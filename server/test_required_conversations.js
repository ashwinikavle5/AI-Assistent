const assert = require('assert');
const { generateTutorResponse } = require('./services/aiTutorService');

async function runTests() {
  console.log('🧪 Running SpeakWise AI 10 Required Tests + Context & Quality Tests...\n');

  // TEST 1
  console.log('--- TEST 1: "not bad" ---');
  const res1 = await generateTutorResponse({ userMessage: 'not bad' });
  console.log('AI:', res1.aiText);
  assert(res1.aiText.toLowerCase().includes('good to hear'), 'Test 1 failed: did not respond naturally to "not bad"');
  assert(!res1.aiText.includes("interesting point"), 'Test 1 failed: returned generic template');
  console.log('✅ TEST 1 PASSED\n');

  // TEST 2
  console.log('--- TEST 2: "what are you doing?" ---');
  const res2 = await generateTutorResponse({ userMessage: 'what are you doing?' });
  console.log('AI:', res2.aiText);
  assert(res2.aiText.toLowerCase().includes('chatting with you') && res2.aiText.toLowerCase().includes('practice english'), 'Test 2 failed');
  console.log('✅ TEST 2 PASSED\n');

  // TEST 3
  console.log('--- TEST 3: "what is your name?" ---');
  const res3 = await generateTutorResponse({ userMessage: 'what is your name?' });
  console.log('AI:', res3.aiText);
  assert(res3.aiText.includes('SpeakWise AI'), 'Test 3 failed: name not mentioned');
  console.log('✅ TEST 3 PASSED\n');

  // TEST 4
  console.log('--- TEST 4: "how to build confidence" ---');
  const res4 = await generateTutorResponse({ userMessage: 'how to build confidence' });
  console.log('AI:', res4.aiText);
  assert(res4.aiText.toLowerCase().includes('building confidence takes practice') || res4.aiText.toLowerCase().includes('speak english for 5–10 minutes'), 'Test 4 failed');
  console.log('✅ TEST 4 PASSED\n');

  // TEST 5
  console.log('--- TEST 5: "mala mahit nahi yach ans ks dyaych" ---');
  const res5 = await generateTutorResponse({ userMessage: 'mala mahit nahi yach ans ks dyaych' });
  console.log('AI:', res5.aiText);
  assert(res5.aiText.includes("I don't know how to answer this"), 'Test 5 failed: English equivalent not suggested');
  console.log('✅ TEST 5 PASSED\n');

  // TEST 6
  console.log('--- TEST 6: "jevn zal ka?" ---');
  const res6 = await generateTutorResponse({ userMessage: 'jevn zal ka?' });
  console.log('AI:', res6.aiText);
  assert(res6.aiText.toLowerCase().includes('have you eaten'), 'Test 6 failed: did not understand "Have you eaten?"');
  console.log('✅ TEST 6 PASSED\n');

  // TEST 7
  console.log('--- TEST 7: "I am chatting with you" ---');
  const res7 = await generateTutorResponse({ userMessage: 'I am chatting with you' });
  console.log('AI:', res7.aiText);
  assert(res7.aiText.toLowerCase().includes('enjoying our conversation') || res7.aiText.toLowerCase().includes('what would you like to talk about'), 'Test 7 failed');
  assert(!res7.aiText.includes("interesting point"), 'Test 7 failed: returned generic filler');
  console.log('✅ TEST 7 PASSED\n');

  // TEST 8
  console.log('--- TEST 8: "what are what are you doing" (Stutter / Repetition) ---');
  const res8 = await generateTutorResponse({ userMessage: 'what are what are you doing' });
  console.log('AI:', res8.aiText);
  assert(res8.aiText.toLowerCase().includes('chatting with you') || res8.aiText.toLowerCase().includes('focused on our conversation') || res8.aiText.toLowerCase().includes('talking with you'), 'Test 8 failed');
  console.log('✅ TEST 8 PASSED\n');

  // TEST 9
  console.log('--- TEST 9: "आज माझं interview आहे, how should I prepare?" ---');
  const res9 = await generateTutorResponse({ userMessage: 'आज माझं interview आहे, how should I prepare?' });
  console.log('AI:', res9.aiText);
  assert(res9.aiText.toLowerCase().includes('interview') && (res9.aiText.toLowerCase().includes('introduction') || res9.aiText.toLowerCase().includes('guide')), 'Test 9 failed');
  console.log('✅ TEST 9 PASSED\n');

  // TEST 10
  console.log('--- TEST 10: "mala English बोलायला practice karaychi aahe" ---');
  const res10 = await generateTutorResponse({ userMessage: 'mala English बोलायला practice karaychi aahe' });
  console.log('AI:', res10.aiText);
  assert(res10.aiText.toLowerCase().includes('practice') && res10.aiText.toLowerCase().includes('questions'), 'Test 10 failed');
  console.log('✅ TEST 10 PASSED\n');

  // ADDITIONAL REQUIRED CONTEXT TEST
  console.log('--- Context Follow-up Test: "My English is weak" -> "how?" ---');
  const contextHistory = [
    { sender: 'user', text: 'My English is weak.' },
    { sender: 'ai', text: "That's okay! 😊 We can improve it together." }
  ];
  const resContext = await generateTutorResponse({
    userMessage: 'how?',
    conversationHistory: contextHistory
  });
  console.log('AI:', resContext.aiText);
  assert(resContext.aiText.toLowerCase().includes('reading') || resContext.aiText.toLowerCase().includes('5–10 minutes') || resContext.aiText.toLowerCase().includes('speaking practice'), 'Context follow-up test failed');
  console.log('✅ CONTEXT FOLLOW-UP TEST PASSED\n');

  // UNCONVENTIONAL / UNCLEAR ENTITY TEST
  console.log('--- Entity Clarification Test: "Science Academy 2 and helping my life" ---');
  const resEntity = await generateTutorResponse({
    userMessage: 'Science Academy 2 and helping my life'
  });
  console.log('AI:', resEntity.aiText);
  assert(resEntity.aiText.toLowerCase().includes('science academy 2') && resEntity.aiText.toLowerCase().includes('helping you'), 'Entity clarification test failed');
  console.log('✅ ENTITY CLARIFICATION TEST PASSED\n');

  // GRAMMAR ACCURACY TESTS
  console.log('--- Grammar Test: "She go to college every day." (True error) ---');
  const resGrammarError = await generateTutorResponse({
    userMessage: 'She go to college every day.'
  });
  assert(resGrammarError.grammarCorrection && resGrammarError.grammarCorrection.hasError, 'Grammar error not detected');
  assert(resGrammarError.grammarCorrection.better.includes('goes'), 'Correction incorrect');
  console.log('✅ GRAMMAR ERROR DETECTION PASSED\n');

  console.log('--- Grammar Non-Interference Test: "I am going to college." (Valid) ---');
  const resGrammarValid = await generateTutorResponse({
    userMessage: 'I am going to college.'
  });
  assert(!resGrammarValid.grammarCorrection, 'Valid sentence falsely flagged as error');
  console.log('✅ GRAMMAR VALID SENTENCE PASSED\n');

  console.log('🎉 ALL 14 TESTS (10 REQUIRED + 4 EDGE/CONTEXT CASES) PASSED WITH 100% SUCCESS!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
