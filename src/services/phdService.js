import axios from 'axios';
import * as cheerio from 'cheerio';

// Initialize backend URL
const BACKEND_URL = 'http://localhost:3002/api'; // Use full URL to backend API

// Create axios instance with default config
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please check if the server is running.');
    }
    throw error;
  }
);

const extractOpportunityDetails = async (html) => {
  const $ = cheerio.load(html);
  const opportunities = [];

  // Try multiple selectors for opportunities
  const selectors = [
    '.phd-search-result',
    '.search-result',
    '.opportunity',
    'article',
    '.listing',
    '.phd-result',
    '.result-item',
    '.phd-opportunity'
  ];

  let elements = [];
  for (const selector of selectors) {
    elements = $(selector);
    if (elements.length > 0) {
      console.log(`Found ${elements.length} opportunities using selector: ${selector}`);
      break;
    }
  }

  if (elements.length === 0) {
    console.log('No opportunities found with standard selectors. Trying fallback extraction...');
    
    // First fallback: Look for divs with specific classes
    elements = $('div[class*="phd"], div[class*="search"], div[class*="result"]');
    
    if (elements.length === 0) {
      // Second fallback: Look for any div that might contain opportunity information
      elements = $('div').filter((i, el) => {
        const text = $(el).text().toLowerCase();
        const hasKeywords = text.includes('phd') || 
                          text.includes('research') ||
                          text.includes('opportunity') ||
                          text.includes('university') ||
                          text.includes('department');
                          
        const hasTitle = $(el).find('h1, h2, h3, h4').length > 0;
        const hasLink = $(el).find('a').length > 0;
        
        return hasKeywords && (hasTitle || hasLink);
      });
    }
  }

  console.log(`Processing ${elements.length} potential opportunities...`);

  elements.each((i, element) => {
    try {
      const $element = $(element);
      
      // Try multiple ways to find the title
      let title = '';
      const titleSelectors = [
        'h1', 'h2', 'h3', 'h4',
        '.title', '.heading',
        'a[class*="title"]',
        'div[class*="title"]'
      ];
      
      for (const selector of titleSelectors) {
        const titleElement = $element.find(selector).first();
        title = titleElement.text().trim();
        if (title) break;
      }

      // Try multiple ways to find the description
      let description = '';
      const descriptionSelectors = [
        'p',
        '.description',
        '.summary',
        '.content',
        'div[class*="description"]',
        'div[class*="content"]'
      ];
      
      for (const selector of descriptionSelectors) {
        const descElement = $element.find(selector).first();
        description = descElement.text().trim();
        if (description) break;
      }

      // Try to find the link
      let link = '';
      const linkElement = $element.find('a[href*="phd"], a[href*="research"], a[href*="opportunity"]').first() || 
                         $element.find('a').first();
      if (linkElement.length) {
        link = linkElement.attr('href');
      }

      // Try to find additional details
      const university = $element.find('.university, .institution, [class*="university"], [class*="institution"]').first().text().trim();
      const department = $element.find('.department, [class*="department"]').first().text().trim();
      const deadline = $element.find('.deadline, [class*="deadline"], [class*="date"]').first().text().trim();
      const supervisor = $element.find('.supervisor, [class*="supervisor"]').first().text().trim();

      if (title && (description || link)) {
        opportunities.push({
          title,
          description: description || 'No description available',
          link: link ? new URL(link, 'https://www.findaphd.com').href : null,
          university: university || null,
          department: department || null,
          deadline: deadline || null,
          supervisor: supervisor || null
        });
      }
    } catch (error) {
      console.error('Error extracting opportunity details:', error);
    }
  });

  return opportunities;
};

const cleanAndValidateJSON = (content) => {
  try {
    // Remove any non-JSON text that might be present
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON array found in response');
    }
    
    let jsonContent = content.slice(jsonStart, jsonEnd);
    
    // Clean up common JSON issues
    jsonContent = jsonContent
      // Fix trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix missing commas
      .replace(/}(\s*){/g, '},{')
      // Fix unescaped quotes in strings
      .replace(/"([^"]*?)"/g, (match, p1) => `"${p1.replace(/"/g, '\\"')}"`)
      // Remove any control characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    // Validate the JSON structure
    const parsed = JSON.parse(jsonContent);
    
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not a JSON array');
    }
    
    // Validate each opportunity object
    return parsed.map(opp => ({
      title: String(opp.title || ''),
      description: String(opp.description || ''),
      researchAreas: Array.isArray(opp.researchAreas) ? opp.researchAreas.map(String) : [],
      requirements: String(opp.requirements || 'Not specified'),
      university: String(opp.university || 'Not specified'),
      department: String(opp.department || 'Not specified'),
      supervisor: String(opp.supervisor || 'Not specified'),
      deadline: String(opp.deadline || 'Not specified'),
      link: String(opp.link || '')
    }));
    
  } catch (error) {
    throw new Error(`JSON validation failed: ${error.message}`);
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const structureDataWithAI = async (opportunities) => {
  if (!opportunities || opportunities.length === 0) {
    return [];
  }

  const structureWithBackend = async (opportunity) => {
    try {
      const response = await api.post('/api/structure', opportunity);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to structure data: ${error.message}`);
    }
  };

  // Process opportunities in parallel
  const structuredOpportunities = await Promise.all(
    opportunities.map(async (opportunity) => {
      try {
        return await structureWithBackend(opportunity);
      } catch (error) {
        console.error('Error structuring opportunity:', error);
        return {
          title: String(opportunity.title || '').trim(),
          description: String(opportunity.description || '').trim(),
          researchAreas: [],
          requirements: 'Not specified',
          university: String(opportunity.university || 'Not specified').trim(),
          department: String(opportunity.department || 'Not specified').trim(),
          supervisor: String(opportunity.supervisor || 'Not specified').trim(),
          deadline: String(opportunity.deadline || 'Not specified').trim(),
          link: String(opportunity.link || '').trim()
        };
      }
    })
  );

  return structuredOpportunities;
};

async function rateOpportunity(opportunity) {
  try {
    const response = await api.post('/api/rate', opportunity);
    return response.data.rating;
  } catch (error) {
    console.error('Error rating opportunity:', error);
    return 0;
  }
}

export const scrapePhdData = async (keyword = '') => {
  try {
    console.log('Fetching opportunities...');
    const response = await axios.get(`http://localhost:3002/api/scrape?keyword=${encodeURIComponent(keyword)}`);
    console.log('Response received:', response.data);

    if (!response.data.success || !response.data.opportunities) {
      throw new Error('Failed to fetch opportunities');
    }

    return response.data.opportunities;
  } catch (error) {
    console.error('Error scraping PhD opportunities:', error);
    throw error;
  }
};

export const scrapePhdOpportunities = async () => {
  try {
    console.log('Fetching opportunities from FindAPhD...');
    const response = await api.get('/phd');
    console.log('Response received, parsing HTML...');
    const opportunities = await extractOpportunityDetails(response.data);
    console.log(`Total results found: ${opportunities.length}`);
    
    if (opportunities.length > 0) {
      console.log('Structuring data with AI...');
      const structuredOpportunities = await structureDataWithAI(opportunities);
      return structuredOpportunities;
    }
    
    return opportunities;
    
  } catch (error) {
    console.error('Error scraping opportunities:', error);
    throw error;
  }
};
