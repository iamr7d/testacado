// @ts-check
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from test file
dotenv.config({ path: '.env.test' });

// Import after environment variables are loaded
const { createGroqClient } = await import('./src/services/groqService.js');

async function testLLMIntegration() {
  try {
    console.log('Testing LLM Integration...\n');

    // Test 1: Create GROQ Client
    console.log('Test 1: Creating GROQ Client');
    const groq = createGroqClient();
    console.log('✓ GROQ Client created successfully\n');

    // Test 2: Basic LLM Query
    console.log('Test 2: Testing Basic LLM Query');
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "What are the key aspects to consider when applying for a PhD?"
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 150
    });
    console.log('LLM Response:', response.choices[0]?.message?.content);
    console.log('✓ Basic LLM query successful\n');

    // Test 3: Opportunity Analysis
    console.log('Test 3: Testing Opportunity Analysis');
    const sampleOpportunity = {
      title: "PhD Position in Machine Learning",
      description: "We are seeking a motivated PhD candidate to work on advanced machine learning algorithms. The project focuses on developing novel approaches to deep learning and their applications in real-world scenarios. Full funding available for 4 years.",
      university: "Example University",
      location: "London, UK"
    };

    const analysisResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a PhD application analyzer. Provide numerical scores based on the opportunity details. Only return valid JSON with the specified format."
        },
        {
          role: "user",
          content: `
            Analyze this PhD opportunity and provide a JSON response with these scores:
            - researchImpactScore (0-100): Impact potential of the research
            - fieldRelevanceScore (0-100): Relevance to current research trends
            
            PhD Opportunity:
            Title: ${sampleOpportunity.title}
            Description: ${sampleOpportunity.description}
            University: ${sampleOpportunity.university}
            
            Return only valid JSON like this:
            {
              "researchImpactScore": 85,
              "fieldRelevanceScore": 90
            }
          `
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 150
    });

    const analysisContent = analysisResponse.choices[0]?.message?.content || '{}';
    console.log('Analysis Result:', analysisContent);
    console.log('✓ Opportunity analysis successful\n');

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the tests
testLLMIntegration();
