import dotenv from 'dotenv';
import express from 'express';
dotenv.config();
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import cors from 'cors';
import { getGeminiCompletion } from './src/services/geminiService.js';
import { fetchScholarMetrics, simplifyScholarMetrics } from './src/services/scholarService.js';
import { professorDatabase } from './src/data/professorData.js';
import geminiAIService from './src/services/geminiAIService.js'; // Import the Gemini AI service

// Promisify exec for async/await usage
const execPromise = promisify(exec);

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load backend environment variables
dotenv.config({ path: path.join(__dirname, '.env.backend') });

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '6d06f2b0c0edf7bca3cfcae4a6fed17f0e77336211f1b833167df34e55fdf0df';
console.log(GEMINI_API_KEY ? "GEMINI_API_KEY found" : "GEMINI_API_KEY not found in environment variables");

// Create Express app
const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Add rate limiting for Gemini API
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

    const completion = await getGeminiCompletion(prompt, {
      model: "gemini-1.5-flash",
      temperature: 0.3
    });

    const score = parseInt(completion.choices[0]?.message?.content);
    return isNaN(score) ? 70 : score;
  } catch (error) {
    console.error('Error rating opportunity:', error);
    return 70; // Default score on error
  }
};

// Initialize the scholarService with the safeScrape function
// initScholarService(safeScrape);

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

// Add professor profile scraping endpoint
app.post('/api/scrape-professor', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log(`Scraping professor profile from: ${url}`);
    
    // Scrape the professor's webpage with increased timeout and retries
    const result = await safeScrape(url, { timeout: 20000 }, 5);
    
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to scrape professor profile' });
    }
    
    // Load the HTML content
    const $ = cheerio.load(result.data);
    
    // Remove script, style, and hidden elements to clean up text extraction
    $('script, style, [style*="display:none"], [style*="display: none"], .hidden, meta, link, noscript').remove();
    
    // Extract text content from the page with improved selector
    let pageText = '';
    $('body').find('p, h1, h2, h3, h4, h5, h6, li, span, div, a, strong, em, td, th, figcaption, blockquote').each((i, el) => {
      const text = $(el).text().trim();
      if (text) {
        pageText += text + '\n';
      }
    });
    
    // Clean up the text
    pageText = pageText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .replace(/\t+/g, ' ')
      .trim();
    
    // Extract professor's name from title or h1
    const pageTitle = $('title').text().trim();
    const h1Text = $('h1').first().text().trim();
    
    // Try to extract specific information directly from the HTML
    let professorName = '';
    
    // Try to find the professor name using various methods
    if (h1Text && h1Text.length < 100) {
      professorName = h1Text;
    } else if (pageTitle.includes('|')) {
      professorName = pageTitle.split('|')[0].trim();
    } else if (pageTitle.includes('-')) {
      professorName = pageTitle.split('-')[0].trim();
    } else if (pageTitle.includes('–')) {
      professorName = pageTitle.split('–')[0].trim();
    } else {
      // Look for common patterns in headers that might contain the name
      $('h1, h2, h3').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length < 100 && 
            (text.includes('Dr.') || text.includes('Prof.') || 
             text.includes('Professor') || text.match(/^[A-Z][a-z]+ [A-Z][a-z]+/))) {
          professorName = text;
          return false; // break the loop
        }
      });
    }
    
    // Clean up professor name
    if (professorName) {
      // Remove common prefixes/titles for cleaner name
      professorName = professorName
        .replace(/^(Dr\.|Prof\.|Professor|Associate Professor|Assistant Professor)\s+/i, '')
        .replace(/\s+Ph\.?D\.?(\s|$).*$/i, '')
        .trim();
    }
    
    let professorBio = '';
    let researchAreas = [];
    let publications = [];
    let contactInfo = '';
    let university = '';
    let department = '';
    let title = '';
    
    // Extract university from page title or meta tags
    if (pageTitle.includes('|')) {
      university = pageTitle.split('|')[1].trim();
    } else if (pageTitle.includes('-')) {
      university = pageTitle.split('-')[1].trim();
    } else if (pageTitle.includes('–')) {
      university = pageTitle.split('–')[1].trim();
    } else {
      // Try to find university in meta tags
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      if (metaDescription.includes('University') || metaDescription.includes('College') || metaDescription.includes('Institute')) {
        const uniMatch = metaDescription.match(/(University|College|Institute)(\s+of\s+[A-Za-z]+|[^,\.]+)/i);
        if (uniMatch) {
          university = uniMatch[0].trim();
        }
      }
    }
    
    // Look for title in common locations
    $('h1, h2, h3, h4, .title, .position, .role').each((i, el) => {
      const text = $(el).text().trim();
      if (text && (text.includes('Professor') || text.includes('Faculty') || 
                  text.includes('Chair') || text.includes('Dean') || 
                  text.includes('Director') || text.includes('Lecturer'))) {
        if (text !== professorName && text.length < 100) {
          title = text;
          return false; // break the loop
        }
      }
    });
    
    // If we still don't have a title, look for it in paragraphs
    if (!title) {
      $('p').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length < 200) {
          const titleMatch = text.match(/(Professor|Faculty|Chair|Dean|Director|Lecturer|Assistant Professor|Associate Professor)(\s+of\s+[A-Za-z]+|[^,\.]+)?/i);
          if (titleMatch) {
            title = titleMatch[0].trim();
            return false; // break the loop
          }
        }
      });
    }
    
    // Look for department
    $('h1, h2, h3, h4, p, .department, .faculty, .school').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 200 && 
          (text.includes('Department') || text.includes('School of') || 
           text.includes('Faculty of') || text.includes('College of'))) {
        department = text;
        return false; // break the loop
      }
    });
    
    // Look for bio paragraph - often in p tags after h3
    $('h2, h3, h4').each((i, el) => {
      const headerText = $(el).text().toLowerCase().trim();
      if (headerText.includes('bio') || headerText.includes('about') || 
          headerText.includes('profile') || headerText.includes('background')) {
        const nextP = $(el).nextAll('p').first();
        if (nextP.length) {
          professorBio = nextP.text().trim();
        }
      }
    });
    
    // If we couldn't find the bio, look for large paragraphs
    if (!professorBio) {
      $('p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 200 && (text.includes('research') || text.includes('interest') || 
                                 text.includes('Ph.D') || text.includes('Professor') || 
                                 text.includes('university') || text.includes('work'))) {
          professorBio = text;
          return false; // break the loop
        }
      });
    }
    
    // Look for contact information
    $('a[href^="mailto:"]').each((i, el) => {
      const email = $(el).attr('href').replace('mailto:', '').trim();
      if (email) {
        contactInfo = email;
        return false; // break the loop
      }
    });
    
    // If no email found in mailto links, try to find it in text
    if (!contactInfo) {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emailMatches = pageText.match(emailRegex);
      if (emailMatches && emailMatches.length > 0) {
        contactInfo = emailMatches[0];
      }
    }
    
    // Look for research interests/areas with improved detection
    $('h2, h3, h4, h5, h6').each((i, el) => {
      const headerText = $(el).text().toLowerCase().trim();
      if (headerText.includes('research') || headerText.includes('interest') || 
          headerText.includes('area') || headerText.includes('expertise') || 
          headerText.includes('specialization')) {
        
        // Check for list items
        const list = $(el).nextAll('ul, ol').first();
        if (list.length) {
          list.find('li').each((i, li) => {
            const text = $(li).text().trim();
            if (text && text.length < 200) {
              researchAreas.push(text);
            }
          });
        } 
        // If no list, check for paragraph
        else {
          const nextP = $(el).nextAll('p').first();
          if (nextP.length) {
            const text = nextP.text().trim();
            if (text) {
              // Split by common separators
              const areas = text.split(/[,;•]/).map(area => area.trim()).filter(area => area.length > 0);
              researchAreas = researchAreas.concat(areas);
            }
          }
        }
      }
    });
    
    // Look for publications with improved detection
    $('h2, h3, h4, h5, h6').each((i, el) => {
      const headerText = $(el).text().toLowerCase().trim();
      if (headerText.includes('publication') || headerText.includes('paper') || 
          headerText.includes('journal') || headerText.includes('conference') || 
          headerText.includes('book') || headerText.includes('article')) {
        
        // Check for list items
        const list = $(el).nextAll('ul, ol').first();
        if (list.length) {
          list.find('li').each((i, li) => {
            if (i < 5) { // Limit to 5 publications
              const text = $(li).text().trim();
              if (text && text.length > 20) { // Minimum length for a publication
                publications.push(text);
              }
            }
          });
        }
        // If no list, check for paragraphs or divs that might contain publications
        else {
          $(el).nextAll('p, div').slice(0, 5).each((i, el) => {
            const text = $(el).text().trim();
            if (text && text.length > 20 && text.length < 500) {
              publications.push(text);
            }
          });
        }
      }
    });
    
    // If we couldn't find publications in a list, look for them in the text with common patterns
    if (publications.length === 0) {
      // Look for numbered or bulleted lists in text
      const pubMatches = pageText.match(/(?:(?:\d+\.\s*)|(?:- )|(?:• ))([^•\n-].*?)(?=(?:\n(?:\d+\.\s*|\n- |\n• |\n\n|$)))/g);
      if (pubMatches && pubMatches.length > 0) {
        publications = pubMatches
          .slice(0, 5)
          .map(p => p.replace(/^(?:\d+\.\s*)|(?:- )|(?:• )/, '').trim())
          .filter(p => p.length > 20); // Minimum length for a publication
      }
    }
    
    // Extract research areas from bio if we couldn't find them elsewhere
    if (researchAreas.length === 0 && professorBio) {
      const interestMatch = professorBio.match(/(?:research |areas of |)(?:interest|areas|expertise)(?:\s+include|\s+are|\s*:)?\s+([^.]+)/i);
      if (interestMatch && interestMatch[1]) {
        researchAreas = interestMatch[1].split(/[,;]|and/).map(area => area.trim()).filter(area => area.length > 0);
      }
    }
    
    // Extract image URL if available
    let imageUrl = '';
    const imgElements = $('img').toArray();
    
    // First, look for profile-specific images
    for (const img of imgElements) {
      const src = $(img).attr('src');
      const alt = $(img).attr('alt') || '';
      const className = $(img).attr('class') || '';
      
      if (!src) continue;
      
      // Look for profile images with specific indicators
      if (
        alt.toLowerCase().includes('professor') || 
        alt.toLowerCase().includes('profile') || 
        alt.toLowerCase().includes('photo') ||
        alt.toLowerCase().includes('portrait') ||
        src.toLowerCase().includes('profile') || 
        src.toLowerCase().includes('faculty') ||
        src.toLowerCase().includes('staff') ||
        src.toLowerCase().includes('professor') ||
        src.toLowerCase().includes('portrait') ||
        src.toLowerCase().includes('photo') ||
        className.toLowerCase().includes('profile') ||
        className.toLowerCase().includes('portrait') ||
        className.toLowerCase().includes('photo') ||
        (professorName && (
          alt.toLowerCase().includes(professorName.toLowerCase().split(' ')[0]) || // First name in alt
          src.toLowerCase().includes(professorName.toLowerCase().split(' ')[0])    // First name in src
        ))
      ) {
        // Convert relative URL to absolute
        if (src.startsWith('http')) {
          imageUrl = src;
        } else if (src.startsWith('/')) {
          const urlObj = new URL(url);
          imageUrl = `${urlObj.protocol}//${urlObj.host}${src}`;
        } else {
          // Handle case where URL is relative to current path
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split('/');
          pathParts.pop(); // Remove the last part
          const basePath = pathParts.join('/');
          imageUrl = `${urlObj.protocol}//${urlObj.host}${basePath}/${src}`;
        }
        break;
      }
    }
    
    // If no specific profile image found, try to get a reasonable image
    if (!imageUrl) {
      // Look for images near the top of the page that aren't too small and aren't logos/icons
      for (const img of imgElements) {
        const src = $(img).attr('src');
        const width = parseInt($(img).attr('width') || '0', 10);
        const height = parseInt($(img).attr('height') || '0', 10);
        
        if (!src) continue;
        
        // Skip very small images (likely icons) and images with "logo" or "icon" in the path
        if ((width > 0 && width < 50) || (height > 0 && height < 50) || 
            src.toLowerCase().includes('logo') || src.toLowerCase().includes('icon')) {
          continue;
        }
        
        // Convert relative URL to absolute URL
        if (src.startsWith('http')) {
          imageUrl = src;
        } else if (src.startsWith('//')) {
          imageUrl = 'https:' + src;
        } else if (src.startsWith('/')) {
          const urlObj = new URL(url);
          imageUrl = urlObj.origin + src;
        } else {
          const urlObj = new URL(url);
          imageUrl = urlObj.origin + '/' + src;
        }
        break;
      }
    }
    
    // Create a structured object with the extracted data
    const extractedData = {
      name: professorName || 'Unknown',
      title: title || "Professor", // Default title
      university: university || "Unknown",
      department: department || "Not specified",
      researchAreas: researchAreas.length > 0 ? researchAreas : [],
      publications: publications.length > 0 ? publications : [],
      contact: contactInfo || "Not available",
      biography: professorBio || "",
      profileSummary: "",
      imageUrl: imageUrl || "",
      scholarMetrics: null
    };
    
    // For debugging
    console.log("Extracted data:", JSON.stringify(extractedData, null, 2));
    
    // Try to fetch Google Scholar metrics if we have a name
    let scholarMetrics = null;
    if (professorName) {
      try {
        console.log(`Attempting to fetch Google Scholar metrics for ${professorName}`);
        const scholarResult = await searchScholarProfile(professorName, university);
        
        if (scholarResult.success && scholarResult.metrics && scholarResult.metrics.found) {
          console.log(`Found Google Scholar metrics for ${professorName}`);
          scholarMetrics = formatScholarMetrics(scholarResult.metrics);
          extractedData.scholarMetrics = scholarMetrics;
        } else {
          console.log(`No Google Scholar metrics found for ${professorName}`);
        }
      } catch (scholarError) {
        console.error(`Error fetching Google Scholar metrics: ${scholarError.message}`);
      }
    }
    
    // Use Gemini to analyze the professor's profile with our extracted data
    const prompt = `
      You are an expert academic advisor. Analyze this professor's webpage content and extract key information.
      
      Webpage URL: ${url}
      Page Title: ${pageTitle}
      
      I've already extracted some information from the webpage HTML:
      - Professor Name: ${extractedData.name}
      - Title/Position: ${extractedData.title}
      - University/Institution: ${extractedData.university}
      - Department: ${extractedData.department}
      - Biography: ${extractedData.biography.substring(0, 500)}
      - Research Areas: ${extractedData.researchAreas.join(', ')}
      - Publications: ${extractedData.publications.slice(0, 3).join('; ')}
      - Contact Information: ${extractedData.contact}
      
      Webpage Content (first 10000 chars):
      ${pageText.substring(0, 10000)}
      
      Extract and organize the following information, using the pre-extracted data where available and filling in any missing information:
      1. Full Name
      2. Title/Position (e.g., Professor, Associate Professor, etc.)
      3. University/Institution
      4. Department
      5. Research Areas (list the main 3-5 areas)
      6. Recent Publications (list 2-3 if available)
      7. Contact Information (email if available)
      8. Brief Biography
      
      Format your response as a JSON object with the following structure:
      {
        "name": "Professor's full name",
        "title": "Professor's title/position",
        "university": "University name",
        "department": "Department name",
        "researchAreas": ["Area 1", "Area 2", "Area 3"],
        "publications": ["Publication 1", "Publication 2"],
        "contact": "Email or contact info",
        "biography": "Brief biography paragraph",
        "profileSummary": "A concise 2-3 sentence summary of their research focus and expertise",
        "imageUrl": "${imageUrl}"
      }
      
      Return ONLY the JSON object without any additional text or markdown formatting.
    `;
    
    const geminiResponse = await getGeminiCompletion(prompt, {
      model: "gemini-1.5-flash",
      temperature: 0.2
    });
    
    let profileData = {
      name: professorName,
      title: "Professor",
      university: university || "Unknown",
      department: department || "Not specified",
      researchAreas: researchAreas.length > 0 ? researchAreas : [],
      publications: publications.length > 0 ? publications.slice(0, 3) : [],
      contact: contactInfo || "Not available",
      biography: professorBio || "",
      profileSummary: "",
      imageUrl: imageUrl || "",
      scholarMetrics: scholarMetrics || null
    };
    
    if (geminiResponse.success) {
      try {
        // Try to parse the JSON response
        const jsonMatch = geminiResponse.choices[0]?.message?.content.match(/```json\n([\s\S]*?)\n```/) || 
                          geminiResponse.choices[0]?.message?.content.match(/{[\s\S]*?}/);
        
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : geminiResponse.choices[0]?.message?.content;
        const parsedData = JSON.parse(jsonStr);
        
        // Merge the parsed data with our default profile data
        profileData = { ...profileData, ...parsedData };
      } catch (error) {
        console.error('Error parsing Gemini response:', error);
      }
    }
    
    // Add the image URL if found
    if (imageUrl) {
      profileData.imageUrl = imageUrl;
    }
    
    // Add scholar metrics if available
    if (scholarMetrics) {
      profileData.scholarMetrics = scholarMetrics;
    }
    
    // Final cleanup to ensure no "Not found" values
    Object.keys(profileData).forEach(key => {
      if (profileData[key] === 'Not found') {
        if (key === 'name') profileData[key] = 'Unknown Professor';
        else if (key === 'title') profileData[key] = 'Professor';
        else if (key === 'university') profileData[key] = 'Unknown Institution';
        else if (key === 'department') profileData[key] = 'Not specified';
        else if (key === 'contact') profileData[key] = 'Not available';
        else if (key === 'biography') profileData[key] = '';
        else if (key === 'profileSummary') profileData[key] = `${profileData.name} is a researcher.`;
        else if (key === 'imageUrl') profileData[key] = '';
      }
    });
    
    // Generate a fallback profile summary if none was provided
    if (!profileData.profileSummary || profileData.profileSummary === 'Not found') {
      let summary = `${profileData.name} is `;
      
      if (profileData.title && profileData.title !== 'Not found') {
        summary += `a ${profileData.title} `;
      } else {
        summary += 'a researcher ';
      }
      
      if (profileData.university && profileData.university !== 'Not found') {
        summary += `at ${profileData.university}. `;
      } else {
        summary += '. ';
      }
      
      if (profileData.researchAreas && profileData.researchAreas.length > 0) {
        summary += `Their research focuses on ${profileData.researchAreas.slice(0, 3).join(', ')}.`;
      }
      
      profileData.profileSummary = summary;
    }
    
    // For debugging
    console.log("Final profile data:", JSON.stringify(profileData, null, 2));
    
    // Try to fetch Google Scholar metrics if we have a name
    if (professorName) {
      try {
        console.log(`Attempting to fetch Google Scholar metrics for ${professorName}`);
        const scholarResult = await searchScholarProfile(professorName, university);
        
        if (scholarResult.success && scholarResult.metrics && scholarResult.metrics.found) {
          console.log(`Found Google Scholar metrics for ${professorName}`);
          scholarMetrics = formatScholarMetrics(scholarResult.metrics);
          profileData.scholarMetrics = scholarMetrics;
        } else {
          console.log(`No Google Scholar metrics found for ${professorName}`);
        }
      } catch (scholarError) {
        console.error(`Error fetching Google Scholar metrics: ${scholarError.message}`);
      }
    }
    
    // Return the professor's profile data
    return res.json(profileData);
  } catch (error) {
    console.error('Error processing professor profile:', error);
    
    // Return directly extracted data if processing fails
    return res.json(extractedData);
  }
});

// Add find-professor endpoint
app.post('/api/find-professor', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Professor name is required'
      });
    }
    
    console.log(`Searching for professor: ${name}`);
    
    // Initialize profile data with default values
    const profileData = {
      name: name,
      title: "Professor",
      university: "Unknown",
      department: "Unknown",
      researchAreas: [],
      publications: [],
      contact: "Unknown",
      biography: "",
      scholarMetrics: { found: false },
      citationGraph: null
    };
    
    // Check if the professor is in our database (case insensitive)
    const normalizedName = name.toLowerCase().trim();
    
    // Find the professor in the database by checking if any key contains the search term
    // or if any professor name contains the search term
    let foundProfessor = null;
    let bestMatchScore = 0;
    
    // First try exact match
    if (professorDatabase[normalizedName]) {
      foundProfessor = professorDatabase[normalizedName];
    } else {
      // Try to find a partial match in the keys or professor names
      for (const key in professorDatabase) {
        const professor = professorDatabase[key];
        const professorNameLower = professor.name.toLowerCase();
        
        // Calculate match score based on substring presence
        let matchScore = 0;
        
        // Check if search term is in the key
        if (key.includes(normalizedName)) {
          matchScore += 10;
        }
        
        // Check if search term is in the professor name
        if (professorNameLower.includes(normalizedName)) {
          matchScore += 15;
        }
        
        // Check if any word in the search term matches a word in the professor name
        const searchWords = normalizedName.split(/\s+/);
        const professorWords = professorNameLower.split(/\s+/);
        
        for (const searchWord of searchWords) {
          if (searchWord.length < 2) continue; // Skip very short words
          
          for (const professorWord of professorWords) {
            if (professorWord.includes(searchWord)) {
              matchScore += 5;
            }
          }
        }
        
        // If this professor has a better match score, use it
        if (matchScore > bestMatchScore) {
          bestMatchScore = matchScore;
          foundProfessor = professor;
        }
      }
    }
    
    let foundInDatabase = false;
    
    if (foundProfessor && bestMatchScore >= 10) {
      console.log(`Found professor ${foundProfessor.name} in database with match score ${bestMatchScore}`);
      foundInDatabase = true;
      
      // Update profile data with database information
      profileData.name = foundProfessor.name;
      profileData.title = foundProfessor.title;
      profileData.university = foundProfessor.university;
      profileData.department = foundProfessor.department;
      profileData.researchAreas = foundProfessor.researchAreas;
      profileData.publications = foundProfessor.publications;
      profileData.contact = foundProfessor.contact;
      profileData.biography = foundProfessor.biography;
      profileData.scholarMetrics = foundProfessor.scholarMetrics;
    }
    
    // Always try to fetch from Scholarly, even if we found in database
    // This ensures we have the most up-to-date information
    try {
      console.log(`Attempting to fetch Scholarly metrics for ${name}`);
      
      // Execute the Python script with the professor name
      const { stdout, stderr } = await execPromise(`python scholarly_search.py "${name}"`);
      
      if (stderr) {
        console.error(`Python script error: ${stderr}`);
      }
      
      // Parse the JSON output from the Python script
      const scholarResult = JSON.parse(stdout);
      
      if (scholarResult.success && scholarResult.metrics && scholarResult.metrics.found) {
        console.log(`Found Scholarly metrics for ${name}`);
        
        // If we didn't find in database, use all the Scholarly data
        if (!foundInDatabase) {
          profileData.scholarMetrics = {
            found: true,
            citations: scholarResult.metrics.citations || 0,
            hIndex: scholarResult.metrics.hIndex || 0,
            i10Index: scholarResult.metrics.i10Index || 0,
            profileUrl: scholarResult.metrics.profileUrl || ''
          };
          
          // Update profile data with scholar information
          if (scholarResult.metrics.affiliation) {
            profileData.university = scholarResult.metrics.affiliation;
          }
          
          if (scholarResult.metrics.interests && scholarResult.metrics.interests.length > 0) {
            profileData.researchAreas = scholarResult.metrics.interests;
          }
          
          if (scholarResult.metrics.topPublications && scholarResult.metrics.topPublications.length > 0) {
            profileData.publications = scholarResult.metrics.topPublications.map(pub => pub.title);
          }
          
          // Update the name to the one found in Scholarly if it's more complete
          if (scholarResult.metrics.name && scholarResult.metrics.name.length > name.length) {
            profileData.name = scholarResult.metrics.name;
          }
          
          // Add citation graph if available
          if (scholarResult.metrics.citationGraph) {
            profileData.citationGraph = scholarResult.metrics.citationGraph;
          }
        } 
        // If we found in database, just update the metrics
        else {
          // Update only the citation metrics
          profileData.scholarMetrics.citations = scholarResult.metrics.citations || profileData.scholarMetrics.citations;
          profileData.scholarMetrics.hIndex = scholarResult.metrics.hIndex || profileData.scholarMetrics.hIndex;
          profileData.scholarMetrics.i10Index = scholarResult.metrics.i10Index || profileData.scholarMetrics.i10Index;
          
          // Add any new research areas not already in our list
          if (scholarResult.metrics.interests && scholarResult.metrics.interests.length > 0) {
            const newInterests = scholarResult.metrics.interests.filter(
              interest => !profileData.researchAreas.includes(interest)
            );
            profileData.researchAreas = [...profileData.researchAreas, ...newInterests].slice(0, 10);
          }
          
          // Add any new publications not already in our list
          if (scholarResult.metrics.topPublications && scholarResult.metrics.topPublications.length > 0) {
            const newPublications = scholarResult.metrics.topPublications
              .map(pub => pub.title)
              .filter(title => !profileData.publications.includes(title));
            profileData.publications = [...profileData.publications, ...newPublications].slice(0, 10);
          }
          
          // Add citation graph if available
          if (scholarResult.metrics.citationGraph) {
            profileData.citationGraph = scholarResult.metrics.citationGraph;
          }
        }
      } else {
        console.log(`No Scholarly metrics found for ${name}: ${scholarResult.error || 'Unknown error'}`);
        
        // If we didn't find in database and couldn't find in Scholarly, return an error
        if (!foundInDatabase) {
          return res.status(404).json({ 
            error: `No information found for "${name}". Try a different professor name.` 
          });
        }
      }
    } catch (scholarError) {
      console.error(`Error fetching Scholarly metrics: ${scholarError.message}`);
      
      // If we didn't find in database and had an error with Scholarly, return an error
      if (!foundInDatabase) {
        return res.status(500).json({ 
          error: `Error searching for "${name}": ${scholarError.message}` 
        });
      }
    }
    
    // If we don't have a biography, use Gemini to generate one
    if (!profileData.biography) {
      try {
        const prompt = `
          Generate a brief professional biography for Professor ${name}.
          ${profileData.researchAreas.length > 0 ? `Their research interests include: ${profileData.researchAreas.join(', ')}.` : ''}
          ${profileData.scholarMetrics.found ? `They have ${profileData.scholarMetrics.citations} citations, an h-index of ${profileData.scholarMetrics.hIndex}, and an i10-index of ${profileData.scholarMetrics.i10Index}.` : ''}
          Keep it concise, professional, and focused on their academic achievements.
        `;
        
        const geminiResponse = await getGeminiCompletion(prompt, {
          model: "gemini-1.5-flash",
          temperature: 0.3
        });
        
        if (geminiResponse.success) {
          profileData.biography = geminiResponse.choices[0]?.message?.content.trim() || "";
        }
      } catch (error) {
        console.error('Error generating biography:', error);
      }
    }
    
    // Return the professor's profile data
    return res.json(profileData);
  } catch (error) {
    console.error('Error finding professor:', error);
    return res.status(500).json({ error: 'Failed to find professor' });
  }
});

// API endpoint for suggested professors
app.get('/api/suggested-professors', (req, res) => {
  try {
    // Get the list of professor names from our database
    const professorNames = Object.values(professorDatabase).map(prof => prof.name);
    
    // Return the list of professor names
    res.json({
      success: true,
      professors: professorNames
    });
  } catch (error) {
    console.error('Error fetching suggested professors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch suggested professors'
    });
  }
});

// Add research fit analysis endpoint
app.post('/api/analyze-research-fit', async (req, res) => {
  try {
    const { studentResearch, professorResearch, prompt } = req.body;
    
    if (!studentResearch || !professorResearch) {
      return res.status(400).json({ error: 'Student and professor research interests are required' });
    }
    
    console.log('Analyzing research fit between student and professor');
    
    // Use Gemini to analyze research fit
    const completion = await getGeminiCompletion(prompt, {
      model: "gemini-1.5-flash",
      temperature: 0.3
    });
    
    try {
      // Parse the JSON response
      const fitAnalysis = JSON.parse(completion.choices[0]?.message?.content);
      return res.json(fitAnalysis);
    } catch (error) {
      console.error('Error parsing research fit JSON:', error);
      return res.status(500).json({ 
        error: 'Failed to parse research fit analysis',
        rawResponse: completion.choices[0]?.message?.content
      });
    }
  } catch (error) {
    console.error('Error analyzing research fit:', error);
    return res.status(500).json({ error: 'Failed to analyze research fit' });
  }
});

// Add a new endpoint for scholarly search
app.post('/api/scholar-search', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Professor name is required'
      });
    }
    
    console.log(`Searching for professor using scholarly: ${name}`);
    
    // Execute the Python script with the professor name
    const { stdout, stderr } = await execPromise(`python scholarly_search.py "${name}"`);
    
    if (stderr) {
      console.error(`Python script stderr output: ${stderr}`);
    }
    
    // Parse the JSON output from the Python script
    try {
      const result = JSON.parse(stdout);
      return res.json(result);
    } catch (parseError) {
      console.error(`Error parsing Python script output: ${parseError.message}`);
      console.error(`Raw stdout: ${stdout}`);
      return res.status(500).json({
        success: false,
        error: `Error parsing Python script output: ${parseError.message}`,
        metrics: { found: false }
      });
    }
  } catch (error) {
    console.error(`Error in scholarly search: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: `Error searching for professor: ${error.message}`,
      metrics: { found: false }
    });
  }
});

// AI-powered endpoints using Gemini API
app.post('/api/ai/matching-score', async (req, res) => {
  try {
    const { studentProfile, professorData } = req.body;
    
    if (!studentProfile || !professorData) {
      return res.status(400).json({
        success: false,
        error: 'Student profile and professor data are required'
      });
    }
    
    console.log('Calculating matching score between student and professor');
    const result = await geminiAIService.calculateProfileMatchingScore(studentProfile, professorData);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to calculate matching score');
    }
    
    return res.json(result);
  } catch (error) {
    console.error(`Error calculating matching score: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: `Error calculating matching score: ${error.message}`
    });
  }
});

app.post('/api/ai/professor-summary', async (req, res) => {
  try {
    const { professorData } = req.body;
    
    if (!professorData) {
      return res.status(400).json({
        success: false,
        error: 'Professor data is required'
      });
    }
    
    console.log(`Generating summary for professor: ${professorData.name}`);
    const result = await geminiAIService.generateProfessorSummary(professorData);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate professor summary');
    }
    
    return res.json(result);
  } catch (error) {
    console.error(`Error generating professor summary: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: `Error generating professor summary: ${error.message}`
    });
  }
});

app.post('/api/ai/research-trends', async (req, res) => {
  try {
    const { professorData } = req.body;
    
    if (!professorData || !professorData.publications || professorData.publications.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Professor publications are required for analysis'
      });
    }
    
    console.log(`Analyzing research trends for professor: ${professorData.name}`);
    const result = await geminiAIService.analyzeResearchTrends(professorData);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to analyze research trends');
    }
    
    return res.json(result);
  } catch (error) {
    console.error(`Error analyzing research trends: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: `Error analyzing research trends: ${error.message}`
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      geminiAI: process.env.GEMINI_API_KEY ? 'configured' : 'not configured',
      database: 'connected'
    }
  });
});

// Helper function to get Google Scholar metrics
async function searchScholarProfile(name, university) {
  try {
    console.log(`Searching for ${name} on Google Scholar`);
    
    // Construct the search URL
    const searchQuery = `${name} google scholar`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const searchUrl = `https://www.google.com/search?q=${encodedQuery}`;
    
    // Scrape Google search results to find the scholar profile
    const result = await safeScrape(searchUrl, { timeout: 20000 }, 3);
    
    if (!result.success) {
      console.error('Failed to search for Google Scholar profile');
      return { success: false, error: 'Failed to search for Google Scholar profile' };
    }
    
    // Parse the search results
    const $ = cheerio.load(result.data);
    
    // Look for Google Scholar links
    let scholarUrl = null;
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('scholar.google.com/citations') && href.includes('user=')) {
        // Extract the URL
        const match = href.match(/https?:\/\/scholar\.google\.com\/citations[^&]+/);
        if (match) {
          scholarUrl = match[0];
          return false; // Break the loop
        }
      }
    });
    
    if (!scholarUrl) {
      console.log('No Google Scholar profile found');
      return { success: false, error: 'No Google Scholar profile found' };
    }
    
    console.log(`Found Google Scholar profile: ${scholarUrl}`);
    
    // Scrape the Google Scholar profile
    const scholarResult = await safeScrape(scholarUrl, { timeout: 20000 }, 3);
    
    if (!scholarResult.success) {
      console.error('Failed to scrape Google Scholar profile');
      return { success: false, error: 'Failed to scrape Google Scholar profile' };
    }
    
    // Parse the Google Scholar profile
    const scholar$ = cheerio.load(scholarResult.data);
    
    // Extract the metrics
    const metrics = {
      found: true,
      name: scholar$('#gsc_prf_in').text().trim(),
      affiliation: scholar$('.gsc_prf_il').first().text().trim(),
      interests: [],
      citationsAll: 0,
      citationsSince2019: 0,
      hIndexAll: 0,
      hIndexSince2019: 0,
      i10IndexAll: 0,
      i10IndexSince2019: 0,
      profileUrl: scholarUrl,
      topPublications: []
    };
    
    // Extract research interests
    scholar$('a.gsc_prf_inta').each((i, el) => {
      metrics.interests.push(scholar$(el).text().trim());
    });
    
    // Extract citation metrics
    scholar$('td.gsc_rsb_std').each((i, el) => {
      const value = parseInt(scholar$(el).text().trim(), 10) || 0;
      
      switch (i) {
        case 0: metrics.citationsAll = value; break;
        case 1: metrics.citationsSince2019 = value; break;
        case 2: metrics.hIndexAll = value; break;
        case 3: metrics.hIndexSince2019 = value; break;
        case 4: metrics.i10IndexAll = value; break;
        case 5: metrics.i10IndexSince2019 = value; break;
      }
    });
    
    // Extract top publications
    scholar$('tr.gsc_a_tr').each((i, el) => {
      if (i < 5) { // Limit to top 5 publications
        const title = scholar$(el).find('a.gsc_a_at').text().trim();
        const authors = scholar$(el).find('.gs_gray').first().text().trim();
        const venue = scholar$(el).find('.gs_gray').last().text().trim();
        const citedBy = scholar$(el).find('.gsc_a_ac').text().trim();
        const year = scholar$(el).find('.gsc_a_h').text().trim();
        
        metrics.topPublications.push({
          title,
          authors,
          venue,
          year,
          citations: parseInt(citedBy, 10) || 0
        });
      }
    });
    
    return { success: true, metrics };
  } catch (error) {
    console.error('Error getting Google Scholar metrics:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to simplify metrics for response
function formatScholarMetrics(metrics) {
  return {
    name: metrics.name,
    affiliation: metrics.affiliation,
    interests: metrics.interests,
    citations: {
      all: metrics.citationsAll,
      since2019: metrics.citationsSince2019
    },
    hIndex: {
      all: metrics.hIndexAll,
      since2019: metrics.hIndexSince2019
    },
    i10Index: {
      all: metrics.i10IndexAll,
      since2019: metrics.i10IndexSince2019
    },
    profileUrl: metrics.profileUrl,
    topPublications: metrics.topPublications
  };
}

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API available at http://localhost:${port}/api`);
});

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
