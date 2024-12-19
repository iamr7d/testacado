import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

async function testKey(keyName, apiKey) {
    console.log(`\nTesting ${keyName}...`);
    try {
        const groq = new Groq({ apiKey });
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a JSON test bot. You must return EXACTLY what the user asks for. No extra text."
                },
                { 
                    role: "user",
                    content: 'Return this exact JSON: {"test":"ok"}' 
                }
            ],
            model: "mixtral-8x7b-32768",
            temperature: 0,
            max_tokens: 10,
            top_p: 1,
            stream: false
        });

        const content = response.choices[0]?.message?.content.trim();
        console.log(`${keyName} Raw Response:`, content);

        // Clean up response
        const cleanContent = content
            .replace(/^[^{]*{/, '{')
            .replace(/}[^}]*$/, '}')
            .replace(/[\n\r\t]/g, '')
            .replace(/,\s*}/g, '}')
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
            .replace(/:\s*'([^']*)'/g, ':"$1"')
            .replace(/\s+/g, ' ');

        try {
            const parsed = JSON.parse(cleanContent);
            if (parsed.test === 'ok') {
                console.log(`${keyName} Status: ✅ Working`);
                return true;
            } else {
                console.log(`${keyName} Status: ❌ Invalid response format`);
                return false;
            }
        } catch (parseError) {
            console.error(`${keyName} Parse Error:`, parseError.message);
            console.log(`${keyName} Status: ❌ Invalid JSON`);
            return false;
        }
    } catch (error) {
        console.error(`${keyName} Error:`, error.message);
        console.log(`${keyName} Status: ❌ Failed`);
        return false;
    }
}

async function testAllKeys() {
    console.log('Starting API key tests...');
    
    const keys = [
        { name: 'VITE_GROQ_API_KEY_1', key: process.env.VITE_GROQ_API_KEY_1 },
        { name: 'VITE_GROQ_API_KEY_2', key: process.env.VITE_GROQ_API_KEY_2 },
        { name: 'VITE_GROQ_API_KEY_3', key: process.env.VITE_GROQ_API_KEY_3 },
        { name: 'VITE_GROQ_API_KEY_4', key: process.env.VITE_GROQ_API_KEY_4 },
        { name: 'VITE_GROQ_API_KEY_5', key: process.env.VITE_GROQ_API_KEY_5 }
    ];

    const results = [];
    for (const { name, key } of keys) {
        if (!key) {
            console.log(`\n${name}: ❌ Not configured`);
            continue;
        }
        const success = await testKey(name, key);
        results.push({ name, success });
    }

    console.log('\nTest Results Summary:');
    console.log('--------------------');
    results.forEach(({ name, success }) => {
        console.log(`${name}: ${success ? '✅ Working' : '❌ Failed'}`);
    });
}

testAllKeys().catch(console.error);
