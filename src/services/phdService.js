import axios from 'axios';
import { 
  generateDummyAnalysis, 
  calculateDummyCompatibility 
} from './dummyService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

// Helper function to parse funding information
const parseFundingInfo = (fundingText) => {
  const info = {
    fullyFunded: false,
    international: false,
    fundingStatus: 'Unknown',
    fundingAmount: 'Not specified'
  };

  if (!fundingText) return info;

  // Check for fully funded status
  info.fullyFunded = fundingText.toLowerCase().includes('fully funded');
  
  // Check for international eligibility
  info.international = fundingText.toLowerCase().includes('worldwide') || 
                      fundingText.toLowerCase().includes('international');

  // Extract funding status
  if (fundingText.includes('Competition Funded')) {
    info.fundingStatus = 'Competition Funded';
  } else if (fundingText.includes('Self Funded')) {
    info.fundingStatus = 'Self Funded';
  } else if (fundingText.includes('Fully Funded')) {
    info.fundingStatus = 'Fully Funded';
  }

  return info;
};

// Helper function to extract metadata from opportunity
const extractMetadata = (opp) => {
  return {
    hasDetailedFunding: Boolean(opp.fundingTypes?.length || opp.fundingAmount),
    hasSupervisor: Boolean(opp.supervisor && opp.supervisor !== 'Supervisor Not Specified'),
    hasDeadline: Boolean(opp.deadline && opp.deadline !== 'Deadline Not Specified'),
    subjects: opp.subjects || [],
    fundingTypes: opp.fundingTypes || [],
    logoUrl: opp.logoUrl || null
  };
};

export const scrapePhdData = async (keyword = '', filters = {}, userProfile = null) => {
  console.log('Fetching opportunities with keyword:', keyword);
  
  try {
    const response = await axios.get(`${API_BASE_URL}/scrape`, {
      params: {
        keyword,
        timestamp: Date.now(),
        filters
      },
      timeout: 30000
    });

    if (!response.data || !response.data.opportunities) {
      console.error('Invalid response format:', response.data);
      return [];
    }

    let opportunities = response.data.opportunities.map(opp => {
      // Parse funding information
      const fundingInfo = parseFundingInfo(opp.funding);
      
      // Create base opportunity object
      const opportunity = {
        id: opp.id || `opp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: opp.title || 'No Title',
        university: opp.university || 'University Not Specified',
        department: opp.department || 'Department Not Specified',
        description: opp.description || 'No Description Available',
        supervisor: opp.supervisor || 'Supervisor Not Specified',
        deadline: opp.deadline || 'Deadline Not Specified',
        location: opp.location || 'Location Not Specified',
        source: opp.source || 'Source Not Specified',
        url: opp.url || '#',
        timestamp: opp.timestamp || new Date().toISOString(),
        
        // Add funding information
        ...fundingInfo,
        
        // Add metadata
        metadata: extractMetadata(opp)
      };

      return opportunity;
    });

    // Apply filters
    if (filters.fullyFunded) {
      opportunities = opportunities.filter(opp => opp.fullyFunded);
    }

    if (filters.international) {
      opportunities = opportunities.filter(opp => opp.international);
    }

    if (filters.hasDeadline) {
      opportunities = opportunities.filter(opp => opp.metadata.hasDeadline);
    }

    if (filters.hasSupervisor) {
      opportunities = opportunities.filter(opp => opp.metadata.hasSupervisor);
    }

    // Sort opportunities by deadline if available
    opportunities.sort((a, b) => {
      const dateA = new Date(a.deadline);
      const dateB = new Date(b.deadline);
      
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateA - dateB;
    });

    // Add compatibility scores if user profile is provided
    if (userProfile) {
      opportunities = opportunities.map(opp => ({
        ...opp,
        compatibility: calculateDummyCompatibility(opp, userProfile)
      }));
    }

    return opportunities;
  } catch (error) {
    console.error('Error fetching PhD opportunities:', error);
    throw error;
  }
};
