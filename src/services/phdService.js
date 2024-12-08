import axios from 'axios';
import * as cheerio from 'cheerio';
import Groq from 'groq-sdk';

const API_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY_1,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY_3,
  import.meta.env.VITE_GROQ_API_KEY_4,
  import.meta.env.VITE_GROQ_API_KEY_5,
  import.meta.env.VITE_GROQ_API_KEY_6,
  import.meta.env.VITE_GROQ_API_KEY_7,
  import.meta.env.VITE_GROQ_API_KEY_8,
].filter(Boolean);

let currentKeyIndex = 0;

const getNextApiKey = () => {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
};

const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
};

const extractDeadline = (text) => {
  if (!text) return '';
  const match = text.match(/\d{1,2}\s+[A-Za-z]+\s+\d{4}/);
  return match ? match[0] : text.trim();
};

const extractSupervisor = (text) => {
  if (!text) return '';
  return text.replace(/Supervisor:\s*/i, '').trim();
};

const determinePositionType = (title, description) => {
  const text = (title + ' ' + description).toLowerCase();
  if (text.includes('phd') || text.includes('doctorate') || text.includes('doctoral')) return 'phd';
  if (text.includes('masters') || text.includes('msc') || text.includes('master of')) return 'masters';
  if (text.includes('postdoc') || text.includes('post-doc') || text.includes('postdoctoral')) return 'postdoc';
  if (text.includes('internship') || text.includes('intern')) return 'internship';
  if (text.includes('research assistant') || text.includes('research associate') || text.includes('research fellow')) return 'research';
  if (text.includes('lecturer') || text.includes('professor') || text.includes('faculty')) return 'job';
  return 'research';
};

export const scrapePhdData = async (searchQuery) => {
  try {
    console.log('Fetching data for query:', searchQuery);
    const proxyUrl = 'http://localhost:3001/api/phd';
    const searchUrl = `${proxyUrl}/?Keywords=${encodeURIComponent(searchQuery)}`;
    
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);
    
    const opportunities = [];
    
    $('.phd-result').each((index, element) => {
      try {
        const $element = $(element);
        const title = cleanText($element.find('h3 a, .h4 a, .h5 a').first().text());
        const link = 'https://www.findaphd.com' + $element.find('h3 a, .h4 a, .h5 a').first().attr('href');
        const description = cleanText($element.find('.description, .descFrag').first().text());
        const university = cleanText($element.find('.inst-logo img').attr('alt') || $element.find('.phd-result__dept-inst--title').text());
        const imageUrl = $element.find('.inst-logo img').attr('src');
        const deadline = extractDeadline($element.find('.deadline, .icon-text:contains("calendar")').text());
        const supervisor = extractSupervisor($element.find('.super:contains("Supervisor"), .icon-text:contains("Supervisor")').text());
        const positionType = determinePositionType(title, description);

        if (title && description) {
          opportunities.push({
            id: index + 1,
            title,
            description,
            university,
            imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : 'https://www.findaphd.com' + imageUrl) : null,
            link,
            deadline,
            supervisor,
            positionType
          });
        }
      } catch (err) {
        console.error('Error processing opportunity:', err);
      }
    });
    
    console.log('Scraped opportunities:', opportunities.length);
    return await processWithGroq(opportunities);
  } catch (error) {
    console.error('Error scraping data:', error);
    return [];
  }
};

const processWithGroq = async (opportunities) => {
  if (!opportunities.length) return [];
  
  try {
    const chunkSize = Math.max(1, Math.ceil(opportunities.length / API_KEYS.length));
    const chunks = Array.from({ length: Math.ceil(opportunities.length / chunkSize) }, (_, i) =>
      opportunities.slice(i * chunkSize, (i + 1) * chunkSize)
    );

    console.log('Processing chunks:', chunks.length);

    const processedChunks = await Promise.all(chunks.map(async (chunk, index) => {
      try {
        const groq = new Groq({ apiKey: API_KEYS[index % API_KEYS.length] });
        const prompt = `
          For each opportunity, create a one-sentence summary that highlights:
          1. The main research focus or job responsibility
          2. Key requirements or qualifications
          3. Any unique aspects or benefits
          
          Input: ${JSON.stringify(chunk.map(opp => ({
            title: opp.title,
            description: opp.description
          })))}
          
          Format the response as a JSON array with objects containing:
          {
            "shortDescription": "one sentence summary"
          }
        `;

        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama3-8b-8192",
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) return chunk;

        try {
          const processed = JSON.parse(content);
          return chunk.map((opp, i) => ({
            ...opp,
            shortDescription: processed[i]?.shortDescription || opp.description?.slice(0, 150)
          }));
        } catch (parseError) {
          console.error('Error parsing Groq response:', parseError);
          return chunk;
        }
      } catch (error) {
        console.error('Error processing chunk with Groq:', error);
        return chunk;
      }
    }));

    return processedChunks.flat().map((opp, index) => ({
      id: index + 1,
      title: opp.title || '',
      description: opp.description || '',
      shortDescription: opp.shortDescription || opp.description?.slice(0, 150) || '',
      university: opp.university || '',
      imageUrl: opp.imageUrl || null,
      link: opp.link || '',
      deadline: opp.deadline || '',
      supervisor: opp.supervisor || '',
      positionType: opp.positionType || 'research'
    }));
  } catch (error) {
    console.error('Error in Groq processing:', error);
    return opportunities;
  }
};
