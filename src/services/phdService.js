import axios from 'axios';
import { analyzeOpportunityWithProfile, calculateCompatibilityScore } from './groqService';

const API_BASE_URL = 'http://localhost:3002/api';
const API_URL = `${API_BASE_URL}`;

// Constants
const MAX_RETRIES = 3;
const BASE_DELAY = 2000;
const MAX_DELAY = 30000;
const REQUEST_TIMEOUT = 120000;
const RETRY_DELAY = 2000;

// Helper function to generate unique ID
const generateId = (opportunity) => {
  const str = `${opportunity.title}-${opportunity.university}-${Date.now()}`;
  return str.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
};

// Helper function for delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

// Helper function to calculate basic scores
const calculateBasicScores = async (opportunity, userProfile = null) => {
  const scores = {
    relevance: 0,
    funding: 0,
    university: 0,
    location: 0
  };

  // Calculate funding score
  const fundingStatus = opportunity.fundingStatus?.toLowerCase() || '';
  if (fundingStatus.includes('fully funded')) {
    scores.funding = 100;
  } else if (fundingStatus.includes('partial')) {
    scores.funding = 50;
  }

  // Calculate university score based on ranking or reputation
  const universityName = opportunity.university?.toLowerCase() || '';
  if (universityName) {
    if (universityName.includes('oxford') || universityName.includes('cambridge') || 
        universityName.includes('harvard') || universityName.includes('stanford')) {
      scores.university = 100;
    } else if (universityName.includes('university')) {
      scores.university = 70;
    }
  }

  // Calculate location score
  const location = opportunity.location?.toLowerCase() || '';
  if (userProfile?.preferredLocations) {
    const preferredLocations = userProfile.preferredLocations.map(loc => loc.toLowerCase());
    if (preferredLocations.some(loc => location.includes(loc))) {
      scores.location = 100;
    }
  }

  // Calculate relevance score
  const content = [
    opportunity.title,
    opportunity.description,
    opportunity.department
  ].map(s => (s || '').toLowerCase()).join(' ');

  if (userProfile?.researchInterests) {
    const interests = userProfile.researchInterests.map(interest => interest.toLowerCase());
    const matchCount = interests.filter(interest => content.includes(interest)).length;
    scores.relevance = Math.min(100, (matchCount / interests.length) * 100);
  }

  // Calculate overall score
  const weights = {
    relevance: 0.4,
    funding: 0.3,
    university: 0.2,
    location: 0.1
  };

  const overallScore = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scores[key] * weight);
  }, 0);

  return {
    ...scores,
    score: Math.round(overallScore)
  };
};

// Add new function for LLM compatibility scoring
const calculateCompatibilityScoreWithGroq = async (userProfile, opportunity) => {
  try {
    const prompt = `
      Given a user profile and a PhD opportunity, calculate a compatibility score between 0 and 100.
      Consider research interests, academic background, and requirements alignment.
      
      User Profile:
      ${JSON.stringify(userProfile, null, 2)}
      
      PhD Opportunity:
      ${JSON.stringify(opportunity, null, 2)}
      
      Return only a number between 0 and 100.
    `;

    const response = await analyzeOpportunityWithProfile({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 5,
    });

    const score = parseInt(response.choices[0].message.content.trim());
    return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error('Error calculating compatibility score:', error);
    return 0;
  }
};

export const scrapePhdData = async (keyword = '', filters = {}, userProfile = null) => {
  let retries = MAX_RETRIES;
  
  while (retries > 0) {
    try {
      console.log('Attempting to fetch opportunities with keyword:', keyword);
      
      const timestamp = Date.now();
      const response = await axios.get(`${API_URL}/scrape`, {
        params: {
          keyword: keyword.trim(),
          timestamp,
          filters
        },
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.data?.opportunities || !Array.isArray(response.data.opportunities)) {
        throw new Error('Invalid response format from server');
      }

      let opportunities = response.data.opportunities;
      console.log('Received', opportunities.length, 'opportunities from server');

      // Add IDs if they don't exist
      opportunities = opportunities.map(opp => ({
        ...opp,
        id: opp.id || generateId(opp)
      }));

      // Calculate compatibility scores if userProfile is provided
      if (userProfile && Object.keys(userProfile).length > 0) {
        console.log('Calculating compatibility scores with user profile');
        
        const scoredOpportunities = await Promise.all(
          opportunities.map(async (opportunity) => {
            try {
              const score = await calculateCompatibilityScore(userProfile, opportunity);
              return {
                ...opportunity,
                score: score || 0
              };
            } catch (error) {
              console.error('Error scoring opportunity:', error);
              return {
                ...opportunity,
                score: 0
              };
            }
          })
        );

        // Sort by score in descending order
        opportunities = scoredOpportunities.sort((a, b) => (b.score || 0) - (a.score || 0));
      }

      return opportunities;

    } catch (error) {
      console.error('Error fetching opportunities:', error);
      retries--;
      if (retries > 0) {
        console.log(`Retrying... ${retries} attempts remaining`);
        await sleep(RETRY_DELAY);
      } else {
        throw error;
      }
    }
  }
};

// Export all functions for use in other files
export {
  calculateBasicScores,
  cleanText,
  extractDates,
  generateId,
  calculateCompatibilityScoreWithGroq
};
