import axios from 'axios';
import * as cheerio from 'cheerio';
import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq();

async function rateOpportunity(opportunity) {
  try {
    const prompt = `Rate this PhD opportunity on a scale of 0-100 based on its potential impact, research area, and overall attractiveness. Only return the numerical score, nothing else.

Title: ${opportunity.title}
University: ${opportunity.university}
Department: ${opportunity.department}
Description: ${opportunity.description}
Funding Status: ${opportunity.fundingStatus}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 10,
    });

    const rating = parseInt(completion.choices[0]?.message?.content?.trim() || '0');
    return Math.min(Math.max(rating, 0), 100); // Ensure rating is between 0 and 100
  } catch (error) {
    console.error('Error rating opportunity:', error);
    return 0;
  }
}

async function scrapePhdOpportunities() {
  try {
    const { data } = await axios.get('https://www.findaphd.com/phds/?Keywords=ai');
    const $ = cheerio.load(data);

    const opportunities = [];

    $('.phd-result').each((index, element) => {
      const title = $(element).find('.d-none.d-md-block.w-100 a').attr('title')?.replace('More Details ', '').trim();
      const link = $(element).find('.d-none.d-md-block.w-100 a').attr('href');
      const university = $(element).find('.deptLink').text().trim() || $(element).find('script').html().match(/dynamicInstitutionName = "(.*?)";/)?.[1];
      const department = $(element).find('.deptLink').text().trim();
      const logoUrl = $(element).find('img').attr('src');
      const supervisor = $(element).find('.phd-result__key-info .icon-text').text().trim();
      const deadline = $(element).find('.hoverTitle .icon-text').text().trim();
      const description = $(element).find('.descFrag').text().trim();
      const fundingStatus = $(element).find('.funding-status').text().trim();

      opportunities.push({
        title,
        link: `https://www.findaphd.com${link}`,
        university,
        department,
        logoUrl,
        supervisor,
        deadline,
        description,
        fundingStatus
      });
    });

    // Rate each opportunity
    for (const opportunity of opportunities) {
      opportunity.rating = await rateOpportunity(opportunity);
    }

    console.log('Opportunities:', opportunities);
    return opportunities;
  } catch (error) {
    console.error('Error scraping PhD opportunities:', error);
  }
}

async function testScraping() {
  try {
    console.log('Starting scraping test...');
    const opportunities = await scrapePhdOpportunities();
    
    console.log('\n=== Scraping Results ===');
    console.log(`Total opportunities found: ${opportunities.length}`);
    
    opportunities.slice(0, 3).forEach((opp, index) => {
      console.log(`\n--- Opportunity ${index + 1} ---`);
      console.log('Title:', opp.title);
      console.log('University:', opp.university);
      console.log('Department:', opp.department);
      console.log('Logo URL:', opp.logoUrl);
      console.log('Supervisor:', opp.supervisor);
      console.log('Deadline:', opp.deadline);
      console.log('Description:', opp.description);
      console.log('Funding Status:', opp.fundingStatus);
      console.log('Link:', opp.link);
      console.log('Rating:', opp.rating);
    });
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testScraping();
