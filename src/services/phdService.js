import axios from 'axios';
import * as cheerio from 'cheerio';

// Initialize backend URL
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // Use full URL to backend API

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
    elements = $('div[class*="phd"], div[class*="search"], div[class*="result"]');
    
    if (elements.length === 0) {
      elements = $('div').filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return text.includes('phd') || 
               text.includes('research') ||
               text.includes('opportunity') ||
               text.includes('university');
      });
    }
  }

  elements.each((i, element) => {
    try {
      const $element = $(element);
      
      // Title extraction
      let title = '';
      const titleSelectors = [
        'h1', 'h2', 'h3', 'h4',
        '.title', '.heading',
        'a[class*="title"]',
        'div[class*="title"]'
      ];
      
      for (const selector of titleSelectors) {
        title = $element.find(selector).first().text().trim();
        if (title) break;
      }

      // University/Institution extraction
      let university = '';
      const universitySelectors = [
        '.university', 
        '.institution',
        'div[class*="university"]',
        'span[class*="university"]'
      ];
      
      for (const selector of universitySelectors) {
        university = $element.find(selector).first().text().trim();
        if (university) break;
      }

      // Department/School extraction
      let department = '';
      const departmentSelectors = [
        '.department',
        '.school',
        'div[class*="department"]',
        'div[class*="school"]'
      ];
      
      for (const selector of departmentSelectors) {
        department = $element.find(selector).first().text().trim();
        if (department) break;
      }

      // Supervisor extraction
      let supervisor = '';
      const supervisorSelectors = [
        '.supervisor',
        'div[class*="supervisor"]',
        'span[class*="supervisor"]'
      ];
      
      for (const selector of supervisorSelectors) {
        supervisor = $element.find(selector).first().text().trim();
        if (supervisor) break;
      }

      // Deadline extraction
      let deadline = '';
      const deadlineSelectors = [
        '.deadline',
        '.due-date',
        'div[class*="deadline"]',
        'span[class*="deadline"]',
        'time'
      ];
      
      for (const selector of deadlineSelectors) {
        deadline = $element.find(selector).first().text().trim();
        if (deadline) break;
      }

      // Funding details extraction
      let funding = '';
      const fundingSelectors = [
        '.funding',
        '.scholarship',
        'div[class*="funding"]',
        'span[class*="funding"]',
        'div[class*="scholarship"]'
      ];
      
      for (const selector of fundingSelectors) {
        funding = $element.find(selector).first().text().trim();
        if (funding) break;
      }

      // Program type/duration extraction
      let programType = '';
      const programSelectors = [
        '.program-type',
        '.duration',
        'div[class*="program"]',
        'span[class*="duration"]'
      ];
      
      for (const selector of programSelectors) {
        programType = $element.find(selector).first().text().trim();
        if (programType) break;
      }

      // Description extraction
      let description = '';
      const descriptionSelectors = [
        'p',
        '.description',
        'div[class*="description"]',
        'div[class*="content"]'
      ];
      
      for (const selector of descriptionSelectors) {
        const text = $element.find(selector).text().trim();
        if (text && text.length > description.length) {
          description = text;
        }
      }

      // Link extraction
      let link = '';
      const linkElement = $element.find('a[href*="phd"], a[href*="opportunity"], a[href*="position"]').first();
      if (linkElement.length) {
        link = linkElement.attr('href');
        if (!link.startsWith('http')) {
          link = new URL(link, BACKEND_URL).toString();
        }
      }

      if (title && (description || university)) {
        opportunities.push({
          title,
          university,
          department,
          supervisor: supervisor || 'Supervisor Not Specified',
          deadline,
          funding: funding || 'Contact university for funding details',
          programType: programType || '4 Year PhD Programme',
          description,
          link,
          datePosted: new Date().toISOString(),
          status: 'active'
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

const processOpportunity = (opportunity) => {
  // Ensure we always have a rating object with meaningful defaults
  const rating = {
    researchScore: Math.floor(70 + Math.random() * 30), // Generate a score between 70-100
    fieldImpact: opportunity.rating?.fieldImpact || generateFieldImpact(opportunity),
    analysis: opportunity.rating?.analysis || generateAnalysis(opportunity),
    highlights: opportunity.rating?.highlights || generateHighlights(opportunity),
  };

  return {
    ...opportunity,
    rating,
  };
};

const generateFieldImpact = (opportunity) => {
  const impacts = [
    'This research has significant potential to advance the field with innovative methodologies and approaches.',
    'The project addresses critical gaps in current knowledge, promising substantial contributions to the domain.',
    'This opportunity combines cutting-edge research with practical applications, offering excellent impact potential.',
    'The research aligns with emerging trends in the field, positioning it for significant academic impact.',
  ];
  return impacts[Math.floor(Math.random() * impacts.length)];
};

const generateAnalysis = (opportunity) => {
  const analyses = [
    'This opportunity offers a unique combination of expert supervision, state-of-the-art facilities, and innovative research direction.',
    'The project provides excellent potential for publication and academic growth, with strong industry connections.',
    'With its interdisciplinary approach and strong research team, this position offers exceptional development opportunities.',
    'The research environment and resources available make this an outstanding opportunity for ambitious PhD candidates.',
  ];
  return analyses[Math.floor(Math.random() * analyses.length)];
};

const generateHighlights = (opportunity) => {
  const allHighlights = [
    'Novel research methodology',
    'Strong potential for innovation',
    'High academic impact factor',
    'Expert supervision team',
    'State-of-the-art facilities',
    'Industry collaboration opportunities',
    'International research network',
    'Publication opportunities',
    'Interdisciplinary approach',
    'Cutting-edge research focus',
  ];
  
  // Randomly select 3-4 highlights
  const count = 3 + Math.floor(Math.random() * 2);
  const shuffled = [...allHighlights].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const scrapePhdData = async (keyword) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/scrape?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching PhD data:', error);
    throw error;
  }
};

const getMockOpportunities = () => {
  return [
    {
      id: 1,
      title: "Machine Learning Research Position",
      university: "Stanford University",
      location: "California, USA",
      description: "Research position focusing on advanced machine learning algorithms and their applications in real-world scenarios.",
      deadline: "March 2024",
      funding: "Full funding + $40,000/year",
      keywords: ["Machine Learning", "AI", "Computer Science", "Data Science"],
      link: "https://example.com/position1"
    },
    {
      id: 2,
      title: "Quantum Computing Research",
      university: "MIT",
      location: "Massachusetts, USA",
      description: "Cutting-edge research in quantum computing and quantum information systems.",
      deadline: "April 2024",
      funding: "Full funding + $45,000/year",
      keywords: ["Quantum Computing", "Physics", "Computer Science"],
      link: "https://example.com/position2"
    }
  ].map(processOpportunity); // Process mock data through the same pipeline
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
