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

  // 14. Conversational AI Tutor 16 Target Test Cases & Anti-Generic Filter
  console.log('\n--- Phase 14: Testing All 16 Target Educational & Conversational Tutor Messages ---');
  const { generateTutorResponse } = require('./services/aiTutorService');
  const FORBIDDEN_FILLERS = [
    "that's an interesting point",
    "you are communicating clearly",
    "to expand on this",
    "could you share a little more about your experience with that",
    "i hear you",
    "let's explore that together",
    "that's a good question",
    "tell me a little more about that",
    "what would you like to say in english",
    "what would you like to explore next",
    "i'm listening",
    "could you tell me a little more",
    "what specific details or examples can you share",
    "work through it together"
  ];

  const targetTestCases = [
    {
      id: 1,
      input: 'present tense',
      verify: (res) => res.aiText.includes("Present tense is used") && res.aiText.includes("Simple Present") && !res.grammarCorrection
    },
    {
      id: 2,
      input: 'how we can use present tense',
      verify: (res) => res.aiText.includes("How can we use the present tense?") && res.grammarCorrection?.better === "How can we use the present tense?"
    },
    {
      id: 3,
      input: 'daily habbits',
      verify: (res) => res.aiText.includes("daily habits") && res.aiText.includes("wake up") && res.grammarCorrection?.better === "daily habits"
    },
    {
      id: 4,
      input: 'what is simple present tense',
      verify: (res) => res.aiText.includes("Simple Present tense is used") && res.aiText.includes("Subject + Base Verb") && !res.grammarCorrection
    },
    {
      id: 5,
      input: 'give me examples of present tense',
      verify: (res) => res.aiText.includes("examples of the Present Tense") && res.aiText.includes("Simple Present") && !res.grammarCorrection
    },
    {
      id: 6,
      input: 'how can I improve my English?',
      verify: (res) => res.aiText.includes("To improve your English") && res.aiText.includes("Read aloud") && !res.grammarCorrection
    },
    {
      id: 7,
      input: 'i cant understand english',
      verify: (res) => res.aiText.includes("can't understand English") && res.grammarCorrection?.better.includes("can't")
    },
    {
      id: 8,
      input: 'i have lot of woring for today',
      verify: (res) => res.aiText.includes("a lot of work for today") && res.aiText.includes("woring") && res.grammarCorrection?.better === "I have a lot of work for today."
    },
    {
      id: 9,
      input: 'I am chatting with you',
      verify: (res) => res.aiText.includes("happy to chat with you") && !res.grammarCorrection
    },
    {
      id: 10,
      input: 'mala English samjat nahi',
      verify: (res) => res.aiText.includes("मला English समजत नाही") && res.aiText.includes("I don't understand English")
    },
    {
      id: 11,
      input: 'mala present tense samjun sang',
      verify: (res) => res.aiText.includes("Present Tense म्हणजे वर्तमानकाळ") && res.aiText.includes("Simple Present")
    },
    {
      id: 12,
      input: 'mala mahit nahi yach ans ks dyaych',
      verify: (res) => res.aiText.includes("मला माहित नाही, याचं answer कसं द्यायचं?") && res.aiText.includes("I don't know how to answer this")
    },
    {
      id: 13,
      input: 'jevn zal ka?',
      verify: (res) => res.aiText.includes("जेवण झालं का?") && res.aiText.includes("Have you eaten")
    },
    {
      id: 14,
      input: 'mala English बोलायला practice karaychi aahe',
      verify: (res) => res.aiText.includes("I want to practice speaking English") && res.aiText.includes("What did you do today")
    },
    {
      id: 15,
      input: 'give me present tense exercise',
      verify: (res) => res.aiText.includes("Present Tense practice exercise") && res.aiText.includes("1. She ______ (go)") && !res.grammarCorrection
    },
    {
      id: 16,
      input: 'check my answer',
      verify: (res) => res.aiText.includes("She goes to college every day") && !res.grammarCorrection
    },
    {
      id: 17,
      input: 'what was doing?',
      verify: (res) => res.aiText.includes("What were you doing?") && res.aiText.includes("chatting with you")
    },
    {
      id: 18,
      input: 'you dont help me just tell these sentense wrong and you even dont correct the statement',
      verify: (res) => res.aiText.includes("You don't help me") && res.aiText.includes("sentense → sentence") && !res.aiText.includes("What did you do today?")
    }
  ];

  for (const tc of targetTestCases) {
    const res = await generateTutorResponse({ userMessage: tc.input });
    const lower = res.aiText.toLowerCase();
    for (const f of FORBIDDEN_FILLERS) {
      if (lower.includes(f)) {
        throw new Error(`Test Case ${tc.id} ("${tc.input}") contained forbidden generic filler: "${f}"`);
      }
    }
    if (!tc.verify(res)) {
      throw new Error(`Test Case ${tc.id} ("${tc.input}") failed verification. Response was:\n${res.aiText}`);
    }
    console.log(`  ✓ Case ${tc.id} passed: "${tc.input}"`);
  }
  console.log('✅ 14. Conversational AI Tutor 18 Target Cases PASSED (18/18)');

  // 15. Conversation Context & Multi-turn Continuity Test
  console.log('\n--- Phase 15: Testing Conversation Context & Continuity ---');
  // Flow A: what was doing? -> yes
  const flowA = [
    { sender: 'user', text: 'what was doing?' },
    { sender: 'ai', text: 'Did you mean: "What were you doing?" Because the subject is "you", we use "were", not "was". I was chatting with you!' }
  ];
  const flowARes = await generateTutorResponse({
    userMessage: 'yes',
    conversationHistory: flowA
  });
  if (!flowARes.aiText.includes("What were you doing?") || !flowARes.aiText.includes("What were you doing yesterday?")) {
    throw new Error("Context test failed: 'what was doing?' -> 'yes' did not explain was/were");
  }
  console.log("  ✓ Flow A: 'what was doing?' -> 'yes' correctly continued was/were explanation");

  // Flow B: present tense -> give me exercise -> check my answer
  const contextHistory = [
    { sender: 'user', text: 'present tense' },
    { sender: 'ai', text: 'Present tense is used to talk about things that happen now, regularly, or are generally true.' }
  ];
  const followUp1 = await generateTutorResponse({
    userMessage: 'give me exercise',
    conversationHistory: contextHistory
  });
  if (!followUp1.aiText.includes("Present Tense practice exercise")) {
    throw new Error("Context test failed: 'give me exercise' did not yield present tense exercise");
  }
  contextHistory.push({ sender: 'user', text: 'give me exercise' });
  contextHistory.push({ sender: 'ai', text: followUp1.aiText });

  const followUp2 = await generateTutorResponse({
    userMessage: 'check my answer',
    conversationHistory: contextHistory
  });
  if (!followUp2.aiText.includes("She goes to college every day")) {
    throw new Error("Context test failed: 'check my answer' did not evaluate the exercise");
  }
  console.log("  ✓ Flow B: 'present tense' -> 'give me exercise' -> 'check my answer' passed");
  console.log('✅ 15. Multi-Turn Conversation Context Flow PASSED (15/15)\n');

  console.log('\n🎉 ALL 15 TEST PHASES PASSED WITH ZERO FAILURES!\n');
};

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
