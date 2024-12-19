import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Groq } from 'groq-sdk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const GROQ_API_KEYS = [
  process.env.VITE_GROQ_API_KEY_1,
  process.env.VITE_GROQ_API_KEY_2,
  process.env.VITE_GROQ_API_KEY_3,
  process.env.VITE_GROQ_API_KEY_4,
  process.env.VITE_GROQ_API_KEY_5
];

let currentKeyIndex = 0;

const getNextGroqKey = () => {
  const key = GROQ_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GROQ_API_KEYS.length;
  return key;
};

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load backend environment variables
dotenv.config({ path: path.join(__dirname, '.env.backend') });

const app = express();
const port = 3002;

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Configure axios defaults
axios.defaults.timeout = 30000;
axios.defaults.maxRedirects = 5;

const FINDAPHD_BASE_URL = 'https://www.findaphd.com';

app.get('/api/scrape', async (req, res) => {
  try {
    const searchKeyword = req.query.keyword || 'computer science';
    const encodedKeyword = encodeURIComponent(searchKeyword);
    const FINDAPHD_URL = `${FINDAPHD_BASE_URL}/phds/?Keywords=${encodedKeyword}`;
    
    console.log(`Starting PhD opportunity scraping for keyword: ${searchKeyword}`);
    console.log(`URL: ${FINDAPHD_URL}`);
    
    const response = await axios.get(FINDAPHD_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    if (!response.data) {
      throw new Error('No data received from FindAPhD');
    }

    const $ = cheerio.load(response.data);
    const opportunities = [];
    let id = 1;

    $('.phd-result').each((index, element) => {
      try {
        const titleElement = $(element).find('.d-none.d-md-block.w-100 a, h4 a');
        const title = titleElement.attr('title')?.replace('More Details ', '').trim() || 
                     titleElement.text().trim();
        const link = titleElement.attr('href');

        if (!title) return;

        const scriptContent = $(element).find('script').html() || '';
        const universityMatch = scriptContent.match(/dynamicInstitutionName = "(.*?)";/) || 
                              scriptContent.match(/institution: "(.*?)"/);
        
        const university = universityMatch?.[1] || 
                         $(element).find('.deptLink').text().trim() || 
                         'University Not Specified';

        const department = $(element).find('.deptLink').text().trim() || 
                         'Department Not Specified';

        let logoUrl = $(element).find('img').attr('src');
        if (logoUrl) {
          logoUrl = logoUrl.startsWith('http') ? logoUrl :
                   logoUrl.startsWith('/') ? `${FINDAPHD_BASE_URL}${logoUrl}` :
                   `${FINDAPHD_BASE_URL}/${logoUrl}`;
        } else {
          logoUrl = 'https://via.placeholder.com/150?text=University';
        }

        const supervisor = $(element).find('.phd-result__key-info .icon-text').text().trim() || 
                         'Supervisor Not Specified';

        const deadline = $(element).find('.hoverTitle .icon-text').text().trim() || 
                        'Deadline Not Specified';

        const description = $(element).find('.descFrag').text().trim() || 
                          'No description available';

        const fundingStatus = $(element).find('.funding-status').text().trim() || 
                            'Funding status not specified';

        const opportunity = {
          id: id++,
          title: String(title),
          link: link ? (link.startsWith('http') ? link : `${FINDAPHD_BASE_URL}${link}`) : null,
          university: String(university),
          department: String(department),
          logoUrl,
          supervisor: String(supervisor),
          deadline: String(deadline),
          description: String(description),
          fundingStatus: String(fundingStatus),
          rating: null
        };
        
        opportunities.push(opportunity);
        console.log(`Successfully processed opportunity: ${title}`);
      } catch (error) {
        console.error(`Error processing opportunity ${index + 1}:`, error);
      }
    });

    if (opportunities.length === 0) {
      throw new Error('Failed to extract any valid opportunities');
    }

    // Initialize Groq client with rotating keys
    const groq = new Groq({
      apiKey: getNextGroqKey(),
      dangerouslyAllowBrowser: true
    });

    async function rateOpportunity(opportunity) {
      try {
        const prompt = `
          Rate this PhD opportunity from 0 to 100 based on the following criteria:
          - Research impact and innovation (40%)
          - University reputation (20%)
          - Funding availability (20%)
          - Project clarity and structure (20%)

          Title: ${opportunity.title}
          University: ${opportunity.university}
          Department: ${opportunity.department}
          Description: ${opportunity.description}
          Funding: ${opportunity.fundingStatus}

          Provide only a numeric score (0-100) without any explanation.
        `;

        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "mixtral-8x7b-32768",
          temperature: 0.3,
          max_tokens: 5,
          top_p: 1
        });

        const score = parseInt(completion.choices[0]?.message?.content);
        return isNaN(score) ? 70 : score;
      } catch (error) {
        console.error('Error rating opportunity:', error);
        return 70; // Default score on error
      }
    }

    console.log('Rating opportunities...');
    const ratedOpportunities = await Promise.all(
      opportunities.slice(0, 10).map(rateOpportunity)
    );

    opportunities.forEach((opportunity, index) => {
      if (index < 10) {
        opportunity.rating = ratedOpportunities[index];
      } else {
        opportunity.rating = 70; // Default rating for remaining opportunities
      }
    });

    // Sort opportunities by rating
    opportunities.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    console.log('Successfully processed all opportunities');
    res.json({ opportunities });

  } catch (error) {
    console.error('Error in /api/scrape:', error);
    res.status(500).json({ 
      error: error.message,
      opportunities: []
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
