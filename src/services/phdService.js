import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// Constants
const MAX_RETRIES = 3;
const BASE_DELAY = 2000;
const MAX_DELAY = 30000;

// Helper function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for exponential backoff
const getBackoffDelay = (retryCount) => Math.min(BASE_DELAY * Math.pow(2, retryCount), MAX_DELAY);

// Helper function to clean text
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/[\n\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Helper function to extract dates
const extractDates = (text) => {
  if (!text) return { deadline: null, startDate: null };
  
  const datePatterns = {
    deadline: /deadline:?\s*(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4})/i,
    start: /start(?:ing|s)?(?:\s+date)?:?\s*(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4})/i
  };

  const deadlineMatch = text.match(datePatterns.deadline);
  const startMatch = text.match(datePatterns.start);

  return {
    deadline: deadlineMatch ? deadlineMatch[1] : null,
    startDate: startMatch ? startMatch[1] : null
  };
};

// Helper function to remove duplicate opportunities
const removeDuplicates = (opportunities) => {
  const seen = new Set();
  return opportunities.filter(opp => {
    const key = `${opp.title}-${opp.university}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Helper function to calculate basic scores
const calculateBasicScores = (opportunity) => {
  const scores = {
    relevance: 0,
    funding: 0,
    university: 0,
    location: 0
  };

  // Calculate relevance score
  if (opportunity.title) {
    const relevantTerms = ['phd', 'doctoral', 'research', 'scholarship', 'fellowship'];
    const titleLower = opportunity.title.toLowerCase();
    scores.relevance = relevantTerms.reduce((score, term) => 
      titleLower.includes(term) ? score + 20 : score, 0);
  }

  // Calculate funding score
  if (opportunity.fundingStatus) {
    const fundingLower = opportunity.fundingStatus.toLowerCase();
    if (fundingLower.includes('fully funded')) scores.funding = 100;
    else if (fundingLower.includes('partial')) scores.funding = 60;
    else if (fundingLower.includes('unfunded')) scores.funding = 20;
    else scores.funding = 40;
  }

  // Calculate university score
  if (opportunity.university) {
    const topUniversities = ['oxford', 'cambridge', 'harvard', 'mit', 'stanford'];
    const uniLower = opportunity.university.toLowerCase();
    scores.university = topUniversities.some(uni => uniLower.includes(uni)) ? 100 : 70;
  }

  // Calculate location score
  if (opportunity.location) {
    const preferredLocations = ['london', 'new york', 'california', 'tokyo', 'singapore'];
    const locationLower = opportunity.location.toLowerCase();
    scores.location = preferredLocations.some(loc => locationLower.includes(loc)) ? 100 : 70;
  }

  return scores;
};

export const scrapePhdData = async (keyword = '') => {
  let retries = MAX_RETRIES;
  
  while (retries > 0) {
    try {
      const response = await axios.get(`${API_URL}/api/scrape`, {
        params: { keyword },
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.data || !response.data.opportunities) {
        throw new Error('Invalid response format from server');
      }

      let opportunities = response.data.opportunities.map(opp => {
        const dates = extractDates(opp.description || '');
        return {
          ...opp,
          applicationDeadline: dates.deadline,
          startDate: dates.startDate,
          scores: opp.scores || calculateBasicScores(opp)
        };
      });

      // Remove duplicates and sort by overall score
      opportunities = removeDuplicates(opportunities)
        .sort((a, b) => (b.scores?.overall || 0) - (a.scores?.overall || 0));

      return {
        data: opportunities.length > 0 ? opportunities : getMockOpportunities(keyword),
        errors: response.data.errors || [],
        total: opportunities.length,
        source: response.data.source || 'api'
      };

    } catch (error) {
      console.error(`Attempt ${MAX_RETRIES - retries + 1} failed:`, error);
      retries--;

      if (retries > 0) {
        // Wait with exponential backoff before retrying
        const backoffDelay = getBackoffDelay(MAX_RETRIES - retries);
        console.log(`Retrying in ${backoffDelay}ms...`);
        await delay(backoffDelay);
      } else {
        // All retries failed, return mock data
        console.error('All retry attempts failed, using mock data');
        return {
          data: getMockOpportunities(keyword),
          errors: [{ message: error.message }],
          total: 0,
          source: 'mock'
        };
      }
    }
  }
};

// Mock data for testing and fallback
export const getMockOpportunities = (keyword) => [
  {
    title: "AI and Machine Learning PhD Position",
    university: "Example University",
    department: "Computer Science",
    description: "Research position in advanced AI techniques...",
    location: "London, UK",
    fundingStatus: "Fully Funded",
    link: "https://example.com/phd1",
    scores: {
      relevance: 90,
      funding: 100,
      university: 85,
      location: 80,
      overall: 89
    }
  },
  {
    title: "Deep Learning Research Opportunity",
    university: "Tech Institute",
    department: "Artificial Intelligence",
    description: "PhD position focusing on deep neural networks...",
    location: "California, USA",
    fundingStatus: "Partially Funded",
    link: "https://example.com/phd2",
    scores: {
      relevance: 95,
      funding: 70,
      university: 90,
      location: 85,
      overall: 85
    }
  }
];
