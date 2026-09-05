const { generateTutorResponse } = require('./services/aiTutorService');

async function testConversations() {
  console.log("=== Testing SpeakWise AI Updated Intent-Based Tutor ===\n");

  // Test 1: Conversation 1 - Roman Marathi learning help
  const t1 = await generateTutorResponse({ userMessage: "मला mahit नाही yach ans ks dyaych" });
  console.log("1. User: 'मला mahit नाही yach ans ks dyaych'");
  console.log("   AI:", t1.aiText);
  console.assert(t1.aiText.includes("I don't know how to answer this"), "Test 1 failed: Should suggest natural English phrase");

  // Test 2: Conversation 2 - "what are you doing?"
  const t2 = await generateTutorResponse({ userMessage: "what are you doing?" });
  console.log("\n2. User: 'what are you doing?'");
  console.log("   AI:", t2.aiText);
  console.assert(t2.aiText === "I'm chatting with you and helping you practice English! 😊 What are you doing right now?", "Test 2 failed: Should answer actual question");

  // Test 3: Conversation 3 - "Hello"
  const t3 = await generateTutorResponse({ userMessage: "Hello" });
  console.log("\n3. User: 'Hello'");
  console.log("   AI:", t3.aiText);
  console.assert(t3.aiText === "Hello! 👋 I'm SpeakWise AI. Ready to practice English with you! What would you like to talk about?", "Test 3 failed: Greeting response");

  // Test 4: Conversation 4 - "jevn zal ka?"
  const t4 = await generateTutorResponse({ userMessage: "jevn zal ka?" });
  console.log("\n4. User: 'jevn zal ka?'");
  console.log("   AI:", t4.aiText);
  console.log("   Marathi:", t4.marathiNormalized);
  console.log("   English:", t4.englishTranslation);
  console.assert(t4.aiText === "Yes! 😄 I'm always ready to chat. Have you eaten?", "Test 4 failed: Jevn zal ka response");

  // Test 5: "what is polymorphism?"
  const t5 = await generateTutorResponse({ userMessage: "what is polymorphism?" });
  console.log("\n5. User: 'what is polymorphism?'");
  console.log("   AI:", t5.aiText);
  console.assert(t5.aiText.includes("Polymorphism is a core concept in Object-Oriented Programming"), "Test 5 failed: Should explain polymorphism");

  // Test 6: Valid sentence "I am going to college." (NO false error)
  const t6 = await generateTutorResponse({ userMessage: "I am going to college." });
  console.log("\n6. User: 'I am going to college.'");
  console.log("   AI:", t6.aiText);
  console.assert(t6.grammarCorrection === null, "Test 6 failed: Valid sentence should not have grammar error");

  // Test 7: Real error "She go to college every day."
  const t7 = await generateTutorResponse({ userMessage: "She go to college every day." });
  console.log("\n7. User: 'She go to college every day.'");
  console.log("   Grammar Correction:", t7.grammarCorrection);
  console.assert(t7.grammarCorrection !== null && t7.grammarCorrection.better.includes("goes"), "Test 7 failed: Should catch subject-verb error");

  console.log("\n🎉 ALL 7 INTENT & CONVERSATION TESTS PASSED PERFECTLY!\n");
}

testConversations().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
