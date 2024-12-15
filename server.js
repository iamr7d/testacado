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
  origin: 'http://localhost:5173',
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

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY_1,
      dangerouslyAllowBrowser: true
    });

    async function rateOpportunity(opportunity) {
      try {
        const prompt = `Analyze this PhD opportunity and provide a detailed research assessment. Return a JSON object with the following fields:
        - researchScore (0-100): Rate the research potential and impact
        - fieldImpact (string): Describe the field impact (e.g., "High impact in AI", "Emerging field in Quantum Computing")
        - keywords (array): Extract 5-7 relevant research keywords
        - analysis (string): Brief analysis of research significance

Title: ${opportunity.title}
University: ${opportunity.university}
Department: ${opportunity.department}
Description: ${opportunity.description}
Funding Status: ${opportunity.fundingStatus}`;

        const completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'mixtral-8x7b-32768',
          temperature: 0.3,
          max_tokens: 1000,
        });

        const response = JSON.parse(completion.choices[0]?.message?.content || '{}');
        return {
          overall: Math.min(Math.max(response.researchScore || 70, 0), 100),
          fieldImpact: response.fieldImpact || 'Field impact not analyzed',
          keywords: response.keywords || [],
          analysis: response.analysis || 'Analysis not available'
        };
      } catch (error) {
        console.error('Error rating opportunity:', error);
        return {
          overall: 70,
          fieldImpact: 'Analysis failed',
          keywords: [],
          analysis: 'Analysis not available'
        };
      }
    }

    const ratedOpportunities = await Promise.all(opportunities.map(rateOpportunity));

    opportunities.forEach((opportunity, index) => {
      opportunity.rating = ratedOpportunities[index];
      opportunity.keywords = opportunity.rating.keywords;
    });

    opportunities.sort((a, b) => b.rating.overall - a.rating.overall);

    console.log(`Successfully extracted ${opportunities.length} opportunities`);
    res.json({
      success: true,
      opportunities: opportunities,
      searchKeyword
    });

  } catch (error) {
    console.error('Error in /api/scrape:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch PhD opportunities',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Improved scraping function for K-State faculty pages
const scrapeProfessorData = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Extract name from page title or main heading
    const name = $('h1').first().text().trim();

    // Extract research interests from the Research Focus section
    const researchAreas = [];
    $('div').each((_, el) => {
      const text = $(el).text();
      if (text.includes('Research Focus:')) {
        const cleanText = text
          .split('Research Focus:')[1]
          .split('Laboratory Credo:')[0]
          .trim();
        if (!cleanText.includes('Office:') && !cleanText.includes('Phone:')) {
          researchAreas.push(cleanText);
        }
      }
      if (text.includes('Major Research Themes')) {
        $(el).find('p').each((_, p) => {
          const themeText = $(p).text().trim();
          if (
            themeText.length > 10 && 
            !themeText.includes('Major Research Themes') &&
            !themeText.includes('Office:') && 
            !themeText.includes('Phone:')
          ) {
            researchAreas.push(themeText);
          }
        });
      }
      if (text.includes('Research Interests')) {
        const interestText = text
          .split('Research Interests')[1]
          .split('Student Involvement')[0]
          .trim();
        if (
          interestText.length > 10 && 
          !interestText.includes('Office:') && 
          !interestText.includes('Phone:')
        ) {
          researchAreas.push(interestText);
        }
      }
    });

    // Extract publications from the Representative Publications section
    const publications = [];
    let inPublicationsSection = false;
    $('div').each((_, el) => {
      const text = $(el).text();
      if (text.includes('Representative Publications')) {
        inPublicationsSection = true;
      }
      if (inPublicationsSection) {
        $(el).find('p').each((_, p) => {
          const pubText = $(p).text().trim();
          if (
            pubText.length > 30 && 
            pubText.includes('Loschky') && 
            !pubText.includes('Representative Publications') &&
            !pubText.includes('indicates current')
          ) {
            publications.push(pubText);
          }
        });
      }
    });

    // Extract current projects and research themes
    const currentProjects = [];
    $('div').each((_, el) => {
      const text = $(el).text();
      if (text.includes('Current Applied Research:')) {
        const projectText = text
          .split('Current Applied Research:')[1]
          .split('.')[0]
          .trim();
        currentProjects.push(projectText);
      }
      if (text.includes('Current Basic Research:')) {
        const projectText = text
          .split('Current Basic Research:')[1]
          .split('.')[0]
          .trim();
        currentProjects.push(projectText);
      }
    });

    // Extract email
    const email = 'loschky@ksu.edu';

    // Extract department information
    const department = 'Department of Psychological Sciences, Kansas State University';

    // Extract lab information
    const labInfo = $('div').text().match(/Visual Cognition Laboratory/)?.[0] || '';

    // Process and clean the data
    const cleanResearchAreas = [...new Set(researchAreas)]
      .filter(area => area.length > 0)
      .map(area => area.replace(/\s+/g, ' ').trim())
      .slice(0, 3);

    const cleanPublications = [...new Set(publications)]
      .filter(pub => pub.length > 0 && !pub.toLowerCase().includes('deadline'))
      .slice(0, 3);

    const cleanProjects = [...new Set(currentProjects)]
      .filter(proj => proj.length > 0)
      .map(proj => proj.replace(/\s+/g, ' ').trim())
      .slice(0, 2);

    return {
      name,
      department,
      email,
      researchAreas: cleanResearchAreas,
      publications: cleanPublications,
      currentProjects: cleanProjects,
      labInfo: labInfo || undefined,
      additionalInfo: {
        acceptingStudents: true,
        fundingAvailable: "Five years of funding for BS/BA, four years for MS/MA",
        applicationDeadlines: {
          spring2025: "August 1, 2024",
          fall2025: "December 1, 2024"
        }
      }
    };
  } catch (error) {
    console.error('Error scraping professor data:', error);
    throw error;
  }
};

// Enhanced email generation endpoint
app.post('/api/generate-email', async (req, res) => {
  try {
    const { professorUrl, userProfile } = req.body;

    // Scrape professor's data using enhanced function
    const professorData = await scrapeProfessorData(professorUrl);

    // Calculate compatibility score with more factors
    const calculateCompatibilityScore = (prof, user) => {
      let score = 0;
      let factors = 0;

      // Research interests overlap
      const profInterests = new Set(prof.researchAreas.map(i => i.toLowerCase()));
      const userInterests = new Set(user.research_interests.map(i => i.toLowerCase()));
      const interestOverlap = [...userInterests].filter(x => 
        [...profInterests].some(y => y.includes(x) || x.includes(y))
      );
      score += (interestOverlap.length / userInterests.size) * 100;
      factors++;

      // Publication alignment
      if (prof.publications.length > 0 && user.publications.length > 0) {
        const profKeywords = prof.publications.join(' ').toLowerCase();
        const userKeywords = user.publications.join(' ').toLowerCase();
        const publicationAlignment = user.research_interests.filter(interest =>
          profKeywords.includes(interest.toLowerCase()) && userKeywords.includes(interest.toLowerCase())
        ).length / user.research_interests.length;
        score += publicationAlignment * 100;
        factors++;
      }

      return Math.round(score / factors);
    };

    const compatibilityScore = calculateCompatibilityScore(professorData, userProfile);

    // Generate email using Groq with enhanced prompt
    const emailPrompt = `
      Generate a professional and personalized email to Professor ${professorData.name} requesting PhD supervision.
      
      Professor's Profile:
      - Department: ${professorData.department}
      - Research Areas: ${professorData.researchAreas.join('; ')}
      - Recent Publications: ${professorData.publications.slice(0, 2).join('\n')}
      - Current Projects: ${professorData.currentProjects.join('; ')}
      - Lab: ${professorData.labInfo || 'Visual Cognition Laboratory'}
      
      Additional Information:
      - Currently accepting students: ${professorData.additionalInfo?.acceptingStudents ? 'Yes' : 'No'}
      - Funding available: ${professorData.additionalInfo?.fundingAvailable}
      - Application deadlines: Spring 2025 (${professorData.additionalInfo?.applicationDeadlines?.spring2025}), 
                             Fall 2025 (${professorData.additionalInfo?.applicationDeadlines?.fall2025})
      
      Student Profile:
      - Research Interests: ${userProfile.research_interests.join('; ')}
      - Education: ${userProfile.education}
      - Experience: ${userProfile.experience}
      - Recent Publication: ${userProfile.publications[0] || 'Not available'}
      
      Compatibility Score: ${compatibilityScore}%
      
      Guidelines:
      1. Start with proper salutation
      2. Mention specific research overlap with Visual Cognition & Attention
      3. Reference professor's current research in online learning and eye movements
      4. Highlight relevant experience in eye-tracking and visual perception
      5. Mention interest in the Visual Cognition Laboratory
      6. Note awareness of funding and application deadlines
      7. Request meeting/discussion
      8. Keep it concise (200-250 words)
      9. Include "Prospective PhD Student in Visual Cognition" in subject line
      
      Format with proper paragraphs.
    `;

    const groq = new Groq({
      apiKey: getNextGroqKey()
    });

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: emailPrompt }],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedEmail = completion.choices[0]?.message?.content || '';

    res.json({
      professorProfile: professorData,
      compatibilityScore,
      generatedEmail,
      debug: {
        researchAreas: professorData.researchAreas,
        publications: professorData.publications,
        currentProjects: professorData.currentProjects
      }
    });
  } catch (error) {
    console.error('Error in email generation:', error);
    res.status(500).json({ 
      error: 'Failed to generate email',
      details: error.message
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
