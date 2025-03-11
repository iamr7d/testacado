/**
 * Gemini AI Service - Provides AI-powered features using Google's Gemini API
 */
import axios from 'axios';

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyBzITzfjocFjQawIkWe6HNFEDWRQXGoe8U';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-1.5-flash'; // Using the latest model

/**
 * Generate content using Gemini AI
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<Object>} - The response from Gemini
 */
export async function generateContent(prompt, options = {}) {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: options.maxOutputTokens || 1024,
        }
      }
    );

    // Extract the generated text from the response
    const generatedText = response.data.candidates[0].content.parts[0].text;
    return {
      success: true,
      text: generatedText,
      fullResponse: response.data
    };
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
}

/**
 * Calculate a matching score between a student profile and a professor
 * @param {Object} studentProfile - The student's profile data
 * @param {Object} professorData - The professor's data
 * @returns {Promise<Object>} - The matching score and analysis
 */
export async function calculateProfileMatchingScore(studentProfile, professorData) {
  try {
    // Create a detailed prompt for the matching analysis
    const prompt = `
      I need to analyze the compatibility between a student and a professor for potential research collaboration.
      
      Student Profile:
      - Research Interests: ${studentProfile.researchInterests.join(', ')}
      - Academic Background: ${studentProfile.academicBackground || 'Not specified'}
      - Skills: ${studentProfile.skills?.join(', ') || 'Not specified'}
      - Publications: ${studentProfile.publications?.join(', ') || 'None'}
      
      Professor Profile:
      - Name: ${professorData.name}
      - University: ${professorData.university}
      - Department: ${professorData.department}
      - Research Areas: ${professorData.researchAreas?.join(', ') || 'Not specified'}
      - Publications: ${professorData.publications?.slice(0, 3).join(', ') || 'None'}
      ${professorData.scholarMetrics?.found ? 
        `- Citations: ${professorData.scholarMetrics.citations}
         - h-index: ${professorData.scholarMetrics.hIndex}
         - i10-index: ${professorData.scholarMetrics.i10Index}` : ''}
      
      Please provide:
      1. A matching score from 0-100 based on research alignment
      2. A brief analysis of the compatibility (3-4 sentences)
      3. Key strengths of this potential collaboration
      4. Potential challenges or gaps
      
      Format your response as follows:
      Score: [numerical score]
      Analysis: [brief analysis]
      Strengths: [bullet points]
      Challenges: [bullet points]
    `;

    const response = await generateContent(prompt, { temperature: 0.3 });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to calculate matching score');
    }
    
    // Parse the response to extract structured data
    const text = response.text;
    const scoreMatch = text.match(/Score:\s*(\d+)/i);
    const analysisMatch = text.match(/Analysis:\s*([\s\S]*?)(?=Strengths:|$)/i);
    const strengthsMatch = text.match(/Strengths:\s*([\s\S]*?)(?=Challenges:|$)/i);
    const challengesMatch = text.match(/Challenges:\s*([\s\S]*?)(?=$)/i);
    
    return {
      success: true,
      score: scoreMatch ? parseInt(scoreMatch[1]) : null,
      analysis: analysisMatch ? analysisMatch[1].trim() : null,
      strengths: strengthsMatch ? parseListItems(strengthsMatch[1]) : [],
      challenges: challengesMatch ? parseListItems(challengesMatch[1]) : [],
      rawResponse: text
    };
  } catch (error) {
    console.error('Error calculating profile matching score:', error);
    return {
      success: false,
      error: error.message,
      score: null,
      analysis: null,
      strengths: [],
      challenges: []
    };
  }
}

/**
 * Generate a summary of a professor's research and achievements
 * @param {Object} professorData - The professor's data
 * @returns {Promise<Object>} - The generated summary
 */
export async function generateProfessorSummary(professorData) {
  try {
    // Create a prompt for generating a professor summary
    const prompt = `
      Please provide a concise professional summary for the following professor:
      
      Name: ${professorData.name}
      University: ${professorData.university}
      Department: ${professorData.department || 'Not specified'}
      Research Areas: ${professorData.researchAreas?.join(', ') || 'Not specified'}
      ${professorData.scholarMetrics?.found ? 
        `Citations: ${professorData.scholarMetrics.citations}
         h-index: ${professorData.scholarMetrics.hIndex}
         i10-index: ${professorData.scholarMetrics.i10Index}` : ''}
      
      Notable Publications:
      ${professorData.publications?.slice(0, 3).map((pub, i) => `${i+1}. ${pub}`).join('\n') || 'None available'}
      
      Write a professional 3-4 sentence summary highlighting their research focus, academic standing, and potential value to collaborators or students. Focus on their expertise and impact in their field.
    `;

    const response = await generateContent(prompt, { temperature: 0.2 });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to generate professor summary');
    }
    
    return {
      success: true,
      summary: response.text.trim(),
    };
  } catch (error) {
    console.error('Error generating professor summary:', error);
    return {
      success: false,
      error: error.message,
      summary: null
    };
  }
}

/**
 * Analyze research trends based on a professor's publications
 * @param {Object} professorData - The professor's data including publications
 * @returns {Promise<Object>} - The analysis of research trends
 */
export async function analyzeResearchTrends(professorData) {
  try {
    if (!professorData.publications || professorData.publications.length === 0) {
      return {
        success: false,
        error: 'No publications available for analysis',
        trends: null
      };
    }

    // Create a prompt for analyzing research trends
    const prompt = `
      Based on the following publications of Professor ${professorData.name}, please analyze the research trends, emerging themes, and potential future directions:
      
      Publications:
      ${professorData.publications.map((pub, i) => `${i+1}. ${pub}`).join('\n')}
      
      Research Areas: ${professorData.researchAreas?.join(', ') || 'Not specified'}
      
      Please provide:
      1. 2-3 major research themes identified in these publications
      2. How these themes have evolved over time (if discernible)
      3. Potential future research directions based on these publications
      4. How this research connects to broader trends in ${professorData.department || 'their field'}
      
      Format your response with clear headings for each section.
    `;

    const response = await generateContent(prompt, { temperature: 0.3 });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to analyze research trends');
    }
    
    return {
      success: true,
      analysis: response.text.trim(),
    };
  } catch (error) {
    console.error('Error analyzing research trends:', error);
    return {
      success: false,
      error: error.message,
      analysis: null
    };
  }
}

/**
 * Helper function to parse bullet points or numbered lists from text
 * @param {string} text - The text containing list items
 * @returns {Array<string>} - Array of list items
 */
function parseListItems(text) {
  if (!text) return [];
  
  // Remove any leading/trailing whitespace
  const trimmedText = text.trim();
  
  // Split by newlines and filter out empty lines
  const lines = trimmedText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Process each line to remove bullet points or numbers
  return lines.map(line => {
    // Remove bullet points, numbers, or dashes at the beginning of the line
    return line.replace(/^[\s•\-–—*]+|^\d+[\.\)]\s*/, '').trim();
  });
}

export default {
  generateContent,
  calculateProfileMatchingScore,
  generateProfessorSummary,
  analyzeResearchTrends
};
