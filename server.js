import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import rateLimit from 'express-rate-limit';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import Groq from 'groq-sdk';

// Load environment variables
dotenv.config();

// Initialize Groq client
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3002;

// Cache configuration
const CACHE_FILE = path.join(__dirname, 'cache', 'opportunities.json');
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Ensure cache directory exists
await fs.mkdir(path.join(__dirname, 'cache'), { recursive: true });

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { 
    error: 'Too many requests', 
    message: 'Please wait before making more requests',
    retryAfter: '60 seconds'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip;
  }
});

app.use('/api/', limiter);

// Helper function to clean text
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/[\n\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
};

// Helper function to extract dates
function extractDates(text) {
  if (!text) return null;

  const cleanedText = text.toLowerCase().trim();
  
  // Handle specific date format like "10 January 2025"
  const dateRegex = /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i;
  const match = cleanedText.match(dateRegex);
  
  if (match) {
    const [_, day, month, year] = match;
    const date = new Date(`${month} ${day}, ${year}`);
    
    // Check if it's a valid date
    if (!isNaN(date.getTime())) {
      return {
        deadline: date.toISOString(),
        startDate: new Date(date.getFullYear(), 8, 1).toISOString() // Default to September 1st of the same year
      };
    }
  }

  // Fallback: Look for year mentions
  const yearMatch = cleanedText.match(/\b(202\d|203\d)\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    return {
      deadline: new Date(year, 5, 30).toISOString(), // Default to June 30th
      startDate: new Date(year, 8, 1).toISOString() // Default to September 1st
    };
  }

  return null;
};

// Helper function to calculate scores
const calculateBasicScores = (opportunity) => {
  const scores = {
    relevance: 0,
    funding: 0,
    university: 0,
    location: 0,
    overall: 0
  };

  // Calculate relevance score based on AI/ML keywords
  if (opportunity.title && opportunity.description) {
    const keywords = [
      'machine learning',
      'artificial intelligence',
      'ai',
      'deep learning',
      'neural networks',
      'computer science',
      'data science'
    ];
    const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();
    const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
    scores.relevance = Math.min(100, matchCount * 15); // Adjusted weight per keyword
  }

  // Calculate funding score
  if (opportunity.fundingStatus) {
    switch(opportunity.fundingStatus.toLowerCase()) {
      case 'fully funded':
        scores.funding = 100;
        break;
      case 'partially funded':
        scores.funding = 60;
        break;
      case 'unfunded':
        scores.funding = 20;
        break;
      default:
        scores.funding = 0;
    }
  }

  // Calculate university score
  if (opportunity.university) {
    const topUniversities = [
      'oxford',
      'cambridge',
      'harvard',
      'mit',
      'stanford',
      'imperial college',
      'eth zurich',
      'berkeley'
    ];
    const goodUniversities = [
      'ucl',
      'edinburgh',
      'manchester',
      'kings college',
      'warwick'
    ];
    const uniName = opportunity.university.toLowerCase();
    
    if (topUniversities.some(uni => uniName.includes(uni))) {
      scores.university = 100;
    } else if (goodUniversities.some(uni => uniName.includes(uni))) {
      scores.university = 80;
    } else {
      scores.university = 60; // Base score for universities
    }
  }

  // Calculate location score
  if (opportunity.location) {
    const preferredLocations = {
      'united kingdom': 100,
      'usa': 100,
      'united states': 100,
      'canada': 90,
      'australia': 90,
      'germany': 85,
      'netherlands': 85,
      'switzerland': 85
    };
    
    const location = opportunity.location.toLowerCase();
    for (const [country, score] of Object.entries(preferredLocations)) {
      if (location.includes(country)) {
        scores.location = score;
        break;
      }
    }
    if (scores.location === 0) scores.location = 50; // Base score for other locations
  }

  // Calculate overall score with weighted average
  const weights = {
    relevance: 0.35,  // Most important
    funding: 0.30,    // Very important
    university: 0.20, // Important
    location: 0.15    // Less important
  };

  scores.overall = Math.round(
    scores.relevance * weights.relevance +
    scores.funding * weights.funding +
    scores.university * weights.university +
    scores.location * weights.location
  );

  // Round all scores
  for (let key in scores) {
    scores[key] = Math.round(scores[key]);
  }

  return scores;
};

// Helper function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Cache management functions
async function readCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { opportunities: [], lastUpdated: 0 };
  }
}

async function writeCache(data) {
  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

async function getCachedOpportunities(keyword) {
  const cache = await readCache();
  const now = Date.now();

  // Check if cache is valid (less than 1 hour old)
  if (now - cache.lastUpdated < CACHE_DURATION) {
    const opportunities = cache.opportunities.filter(opp => {
      const text = `${opp.title} ${opp.description} ${opp.university} ${opp.department}`.toLowerCase();
      return text.includes(keyword.toLowerCase());
    });

    if (opportunities.length > 0) {
      // Update scores and timestamps before returning
      return opportunities.map(opp => ({
        ...opp,
        scores: calculateBasicScores(opp),
        scrapedAt: new Date().toISOString()
      }));
    }
  }

  // Clear old cache
  await writeCache({ opportunities: [], lastUpdated: 0 });
  return null;
}

// Scraping functions
async function scrapeOpportunities(keyword) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Configure viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'document') {
        req.continue();
      } else {
        req.abort();
      }
    });

    // Add stealth configurations
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
    });

    const baseUrl = 'https://www.findaphd.com';
    const searchUrl = `${baseUrl}/phds/?Keywords=${encodeURIComponent(keyword)}`;
    console.log(`Scraping URL: ${searchUrl}`);

    await page.goto(searchUrl, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for results with retry mechanism
    let retries = 3;
    let content = '';
    
    while (retries > 0) {
      try {
        await page.waitForSelector('.phd-result', { timeout: 10000 });
        content = await page.content();
        break;
      } catch (error) {
        console.log(`Retry ${4 - retries} failed. Retrying...`);
        retries--;
        if (retries === 0) throw error;
        await page.reload({ waitUntil: 'networkidle0' });
      }
    }

    const $ = cheerio.load(content);
    let opportunities = [];

    // Process each opportunity
    $('.phd-result').each((_, element) => {
      try {
        const $element = $(element);
        
        // Extract title and link
        const titleElement = $element.find('a.h4.text-dark');
        const title = cleanText(titleElement.text());
        const link = titleElement.attr('href') ? 
          (titleElement.attr('href').startsWith('http') ? 
            titleElement.attr('href') : 
            baseUrl + titleElement.attr('href')
          ) : null;

        // Extract description
        const description = cleanText($element.find('.descFrag').first().text());

        // Extract university and department
        const university = cleanText($element.find('.phd-result__dept-inst--title').text());
        const department = cleanText($element.find('.phd-result__dept').text());

        // Extract supervisor
        const supervisor = cleanText($element.find('.fa-chalkboard-teacher').parent().text())
          .replace('Supervisor:', '').trim();

        // Extract deadline
        const deadlineText = $element.find('.fa-calendar').parent().text().trim();
        const deadline = extractDates(deadlineText);

        // Extract funding status
        const fundingElement = $element.find('[class*="funding"]');
        let fundingStatus = 'Unknown';
        const fundingText = cleanText(fundingElement.text()).toLowerCase();
        
        if (fundingText.includes('fully funded')) {
          fundingStatus = 'Fully Funded';
        } else if (fundingText.includes('partial')) {
          fundingStatus = 'Partially Funded';
        } else if (fundingText.includes('funding available')) {
          fundingStatus = 'Funding Available';
        } else if (fundingText.includes('self funded')) {
          fundingStatus = 'Self-Funded';
        }

        // Extract location
        let location = cleanText($element.find('.location').text());
        if (!location) {
          if (university.toLowerCase().includes('uk') || 
              university.toLowerCase().includes('united kingdom') ||
              university.toLowerCase().includes('england') ||
              university.toLowerCase().includes('scotland') ||
              university.toLowerCase().includes('wales')) {
            location = 'United Kingdom';
          } else if (university.toLowerCase().includes('usa') ||
                     university.toLowerCase().includes('united states')) {
            location = 'United States';
          } else {
            location = 'International';
          }
        }

        // Create opportunity object if title exists
        if (title) {
          opportunities.push({
            title,
            university,
            department,
            description,
            location,
            fundingStatus,
            supervisor,
            link,
            source: 'FindAPhD',
            dates: {
              deadline: deadline?.deadline || null,
              startDate: deadline?.startDate || null
            },
            scrapedAt: new Date().toISOString()
          });
        }
      } catch (elementError) {
        console.error('Error processing opportunity:', elementError);
      }
    });

    console.log(`Successfully scraped ${opportunities.length} opportunities`);
    return opportunities;

  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Mock data for testing
const getMockOpportunities = (keyword) => {
  const opportunities = [
    {
      title: "PhD in Computer Science - AI and Machine Learning",
      university: "University of Oxford",
      department: "Department of Computer Science",
      description: "Research position in AI and Machine Learning focusing on deep learning and neural networks. The successful candidate will work on developing novel machine learning algorithms for real-world applications. Full funding available for qualified candidates.",
      location: "United Kingdom",
      fundingStatus: "Fully Funded",
      link: "https://www.cs.ox.ac.uk/admissions/graduate/dphil-computer-science",
      source: "FindAPhD",
      dates: {
        deadline: new Date("2024-03-01").toISOString(),
        startDate: new Date("2024-09-01").toISOString()
      }
    },
    {
      title: "PhD Position in Data Science and Analytics",
      university: "University of Manchester",
      department: "School of Engineering",
      description: "Research opportunity in data science and analytics with focus on big data processing and machine learning applications. Working with industry partners on real-world problems.",
      location: "United Kingdom",
      fundingStatus: "Partially Funded",
      link: "https://www.manchester.ac.uk/study/postgraduate-research/",
      source: "FindAPhD",
      dates: {
        deadline: new Date("2024-04-15").toISOString(),
        startDate: new Date("2024-10-01").toISOString()
      }
    },
    {
      title: "Doctoral Research in Natural Language Processing",
      university: "Stanford University",
      department: "Computer Science Department",
      description: "Research position in NLP and machine learning, focusing on transformer architectures and large language models. Full scholarship with stipend available.",
      location: "USA",
      fundingStatus: "Fully Funded",
      link: "https://cs.stanford.edu/admissions/phd",
      source: "FindAPhD",
      dates: {
        deadline: new Date("2024-02-28").toISOString(),
        startDate: new Date("2024-09-15").toISOString()
      }
    }
  ];

  // Filter opportunities based on keyword
  if (!keyword) return opportunities;
  
  return opportunities.filter(opp => {
    const text = `${opp.title} ${opp.description} ${opp.university} ${opp.department}`.toLowerCase();
    return text.includes(keyword.toLowerCase());
  }).map(opp => ({
    ...opp,
    scores: calculateBasicScores(opp),
    scrapedAt: new Date().toISOString()
  }));
};

// Enhanced scoring function using Groq
const calculateEnhancedScores = async (opportunity) => {
  try {
    // Prepare opportunity data for analysis
    const opportunityContext = `
Title: ${opportunity.title}
University: ${opportunity.university}
Department: ${opportunity.department || 'Not specified'}
Location: ${opportunity.location || 'Not specified'}
Funding: ${opportunity.fundingStatus || 'Not specified'}
Description: ${opportunity.description}
Supervisor: ${opportunity.supervisor || 'Not specified'}
    `;

    console.log('Sending request to Groq...');
    // Get LLM analysis
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert in evaluating PhD opportunities. Analyze the given opportunity and provide scores in these categories:
          - Relevance (0-100): How relevant is this opportunity to AI/ML/Computer Science
          - Funding (0-100): Quality of funding package
          - University (0-100): University's reputation and research quality
          - Location (0-100): Desirability and accessibility of location
          Respond only with a JSON object containing these scores.
          Example response: {"relevance": 95, "funding": 90, "university": 85, "location": 80}`
        },
        {
          role: "user",
          content: opportunityContext
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: "json_object" }
    });

    console.log('Groq response:', chatCompletion.choices[0]?.message?.content);

    // Parse LLM response
    const llmScores = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
    
    // Validate scores
    if (!llmScores.relevance || !llmScores.funding || !llmScores.university || !llmScores.location) {
      console.log('Invalid LLM scores, falling back to basic scoring');
      return calculateBasicScores(opportunity);
    }

    // Combine with basic scores for robustness
    const basicScores = calculateBasicScores(opportunity);
    
    // Calculate weighted average between LLM and basic scores
    const scores = {
      relevance: Math.round((llmScores.relevance * 0.7 + basicScores.relevance * 0.3)),
      funding: Math.round((llmScores.funding * 0.7 + basicScores.funding * 0.3)),
      university: Math.round((llmScores.university * 0.7 + basicScores.university * 0.3)),
      location: Math.round((llmScores.location * 0.7 + basicScores.location * 0.3))
    };

    // Calculate overall score
    const weights = {
      relevance: 0.35,
      funding: 0.30,
      university: 0.20,
      location: 0.15
    };

    scores.overall = Math.round(
      scores.relevance * weights.relevance +
      scores.funding * weights.funding +
      scores.university * weights.university +
      scores.location * weights.location
    );

    return scores;
  } catch (error) {
    console.error('Error in LLM scoring:', error);
    // Fallback to basic scoring if LLM fails
    return calculateBasicScores(opportunity);
  }
};

// Scraping endpoint
app.get('/api/scrape', async (req, res) => {
  try {
    const { keyword = '' } = req.query;
    const cleanKeyword = cleanText(keyword);
    console.log(`Received search request for keyword: ${cleanKeyword}`);

    // First, check cache
    const cachedResults = await getCachedOpportunities(cleanKeyword);
    if (cachedResults) {
      console.log('Returning cached results');
      return res.json({
        opportunities: cachedResults,
        source: 'cache'
      });
    }

    // Scrape new opportunities
    let opportunities = await scrapeOpportunities(cleanKeyword);
    
    // If no results from scraping, use mock data
    if (!opportunities || opportunities.length === 0) {
      console.log('No results from scraping, using mock data');
      opportunities = getMockOpportunities(cleanKeyword);
    }

    // Process each opportunity
    opportunities = await Promise.all(opportunities.map(async (opp) => {
      try {
        // Calculate basic scores
        const basicScores = calculateBasicScores(opp);
        
        // Try to get enhanced scores using Groq
        let enhancedScores;
        try {
          enhancedScores = await calculateEnhancedScores(opp);
        } catch (error) {
          console.warn('Failed to get enhanced scores:', error);
          enhancedScores = null;
        }

        // Combine scores, preferring enhanced scores when available
        const scores = enhancedScores || basicScores;

        // Compute search relevance score if keyword provided
        if (cleanKeyword) {
          const searchTerms = cleanKeyword.toLowerCase().split(/\s+/);
          const content = [
            opp.title,
            opp.description,
            opp.university,
            opp.department,
            opp.supervisor
          ].map(s => cleanText(s?.toLowerCase() || '')).join(' ');

          let relevanceScore = 0;
          searchTerms.forEach(term => {
            if (term.length > 2) { // Only consider terms longer than 2 characters
              const regex = new RegExp(term, 'gi');
              const matches = content.match(regex);
              if (matches) {
                relevanceScore += matches.length;
                
                // Boost scores for matches in important fields
                if (opp.title?.toLowerCase().includes(term)) relevanceScore += 10;
                if (opp.university?.toLowerCase().includes(term)) relevanceScore += 5;
                if (opp.department?.toLowerCase().includes(term)) relevanceScore += 3;
              }
            }
          });

          // Normalize relevance score (0-100)
          scores.relevance = Math.min(100, Math.round((relevanceScore / searchTerms.length) * 20));
        }

        return {
          ...opp,
          scores: {
            ...scores,
            overall: Math.round(
              (scores.relevance * 0.4) +
              (scores.funding * 0.3) +
              (scores.university * 0.2) +
              (scores.location * 0.1)
            )
          }
        };
      } catch (error) {
        console.error('Error processing opportunity:', error);
        return {
          ...opp,
          scores: calculateBasicScores(opp)
        };
      }
    }));

    // Sort by relevance and overall score
    opportunities.sort((a, b) => {
      if (cleanKeyword) {
        // If searching, prioritize relevance
        const relevanceDiff = (b.scores?.relevance || 0) - (a.scores?.relevance || 0);
        if (relevanceDiff !== 0) return relevanceDiff;
      }
      // Then by overall score
      return (b.scores?.overall || 0) - (a.scores?.overall || 0);
    });

    // Cache the results
    await writeCache(opportunities);

    res.json({
      opportunities,
      source: 'api'
    });

  } catch (error) {
    console.error('Error in /api/scrape:', error);
    res.status(500).json({
      opportunities: getMockOpportunities(cleanKeyword),
      errors: [{ message: error.message }],
      source: 'error'
    });
  }
});

// Test endpoint for LLM scoring
app.post('/api/test-llm', async (req, res) => {
  try {
    const testOpportunity = {
      title: "PhD in Machine Learning for Computer Vision",
      university: "Stanford University",
      department: "Computer Science",
      location: "California, USA",
      fundingStatus: "Fully Funded",
      description: "We are seeking exceptional candidates for a fully funded PhD position in Machine Learning and Computer Vision. The project focuses on developing novel deep learning architectures for real-time object detection and scene understanding. The successful candidate will work with state-of-the-art computing facilities and collaborate with leading industry partners.",
      supervisor: "Dr. Jane Smith"
    };

    console.log('Testing LLM scoring with sample opportunity...');
    const scores = await calculateEnhancedScores(testOpportunity);
    console.log('LLM Scores:', scores);

    res.json({
      opportunity: testOpportunity,
      scores,
      success: true
    });
  } catch (error) {
    console.error('LLM Test Error:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

// LLM analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { opportunity } = req.body;
    if (!opportunity) {
      return res.status(400).json({ error: 'No opportunity data provided' });
    }

    const scores = await calculateEnhancedScores(opportunity);
    res.json({ scores });
  } catch (error) {
    console.error('Error analyzing opportunity:', error);
    res.status(500).json({ error: 'Error analyzing opportunity' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    version: process.version
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
