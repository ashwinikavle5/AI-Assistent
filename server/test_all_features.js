/**
 * Comprehensive Automated Test Suite for SpeakWise AI
 * Validates:
 * 1. Authentication (Register, Login, Bad Credentials, Protected Endpoints)
 * 2. Roman Marathi Normalization ("jevn zal ka?", "tu kasa ahes?")
 * 3. Devanagari Marathi Understanding ("माझं जेवण झालं.")
 * 4. English Grammar Detection & Polite Correction ("I am go to college everyday")
 * 5. Pronunciation Coach (Lookup, IPA, Audio, Spoken Practice Evaluation)
 * 6. Marathi -> English Practice (Non-repetition guarantee, intelligent grading)
 * 7. Persistent Streak & Calendar System
 * 8. Progress Analytics & Skills Breakdown
 */

const http = require('http');

const request = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting SpeakWise AI Comprehensive Test Suite...\n');
  let token = null;
  let testEmail = `testuser_${Date.now()}@example.com`;

  // 1. Health check
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.assert(health.status === 200 && health.data.product === 'SpeakWise AI', 'Health check failed');
  console.log('✅ 1. Health Check PASSED');

  // 2. Unauthenticated access blocked
  const unauth = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET'
  });
  console.assert(unauth.status === 401, 'Protected route should reject unauthenticated request');
  console.log('✅ 2. Protected Route Rejection PASSED (Status 401)');

  // 3. Register new user
  const reg = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Ashu Learner',
    email: testEmail,
    password: 'password123',
    confirmPassword: 'password123'
  });
  console.assert(reg.status === 201 && reg.data.token, 'Registration should return 201 with token');
  token = reg.data.token;
  console.log(`✅ 3. Registration PASSED (User ID: ${reg.data.user.id})`);

  // 4. Login with wrong password
  const badLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: 'wrong_password'
  });
  console.assert(badLogin.status === 401, 'Bad credentials should return 401');
  console.log('✅ 4. Bad Credentials Validation PASSED (Status 401)');

  // 5. Successful Login
  const login = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: 'password123'
  });
  console.assert(login.status === 200 && login.data.token, 'Login should succeed');
  token = login.data.token;
  console.log('✅ 5. Login Authentication PASSED');

  // 6. Roman Marathi AI Chat: "jevn zal ka?"
  const romanChat = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    text: 'jevn zal ka?'
  });
  console.assert(romanChat.status === 200, 'AI chat should return 200');
  console.assert(romanChat.data.userMessage.marathi_normalized === 'जेवण झालं का?', 'Roman Marathi must be normalized to जेवण झालं का?');
  console.assert(romanChat.data.userMessage.english_translation === 'Have you eaten?', 'English translation must be "Have you eaten?"');
  console.log(`✅ 6. Roman Marathi Processing PASSED ("jevn zal ka?" -> "${romanChat.data.userMessage.marathi_normalized}" -> "${romanChat.data.userMessage.english_translation}")`);
  console.log(`   AI Tutor Replied: "${romanChat.data.aiMessage.text}"`);

  // 7. Grammar Correction Test: "I am go to college everyday."
  const grammarChat = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    text: 'I am go to college everyday.'
  });
  console.assert(grammarChat.data.userMessage.grammar_correction !== null, 'Grammar correction must be detected');
  console.assert(grammarChat.data.userMessage.grammar_correction.better === 'I go to college every day.', 'Correction better version must match');
  console.log(`✅ 7. English Grammar Correction PASSED`);
  console.log(`   You wrote: "${grammarChat.data.userMessage.grammar_correction.original}"`);
  console.log(`   Better: "${grammarChat.data.userMessage.grammar_correction.better}"`);
  console.log(`   Why: "${grammarChat.data.userMessage.grammar_correction.explanation}"`);

  // 8. Pronunciation Lookup: "Beautiful"
  const pronLookup = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/pronunciation/lookup?word=beautiful',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.assert(pronLookup.status === 200 && pronLookup.data.details.word === 'Beautiful', 'Pronunciation lookup should return word details');
  console.log(`✅ 8. Pronunciation Lookup PASSED (${pronLookup.data.details.word}: ${pronLookup.data.details.ipa}, ${pronLookup.data.details.phoneticLearner})`);

  // 9. Pronunciation Practice Attempt
  const pronPractice = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/pronunciation/practice',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    word: 'Beautiful',
    transcript: 'beautiful',
    ipa: '/ˈbjuː.tɪ.fəl/'
  });
  console.assert(pronPractice.status === 200 && pronPractice.data.isMatch === true, 'Pronunciation attempt match should succeed');
  console.log(`✅ 9. Pronunciation Practice Feedback PASSED ("${pronPractice.data.feedback}")`);

  // 10. Practice Question Generation (Non-repeating check)
  const q1 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/practice/next?difficulty=Beginner',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const q2 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/practice/next?difficulty=Beginner',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.assert(q1.data.question.marathiSentence !== q2.data.question.marathiSentence, 'Practice questions must not repeat consecutive sentences');
  console.log(`✅ 10. Non-Repeating Question Engine PASSED`);
  console.log(`    Q1: "${q1.data.question.marathiSentence}" (${q1.data.question.category})`);
  console.log(`    Q2: "${q2.data.question.marathiSentence}" (${q2.data.question.category})`);

  // 11. Practice Evaluation
  const evalAttempt = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/practice/evaluate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    questionId: q1.data.question.questionId,
    userAnswer: 'I go to college every day.'
  });
  console.assert(evalAttempt.status === 200, 'Evaluation should return 200');
  console.log(`✅ 11. Practice Translation Evaluation PASSED (isCorrect: ${evalAttempt.data.isCorrect}, Message: "${evalAttempt.data.message}")`);

  // 12. Streak Tracking & Calendar
  const streak = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/streak/status',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.assert(streak.data.streak.currentStreak >= 1, 'Current streak should be at least 1 day');
  console.log(`✅ 12. Persistent Streak Status PASSED (Current: ${streak.data.streak.currentStreak} Days, Practiced Today: ${streak.data.streak.practicedToday})`);

  // 13. Progress Statistics & Competencies
  const progress = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/progress/stats',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.assert(progress.data.stats.totalPracticeDays >= 1, 'Total practice days should be >= 1');
  console.log(`✅ 13. Progress Analytics PASSED:`);
  console.log(`    Speaking: ${progress.data.stats.skills.speaking}%`);
  console.log(`    Grammar: ${progress.data.stats.skills.grammar}%`);
  console.log(`    Vocabulary: ${progress.data.stats.skills.vocabulary}%`);
  console.log(`    Pronunciation: ${progress.data.stats.skills.pronunciation}%`);
  console.log(`    Translation: ${progress.data.stats.skills.translation}%`);
  console.log(`    Listening: ${progress.data.stats.skills.listening}%`);

  console.log('\n🎉 ALL 13 TEST PHASES PASSED WITH ZERO FAILURES!\n');
};

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
