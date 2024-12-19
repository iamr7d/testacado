import { Groq } from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

const testGroqKey = async (keyNumber) => {
    const keyName = `VITE_GROQ_API_KEY_${keyNumber}`;
    const apiKey = process.env[keyName];
    
    if (!apiKey) {
        console.log(`❌ ${keyName}: Key not found in environment variables`);
        return false;
    }

    const groq = new Groq({
        apiKey: apiKey
    });

    try {
        console.log(`Testing ${keyName}...`);
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Return the text 'OK' if you can read this message."
                }
            ],
            model: "mixtral-8x7b-32768",  
            temperature: 0,
            max_tokens: 10,
        });

        const response = completion.choices[0]?.message?.content?.trim();
        if (response && response.toLowerCase().includes('ok')) {
            console.log(`✅ ${keyName}: Working (Response: ${response})`);
            return true;
        } else {
            console.log(`❌ ${keyName}: Invalid response: ${response}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${keyName}: Error - ${error.message}`);
        if (error.response) {
            console.log(`Response details:`, error.response.data);
        }
        return false;
    }
};

const testAllKeys = async () => {
    console.log('Testing all Groq API keys...\n');
    
    const results = [];
    for (let i = 1; i <= 5; i++) {
        const result = await testGroqKey(i);
        results.push(result);
        if (i < 5) await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\nSummary:');
    console.log(`Working keys: ${results.filter(r => r).length}`);
    console.log(`Failed keys: ${results.filter(r => !r).length}`);
};

console.log('Starting Groq API key test...');
console.log('Make sure your .env file contains VITE_GROQ_API_KEY_1 through VITE_GROQ_API_KEY_5\n');

testAllKeys().catch(console.error);
