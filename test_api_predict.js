// Test actual HTTP call to /api/ai/predict/:surveyId
const http = require('http');

// First login as HR to get a token
const loginData = JSON.stringify({ email: 'hr@company.com', password: 'password123' });

const loginReq = http.request({
    hostname: 'localhost', port: 5000, path: '/api/auth/login',
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
}, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        console.log('Login status:', res.statusCode);
        console.log('Login response:', body.substring(0, 200));
        
        try {
            const loginResult = JSON.parse(body);
            const token = loginResult.token;
            if (!token) {
                console.log('No token received. Full response:', body);
                process.exit(1);
            }
            
            // Now call Run AI for survey ID 1
            console.log('\n--- Calling /api/ai/predict/1 ---');
            const aiReq = http.request({
                hostname: 'localhost', port: 5000, path: '/api/ai/predict/1',
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            }, (aiRes) => {
                let aiBody = '';
                aiRes.on('data', d => aiBody += d);
                aiRes.on('end', () => {
                    console.log('AI predict status:', aiRes.statusCode);
                    console.log('AI predict response:', aiBody.substring(0, 500));
                    
                    // Now try survey ID 2 (kavin)
                    console.log('\n--- Calling /api/ai/predict/2 ---');
                    const ai2Req = http.request({
                        hostname: 'localhost', port: 5000, path: '/api/ai/predict/2',
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                    }, (ai2Res) => {
                        let ai2Body = '';
                        ai2Res.on('data', d => ai2Body += d);
                        ai2Res.on('end', () => {
                            console.log('AI predict/2 status:', ai2Res.statusCode);
                            console.log('AI predict/2 response:', ai2Body.substring(0, 500));
                            process.exit(0);
                        });
                    });
                    ai2Req.on('error', e => { console.error('AI2 error:', e.message); process.exit(1); });
                    ai2Req.end();
                });
            });
            aiReq.on('error', e => { console.error('AI error:', e.message); process.exit(1); });
            aiReq.end();
            
        } catch (e) {
            console.error('Parse error:', e.message);
            process.exit(1);
        }
    });
});

loginReq.on('error', e => { console.error('Login error:', e.message); process.exit(1); });
loginReq.write(loginData);
loginReq.end();
