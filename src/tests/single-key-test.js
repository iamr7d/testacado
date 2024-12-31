import Groq from 'groq-sdk';
import { GROQ_API_KEYS } from '../config/env.js';

async function testSingleKey() {
    // Try each key until one works
    for (let i = 0; i < GROQ_API_KEYS.length; i++) {
        const apiKey = GROQ_API_KEYS[i];
        console.log(`\nTesting with API Key ${i + 1}:`, apiKey?.slice(0, 10) + '...');
        
        const groq = new Groq({
            apiKey
        });

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: "What is 2+2? Respond with just the number."
                    }
                ],
                model: "mixtral-8x7b-32768",
                temperature: 0.1,
                max_tokens: 10,
                top_p: 1,
                stream: false
            });

            console.log('Response:', completion.choices[0]?.message?.content);
            console.log('Success! Found working key.');
            return; // Exit after finding a working key
        } catch (error) {
            console.error('Error:', {
                message: error.message,
                type: error.type,
                status: error.status
            });
            
            if (error.response) {
                console.error('Response Error:', error.response.data);
            }
            
            console.log('Trying next key...');
        }
    }
    
    console.error('\nNo working keys found!');
}

testSingleKey();
