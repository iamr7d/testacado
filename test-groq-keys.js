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
            model: "llama-3.2-90b-vision-preview",
            temperature: 0,
            max_tokens: 10,
        });

        const response = completion.choices[0]?.message?.content?.trim();
        if (response && response.includes('OK')) {
            console.log(`✅ ${keyName}: Working`);
            return true;
        } else {
            console.log(`❌ ${keyName}: Invalid response: ${response}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${keyName}: Error - ${error.message}`);
        return false;
    }
};

const testAllKeys = async () => {
    console.log('Testing all Groq API keys...\n');
    
    const results = [];
    for (let i = 1; i <= 8; i++) {
        const result = await testGroqKey(i);
        results.push(result);
        // Add a small delay between tests to avoid rate limits
        if (i < 8) await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\nSummary:');
    console.log(`Working keys: ${results.filter(r => r).length}`);
    console.log(`Failed keys: ${results.filter(r => !r).length}`);
};

testAllKeys().catch(console.error);
