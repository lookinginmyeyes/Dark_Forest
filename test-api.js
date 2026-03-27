const fetch = require('node-fetch');

async function testAPI() {
    const url = 'https://ark.cn-beijing.volces.com/api/coding/v3';
    const key = 'f8591ebf-5301-4922-ae6f-c1eb942643e5';
    const model = 'Doubao-Seed-2.0-lite';
    
    try {
        console.log('Testing API:', url);
        console.log('Using Model:', model);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 100,
                messages: [
                    { role: 'system', content: '你是一个助手' },
                    { role: 'user', content: '你好' }
                ]
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        const text = await response.text();
        console.log('Response text:', text);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testAPI();
