import { getGroqCompletion } from '../services/groqService.js';
import '../config/env.js';

async function testLLM() {
    console.log('Testing LLM Integration...');
    
    try {
        const response = await getGroqCompletion(
            "What is 2+2? Please respond with just the number.",
            {
                temperature: 0.1,
                max_tokens: 10,
                top_p: 1
            }
        );
        
        console.log('\nRaw Response:', JSON.stringify(response, null, 2));
        console.log('\nMessage Content:', response.choices[0]?.message?.content);
        console.log('Model Used:', response.model);
        console.log('\nTest Successful!');
    } catch (error) {
        console.error('\nTest Failed:', error);
        if (error.response) {
            console.error('\nAPI Error Response:', {
                status: error.response.status,
                data: error.response.data
            });
        }
        console.error('\nFull Error:', error);
    }
}

console.log('Starting LLM test...');
testLLM()
    .then(() => console.log('Test completed'))
    .catch(err => console.error('Test failed with error:', err));
