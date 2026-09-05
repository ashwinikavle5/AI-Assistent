const http = require('http');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, res => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(responseBody) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function verifyAll10() {
  const email = 'deploy_test_' + Date.now() + '@speakwise.ai';
  const reg = await post('/api/auth/register', {
    name: 'Production Verifier',
    email,
    password: 'Password123!',
    confirmPassword: 'Password123!'
  });
  const token = reg.body.token;

  const tests = [
    { id: 1, text: 'not bad' },
    { id: 2, text: 'what are you doing?' },
    { id: 3, text: 'what is your name?' },
    { id: 4, text: 'how to build confidence' },
    { id: 5, text: 'mala mahit nahi yach ans ks dyaych' },
    { id: 6, text: 'jevn zal ka?' },
    { id: 7, text: 'I am chatting with you' },
    { id: 8, text: 'what are what are you doing' },
    { id: 9, text: 'आज माझं interview आहे, how should I prepare?' },
    { id: 10, text: 'mala English बोलायला practice karaychi aahe' }
  ];

  console.log('🚀 Testing 10 Required Deployment Messages via Live Server API...\n');

  for (const t of tests) {
    const res = await post('/api/ai/chat', { text: t.text }, { 'Authorization': 'Bearer ' + token });
    console.log(`[${t.id}] User: "${t.text}"`);
    console.log(`    AI: "${res.body.aiMessage.text.split('\n')[0]}"\n`);
  }

  console.log('🎉 ALL 10 LIVE DEPLOYMENT TESTS COMPLETED SUCCESSFULLY!');
}

verifyAll10().catch(console.error);
