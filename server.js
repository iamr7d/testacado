import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { getGroqCompletion } from './src/services/groqService.js';

const GROQ_API_KEYS = [
  process.env.VITE_GROQ_API_KEY_1,
  process.env.VITE_GROQ_API_KEY_2,
  process.env.VITE_GROQ_API_KEY_3,
  process.env.VITE_GROQ_API_KEY_4,
  process.env.VITE_GROQ_API_KEY_5
];

let currentKeyIndex = 0;

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load backend environment variables
dotenv.config({ path: path.join(__dirname, '.env.backend') });

// Create Express app
const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Base URLs for different sources
const FINDAPHD_BASE_URL = 'https://www.findaphd.com';
const SCHOLARSHIP_BASE_URL = 'https://www.scholarshipportal.com';
const UNIVERSITY_BASE_URL = 'https://www.topuniversities.com';
const EURAXESS_BASE_URL = 'https://euraxess.ec.europa.eu';
const JOBS_AC_BASE_URL = 'https://www.jobs.ac.uk';

// Helper function to safely scrape data with retries
const safeScrape = async (url, headers = {}, maxRetries = 3) => {
  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          ...headers
        },
        timeout: 20000,
        validateStatus: status => status === 200
      });
      
      if (!response.data) {
        throw new Error('Empty response received');
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      lastError = error;
      console.error(`Error scraping ${url} (attempt ${attempt + 1}/${maxRetries}):`, error.message);
      
      if (error.response?.status === 429 || error.message.includes('rate limit')) {
        const backoffDelay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        continue;
      }
    }
  }
  
  return { success: false, error: lastError?.message || 'Failed to fetch data' };
};

// Cache for search results (5 minutes)
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper to get cached results
const getCachedResults = (keyword, filters) => {
  const cacheKey = JSON.stringify({ keyword, filters });
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper to set cached results
const setCachedResults = (keyword, filters, data) => {
  const cacheKey = JSON.stringify({ keyword, filters });
  searchCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
};

// Add rate limiting for Groq API
const rateOpportunity = async (opportunity) => {
  try {
    const prompt = `
      Rate this PhD/Research opportunity from 0 to 100 based on the following criteria:
      - Research impact and innovation (35%)
      - Institution reputation (20%)
      - Funding and benefits (25%)
      - Project clarity and structure (20%)

      Title: ${opportunity.title}
      Institution: ${opportunity.university}
      Department: ${opportunity.department || 'Not specified'}
      Description: ${opportunity.description}
      Funding: ${opportunity.funding || 'Not specified'}
      Source: ${opportunity.source}

      Provide only a numeric score (0-100) without any explanation.
    `;

    const completion = await getGroqCompletion(prompt, {
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 5
    });

    const score = parseInt(completion.choices[0]?.message?.content);
    return isNaN(score) ? 70 : score;
  } catch (error) {
    console.error('Error rating opportunity:', error);
    return 70; // Default score on error
  }
};

// Rate opportunities in batches
const rateOpportunities = async (opportunities) => {
  const BATCH_SIZE = 5;
  const ratedOpportunities = [...opportunities];
  
  for (let i = 0; i < Math.min(opportunities.length, 15); i += BATCH_SIZE) {
    const batch = opportunities.slice(i, i + BATCH_SIZE);
    const scores = await Promise.all(batch.map(rateOpportunity));
    
    scores.forEach((score, index) => {
      ratedOpportunities[i + index].rating = score;
    });
    
    // Small delay between batches
    if (i + BATCH_SIZE < opportunities.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Sort by rating
  ratedOpportunities.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return ratedOpportunities;
};

app.get('/api/scrape', async (req, res) => {
  try {
    const searchKeyword = req.query.keyword || 'computer science';
    const encodedKeyword = encodeURIComponent(searchKeyword);
    
    console.log(`Starting PhD opportunity scraping for keyword: ${searchKeyword}`);
    
    // Check cache first
    const cachedResults = getCachedResults(searchKeyword, {});
    if (cachedResults) {
      console.log('Returning cached results');
      return res.json({ opportunities: cachedResults });
    }

    // URLs for different sources
    const FINDAPHD_URL = `${FINDAPHD_BASE_URL}/phds/?Keywords=${encodedKeyword}`;
    
    // Fetch data from FindAPhD
    const phdResult = await safeScrape(FINDAPHD_URL);
    
    const opportunities = [];
    let id = 1;

    // Process FindAPhD opportunities
    if (phdResult.success && phdResult.data && typeof phdResult.data === 'string') {
      try {
        const $phd = cheerio.load(phdResult.data);
        const results = $phd('.phd-result');
        
        console.log(`Found ${results.length} results on FindAPhD`);
        
        results.each((index, element) => {
          try {
            // Extract title and link from title element
            const titleElement = $phd(element).find('h3 > a.h4.text-dark');
            const title = titleElement.text().trim();
            const titleLink = titleElement.attr('href');

            // Find the More Details link with exact class structure and content
            const moreDetailsButton = $phd(element).find('div.d-none.d-md-block.w-100').find('a.btn.btn-block.btn-success.rounded-pill.text-white:contains("More Details")');
            const moreDetailsLink = moreDetailsButton.attr('href');
            
            // Debug log for link extraction
            console.log('Link extraction for:', title, {
                titleLink,
                moreDetailsLink,
                buttonFound: moreDetailsButton.length > 0,
                buttonHtml: $phd(element).find('div.d-none.d-md-block.w-100').html()
            });
            
            // Get the valid link
            let relativeLink = moreDetailsLink || titleLink;
            
            if (!relativeLink || !relativeLink.includes('/phds/project/')) {
                console.log(`No valid project link found for result ${index}`);
                return;
            }

            // Ensure the link starts with a forward slash
            if (!relativeLink.startsWith('/')) {
                relativeLink = '/' + relativeLink;
            }
            
            // Create the full FindAPhD.com URL
            const fullLink = `https://www.findaphd.com${relativeLink}`;
            
            // Debug log for final URL
            console.log('Final URL:', {
                title,
                relativeLink,
                fullLink,
                isValid: fullLink.includes('findaphd.com/phds/project/') && fullLink.includes('?p')
            });

            // Extract other information
            const supervisor = $phd(element).find('.phd-result__key-info span.icon-text').first().text().trim();
            const institution = $phd(element).find('.instLink span.phd-result__dept-inst--title').text().trim();
            const department = $phd(element).find('.deptLink.phd-result__dept-inst--dept').text().trim();
            const description = $phd(element).find('.descFrag').text().trim();
            const deadline = $phd(element).find('.hoverTitle span.icon-text').filter((i, el) => {
                const text = $phd(el).text();
                return text.includes('202'); // Look for dates containing year
            }).first().text().trim();
            const funding = $phd(element).find('.hoverTitle span.icon-text').filter((i, el) => {
                const text = $phd(el).text();
                return text.includes('Funded') || text.includes('Self Funded');
            }).first().text().trim();
            const logoUrl = $phd(element).find('.instLogo img').attr('src');

            opportunities.push({
                id: id++,
                title,
                link: fullLink,
                source: 'FindAPhD',
                description: description || 'No description available',
                university: institution || 'University not specified',
                department: department || 'Department not specified',
                supervisor: supervisor || 'Supervisor Not Specified',
                deadline: deadline || 'Deadline Not Specified',
                funding: funding || 'Funding Not Specified',
                location: institution ? `${institution}` : 'Location Not Specified',
                logo: logoUrl ? (logoUrl.startsWith('http') ? logoUrl : `${FINDAPHD_BASE_URL}${logoUrl}`) : null
            });
          } catch (error) {
            console.error(`Error processing result ${index}:`, error);
          }
        });
      } catch (error) {
        console.error('Error parsing FindAPhD results:', error);
      }
    }

    // Cache the results
    setCachedResults(searchKeyword, {}, opportunities);
    
    // Rate opportunities if we have any
    if (opportunities.length > 0) {
      console.log('Rating opportunities...');
      const ratedOpportunities = await rateOpportunities(opportunities);
      
      res.json({ opportunities: ratedOpportunities });
    } else {
      res.json({ opportunities: [] });
    }

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch opportunities',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      opportunities: [] 
    });
  }
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API available at http://localhost:${port}/api`);
});
