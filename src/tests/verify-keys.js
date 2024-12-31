import { GROQ_API_KEYS } from '../config/env.js';
import fetch from 'node-fetch';

async function verifyKey(key) {
    console.log(`\nVerifying key: ${key.slice(0, 10)}...`);
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "mixtral-8x7b-32768",
                messages: [
                    {
                        role: "user",
                        content: "Hi"
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Key is valid');
            console.log('Model:', data.model);
            console.log('Response:', data.choices[0]?.message?.content);
            return true;
        } else {
            console.log('❌ Key is invalid:', data.error?.message || 'Unknown error');
            return false;
        }
    } catch (error) {
        console.error('❌ Error verifying key:', error.message);
        return false;
    }
}

async function verifyAllKeys() {
    console.log('Verifying all API keys...');
    console.log(`Found ${GROQ_API_KEYS.length} keys to verify`);

    const results = await Promise.all(GROQ_API_KEYS.map(verifyKey));
    const validKeys = results.filter(result => result).length;

    console.log(`\nSummary: ${validKeys} out of ${GROQ_API_KEYS.length} keys are valid`);
}

verifyAllKeys();
