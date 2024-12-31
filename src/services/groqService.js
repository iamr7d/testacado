import { Groq } from 'groq-sdk';
import { config } from '../config/env.js';

const MODELS = {
  DEFAULT: "mixtral-8x7b-32768",
  FAST: "llama2-70b-4096",
  ANALYSIS: "mixtral-8x7b-32768"
};

const MAX_RETRIES = 3;
const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests
const MAX_CONCURRENT_REQUESTS = 5;
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Semaphore for limiting concurrent requests
let activeRequests = 0;
const requestQueue = [];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const processQueue = async () => {
  while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    const { resolve: queueResolve, reject: queueReject, fn } = requestQueue.shift();
    try {
      activeRequests++;
      const result = await fn();
      queueResolve(result);
    } catch (error) {
      queueReject(error);
    } finally {
      activeRequests--;
      if (requestQueue.length > 0) {
        processQueue();
      }
    }
  }
};

const queueRequest = async (fn) => {
  if (activeRequests < MAX_CONCURRENT_REQUESTS) {
    activeRequests++;
    try {
      return await fn();
    } finally {
      activeRequests--;
      if (requestQueue.length > 0) {
        processQueue();
      }
    }
  }

  // Add timeout to queued requests
  return Promise.race([
    new Promise((resolve, reject) => {
      requestQueue.push({ resolve, reject, fn });
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout in queue')), REQUEST_TIMEOUT)
    )
  ]);
};

const throttledRequest = async (requestFn) => {
  let retries = 0;
  let lastError = null;

  const makeRequest = async () => {
    try {
      const result = await requestFn();
      await wait(RATE_LIMIT_DELAY);
      return result;
    } catch (error) {
      lastError = error;
      
      if (error.response?.status === 429 || error.message.includes('rate limit')) {
        if (retries < MAX_RETRIES) {
          retries++;
          const backoffDelay = Math.pow(2, retries) * 1000;
          console.log(`Rate limit hit. Waiting ${backoffDelay/1000} seconds before retry...`);
          await wait(backoffDelay);
          return makeRequest();
        }
      }
      
      // Add more specific error handling
      if (error.response?.status === 401) {
        throw new Error('Invalid API key or authentication error');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid request: ' + (error.response.data?.error || error.message));
      }
      
      throw error;
    }
  };

  return queueRequest(makeRequest);
};

export const createGroqClient = () => {
  if (!config.GROQ_API_KEY) {
    console.error('GROQ_API_KEY not found in environment variables');
    throw new Error('GROQ_API_KEY not found in environment variables');
  }

  return new Groq({
    apiKey: config.GROQ_API_KEY,
    dangerouslyAllowBrowser: true, // Required for browser environment
    timeout: REQUEST_TIMEOUT
  });
};

export const makeGroqRequest = async (requestFn) => {
  return throttledRequest(async () => {
    const groq = createGroqClient();
    try {
      return await requestFn(groq);
    } catch (error) {
      console.error('Groq API error:', error);
      if (error.response?.data) {
        console.error('Groq API response:', error.response.data);
      }
      throw error;
    }
  });
};

export const getGroqCompletion = async (prompt, options = {}) => {
  const requestFn = async (groq) => {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: options.model || MODELS.DEFAULT,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      top_p: options.top_p || 1,
      stream: false
    });

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from Groq API');
    }

    return completion;
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
        messages: [{ role: "user", content: prompt }],
        model: "mixtral-8x7b-32768",
        temperature: 0.3,
        max_tokens: 150,
        top_p: 1,
        stream: false,
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
        You are an expert academic advisor analyzing the compatibility between a PhD opportunity and a candidate's profile.
        Provide a detailed analysis focusing on academic fit, research alignment, and skills match.
        
        PhD Opportunity:
        Title: ${opportunity.title}
        Description: ${opportunity.description}
        University: ${opportunity.university}
        Department: ${opportunity.department || 'Not specified'}
        Research Area: ${opportunity.researchArea || 'Not specified'}
        Funding: ${opportunity.funding || 'Not specified'}
        
        User Profile:
        Education: ${userProfile.education}
        Research Interests: ${userProfile.researchInterests}
        Skills: ${userProfile.skills}
        Publications: ${userProfile.publications || 'None'}
        
        Analyze and score (0-100) based on these criteria:
        1. Academic Fit (35%): How well the candidate's educational background matches the opportunity requirements
        2. Research Alignment (40%): How closely the research interests and experience align with the project
        3. Skills Match (25%): How relevant the candidate's technical and research skills are
        
        The overall compatibility should be a weighted average of these scores.
        
        Return a JSON object with this exact structure:
        {
          "academicFit": number,
          "researchAlignment": number,
          "skillsMatch": number,
          "overallCompatibility": number,
          "analysis": string,
          "matchingPoints": string[],
          "areasForImprovement": string[]
        }
        
        Keep the analysis concise but informative, focusing on key points.
      `;

      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: MODELS.ANALYSIS,
        temperature: 0.3,
        max_tokens: 800,
        top_p: 1,
        stream: false,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Groq API');
      }

      try {
        const result = JSON.parse(content);
        
        // Validate response structure
        const requiredFields = ['academicFit', 'researchAlignment', 'skillsMatch', 'overallCompatibility', 'analysis'];
        const missingFields = requiredFields.filter(field => !(field in result));
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Ensure scores are within valid range
        result.academicFit = Math.min(100, Math.max(0, result.academicFit));
        result.researchAlignment = Math.min(100, Math.max(0, result.researchAlignment));
        result.skillsMatch = Math.min(100, Math.max(0, result.skillsMatch));
        result.overallCompatibility = Math.min(100, Math.max(0, result.overallCompatibility));

        return result;
      } catch (parseError) {
        console.error('Error parsing Groq response:', parseError);
        throw parseError;
      }
    } catch (error) {
      console.error('Error analyzing opportunity with profile:', error);
      return {
        academicFit: 0,
        researchAlignment: 0,
        skillsMatch: 0,
        overallCompatibility: 0,
        analysis: "Error analyzing compatibility: " + error.message,
        matchingPoints: [],
        areasForImprovement: ["Unable to analyze due to an error"]
      };
    }
  };

  return makeGroqRequest(requestFn);
};

export const calculateCompatibilityScore = async (userProfile, opportunity) => {
  const prompt = `
    You are an expert academic advisor analyzing the compatibility between a PhD candidate and a research opportunity.
    Provide a detailed analysis focusing on overall fit and specific areas of compatibility.
    
    User Profile:
    ${JSON.stringify(userProfile, null, 2)}
    
    Research Opportunity:
    ${JSON.stringify(opportunity, null, 2)}
    
    Consider these factors when calculating the score (0-100):
    1. Academic Background (30%): Educational qualifications and research experience
    2. Research Interest Alignment (35%): How well the candidate's interests match the opportunity
    3. Technical Skills (20%): Relevant technical and research skills
    4. Additional Factors (15%): Publications, projects, or other relevant experience
    
    Return a JSON object with this exact structure:
    {
      "score": number (0-100),
      "explanation": string (concise explanation of the score),
      "matchingPoints": string[] (list of 2-4 key strengths),
      "improvementAreas": string[] (list of 1-3 areas for improvement)
    }
  `;

  try {
    const completion = await getGroqCompletion(prompt, {
      model: MODELS.ANALYSIS,
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq API');
    }

    try {
      const result = JSON.parse(content);
      
      // Validate response structure
      const requiredFields = ['score', 'explanation', 'matchingPoints', 'improvementAreas'];
      const missingFields = requiredFields.filter(field => !(field in result));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Ensure score is within valid range
      result.score = Math.min(100, Math.max(0, result.score));
      
      // Ensure arrays have content
      if (!Array.isArray(result.matchingPoints) || result.matchingPoints.length === 0) {
        result.matchingPoints = ["No specific matching points identified"];
      }
      if (!Array.isArray(result.improvementAreas) || result.improvementAreas.length === 0) {
        result.improvementAreas = ["No specific improvement areas identified"];
      }

      return result;
    } catch (parseError) {
      console.error('Error parsing LLM response:', parseError);
      return {
        score: 70,
        explanation: "Score calculated with limited confidence due to parsing error",
        matchingPoints: ["Unable to parse detailed matching points"],
        improvementAreas: ["Unable to parse improvement areas"]
      };
    }
  } catch (error) {
    console.error('Error calculating compatibility score:', error);
    return {
      score: 70,
      explanation: "Score calculated with limited confidence due to API error: " + error.message,
      matchingPoints: ["Error occurred while analyzing matching points"],
      improvementAreas: ["Error occurred while analyzing improvement areas"]
    };
  }
};
