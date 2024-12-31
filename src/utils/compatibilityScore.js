import { config } from '../config/env.js';
import { getGroqCompletion } from '../services/groqService.js';

export async function calculateCompatibilityScore(userProfile, opportunity) {
  try {
    const userBio = generateUserBioForMatching(userProfile);
    const opportunityText = generateOpportunityText(opportunity);

    const prompt = `
    Task: Analyze the compatibility between a researcher's profile and a research opportunity.
    
    Researcher Profile:
    ${userBio}
    
    Research Opportunity:
    ${opportunityText}
    
    Please analyze the compatibility based on the following criteria and provide a score out of 100:
    1. Research Area Alignment (40 points)
    2. Technical Skills Match (30 points)
    3. Experience Level (20 points)
    4. Additional Qualifications (10 points)
    
    Format your response as a JSON object with the following structure:
    {
      "totalScore": number (0-100),
      "breakdown": {
        "researchAlignment": number (0-40),
        "technicalSkills": number (0-30),
        "experience": number (0-20),
        "additionalQualifications": number (0-10)
      },
      "explanation": string (brief explanation of the scoring),
      "strengths": string[] (list of key strengths),
      "improvements": string[] (list of areas for improvement)
    }
    `;

    const completion = await getGroqCompletion(prompt, {
      temperature: 0.3,
      max_tokens: 1000
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error calculating compatibility score:', error);
    throw error;
  }
}

function generateUserBioForMatching(profile) {
  const sections = [];
  const {
    personalInfo = {},
    academic = {},
    research = {},
    skills = {},
    location = {},
    availability = {}
  } = profile;

  // Research Field and Interests
  if (research.field || research.interests?.length) {
    sections.push(`Research Field: ${research.field || 'Not specified'}
Research Interests: ${research.interests?.join(', ') || 'Not specified'}
Keywords: ${research.keywords?.join(', ') || 'Not specified'}`);
  }

  // Technical Skills
  const skillsSection = [];
  if (skills.programmingLanguages?.length) {
    skillsSection.push(`Programming Languages: ${skills.programmingLanguages.map(s => s.name).join(', ')}`);
  }
  if (skills.frameworks?.length) {
    skillsSection.push(`Frameworks: ${skills.frameworks.map(s => s.name).join(', ')}`);
  }
  if (skills.tools?.length) {
    skillsSection.push(`Tools: ${skills.tools.map(s => s.name).join(', ')}`);
  }
  if (skillsSection.length) {
    sections.push('Technical Skills:\n' + skillsSection.join('\n'));
  }

  // Academic Background
  if (academic.degree || academic.field) {
    sections.push(`Academic Background:
Degree: ${academic.degree || 'Not specified'}
Field: ${academic.field || 'Not specified'}`);
  }

  // Location and Availability
  sections.push(`Location and Availability:
Current Location: ${location.current || 'Not specified'}
Work Preference: ${location.workLocation || 'Not specified'}
Availability Status: ${availability.status || 'Not specified'}`);

  return sections.join('\n\n');
}

function generateOpportunityText(opportunity) {
  const sections = [];

  sections.push(`Title: ${opportunity.title || 'Not specified'}`);
  sections.push(`Type: ${opportunity.type || 'Not specified'}`);
  
  if (opportunity.description) {
    sections.push(`Description: ${opportunity.description}`);
  }

  if (opportunity.requirements) {
    sections.push(`Requirements: ${opportunity.requirements}`);
  }

  if (opportunity.skills?.length) {
    sections.push(`Required Skills: ${opportunity.skills.join(', ')}`);
  }

  if (opportunity.location) {
    sections.push(`Location: ${opportunity.location}
Work Type: ${opportunity.workType || 'Not specified'}`);
  }

  return sections.join('\n\n');
}
