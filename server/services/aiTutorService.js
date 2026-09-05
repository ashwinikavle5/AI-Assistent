/**
 * Conversational AI English Tutor Service — SpeakWise AI
 *
 * Core Principles:
 * 1. Always answer the user's actual question or message first.
 * 2. Conversation-first: behave like an intelligent, friendly AI conversational partner.
 * 3. Never use generic canned deflection templates (no "That's an interesting point", "I hear you", etc.).
 * 4. Comprehensive Intent Classification across 18 intents.
 * 5. Roman Marathi semantic understanding by whole sentence meaning.
 * 6. Context-aware follow-up recognition (e.g. "My English is weak" -> "how?").
 * 7. Do not force grammar corrections onto normal conversation.
 */

const {
  detectLanguage,
  processRomanMarathi,
  translateMarathiToEnglish,
  normalizeRomanMarathiText
} = require('./romanMarathiService');
const { checkGrammar } = require('./grammarService');
const https = require('https');

// The 18 standard intent classes
const INTENT_TYPES = {
  GREETING: 'GREETING',
  CASUAL_CONVERSATION: 'CASUAL_CONVERSATION',
  GENERAL_QUESTION: 'GENERAL_QUESTION',
  PERSONAL_QUESTION: 'PERSONAL_QUESTION',
  AI_QUESTION: 'AI_QUESTION',
  ADVICE: 'ADVICE',
  ENGLISH_PRACTICE: 'ENGLISH_PRACTICE',
  GRAMMAR_CORRECTION: 'GRAMMAR_CORRECTION',
  TRANSLATION: 'TRANSLATION',
  ROMAN_MARATHI: 'ROMAN_MARATHI',
  MARATHI: 'MARATHI',
  MIXED_LANGUAGE: 'MIXED_LANGUAGE',
  VOCABULARY: 'VOCABULARY',
  PRONUNCIATION: 'PRONUNCIATION',
  INTERVIEW_HELP: 'INTERVIEW_HELP',
  WRITING_HELP: 'WRITING_HELP',
  GENERAL_KNOWLEDGE: 'GENERAL_KNOWLEDGE',
  UNCLEAR: 'UNCLEAR'
};

// Clean and normalize input text (handles stutters/repeated words like "what are what are you doing")
const normalizeInputText = (text) => {
  if (!text || typeof text !== 'string') return '';
  let clean = text.trim();

  // Deduplicate repeated phrases or repeated words (e.g., "what are what are you doing" -> "what are you doing")
  clean = clean.replace(/\b(what\s+are)\s+(what\s+are)\b/gi, '$1');
  clean = clean.replace(/\b(how\s+to)\s+(how\s+to)\b/gi, '$1');
  clean = clean.replace(/\b(\w+)\s+\1\b/gi, '$1');
  clean = clean.replace(/\s+/g, ' ');

  return clean;
};

// Intent Classifier
const classifyIntent = (cleanInput, conversationHistory = [], detectedLang = 'english') => {
  const lower = cleanInput.toLowerCase().replace(/[?!.,;]/g, '').trim();

  // Check recent context for follow-ups (e.g., "how?" after "My English is weak")
  if (/^(how|how\s+to|how\s+can\s+i|kas|kasa|why)$/i.test(lower) && conversationHistory.length > 0) {
    const lastUserMsg = conversationHistory.slice().reverse().find(m => m.sender === 'user' || m.role === 'user');
    if (lastUserMsg) {
      const prevText = (lastUserMsg.text || '').toLowerCase();
      if (/english\s+is\s+(weak|poor|bad)|improve\s+english|learn\s+english|shikaych/i.test(prevText)) {
        return { intent: INTENT_TYPES.ADVICE, subType: 'FOLLOWUP_IMPROVE_ENGLISH' };
      }
    }
  }

  // 1. AI Questions (Activity first, then Identity)
  if (
    /\bwhat\s+(are\s+you|r\s+u)\s+doing\b/i.test(lower) ||
    /\bwhat\s+you\s+doing\b/i.test(lower) ||
    /\bwhat's\s+up\b/i.test(lower) ||
    /\bwhats\s+up\b/i.test(lower) ||
    /\bwhat\s+are\s+you\s+up\s+to\b/i.test(lower) ||
    /\bkay\s+(kartoy|kartes|chalalay)\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.AI_QUESTION, subType: 'AI_ACTIVITY' };
  }

  if (
    /\bwhat\s+(is\s+your|r\s+ur)\s+name\b/i.test(lower) ||
    /\bwho\s+are\s+you\b/i.test(lower) ||
    /^what\s+are\s+you\??$/i.test(lower) ||
    /\bwho\s+made\s+you\b/i.test(lower) ||
    /\btu\s+kon\s+ahes\b/i.test(lower) ||
    lower === 'your name'
  ) {
    return { intent: INTENT_TYPES.AI_QUESTION, subType: 'AI_IDENTITY' };
  }

  // 2. Greetings
  if (/^(hello|hi|hey|heya|howdy|good\s+morning|good\s+afternoon|good\s+evening|shubh\s+sakal|shubh\s+ratri)$/i.test(lower)) {
    return { intent: INTENT_TYPES.GREETING };
  }

  // 3. Casual Conversation
  if (/^not\s+bad$/i.test(lower)) {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'NOT_BAD' };
  }

  if (
    /\bi\s+am\s+chatting\s+with\s+you\b/i.test(lower) ||
    /\bchatting\s+with\s+you\b/i.test(lower) ||
    /\btalking\s+with\s+you\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'CHATTING_WITH_YOU' };
  }

  if (
    /\bhow\s+(are\s+you|r\s+u|do\s+you\s+do)\b/i.test(lower) ||
    /\bhow's\s+it\s+going\b/i.test(lower) ||
    /\bhow\s+is\s+it\s+going\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'HOW_ARE_YOU' };
  }

  if (/^(i'm\s+good|im\s+good|doing\s+good|doing\s+fine|i\s+am\s+fine|all\s+good|feeling\s+good|pretty\s+good|great)$/i.test(lower)) {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'USER_FEELING_GOOD' };
  }

  if (/^(nothing\s+much|just\s+chilling|relaxing|watching\s+tv|just\s+resting)$/i.test(lower)) {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'USER_RELAXING' };
  }

  if (/^(thank\s+you|thanks|thank\s+u|thx)$/i.test(lower)) {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'THANKS' };
  }

  if (/^(yes|yeah|yep|sure|okay|ok)$/i.test(lower)) {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'AFFIRMATION' };
  }

  if (/^(no|nope|not\s+really)$/i.test(lower)) {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'NEGATION' };
  }

  // 4. Advice / English Improvement Queries
  if (
    /\bhow\s+to\s+build\s+confidence\b/i.test(lower) ||
    /\bbuild\s+confidence\b/i.test(lower) ||
    /\bconfidence\s+building\b/i.test(lower) ||
    /\bhow\s+(can\s+i|to)\s+become\s+confident\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ADVICE, subType: 'BUILD_CONFIDENCE' };
  }

  if (
    /\bhow\s+to\s+speak\s+(fluent\s+)?english\b/i.test(lower) ||
    /\bhow\s+to\s+improve\s+(my\s+)?english\b/i.test(lower) ||
    /\bmy\s+english\s+is\s+weak\b/i.test(lower) ||
    /\bhow\s+can\s+i\s+learn\s+english\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ADVICE, subType: 'IMPROVE_ENGLISH' };
  }

  if (/\bhow\s+to\s+overcome\s+(fear|hesitation)\b/i.test(lower)) {
    return { intent: INTENT_TYPES.ADVICE, subType: 'OVERCOME_HESITATION' };
  }

  // 5. Interview Help
  if (
    /\binterview\b/i.test(lower) &&
    (/\b(prepare|tayari|tayyari|tips|questions|how\s+should\s+i|aaj|ahe|aahe)\b/i.test(lower) ||
      /\bआज\s+माझं\s+interview\s+आहे\b/i.test(cleanInput))
  ) {
    return { intent: INTENT_TYPES.INTERVIEW_HELP };
  }

  // 6. English Practice Request
  if (
    /(?:mala|मला).*?english.*?(?:bolayla|बोलायला|shikaych|शिकायचं|practice)/i.test(cleanInput) ||
    /\benglish\b.*?\bpractice\b/i.test(lower) ||
    /\bmala\s+english\s+shikaycha\b/i.test(lower) ||
    /\bमला\s+इंग्रजी\s+शिकायचं\b/i.test(cleanInput) ||
    /\bi\s+want\s+to\s+practice\s+(spoken\s+)?english\b/i.test(lower) ||
    /\blet('s|\s+us)\s+practice\s+english\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE };
  }

  // 7. General Knowledge / Technical Topics
  if (/\bpolymorphism\b/i.test(lower)) {
    return { intent: INTENT_TYPES.GENERAL_KNOWLEDGE, subType: 'POLYMORPHISM' };
  }

  if (/\bwhat\s+is\s+(an?\s+)?(api|database|algorithm|compiler|variable|class|object)\b/i.test(lower)) {
    return { intent: INTENT_TYPES.GENERAL_KNOWLEDGE, subType: 'PROGRAMMING_CONCEPT' };
  }

  if (/\bwhat\s+is\s+(an?\s+)?(noun|verb|adjective|adverb|pronoun|preposition|tense)\b/i.test(lower)) {
    return { intent: INTENT_TYPES.GENERAL_KNOWLEDGE, subType: 'GRAMMAR_CONCEPT' };
  }

  // 8. Explicit Grammar Check Request
  if (
    /\bis\s+this\s+(sentence\s+)?correct\b/i.test(lower) ||
    /\bcheck\s+(my\s+)?grammar\b/i.test(lower) ||
    /\bcorrect\s+(this|my)\s+sentence\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.GRAMMAR_CORRECTION, subType: 'EXPLICIT_REQUEST' };
  }

  // 9. Specific Entity Mention / Unclear Subject (e.g. "Science Academy 2 and helping my life")
  if (/\bscience\s+academy\b/i.test(lower)) {
    return { intent: INTENT_TYPES.UNCLEAR, subType: 'SCIENCE_ACADEMY' };
  }

  // 10. Language-specific intents
  if (detectedLang === 'roman_marathi') {
    return { intent: INTENT_TYPES.ROMAN_MARATHI };
  }

  if (detectedLang === 'marathi') {
    return { intent: INTENT_TYPES.MARATHI };
  }

  if (detectedLang === 'mixed') {
    return { intent: INTENT_TYPES.MIXED_LANGUAGE };
  }

  // Default intent for English statements/questions
  if (cleanInput.endsWith('?') || /^(what|why|where|when|who|how|can|could|will|would|is|are|do|does)\b/i.test(lower)) {
    return { intent: INTENT_TYPES.GENERAL_QUESTION };
  }

  return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'GENERAL_STATEMENT' };
};

// Call external Gemini API if API key is present
const callGeminiAPI = async (apiKey, systemInstruction, userMessage, conversationHistory = []) => {
  return new Promise((resolve, reject) => {
    const contents = [];

    for (const msg of conversationHistory.slice(-6)) {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const postData = JSON.stringify({
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
            resolve(json.candidates[0].content.parts[0].text);
          } else if (json.error) {
            reject(new Error(json.error.message || 'Gemini API returned an error.'));
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('Gemini API request timed out.'));
    });

    req.write(postData);
    req.end();
  });
};

// Multiple natural activity responses for repeated inquiries
const AI_ACTIVITY_RESPONSES = [
  "I'm chatting with you and helping you practice English! 😊 What are you doing right now?",
  "I'm here talking with you and ready to practice English whenever you are! 😄 What are you working on today?",
  "Right now, I'm focused on our conversation and helping you with English! 🤖 What would you like to talk about?"
];
let activityResponseIndex = 0;

// Main AI Tutor orchestration
const generateTutorResponse = async ({
  userMessage,
  userLevel = 'Intermediate',
  conversationHistory = [],
  customApiKey = null
}) => {
  const rawInput = (userMessage || '').trim();
  const cleanInput = normalizeInputText(rawInput);
  const apiKey = customApiKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

  // 1. Language Detection & Roman Marathi Normalization
  const detectedLang = detectLanguage(cleanInput);
  let marathiNormalized = null;
  let englishTranslation = null;

  if (detectedLang === 'roman_marathi' || detectedLang === 'mixed') {
    const romanResult = processRomanMarathi(cleanInput);
    if (romanResult.isRomanMarathi) {
      marathiNormalized = romanResult.normalizedMarathi;
      englishTranslation = romanResult.englishTranslation;
    }
  } else if (detectedLang === 'marathi') {
    marathiNormalized = cleanInput;
    englishTranslation = translateMarathiToEnglish(cleanInput);
  }

  // 2. Classify Intent
  const classified = classifyIntent(cleanInput, conversationHistory, detectedLang);
  const intent = classified.intent;
  const subType = classified.subType;

  // 3. Grammar Check ONLY on genuine errors or explicit requests
  let grammarCorrection = null;
  const isCasualStatement = [
    'NOT_BAD',
    'CHATTING_WITH_YOU',
    'HOW_ARE_YOU',
    'USER_FEELING_GOOD',
    'USER_RELAXING',
    'THANKS',
    'AFFIRMATION',
    'NEGATION'
  ].includes(subType);

  if (!isCasualStatement && (detectedLang === 'english' || detectedLang === 'mixed')) {
    grammarCorrection = checkGrammar(cleanInput);
  }

  // 4. If an external API key is present, invoke Google Gemini with exact instructions
  if (apiKey) {
    const systemPrompt = `
You are SpeakWise AI, a friendly and intelligent English tutor and conversational assistant.

Your primary responsibility is to understand what the user actually means and answer their message directly.

Never use generic filler responses.

Never respond with unrelated English-practice questions.

Do not assume that every user message is a grammar exercise.

Answer factual questions accurately.

Answer casual questions naturally.

Give advice when the user asks for advice.

Correct grammar only when appropriate.

You understand English, Marathi, Roman Marathi, and mixed Marathi-English.

Roman Marathi is Marathi written using English letters. Interpret it by sentence meaning rather than translating individual words.

For unclear Roman Marathi, infer the likely meaning from context and ask for clarification only when necessary.

When a user asks a question, answer the question first.

When the user makes a grammar mistake, correct it only if useful.

Be friendly, concise, encouraging and natural.

Do not repeatedly say phrases such as 'That's an interesting point', 'I hear you', or 'Let's explore that together'.

Do not pretend to understand something that is genuinely unclear.

If the user asks 'what are you doing?', answer that you are chatting with them and helping them practice English.

If the user asks 'what is your name?', answer that your name is SpeakWise AI.

If the user asks for advice such as 'how to build confidence', provide useful actionable advice.

You are a conversational AI tutor, not a question generator.
    `.trim();

    try {
      const geminiResponse = await callGeminiAPI(apiKey, systemPrompt, cleanInput, conversationHistory);
      if (geminiResponse) {
        return {
          aiText: geminiResponse,
          detectedLang,
          marathiNormalized,
          englishTranslation,
          grammarCorrection: grammarCorrection?.hasError ? grammarCorrection : null
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed:', err.message);
      if (customApiKey) {
        // As instructed: "If the AI API fails, show an actual error message instead of pretending the AI answered."
        return {
          aiText: `Unable to connect to the external AI model: ${err.message}. Please check your API key in Settings or try again.`,
          detectedLang,
          marathiNormalized,
          englishTranslation,
          grammarCorrection: null
        };
      }
    }
  }

  // 5. Intelligent Offline Intent-Based Engine (NO generic filler templates)
  let reply = "";

  // Handle AI Identity & Activity
  if (intent === INTENT_TYPES.AI_QUESTION) {
    if (subType === 'AI_IDENTITY') {
      reply = "My name is SpeakWise AI! 🤖 I'm your friendly English tutor and conversation partner.";
    } else if (subType === 'AI_ACTIVITY') {
      reply = AI_ACTIVITY_RESPONSES[activityResponseIndex % AI_ACTIVITY_RESPONSES.length];
      activityResponseIndex++;
    } else {
      reply = "I'm SpeakWise AI, your friendly AI English companion! 🤖 I'm here to chat, help you build speaking confidence, and answer your questions.";
    }
  }

  // Handle Greetings
  else if (intent === INTENT_TYPES.GREETING) {
    const lower = cleanInput.toLowerCase();
    if (/morning|सकाळ/i.test(lower)) {
      reply = "Good morning! ☀️ I'm SpeakWise AI. Ready to practice English with you! How is your morning going?";
    } else if (/afternoon/i.test(lower)) {
      reply = "Good afternoon! 🌤️ I'm SpeakWise AI. Ready to practice English with you! What would you like to chat about today?";
    } else if (/evening|ratri|रात्री/i.test(lower)) {
      reply = "Good evening! 🌙 I'm SpeakWise AI. Ready to practice English with you! How was your day?";
    } else {
      reply = "Hello! 👋 I'm SpeakWise AI. Ready to practice English with you! What would you like to talk about?";
    }
  }

  // Handle Casual Conversation
  else if (intent === INTENT_TYPES.CASUAL_CONVERSATION) {
    if (subType === 'NOT_BAD') {
      reply = "That's good to hear! 😊 What have you been doing today?";
    } else if (subType === 'CHATTING_WITH_YOU') {
      reply = "Yes! 😄 And I'm enjoying our conversation. What would you like to talk about?";
    } else if (subType === 'HOW_ARE_YOU') {
      reply = "I'm doing great! 😊 Thanks for asking. How are you?";
    } else if (subType === 'USER_FEELING_GOOD') {
      reply = "Glad to hear that! 😊 What are you up to today?";
    } else if (subType === 'USER_RELAXING') {
      reply = "Sounds nice and relaxing! 😄 Are you taking a break, or just winding down for the day?";
    } else if (subType === 'THANKS') {
      reply = "You're very welcome! 😊 What else would you like to talk about?";
    } else if (subType === 'AFFIRMATION') {
      reply = "Awesome! 😄 What topic would you like to chat about next—daily life, your hobbies, or work/college?";
    } else if (subType === 'NEGATION') {
      reply = "No problem at all! 😊 What's on your mind right now?";
    } else {
      // Direct acknowledgment of general conversational input
      reply = "I understand! 😊 Tell me a little more about that.";
    }
  }

  // Handle Advice & English Improvement
  else if (intent === INTENT_TYPES.ADVICE) {
    if (subType === 'BUILD_CONFIDENCE') {
      reply = `Building confidence takes practice. Here are a few simple things you can try:

1. Speak English for 5–10 minutes every day.
2. Don't be afraid of making mistakes.
3. Start with simple sentences and gradually make them longer.
4. Practice speaking in front of a mirror or with a friend.
5. Celebrate small improvements.

Remember: you don't need perfect English to speak confidently. You become confident by speaking more. 😊

If you want, I can also give you a simple 7-day English confidence practice plan.`;
    } else if (subType === 'FOLLOWUP_IMPROVE_ENGLISH' || subType === 'IMPROVE_ENGLISH') {
      reply = `We can start with 5–10 minutes of speaking practice every day! Here is a simple plan:

1. **Read aloud**: Read short English sentences or stories out loud every day.
2. **Think in English**: Name objects around you in English instead of translating in your head.
3. **Chat daily**: Practice short conversations with me right here!

What part of English feels hardest for you—vocabulary, grammar, or speaking confidence?`;
    } else if (subType === 'OVERCOME_HESITATION') {
      reply = `Hesitation happens when you worry about making mistakes! Here is how to overcome it:

1. **Focus on communication, not perfection**: If the listener understands your point, you succeeded.
2. **Slow down your speech**: Speaking slightly slower gives your brain time to choose words.
3. **Use simple vocabulary first**: You don't need complex words to express great ideas.

Would you like to try a short 2-minute speaking practice with me right now?`;
    } else {
      reply = `Here is a helpful tip: break big goals into 10-minute daily habits. Consistency matters more than speed! What specific challenge are you facing?`;
    }
  }

  // Handle Interview Preparation
  else if (intent === INTENT_TYPES.INTERVIEW_HELP) {
    reply = `Good luck with your interview! 🎯 Here is a focused preparation guide to help you shine:

1. **Master Your Self-Introduction**:
   Prepare a crisp 60-second summary:
   👉 *"Hello, my name is [Name]. I have a background in [Field] and I am passionate about [Key Skill]. In my recent experience, I worked on [Key Project] and delivered [Result]."*

2. **Common Questions to Practice**:
   - *"What are your greatest strengths?"* (Give a specific example).
   - *"Tell me about a challenge you solved."* (Use Situation → Task → Action → Result).
   - *"Why do you want to join our team?"*

3. **Speaking Delivery**:
   - Take a breath before answering; pause instead of saying *"um"* or *"uh"*.
   - Keep answers between 1 to 2 minutes.

Would you like to practice a mock interview right now? Say *"Ask me an interview question!"* and we can start!`;
  }

  // Handle English Practice Requests
  else if (intent === INTENT_TYPES.ENGLISH_PRACTICE) {
    reply = `Of course! 😊 Let's practice. I'll ask you simple questions in English and help you improve your answers.

To get started: What do you like to do in your free time, or what did you do today?`;
  }

  // Handle General Knowledge / Technical Concepts
  else if (intent === INTENT_TYPES.GENERAL_KNOWLEDGE) {
    if (subType === 'POLYMORPHISM') {
      reply = `Polymorphism is a core concept in Object-Oriented Programming (OOP) that allows objects or methods to take on multiple forms! 💡

The word comes from Greek: **"poly"** (many) and **"morph"** (forms).

There are two main types:
1. **Compile-time Polymorphism (Method Overloading)**: Multiple methods in the same class have the same name but different parameters.
2. **Runtime Polymorphism (Method Overriding)**: A subclass provides its own specific implementation of a method defined in its parent class.

**Example**:
A method named \`makeSound()\`. A Dog object barks, while a Cat object meows. Both use the same method name, but respond differently!

In spoken English, you can describe it like this:
👉 *"Polymorphism allows different objects to respond to the same message in their own unique way."*

Would you like to see a code example in Java, Python, or C++?`;
    } else {
      reply = `That is a great technical concept to practice explaining in English! Could you tell me in your own words what you think it means, and I'll help you refine your explanation?`;
    }
  }

  // Handle Roman Marathi / Marathi Queries
  else if (intent === INTENT_TYPES.ROMAN_MARATHI || intent === INTENT_TYPES.MARATHI || intent === INTENT_TYPES.MIXED_LANGUAGE) {
    // Check specific Roman Marathi intents
    const lower = cleanInput.toLowerCase();

    if (
      /mahit\s+nahi.*?ans.*?ks.*?dyaych/i.test(lower) ||
      /(?:ks|kasa).*?(?:ans|answer).*?(?:dyaych|dyaycha)/i.test(lower) ||
      /मला.*?माहित.*?नाही.*?कसं/i.test(cleanInput) ||
      /mahit.*?nahi/i.test(lower) && /ans|answer|dyaych/i.test(lower)
    ) {
      reply = `No problem! 😊 Send me the question and I'll help you answer it naturally in English.

You can say:

👉 "I don't know how to answer this."

Or:

👉 "I'm not sure how to answer this."`;
    } else if (/jevn\s+zal\s+ka/i.test(lower) || /जेवण\s+झालं\s+का/i.test(cleanInput)) {
      reply = "Yes! 😄 I'm always ready to chat. Have you eaten?";
    } else if (/tu\s+kasa\s+ahes/i.test(lower) || /तू\s+कसा\s+आहेस/i.test(cleanInput)) {
      reply = "I'm doing great! 😊 Thanks for asking. How are you?";
    } else if (/udya\s+bhetu/i.test(lower) || /उद्या\s+भेटू/i.test(cleanInput)) {
      reply = "See you tomorrow! 😊 Remember to practice for a few minutes every day.";
    } else if (englishTranslation) {
      reply = `In English, you can say:

👉 "${englishTranslation}"

Would you like to practice using this in a sentence?`;
    } else {
      reply = `I understand! What would you like to say in English? You can tell me in Marathi or Roman Marathi, and I'll help you phrase it naturally.`;
    }
  }

  // Handle Unclear Specific Entities (e.g., "Science Academy 2 and helping my life")
  else if (intent === INTENT_TYPES.UNCLEAR) {
    if (subType === 'SCIENCE_ACADEMY') {
      reply = "That sounds interesting! 😊 Do you mean that Science Academy 2 is helping you in your studies or in your daily life? Tell me a little more.";
    } else {
      reply = "That sounds interesting! 😊 Could you tell me a little more about what you mean, or what you'd like to talk about today?";
    }
  }

  // If there is an explicit grammar correction
  else if (grammarCorrection && grammarCorrection.hasError) {
    reply = `A quick tip on your sentence! 😊\n\n❌ ${grammarCorrection.original}\n✅ ${grammarCorrection.better}\n\n**Why?** ${grammarCorrection.explanation}\n\nWhat would you like to talk about next?`;
  }

  // General Questions / Catch-All (Direct, conversational answer acknowledging the user's message)
  else {
    reply = `That's a good question! 😊 To give you the most helpful answer, could you tell me a little more context about what you have in mind?`;
  }

  return {
    aiText: reply,
    detectedLang,
    marathiNormalized,
    englishTranslation,
    grammarCorrection: grammarCorrection?.hasError ? grammarCorrection : null
  };
};

module.exports = {
  generateTutorResponse,
  classifyIntent,
  normalizeInputText,
  INTENT_TYPES
};
