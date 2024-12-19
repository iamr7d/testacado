import axios from 'axios';

const testAnalyzeEndpoint = async () => {
  try {
    const testOpportunity = {
      title: "PhD in Computer Science - Machine Learning Research",
      description: "Exciting opportunity to conduct research in machine learning and artificial intelligence. The project focuses on developing novel deep learning architectures.",
      university: "Test University",
      location: "London, UK",
      requirements: "Masters degree in Computer Science or related field",
      link: "https://example.com",
      source: "findaphd"
    };

    console.log('\n=== Starting Analysis Test ===');
    console.log('\nTest opportunity:', JSON.stringify(testOpportunity, null, 2));

    console.log('\nSending request to server...');
    const response = await axios.post('http://localhost:3002/api/analyze', 
      { opportunity: testOpportunity },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // 60 second timeout
      }
    );

    // Log raw response for debugging
    console.log('\nServer Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });

    // Validate response format
    const { researchImpact, fieldRelevance, overall, strengths, weaknesses, recommendations } = response.data;
    
    // Validate scores are numbers between 0-100
    const validateScore = (name, value) => {
      const score = Number(value);
      if (Number.isNaN(score) || score < 0 || score > 100) {
        throw new Error(`Invalid ${name} score: ${value}. Must be a number between 0-100`);
      }
      return score;
    };

    const validatedScores = {
      researchImpact: validateScore('researchImpact', researchImpact),
      fieldRelevance: validateScore('fieldRelevance', fieldRelevance),
      overall: validateScore('overall', overall)
    };

    // Validate arrays
    if (!Array.isArray(strengths) || !Array.isArray(weaknesses) || !Array.isArray(recommendations)) {
      throw new Error('strengths, weaknesses, and recommendations must be arrays');
    }

    console.log('\n=== Validation Results ===');
    console.log('\nScores:', validatedScores);
    console.log('\nAnalysis:', {
      strengths: strengths.length + ' items',
      weaknesses: weaknesses.length + ' items',
      recommendations: recommendations.length + ' items'
    });

    console.log('\nTest completed successfully!');

  } catch (error) {
    console.error('\n=== Test Failed ===');
    
    if (error.response) {
      // Server responded with error
      console.error('\nServer Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // Request made but no response
      console.error('\nNo Response:', {
        message: error.message,
        code: error.code,
        request: {
          method: error.request.method,
          path: error.request.path,
          headers: error.request.headers
        }
      });
    } else {
      // Other error
      console.error('\nError:', {
        message: error.message,
        stack: error.stack
      });
    }
    process.exit(1);
  }
};

console.log('Starting test...');
testAnalyzeEndpoint();
