import { Groq } from 'groq-sdk';

const MODELS = {
  DEFAULT: "mixtral-8x7b-32768",
  FAST: "mixtral-8x7b-32768",
  ANALYSIS: "mixtral-8x7b-32768"
};

const API_KEYS = [
  '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',
  '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',
  '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',
  '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'
];

let currentKeyIndex = 0;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // Minimum time between requests in ms

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getNextApiKey = () => {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
};

export const createGroqClient = () => {
  const apiKey = getNextApiKey();
  return new Groq({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

export const makeGroqRequest = async (requestFn) => {
  // Ensure minimum time between requests
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }

  try {
    const groq = createGroqClient();
    const result = await requestFn(groq);
    lastRequestTime = Date.now();
    return result;
  } catch (error) {
    if (error.status === 429) {
      const retryAfter = parseInt(error.headers?.['retry-after'] || '60', 10);
      console.log(`Rate limit hit. Waiting ${retryAfter} seconds before retry...`);
      await sleep(retryAfter * 1000);
      return makeGroqRequest(requestFn); // Retry with next key
    }
    throw error;
  }
};

export const getGroqCompletion = async (prompt, options) => {
  const requestFn = async (groq) => {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: MODELS.DEFAULT,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        top_p: options.top_p,
        stream: false
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  return makeGroqRequest(requestFn);
};

export const analyzeProfessorProfile = async (profileUrl) => {
  const requestFn = async (groq) => {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert academic advisor and research analyst. Your task is to analyze professor profiles 
            and provide comprehensive insights for PhD applicants. Focus on extracting and analyzing:

            1. Research Areas & Expertise
            - Current research focus
            - Historical research evolution
            - Interdisciplinary connections

            2. Publication Impact
            - Key publications and their significance
            - Citation metrics and research impact
            - Publication trends and patterns

            3. Lab & Resources
            - Current lab size and composition
            - Available equipment and facilities
            - Funding status and grant history

            4. Collaboration Network
            - Internal and external collaborations
            - Industry connections
            - International partnerships

            5. Mentorship Style & Lab Culture
            - Supervision approach
            - Student success stories
            - Lab environment and expectations

            6. Opportunities
            - Current openings
            - Upcoming projects
            - Funding availability

            Format your analysis in a clear, structured manner that helps PhD applicants make informed decisions.`
          },
          {
            role: "user",
            content: `Please analyze this professor's profile: ${profileUrl}

            Provide a detailed analysis that covers all the key areas mentioned in the system prompt.
            Focus on information that would be most relevant for a potential PhD applicant.
            Include specific examples and metrics where available.
            Highlight any unique opportunities or challenges.`
          }
        ],
        model: MODELS.ANALYSIS,
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
        stream: false
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw error;
    }
  };

  return makeGroqRequest(requestFn);
};

export const generateEmail = async (professorInfo, studentInfo) => {
  const requestFn = async (groq) => {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert academic communication specialist helping PhD applicants craft compelling emails 
            to potential advisors. Your goal is to create personalized, professional emails that effectively communicate 
            the student's qualifications and research interests.

            Guidelines for email generation:
            1. Professional Tone: Maintain a formal yet engaging tone
            2. Clear Structure: Follow a logical flow with clear paragraphs
            3. Personalization: Reference specific aspects of the professor's research
            4. Relevance: Highlight relevant experience and skills
            5. Conciseness: Keep the email focused and to-the-point
            6. Call to Action: Include a clear next step or request

            The email should demonstrate:
            - Deep understanding of the professor's research
            - Clear alignment between student's interests and professor's work
            - Specific examples of relevant experience
            - Genuine enthusiasm for potential collaboration
            - Professional courtesy and attention to detail`
          },
          {
            role: "user",
            content: `Generate a professional email using the following information:

            Professor's Profile Analysis:
            ${professorInfo}

            Student Information:
            Name: ${studentInfo.name}
            Research Interests: ${studentInfo.research}
            Experience: ${studentInfo.experience}
            Education: ${studentInfo.education}

            Create an email that:
            1. Has an attention-grabbing subject line
            2. Makes a strong connection between the student's interests and professor's research
            3. Highlights specific, relevant experiences
            4. Demonstrates knowledge of recent work
            5. Includes a clear request for PhD opportunities
            6. Maintains professionalism throughout`
          }
        ],
        model: MODELS.DEFAULT,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
        stream: false
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw error;
    }
  };

  return makeGroqRequest(requestFn);
};

export const analyzeResearchFit = async (professorInfo, studentInfo) => {
  const requestFn = async (groq) => {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert academic advisor specializing in analyzing research compatibility between 
            professors and potential PhD students. Your analysis should be comprehensive, data-driven, and actionable.

            Analysis Framework:
            1. Research Alignment
            - Core research areas overlap
            - Methodological compatibility
            - Theoretical framework alignment

            2. Technical Skills Match
            - Required vs. available skills
            - Learning potential
            - Technical gaps to address

            3. Career Trajectory
            - Long-term research goals alignment
            - Career development opportunities
            - Growth potential in the lab

            4. Resource Fit
            - Available resources vs. research needs
            - Funding alignment
            - Equipment and facility requirements

            5. Cultural Fit
            - Work style compatibility
            - Lab culture alignment
            - Communication style match

            Provide specific recommendations for:
            - Areas to emphasize in application
            - Skills to develop
            - Potential challenges to address
            - Ways to strengthen alignment`
          },
          {
            role: "user",
            content: `Analyze the research fit between:

            Professor's Profile:
            ${professorInfo}

            Student Background:
            Research Interests: ${studentInfo.research}
            Experience: ${studentInfo.experience}
            Education: ${studentInfo.education}

            Provide:
            1. Overall compatibility score (0-100)
            2. Detailed analysis of alignment areas
            3. Specific strengths and gaps
            4. Growth opportunities
            5. Actionable recommendations
            6. Potential challenges and solutions`
          }
        ],
        model: MODELS.ANALYSIS,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
        stream: false
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw error;
    }
  };

  return makeGroqRequest(requestFn);
};

export const extractProfileInfo = async (profileText) => {
  const requestFn = async (groq) => {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert in extracting and structuring academic information. 
            Your task is to analyze professor profile text and extract key information in a structured format.`
          },
          {
            role: "user",
            content: `Extract and structure the following information from this profile:
            ${profileText}

            Please provide:
            1. Name and Title
            2. Institution and Department
            3. Research Areas (list)
            4. Recent Publications (last 3-5)
            5. Current Projects
            6. Lab Information
            7. Contact Information

            Format the output as a clean JSON object.`
          }
        ],
        model: MODELS.FAST,
        temperature: 0.3,
        max_tokens: 1024,
        top_p: 0.9,
        stream: false
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw error;
    }
  };

  return makeGroqRequest(requestFn);
};

export const analyzeOpportunity = async (opportunity) => {
  const requestFn = async (groq) => {
    try {
      const prompt = `
        Analyze this PhD opportunity and provide a JSON response with these scores:
        - researchImpactScore (0-100): Impact potential of the research
        - fieldRelevanceScore (0-100): Relevance to current research trends
        
        PhD Opportunity:
        Title: ${opportunity.title}
        Description: ${opportunity.description}
        University: ${opportunity.university}
        
        Return only valid JSON like this:
        {
          "researchImpactScore": 85,
          "fieldRelevanceScore": 90
        }
      `;

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a PhD application analyzer. Provide numerical scores based on the opportunity details. Only return valid JSON with the specified format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: MODELS.DEFAULT,
        temperature: 0.3,
        max_tokens: 150,
        top_p: 1,
        stream: false
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      throw error;
    }
  };

  return makeGroqRequest(requestFn);
};

export const analyzeOpportunityWithProfile = async (opportunity, userProfile) => {
  const requestFn = async (groq) => {
    try {
      const prompt = `
        Compare this PhD opportunity with the user's profile and provide a detailed compatibility analysis in JSON format.
        
        PhD Opportunity:
        Title: ${opportunity.title}
        Description: ${opportunity.description}
        University: ${opportunity.university}
        Department: ${opportunity.department}
        Research Area: ${opportunity.researchArea || 'Not specified'}
        
        User Profile:
        Education: ${userProfile.education}
        Research Interests: ${userProfile.researchInterests}
        Skills: ${userProfile.skills}
        Publications: ${userProfile.publications}
        
        Provide scores (0-100) for:
        - academicFit: How well the user's academic background matches
        - researchAlignment: How well research interests align
        - skillsMatch: How relevant the user's skills are
        - overallCompatibility: Weighted average of all factors
        
        Return only valid JSON like this:
        {
          "academicFit": 85,
          "researchAlignment": 90,
          "skillsMatch": 75,
          "overallCompatibility": 83,
          "analysis": "Brief explanation of the scores"
        }
      `;

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a PhD application analyzer that provides objective compatibility scores between candidates and opportunities. Focus on concrete matches in academic background, research interests, and skills."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: MODELS.DEFAULT,
        temperature: 0.3,
        max_tokens: 500,
        top_p: 1,
        stream: false
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing opportunity with profile:', error);
      return {
        academicFit: 0,
        researchAlignment: 0,
        skillsMatch: 0,
        overallCompatibility: 0,
        analysis: "Error analyzing compatibility"
      };
    }
  };

  return makeGroqRequest(requestFn);
};

export const calculateCompatibilityScore = async (userProfile, opportunity) => {
  if (!userProfile || !opportunity) {
    console.warn('Missing userProfile or opportunity for compatibility calculation');
    return 0;
  }

  try {
    const prompt = `
      Given a user profile and a PhD opportunity, calculate a compatibility score between 0 and 100.
      Consider research interests, academic background, and requirements alignment.
      
      User Profile:
      ${JSON.stringify(userProfile, null, 2)}
      
      PhD Opportunity:
      ${JSON.stringify(opportunity, null, 2)}
      
      Return only a number between 0 and 100.
    `;

    const response = await makeGroqRequest(async (groq) => {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: MODELS.FAST,
        temperature: 0.3,
        max_tokens: 5,
      });
      
      if (!completion?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from Groq API');
      }
      
      return completion;
    });

    const scoreText = response.choices[0].message.content.trim();
    const score = parseInt(scoreText);
    
    if (isNaN(score)) {
      console.warn('Invalid score returned from API:', scoreText);
      return 0;
    }
    
    return Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error('Error calculating compatibility score:', error);
    return 0;
  }
};
