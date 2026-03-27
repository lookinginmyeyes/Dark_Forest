const fetch = require('node-fetch');

async function testAPI() {
    const url = 'https://ark.cn-beijing.volces.com/api/coding';
    const key = 'f8591ebf-5301-4922-ae6f-c1eb942643e5';
    const model = 'Doubao-Seed-2.0-lite';
    
    try {
        console.log('Testing API with x-api-key header:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
                'x-api-key': key
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 100,
                prompt: `\n\nHuman: 你好\n\nAssistant:`,
                system: '你是一个助手'
            })
        });
        
        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Response text:', text);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testAPI();
