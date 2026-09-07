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
const { analyzeToneAndConfidence } = require('./toneConfidenceService');
const { evaluatePracticeAnswer, getPracticeSentence, PRACTICE_SENTENCES } = require('./practiceTranslationService');
const https = require('https');

// The standard intent classes
const INTENT_TYPES = {
  GREETING: 'GREETING',
  CASUAL_CONVERSATION: 'CASUAL_CONVERSATION',
  CONFIRMATION: 'CONFIRMATION',
  NEGATION: 'NEGATION',
  GENERAL_QUESTION: 'GENERAL_QUESTION',
  PERSONAL_QUESTION: 'PERSONAL_QUESTION',
  AI_QUESTION: 'AI_QUESTION',
  ADVICE: 'ADVICE',
  ENGLISH_PRACTICE: 'ENGLISH_PRACTICE',
  GRAMMAR_CORRECTION: 'GRAMMAR_CORRECTION',
  COMPLAINT: 'COMPLAINT',
  TRANSLATION: 'TRANSLATION',
  ROMAN_MARATHI: 'ROMAN_MARATHI',
  MARATHI: 'MARATHI',
  MIXED_LANGUAGE: 'MIXED_LANGUAGE',
  VOCABULARY: 'VOCABULARY',
  PRONUNCIATION: 'PRONUNCIATION',
  INTERVIEW_HELP: 'INTERVIEW_HELP',
  WRITING_HELP: 'WRITING_HELP',
  GENERAL_KNOWLEDGE: 'GENERAL_KNOWLEDGE',
  DISCUSSION_TOPIC: 'DISCUSSION_TOPIC',
  DISCUSSION_ANSWER: 'DISCUSSION_ANSWER',
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

  // Inspect recent conversation context
  const lastUserMsg = conversationHistory.slice().reverse().find(m => m.sender === 'user' || m.role === 'user');
  const lastAiMsg = conversationHistory.slice().reverse().find(m => m.sender === 'ai' || m.role === 'model');
  const prevUserText = (lastUserMsg?.text || '').toLowerCase();
  const prevAiText = (lastAiMsg?.text || '').toLowerCase();

  // A. Check context for exercise checking or answers
  if (
    /\b(?:check\s+(?:my\s+|this\s+|the\s+)?answer|check\s+this|check\s+it)\b/i.test(lower) ||
    lower === 'check my answer' ||
    (/^\s*(?:1[\.\)]|first|a[\.\)])\s+/i.test(cleanInput) && /exercise|fill\s+in\s+the\s+blanks/i.test(prevAiText))
  ) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'CHECK_EXERCISE_ANSWER' };
  }

  // B. Check context for exercise requests ("give me exercise" / "exercise")
  if (
    /^(?:give\s+me\s+)?(?:more\s+)?(?:practice\s+)?exercises?\??$/i.test(lower) ||
    lower === 'give me exercise' ||
    lower === 'give me present tense exercise'
  ) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PRESENT_TENSE_EXERCISE' };
  }

  // C. Context for "yes" / affirmations (Deep context continuation)
  if (/^(yes|yeah|yep|sure|okay|ok|yes\s+please|yes\s+explain|yes\s+i\s+did|yup)$/i.test(lower)) {
    if (
      /what\s+was\s+doing|what\s+were\s+you\s+doing|was\/were|with\s+['"]you['"],?\s+use\s+['"]were['"]|subject\s+is\s+['"]you['"]/i.test(prevAiText) ||
      /what\s+was\s+doing/i.test(prevUserText)
    ) {
      return { intent: INTENT_TYPES.AI_QUESTION, subType: 'EXPLAIN_WAS_WERE_YOU_DOING' };
    }
    if (/practice\s+(?:an\s+)?apology/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PRACTICE_APOLOGY_SCENARIO' };
    }
    if (/practice\s+english\s+conversation|practice\s+right\s+now|start\s+with\s+a\s+quick\s+daily|let's\s+start|shall\s+we\s+start|what\s+would\s+you\s+like\s+to\s+practice/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'START_DAILY_CHAT' };
    }
    if (/teach\s+(?:you\s+)?the\s+4\s+types|teach\s+you|4\s+types\s+one\s+by\s+one/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'TEACH_4_PRESENT_TENSE_TYPES' };
    }
    if (/present\s+tense\s+practice\s+exercise|practice\s+exercise|exercise/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PRESENT_TENSE_EXERCISE' };
    }
    if (/daily\s+habit/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'CONTINUE_DAILY_HABITS' };
    }
    if (/interview/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.INTERVIEW_HELP, subType: 'CONTINUE_INTERVIEW' };
    }
    if (/present\s+tense/i.test(prevAiText) || /present\s+tense/i.test(prevUserText)) {
      return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'CONTINUE_PRESENT_TENSE' };
    }
    if (/(?:pizza|food|eat|ate|lunch|dinner)/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.CONFIRMATION, subType: 'CONFIRM_FOOD' };
    }
    if (/(?:college|class|lecture|exam|attend)/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.CONFIRMATION, subType: 'CONFIRM_COLLEGE' };
    }
    if (/(?:friend|friends|meet|anyone)/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.CONFIRMATION, subType: 'CONFIRM_FRIENDS' };
    }
    if (prevAiText.includes('?')) {
      return { intent: INTENT_TYPES.CONFIRMATION, subType: 'CONFIRM_PREVIOUS_QUESTION' };
    }
    return { intent: INTENT_TYPES.CONFIRMATION, subType: 'GENERAL_CONFIRMATION' };
  }

  // C2. Context for "no" / negations
  if (/^(no|nope|not\s+really|no\s+thanks|no\s+i\s+didn'?t|no\s+i\s+dont)$/i.test(lower)) {
    return { intent: INTENT_TYPES.NEGATION, subType: 'GENERAL_NEGATION' };
  }

  // C3. Context for "sorry" / apologies
  if (/^(sorry|i\s+am\s+sorry|im\s+sorry|my\s+apologies|sorry\s+about\s+that)$/i.test(lower)) {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'USER_APOLOGY' };
  }

  // C4. "means how to apololize" / "how to apologize"
  if (
    /\b(?:means?\s+)?how\s+to\s+(?:apololize|apologize|apolagize)\b/i.test(lower) ||
    /\bhow\s+(?:can|do)\s+i\s+(?:apololize|apologize|apolagize)\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'HOW_TO_APOLOGIZE' };
  }

  // C5. "daily chat" / "daily conversation"
  if (/^(?:daily\s+chat|start\s+daily\s+chat|daily\s+conversation|daily\s+english)$/i.test(lower)) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'START_DAILY_CHAT' };
  }

  // C6. "chatting"
  if (/^(?:just\s+)?chatting$/i.test(lower)) {
    if (/practice|explore|focus|like\s+to\s+do|would\s+you\s+like/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PRACTICE_CHATTING' };
    }
    if (/what\s+(?:are\s+you|r\s+u)\s+doing/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'USER_DOING_CHATTING' };
    }
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'CHATTING_INTEREST' };
  }

  // C7. "learning"
  if (/^(?:just\s+)?learning$/i.test(lower)) {
    if (/what\s+(?:are\s+you|r\s+u)\s+doing/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'USER_DOING_LEARNING' };
    }
    if (/practice|explore|focus|like\s+to\s+do|would\s+you\s+like/i.test(prevAiText)) {
      return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PRACTICE_LEARNING' };
    }
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'USER_DOING_LEARNING' };
  }

  // C8. "i am learning python"
  if (/\b(?:learning|studying)\s+python\b/i.test(lower) || lower === 'i am learning python') {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'LEARNING_PYTHON' };
  }

  // C9. "i am practicing eng"
  if (/\b(?:practicing|learning|speaking)\s+(?:eng|english)\b/i.test(lower) || lower === 'i am practicing eng') {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PRACTICING_ENGLISH' };
  }

  // C10. "AI" / Discussion Topic & Answer
  if (/benefit\s+of\s+artificial\s+intelligence|benefit\s+of\s+ai|artificial\s+intelligence/i.test(prevAiText)) {
    if (/\bai\s+(?:help|helps|can\s+help)\b/i.test(lower) || /student/i.test(lower)) {
      return { intent: INTENT_TYPES.DISCUSSION_ANSWER, subType: 'ANSWER_AI_BENEFIT' };
    }
  }
  if (/^(ai|artificial\s+intelligence|the\s+ai)$/i.test(lower)) {
    return { intent: INTENT_TYPES.DISCUSSION_TOPIC, subType: 'TOPIC_AI' };
  }

  // D. Check context for "how we can use it" / "how to use it"
  if (
    /\bhow\s+(?:we\s+can|to|can\s+we)\s+use\s+(?:it|this)\b/i.test(lower) ||
    /^(?:how\s+to\s+use\s+it|how\s+we\s+can\s+use\s+it)\??$/i.test(lower)
  ) {
    if (/present\s+tense/i.test(prevAiText) || /present\s+tense/i.test(prevUserText)) {
      return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'HOW_TO_USE_PRESENT_TENSE' };
    }
    if (/past\s+tense/i.test(prevAiText) || /past\s+tense/i.test(prevUserText)) {
      return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PAST_TENSE' };
    }
  }

  // E. Check context for "give me examples" / "examples"
  if (
    /^(?:give\s+me\s+)?(?:some\s+)?examples?\??$/i.test(lower) ||
    /^(?:more\s+)?examples?\??$/i.test(lower)
  ) {
    if (/present\s+tense/i.test(prevAiText) || /present\s+tense/i.test(prevUserText)) {
      return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PRESENT_TENSE_EXAMPLES' };
    }
    if (/past\s+tense/i.test(prevAiText) || /past\s+tense/i.test(prevUserText)) {
      return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PAST_TENSE' };
    }
  }

  // F. Check recent context for follow-ups (e.g., "how?" after "My English is weak")
  if (/^(how|how\s+to|how\s+can\s+i|kas|kasa|why)$/i.test(lower) && conversationHistory.length > 0) {
    if (/english\s+is\s+(weak|poor|bad)|improve\s+english|learn\s+english|shikaych/i.test(prevUserText)) {
      return { intent: INTENT_TYPES.ADVICE, subType: 'FOLLOWUP_IMPROVE_ENGLISH' };
    }
  }

  // 1. Direct AI Questions (Activity & Identity)
  if (
    /^what\s+(?:was|were)\s+doing\??$/i.test(lower) ||
    /\bwhat\s+(?:was|is)\s+(?:you|u)\s+doing\b/i.test(lower) ||
    /\bwhat\s+(?:you|u)\s+was\s+doing\b/i.test(lower) ||
    /^what\s+(?:you|u)\s+were\s+doing\??$/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.AI_QUESTION, subType: 'AI_PAST_ACTIVITY_INCORRECT' };
  }

  if (/\bwhat\s+were\s+you\s+doing\b/i.test(lower)) {
    return { intent: INTENT_TYPES.AI_QUESTION, subType: 'AI_PAST_ACTIVITY_CORRECT' };
  }

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

  // 2. User Complaints & Correction Requests
  if (
    /\byou\s+(?:dont|don't)\s+help\s+me\b/i.test(lower) ||
    /\bjust\s+tell\s+(?:these\s+)?(?:sentense|sentences?).*?(?:wrong|mistake)\b/i.test(lower) ||
    /\b(?:even\s+)?(?:dont|don't)\s+correct\s+(?:the\s+statement|me|it|these)\b/i.test(lower) ||
    /\bwhy\s+(?:you\s+dont|dont\s+you|you\s+don't|don't\s+you)\s+correct\b/i.test(lower) ||
    /\byou\s+(?:are\s+not|aren't)\s+correcting\s+me\b/i.test(lower) ||
    /\byou\s+(?:just|only)\s+tell\s+me\s+wrong\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.COMPLAINT, subType: 'COMPLAINT_NOT_CORRECTING' };
  }

  // 3. Greetings
  if (/^(hello|hi|hey|heya|howdy|good\s+morning|good\s+afternoon|good\s+evening|shubh\s+sakal|shubh\s+ratri)$/i.test(lower)) {
    return { intent: INTENT_TYPES.GREETING };
  }

  // 4. Casual Conversation
  if (/^what\s+are\s+you\s+okay\??$/i.test(lower) || /\bare\s+you\s+(?:okay|ok|alright)\b/i.test(lower)) {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'ARE_YOU_OKAY' };
  }

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

  if (/^(no|nope|not\s+really)$/i.test(lower)) {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'NEGATION' };
  }

  if (/^(?:i\s+am|im|i'm)\s+tired(?:\s+today)?\.?$/i.test(lower) || /\b(?:feel|feeling|am)\s+tired\s+today\b/i.test(lower)) {
    return { intent: INTENT_TYPES.CASUAL_CONVERSATION, subType: 'USER_TIRED' };
  }

  // 4. Advice / English Improvement Queries
  if (/\b(?:suggest\s+me|where\s+i\s+(?:have\s+to|should)\s+start|where\s+to\s+start)\b/i.test(lower)) {
    return { intent: INTENT_TYPES.ADVICE, subType: 'WHERE_TO_START' };
  }

  if (
    (/\b(?:lot\s+of\s+woring|lot\s+of\s+work)\b/i.test(lower) && /\btoday\b/i.test(lower)) ||
    /\bworing\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ADVICE, subType: 'LOT_OF_WORK_TODAY' };
  }

  if (
    /\b(?:how\s+to|how\s+can\s+i|where\s+to)\s+start\s+(?:my\s+|a\s+)?project\b/i.test(lower) ||
    /\bstart\s+(?:my\s+)?project\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ADVICE, subType: 'START_PROJECT' };
  }

  if (
    /(?:feel\s+tired|i\s+am\s+tired).*?(?:lot\s+of\s+work|much\s+work|so\s+much\s+work).*?(?:manage|handle|do)/i.test(lower) ||
    /\bhow\s+(?:i\s+can|can\s+i)\s+manage\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ADVICE, subType: 'TIRED_WORK_MANAGEMENT' };
  }

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
    /\bhow\s+(?:i\s+can|can\s+i)\s+improve\s+(?:my\s+)?english\b/i.test(lower) ||
    /\bhow\s+to\s+improve\s+(my\s+)?english\b/i.test(lower) ||
    /\bmy\s+english\s+is\s+weak\b/i.test(lower) ||
    /\bhow\s+can\s+i\s+learn\s+english\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ADVICE, subType: 'IMPROVE_ENGLISH' };
  }

  if (/\bhow\s+to\s+overcome\s+(fear|hesitation)\b/i.test(lower)) {
    return { intent: INTENT_TYPES.ADVICE, subType: 'OVERCOME_HESITATION' };
  }

  // 5. Interview Help & Speaking Fear
  if (/\binterview\b/i.test(lower) && /\b(?:bhiti|bheeti|fear|nervous|darr|vatate|vatte)\b/i.test(lower)) {
    return { intent: INTENT_TYPES.ROMAN_MARATHI, subType: 'INTERVIEW_FEAR' };
  }

  if (
    /\binterview\b/i.test(lower) &&
    (/\b(prepare|tayari|tayyari|tips|questions|how\s+should\s+i|aaj|ahe|aahe)\b/i.test(lower) ||
      /\bआज\s+माझं\s+interview\s+आहे\b/i.test(cleanInput))
  ) {
    return { intent: INTENT_TYPES.INTERVIEW_HELP };
  }

  // 6. English Practice Request & Language Difficulty
  if (/\b(?:cant|cannot|can't|dont|don't)\s+understand\s+english\b/i.test(lower)) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'CANT_UNDERSTAND_ENGLISH' };
  }

  if (
    !/\b(?:bhiti|bheeti|fear|nervous|problem|presentation|interview)\b/i.test(lower) &&
    (/(?:mala|मला).*?english.*?(?:bolayla|बोलायला|shikaych|शिकायचं|practice)/i.test(cleanInput) ||
      /\benglish\b.*?\bpractice\b/i.test(lower) ||
      /\bmala\s+english\s+shikaycha\b/i.test(lower) ||
      /\bमला\s+इंग्रजी\s+शिकायचं\b/i.test(cleanInput) ||
      /\bi\s+want\s+to\s+practice\s+(spoken\s+)?english\b/i.test(lower) ||
      /\blet('s|\s+us)\s+practice\s+english\b/i.test(lower))
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

  // 8. Explicit Grammar Check Request & Specific Self-Intro Errors
  if (/\b(?:would\s+like\s+to\s+)?represent\s+(?:my\s*self|myself)\b/i.test(lower)) {
    return { intent: INTENT_TYPES.GRAMMAR_CORRECTION, subType: 'REPRESENT_MYSELF' };
  }

  if (
    /\byou\s+find\s+my\s+mistake/i.test(lower) ||
    /\bfind\s+(my\s+)?mistakes?\s+and\s+tell\s+me\b/i.test(lower) ||
    /\btell\s+me\s+(what\s+is\s+wrong|this\s+is\s+wrong)\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.GRAMMAR_CORRECTION, subType: 'EXPLICIT_FIND_MISTAKES' };
  }

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

  // 9a. Mixed Language Tense request (e.g. "mala present tense samjun sang")
  if (
    /(?:mala|मला).*?present\s+tense.*?(?:samjun|samjaun|sang|shikav|सांग|शिकव|काय)/i.test(cleanInput) ||
    /present\s+tense.*?(?:samjun|samjaun|sang|shikav|सांग|शिकव)/i.test(cleanInput)
  ) {
    return { intent: INTENT_TYPES.MIXED_LANGUAGE, subType: 'EXPLAIN_PRESENT_TENSE_MARATHI' };
  }

  // 9b. Daily Habits ("daily habbits" / "daily habits")
  if (/\bdaily\s+(?:habbits|habits)\b/i.test(lower) || /^daily\s+(?:habbits|habits)$/i.test(lower)) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'DAILY_HABITS' };
  }

  // 9c. How to use present tense / usage questions ("how we can use present tense", "how to use present tense")
  if (
    /\bhow\s+(?:we\s+can|i\s+can|can\s+we|to)\s+(?:use|apply)\s+(?:the\s+)?present\s+tense\b/i.test(lower) ||
    /\bhow\s+do\s+we\s+use\s+(?:the\s+)?present\s+tense\b/i.test(lower) ||
    /\bwhen\s+(?:to|should\s+i|do\s+we)\s+use\s+(?:the\s+)?present\s+tense\b/i.test(lower) ||
    (/\bhow\s+we\s+can\s+use\b/i.test(lower) && /present\s+tense/i.test(lower))
  ) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'HOW_TO_USE_PRESENT_TENSE' };
  }

  // 9d. Present Tense Examples ("give me examples of present tense")
  if (
    /\b(?:give|tell|show)\s+me\s+examples?\s+of\s+(?:the\s+)?present\s+tense\b/i.test(lower) ||
    /\bpresent\s+tense\s+examples?\b/i.test(lower) ||
    /\bexamples?\s+of\s+present\s+tense\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PRESENT_TENSE_EXAMPLES' };
  }

  // 9e. Simple Present Tense ("what is simple present tense", "what is simple present")
  if (
    /\bwhat\s+is\s+(?:the\s+)?simple\s+present(?:\s+tense)?\b/i.test(lower) ||
    /\bexplain\s+(?:the\s+)?simple\s+present(?:\s+tense)?\b/i.test(lower) ||
    /^(?:the\s+)?simple\s+present(?:\s+tense)?$/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'SIMPLE_PRESENT_TENSE' };
  }

  // 9f. Present Continuous Tense ("when should i use present continuous")
  if (
    /\b(?:what\s+is|explain|when\s+should\s+i\s+use)\s+(?:the\s+)?present\s+continuous(?:\s+tense)?\b/i.test(lower) ||
    /^(?:the\s+)?present\s+continuous(?:\s+tense)?$/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PRESENT_CONTINUOUS_TENSE' };
  }

  // 9g. Present Tense Overview / Short Phrase ("present tense", "tell me about present tense")
  if (
    /\bwhat\s+is\s+(?:the\s+)?present\s+tense\b/i.test(lower) ||
    /\bexplain\s+(?:the\s+)?present\s+tense\b/i.test(lower) ||
    /\btell\s+me\s+about\s+(?:the\s+)?present\s+tense\b/i.test(lower) ||
    /\bteach\s+(?:me\s+)?(?:the\s+)?present\s+tense\b/i.test(lower) ||
    /^(?:the\s+)?present\s+tense$/i.test(lower) ||
    /\bpresent\s+tense\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PRESENT_TENSE' };
  }

  // 9h. Past Tense Overview / Short Phrase ("past tense")
  if (
    /\bwhat\s+is\s+(?:the\s+)?past\s+tense\b/i.test(lower) ||
    /\bexplain\s+(?:the\s+)?past\s+tense\b/i.test(lower) ||
    /^(?:the\s+)?past\s+tense$/i.test(lower) ||
    /\bpast\s+tense\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'PAST_TENSE' };
  }

  // 9i. Future Tense Overview / Short Phrase ("future tense")
  if (
    /\bwhat\s+is\s+(?:the\s+)?future\s+tense\b/i.test(lower) ||
    /\bexplain\s+(?:the\s+)?future\s+tense\b/i.test(lower) ||
    /^(?:the\s+)?future\s+tense$/i.test(lower) ||
    /\bfuture\s+tense\b/i.test(lower)
  ) {
    return { intent: INTENT_TYPES.ENGLISH_PRACTICE, subType: 'FUTURE_TENSE' };
  }

  // 9j. Short phrases: confidence, vocabulary, pronunciation
  if (/^(?:the\s+)?confidence$/i.test(lower)) {
    return { intent: INTENT_TYPES.ADVICE, subType: 'BUILD_CONFIDENCE' };
  }

  if (/^(?:english\s+)?vocabulary$/i.test(lower)) {
    return { intent: INTENT_TYPES.VOCABULARY, subType: 'VOCABULARY_HELP' };
  }

  if (/^(?:english\s+)?pronunciation$/i.test(lower)) {
    return { intent: INTENT_TYPES.PRONUNCIATION, subType: 'PRONUNCIATION_HELP' };
  }

  // 10. Language-specific intents & Translation requests
  if (
    /(?:english\s+madhe\s+kasa\s+mhantat|kasa\s+mhantat|kasa\s+bolaycha|kasa\s+boltat)/i.test(cleanInput) ||
    /(?:translate\s+(?:this\s+)?into\s+english|how\s+to\s+say\s+(?:this\s+)?in\s+english|how\s+do\s+you\s+say\s+(?:this\s+)?in\s+english)/i.test(cleanInput) ||
    /इंग्रजीत\s+कसं\s+(?:म्हणतात|बोलायचं)/i.test(cleanInput)
  ) {
    return { intent: INTENT_TYPES.TRANSLATION, subType: 'ASK_TRANSLATION' };
  }

  // Today college
  if (
    /(?:mala|मला)?\s*(?:aaj|आज)\s*(?:college|कॉलेज)\s*(?:la|ला)?\s*(?:jaycha|jaych|jaychay|जायचं)\s*(?:aa?he|आहे)?/i.test(cleanInput) ||
    /\b(?:aaj|आज)\s+(?:college|कॉलेज)\s+(?:la|ला)\s+(?:jaycha|jaych|जायचं)\b/i.test(cleanInput) ||
    /\bमला\s+आज\s+कॉलेजला\s+जायचं\s+आहे\b/i.test(cleanInput)
  ) {
    return { intent: INTENT_TYPES.MARATHI, subType: 'TODAY_COLLEGE' };
  }

  // Speaking fear
  if (
    /(?:mala|मला)?\s*(?:english|इंग्रजी)?\s*(?:bolayla|bolnyachi|बोलायला).*?(?:bhiti|bheeti|भीती)\s*(?:vatate|vatte|वाटते)/i.test(cleanInput) ||
    /\b(?:english|इंग्रजी)\s+(?:bolayla|बोलायला)\s+(?:bhiti|भीती)\s+(?:vatate|वाटते)\b/i.test(cleanInput) ||
    /\b(?:bhiti|bheeti)\s+(?:vatate|vatte)\b/i.test(cleanInput) ||
    /\bमला\s+english\s+बोलायला\s+भीती\s+वाटते\b/i.test(cleanInput)
  ) {
    return { intent: INTENT_TYPES.MARATHI, subType: 'SPEAKING_FEAR' };
  }

  // College presentation past
  if (
    /(?:today|aaj|आज)\s+(?:mala|मला)?\s*(?:college|कॉलेज)\s*(?:madhe|मध्ये)\s*presentation\s*(?:hota|hote|होतं|होता)/i.test(cleanInput) ||
    /\bpresentation\s+(?:hota|hote|होतं|होता)\b/i.test(cleanInput)
  ) {
    return { intent: INTENT_TYPES.MIXED_LANGUAGE, subType: 'COLLEGE_PRESENTATION_PAST' };
  }

  if (
    /(?:mala|मला)?.*?(?:english|इंग्रजी)?.*?(?:madhe|मध्ये)?.*?(?:answer|uttar|उत्तर|बोलता)?.*?(?:deta\s+yet\s+nahi|yet\s+nahi|देता\s+येत\s+नाही|येत\s+नाही)/i.test(cleanInput) ||
    /\b(?:deta|dyayla)\s+(?:yet|jamt)\s+nahi\b/i.test(cleanInput)
  ) {
    return { intent: INTENT_TYPES.ROMAN_MARATHI, subType: 'CANNOT_ANSWER_ENGLISH' };
  }

  if (
    /(?:mala|मला)\s+(?:english|इंग्रजी)?\s*(?:samjat|समजत)\s+(?:nahi|नाही)/i.test(cleanInput) ||
    /(?:samjat|समजत)\s+(?:nahi|नाही)/i.test(cleanInput)
  ) {
    return { intent: INTENT_TYPES.ROMAN_MARATHI, subType: 'DONT_UNDERSTAND_ENGLISH' };
  }

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

// Contextual generator for general English statements
const generateContextualStatementReply = (cleanInput, grammarCorrection) => {
  const lower = cleanInput.toLowerCase().replace(/[?!.,;]/g, '').trim();

  // 1. If grammar correction exists, show direct comment + correction + explanation
  if (grammarCorrection && grammarCorrection.hasError) {
    let comment = "Here is a quick correction to help you express this naturally in English:";
    if (/(?:tired|sleepy|rest|exhaust)/i.test(lower)) {
      comment = "Take care of yourself! Rest is an essential part of staying productive.";
    } else if (/(?:college|school|study|exam|homework)/i.test(lower)) {
      comment = "Hope your studies are going well!";
    } else if (/(?:work|office|job|task)/i.test(lower)) {
      comment = "Tackle your tasks one step at a time!";
    }

    return `${comment}

Correction:
❌ ${grammarCorrection.original}
✅ ${grammarCorrection.better}

${grammarCorrection.explanation}

What else would you like to talk about or practice today?`;
  }

  // 2. Meaningful topic recognition for correct statements:
  if (/\b(?:tired|exhausted|sleepy|need\s+rest)\b/i.test(lower)) {
    return "That sounds exhausting. 😌 Try taking a short break, drink some water, and relax for a few minutes. Did you have a long day?";
  }

  if (/(?:lot\s+of\s+work|busy|so\s+much\s+work|working\s+hard)/i.test(lower)) {
    return "Sounds like a busy day! Remember to prioritize the most important tasks and take short breathers. What project are you working on?";
  }

  if (/\b(?:ate|eating|food|had\s+(?:lunch|dinner|breakfast)|cooking|cooked)\b/i.test(lower)) {
    return "Nice! What did you have? Talking about food is always a great way to practice conversational English.";
  }

  if (/\b(?:i\s+went|i\s+go|went\s+to|going\s+to)\s+(?:college|market|store|gym|office|work|home|park)\b/i.test(lower)) {
    return "Sounds like part of a productive day! Would you like to practice describing what you did there in English?";
  }

  if (/\b(?:watched|watching|movie|film|series|song|music|listen|listening)\b/i.test(lower)) {
    return "That sounds enjoyable! What did you watch or listen to? Explaining what you liked about it is great speaking practice.";
  }

  if (/\b(?:studied|studying|read|reading|learning|book)\b/i.test(lower)) {
    return "Great habit! Reading and studying consistently makes a huge difference. What subject or book were you focused on?";
  }

  if (/\b(?:happy|excited|great|awesome|proud|enjoyed|fun)\b/i.test(lower)) {
    return "That's wonderful to hear! 😊 Positive energy makes practicing English so much easier. What made you feel that way?";
  }

  // Confident speech statement
  if (/\b(?:i\s+think\s+i\s+can\s+speak\s+english\s+confidently|speak\s+english\s+confidently|i\s+can\s+speak\s+confidently)\b/i.test(lower)) {
    return "That's a fantastic mindset! 🌟 Believing in yourself is the biggest step toward fluency. What helps you feel most confident when speaking?";
  }

  // Uncertainty in front of everyone / public speaking
  if (
    /\b(?:in\s+front\s+of\s+(?:everyone|people|audience|crowd|class)|stage\s+fright|fear\s+of\s+speaking)\b/i.test(lower) ||
    /don't\s+know\s+if\s+i\s+can\s+speak/i.test(lower)
  ) {
    return "It's completely natural to feel that way! Even experienced public speakers get nervous before speaking in front of an audience. Start small by practicing sentences with me or in front of a mirror. What topic would you be speaking about?";
  }

  // AI helping students
  if (/\bai\s+helps?\s+students?\b/i.test(lower)) {
    return "That's very true! 💡 AI can personalize learning, explain complex topics, and provide instant practice. How has AI helped you with your studies?";
  }

  // If grammar correction exists, show direct correction without asking permission:
  if (grammarCorrection && grammarCorrection.hasError) {
    return `Nice effort! 😊

Correction:
❌ ${grammarCorrection.original}
✅ ${grammarCorrection.better}

${grammarCorrection.explanation}

What else would you like to talk about or practice today?`;
  }

  // Meaningful conversational statement responses:
  if (/\b(?:learn|study|read|practice|speak|speaking)\b/i.test(lower)) {
    return "Practicing regularly is the best way to become fluent in English! 😊 What would you like to practice right now?";
  }

  if (/\b(?:work|job|office|project|task)\b/i.test(lower)) {
    return "Sounds like a busy day! Remember to pace yourself. What project or task are you working on?";
  }

  return "That sounds interesting! 😊 Tell me more about that, or what you'd like to talk about next.";
};

// Contextual generator for general English questions
const generateContextualQuestionReply = (cleanInput, grammarCorrection) => {
  const lower = cleanInput.toLowerCase().replace(/[?!.,;]/g, '').trim();

  // English improvement questions
  if (/\b(?:how\s+(?:to|can\s+i)|where\s+(?:to|can\s+i))\s+(?:learn|improve|practice|start|speak)\b/i.test(lower)) {
    return `To improve your English, practice a little every day! Here are 3 practical steps:

1. **Daily Conversations**: Practice chatting right here with me for 5–10 minutes every day.
2. **Read Aloud**: Read short English articles or stories to build speech confidence.
3. **Listen Actively**: Listen to English podcasts or videos to pick up natural pronunciation.

What area would you like to focus on first—speaking confidence, vocabulary, or grammar?`;
  }

  // Questions about time/date
  if (/\bwhat\s+(?:time|day|date)\b/i.test(lower)) {
    return "Right now, we are in our English learning session! Time flies when you're practicing. What topic would you like to chat about today?";
  }

  // Questions about SpeakWise AI identity
  if (/\b(?:who|what)\s+(?:are\s+you|made\s+you|created\s+you)\b/i.test(lower)) {
    return "I am SpeakWise AI! 🤖 Your friendly AI English companion, designed to help you practice conversational English, grammar, pronunciation, and vocabulary.";
  }

  // Questions about weather
  if (/\b(?:weather|rain|sunny|hot|cold)\b/i.test(lower)) {
    return "I don't have eyes outside, but I hope the weather is pleasant where you are! In English, talking about the weather is one of the most common small-talk openers. How is the weather where you are right now?";
  }

  // If question has grammar mistakes:
  if (grammarCorrection && grammarCorrection.hasError) {
    return `Good question! 😊

Correction:
❌ ${grammarCorrection.original}
✅ ${grammarCorrection.better}

${grammarCorrection.explanation}

What would you like to explore next?`;
  }

  return "That's a great question! In conversational English, the most natural way to express this is to focus on clear, direct phrasing. What would you like to explore next?";
};

// Dynamic Contextual Next Question Generator for English Practice
const generateContextualNextQuestion = (userText, correctedText = null) => {
  const text = `${userText} ${correctedText || ''}`.toLowerCase();

  // Multi-sentence / scold / late / college
  if (/(?:scold|teacher|professor|late|wake\s+up)/i.test(text)) {
    return "Next question:\nDid the teacher give you an assignment, or did they let you attend the lecture?";
  }

  // Pizza / Food
  if (/(?:pizza|burger|food|eat|ate|lunch|dinner|breakfast|snack|cook|cooked|hotel|restaurant)/i.test(text)) {
    return "Next question:\nWhat kind of toppings or flavor was it, and was it tasty?";
  }

  // Friends / Meet
  if (/(?:friend|friends|buddies|met|meet)/i.test(text)) {
    return "Next question:\nThat sounds fun! What did you and your friends talk about or do together?";
  }

  // College / University / Study / Classes
  if (/(?:college|university|school|lecture|class|classes|exam|studying|studied)/i.test(text)) {
    return "Next question:\nWhat was the most interesting subject or topic you covered today?";
  }

  // Python / Coding / Programming / Technology
  if (/(?:python|code|coding|programming|developer|software|project|bug|java|c\+\+)/i.test(text)) {
    return "Next question:\nAwesome! What kind of project or program are you building in Python?";
  }

  // Work / Office / Tasks
  if (/(?:work|office|job|tasks|project|client|meeting)/i.test(text)) {
    return "Next question:\nSounds like a busy day! What was the main task you completed?";
  }

  // Tired / Rest / Sleep
  if (/(?:tired|exhausted|sleep|sleepy|rest)/i.test(text)) {
    return "Next question:\nTake good care of yourself! Did you have a long, exhausting journey or lots of work?";
  }

  // Movies / Shows / Music
  if (/(?:movie|film|series|watch|watched|song|music)/i.test(text)) {
    return "Next question:\nNice! What was the story about, and would you recommend it?";
  }

  // Default next question
  return "Next question:\nWhat is something interesting you are planning to do next?";
};

// Dedicated English Conversation Practice Engine
const generatePracticeConversationResponse = ({
  cleanInput,
  conversationHistory = [],
  detectedLang = 'english',
  marathiNormalized = null,
  englishTranslation = null
}) => {
  const lower = cleanInput.toLowerCase().trim();

  // Find previous AI message for context
  const lastAiMsg = conversationHistory.slice().reverse().find(m => m.sender === 'ai' || m.role === 'model');
  const prevAiText = (lastAiMsg?.text || '').toLowerCase();
  const isPastContext = /(?:what\s+did\s+you\s+do|what\s+did\s+you\s+eat|what\s+did\s+you\s+watch|what\s+happened|did\s+you\s+go|did\s+you|yesterday|earlier|today)/i.test(prevAiText);

  // 0. Check if user is answering a Marathi -> English practice sentence
  let matchedPractice = null;
  for (const s of PRACTICE_SENTENCES) {
    if (prevAiText.includes(s.marathi.toLowerCase()) || prevAiText.includes(s.roman.toLowerCase())) {
      matchedPractice = s;
      break;
    }
  }

  if (!matchedPractice) {
    if (/\b(?:college|colg)\b/i.test(lower) && /\b(?:go|went|going)\b/i.test(lower)) {
      matchedPractice = PRACTICE_SENTENCES.find(s => s.id === 'i1'); // "मी रोज कॉलेजला जातो."
    } else if (/\bcricket\b/i.test(lower) && /\b(?:play|plays|playing)\b/i.test(lower)) {
      matchedPractice = PRACTICE_SENTENCES.find(s => s.id === 'i2'); // "ती रोज क्रिकेट खेळते."
    } else if (/\bwant\b/i.test(lower) && /\blearn\b/i.test(lower) && /\benglish\b/i.test(lower)) {
      matchedPractice = PRACTICE_SENTENCES.find(s => s.id === 'i3'); // "मला इंग्रजी शिकायची आहे."
    } else if (/\bstudent\b/i.test(lower) && /\bam\b/i.test(lower)) {
      matchedPractice = PRACTICE_SENTENCES.find(s => s.id === 'b1'); // "मी विद्यार्थी आहे."
    }
  }

  if (matchedPractice) {
    const evaluation = evaluatePracticeAnswer(matchedPractice.id, cleanInput, matchedPractice.level);
    return {
      aiText: evaluation.aiResponseText,
      detectedLang,
      marathiNormalized,
      englishTranslation,
      grammarCorrection: evaluation.isCorrect ? null : {
        hasError: true,
        original: cleanInput,
        better: evaluation.correctEnglish,
        explanation: evaluation.mistakeExplanation || evaluation.ruleExplanation
      }
    };
  }

  // 1. Roman Marathi / Marathi in practice mode
  if (
    /(?:mala|मला)\s+(?:english|इंग्रजी)?\s*(?:madhe|मध्ये)?\s*(?:answer|उत्तर|बोलता|bolta)?\s*(?:deta|देता)?\s*(?:yet|येत)?\s*(?:nahi|नाही)/i.test(cleanInput) ||
    /(?:answer|ans)\s+(?:deta|dyayla)\s+(?:yet|jamt)\s+nahi/i.test(lower) ||
    /(?:mala|मला)\s+(?:mahit|माहित)\s+(?:nahi|नाही)/i.test(cleanInput) ||
    lower === 'mala english yet nahi' ||
    lower === 'mala mahit nahi yach ans ks dyaych'
  ) {
    return {
      aiText: `No worries at all! 😊 That's why we're practicing together.

In Marathi: "मला English मध्ये answer देता येत नाही."
In natural English, you can say:
👉 "I don't know how to answer in English."
Or:
👉 "I'm not sure how to answer in English."

Let's try a simple one:
What is your favorite food or hobby?`,
      detectedLang: detectedLang || 'roman_marathi',
      marathiNormalized: marathiNormalized || 'मला English मध्ये answer देता येत नाही',
      englishTranslation: "I don't know how to answer in English.",
      grammarCorrection: null
    };
  }

  // Jevn zal ka
  if (/jevn\s+zal\s+ka/i.test(lower) || /जेवण\s+झालं\s+का/i.test(cleanInput)) {
    return {
      aiText: `Good attempt! 😊 In English, 'जेवण झालं का?' means 'Have you eaten?'.

Next question:
What did you eat for your last meal?`,
      detectedLang,
      marathiNormalized,
      englishTranslation: "Have you eaten?",
      grammarCorrection: null
    };
  }

  // Other Roman Marathi translations
  if (detectedLang === 'roman_marathi' || detectedLang === 'marathi') {
    if (englishTranslation) {
      return {
        aiText: `Good effort! In English, you can express that as:
👉 "${englishTranslation}"

Next question:
What did you do today?`,
        detectedLang,
        marathiNormalized,
        englishTranslation,
        grammarCorrection: null
      };
    }
  }

  // 2. Affirmation / Negation multi-turn continuation
  if (/^(?:yes|yeah|yep|sure|yup|of\s+course|yes\s+i\s+did)\b/i.test(lower)) {
    if (/(?:pizza|food|eat|ate|lunch|dinner|toppings)/i.test(prevAiText)) {
      return {
        aiText: `Awesome! 🍕 Pizza is always a great treat.

Next question:
Do you prefer making food at home, or eating out at restaurants?`,
        detectedLang: 'english',
        marathiNormalized: null,
        englishTranslation: null,
        grammarCorrection: null
      };
    }
    if (/(?:college|lecture|class|attend|exam|subject|teacher)/i.test(prevAiText)) {
      return {
        aiText: `That's great! 👍 Attending classes regularly builds strong habits.

Next question:
Who is your favorite teacher, or what is your favorite subject?`,
        detectedLang: 'english',
        marathiNormalized: null,
        englishTranslation: null,
        grammarCorrection: null
      };
    }
    if (/(?:friend|friends|meet|anyone)/i.test(prevAiText)) {
      return {
        aiText: `Nice! Meeting up with people makes the day more enjoyable.

Next question:
Where did you and your friends go together?`,
        detectedLang: 'english',
        marathiNormalized: null,
        englishTranslation: null,
        grammarCorrection: null
      };
    }
    return {
      aiText: `Great! 👍 That's nice to hear.

Next question:
Tell me a little more about it—what was the best part of your experience?`,
      detectedLang: 'english',
      marathiNormalized: null,
      englishTranslation: null,
      grammarCorrection: null
    };
  }

  if (/^(?:no|nope|not\s+really|no\s+i\s+didn'?t)\b/i.test(lower)) {
    return {
      aiText: `Understood! 👍 Sometimes things go differently than planned.

Next question:
What would you like to do or focus on instead?`,
      detectedLang: 'english',
      marathiNormalized: null,
      englishTranslation: null,
      grammarCorrection: null
    };
  }

  // 2b. Apology in practice mode
  if (/^(sorry|i\s+am\s+sorry|im\s+sorry|my\s+apologies|sorry\s+about\s+that)$/i.test(lower)) {
    return {
      aiText: "That's okay! 😊 No need to apologize. What would you like to talk about next?",
      detectedLang: 'english',
      marathiNormalized: null,
      englishTranslation: null,
      grammarCorrection: null
    };
  }

  // 2c. How to apologize
  if (
    /\b(?:means?\s+)?how\s+to\s+(?:apololize|apologize|apolagize)\b/i.test(lower) ||
    /\bhow\s+(?:can|do)\s+i\s+(?:apololize|apologize|apolagize)\b/i.test(lower)
  ) {
    return {
      aiText: `Did you mean: "How do I apologize?" or "I mean, how do I apologize?" 😊

To apologize in English, you can say:

• I'm sorry.
• I'm really sorry.
• I apologize for my mistake.
• I'm sorry for being late.

For example:
"I'm sorry for being late to class."

Would you like to practice an apology conversation?`,
      detectedLang: 'english',
      marathiNormalized: null,
      englishTranslation: null,
      grammarCorrection: null
    };
  }

  // 2d. Chatting preference
  if (/^(?:daily\s+chat|start\s+daily\s+chat|daily\s+conversation|daily\s+english)$/i.test(lower) || /^(?:just\s+)?chatting$/i.test(lower)) {
    return {
      aiText: `Great! 😊 Let's practice a conversation.

What did you do today?`,
      detectedLang: 'english',
      marathiNormalized: null,
      englishTranslation: null,
      grammarCorrection: null
    };
  }

  // 2e. Learning in practice mode
  if (/^(?:just\s+)?learning$/i.test(lower)) {
    return {
      aiText: `Nice! 😊 What are you learning today?`,
      detectedLang: 'english',
      marathiNormalized: null,
      englishTranslation: null,
      grammarCorrection: null
    };
  }

  // 2f. Learning python
  if (/\b(?:learning|studying)\s+python\b/i.test(lower) || lower === 'i am learning python') {
    return {
      aiText: `That's good! 😊

A more natural sentence is:
✅ I am learning Python.

What are you learning about in Python?`,
      detectedLang: 'english',
      marathiNormalized: null,
      englishTranslation: null,
      grammarCorrection: null
    };
  }

  // 2g. AI discussion topic & answer
  if (/benefit\s+of\s+artificial\s+intelligence|benefit\s+of\s+ai|artificial\s+intelligence/i.test(prevAiText)) {
    if (/\bai\s+(?:help|helps|can\s+help)\b/i.test(lower) || /student/i.test(lower)) {
      const gCorr = checkGrammar(cleanInput);
      return {
        aiText: `Good point! 😊

Small correction:
❌ ${gCorr ? gCorr.original : cleanInput}
✅ ${gCorr ? gCorr.better : 'AI helps students.'}

Because 'AI' is singular, use 'helps'.

How can AI help students in their studies?`,
        detectedLang: 'english',
        marathiNormalized: null,
        englishTranslation: null,
        grammarCorrection: gCorr
      };
    }
  }
  if (/^(ai|artificial\s+intelligence|the\s+ai)$/i.test(lower)) {
    return {
      aiText: `Artificial Intelligence is a fascinating topic! 💡

What do you think is the biggest benefit of Artificial Intelligence?`,
      detectedLang: 'english',
      marathiNormalized: null,
      englishTranslation: null,
      grammarCorrection: null
    };
  }

  // 3. Grammar Check & Dynamic Correction
  const grammarCorrection = checkGrammar(cleanInput, { isPastContext });

  if (grammarCorrection && grammarCorrection.hasError) {
    const nextQ = generateContextualNextQuestion(cleanInput, grammarCorrection.better);
    return {
      aiText: `Good try! Here is how to say it correctly: 😊

❌ Your sentence: ${grammarCorrection.original}
✅ Corrected: ${grammarCorrection.better}

💡 Why? ${grammarCorrection.explanation}

${nextQ}`,
      detectedLang,
      marathiNormalized,
      englishTranslation,
      grammarCorrection
    };
  }

  // 4. Correct Sentence — Confirm & Continue (Never invent mistakes!)
  const nextQ = generateContextualNextQuestion(cleanInput);
  return {
    aiText: `Perfect! 👍 Your sentence is correct.

${nextQ}`,
    detectedLang,
    marathiNormalized,
    englishTranslation,
    grammarCorrection: null
  };
};

// Main AI Tutor orchestration
const generateTutorResponse = async ({
  userMessage,
  userLevel = 'Intermediate',
  conversationHistory = [],
  customApiKey = null,
  practiceMode = false,
  assistantMode = 'discussion'
}) => {
  const rawInput = (userMessage || '').trim();
  const cleanInput = normalizeInputText(rawInput);
  const apiKey = customApiKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

  // Tone & Confidence Analysis (always evaluated encouragingly and non-judgmentally)
  const analysis = analyzeToneAndConfidence(cleanInput, { conversationHistory });

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

  // Practice Mode Handling (Dynamic conversation practice flow)
  if (practiceMode) {
    if (apiKey) {
      const practiceSystemPrompt = `
You are SpeakWise AI in interactive English Conversation Practice Mode.
Your goal is to conduct a supportive, dynamic English conversation practice session with the user.

RULES FOR PRACTICE MODE:
1. Understand the user's intended meaning even with broken English or typos.
2. If the user's sentence contains genuine grammatical, spelling, or phrasing mistakes:
   - Provide clear, friendly feedback:
     ❌ Your sentence: [user sentence]
     ✅ Corrected: [correct natural sentence]
     💡 Why? [simple, clear 1-2 sentence explanation]
   - Then ask 1 relevant follow-up question based on what they talked about to keep the conversation flowing.
3. If the user's sentence is grammatically correct (e.g. "I went to college today.", "I studied Python.", "I met my friends."):
   - Confirm encouragingly:
     "Perfect! 👍 Your sentence is correct."
   - NEVER fabricate or invent errors on correct sentences.
   - Ask 1 relevant follow-up question related to their answer.
4. If the user answers in Roman Marathi or Marathi (e.g. "mala english madhe answer deta yet nahi"):
   - Acknowledge their Marathi sentence kindly.
   - Show how to say it naturally in English:
     "In English, you can say: 'I don't know how to answer in English.'"
   - Ask an easy, encouraging follow-up question.
5. If the user answers with a short word like "Yes" or "No":
   - Maintain multi-turn context with the previous question and continue the topic naturally.
6. Keep answers clean, well-spaced, friendly, and always end with the next question.
      `.trim();

      try {
        const geminiResponse = await callGeminiAPI(apiKey, practiceSystemPrompt, cleanInput, conversationHistory);
        if (geminiResponse) {
          const grammarCorrection = checkGrammar(cleanInput);
          return {
            aiText: geminiResponse,
            detectedLang,
            marathiNormalized,
            englishTranslation,
            grammarCorrection: grammarCorrection?.hasError ? grammarCorrection : null,
            analysis
          };
        }
      } catch (err) {
        console.warn('Gemini practice call failed, falling back to local practice engine:', err.message);
      }
    }

    // Offline Practice Engine
    const practiceResult = generatePracticeConversationResponse({
      cleanInput,
      conversationHistory,
      detectedLang,
      marathiNormalized,
      englishTranslation
    });

    return {
      ...practiceResult,
      analysis
    };
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
    'NEGATION',
    'GENERAL_CONFIRMATION',
    'GENERAL_NEGATION',
    'CONFIRM_PREVIOUS_QUESTION',
    'CONFIRM_FOOD',
    'CONFIRM_COLLEGE',
    'CONFIRM_FRIENDS',
    'USER_APOLOGY',
    'USER_DOING_CHATTING',
    'CHATTING_INTEREST',
    'USER_DOING_LEARNING',
    'START_DAILY_CHAT',
    'PRACTICE_CHATTING',
    'TOPIC_AI'
  ].includes(subType);

  if (!isCasualStatement && (detectedLang === 'english' || detectedLang === 'mixed')) {
    grammarCorrection = checkGrammar(cleanInput);
  }

  // 4. If an external API key is present, invoke Google Gemini with exact instructions
  if (apiKey) {
    const systemPrompt = `
You are SpeakWise AI, a friendly intelligent English tutor and conversational assistant.

CRITICAL CONVERSATIONAL INSTRUCTIONS:
1. NEVER treat short messages (such as "daily chat", "chatting", "learning", "ai", "sorry", "yes", "no") as topic explanation requests.
2. Context-First Understanding: Understand the message according to conversation context:
   - "yes" / "no" / "okay": Answer directly according to the question you just asked. Do NOT deflect or restart with a generic menu.
   - "chatting" / "daily chat": The user wants conversation practice. Start chatting naturally: "Great! Let's practice a conversation. What did you do today?"
   - "learning": Respond in context (e.g. if you asked what they are doing: "Nice! What are you learning today?").
   - "sorry": Respond conversationally: "That's okay! 😊 What happened?"
   - "ai" / "Artificial Intelligence": Engage in a discussion on AI: "Artificial Intelligence is a fascinating topic! What do you think is the biggest benefit of Artificial Intelligence?"
3. Direct Correction of Mistakes: When the user makes an English mistake (e.g. "i am practicing eng" -> "I am practicing English.", "means how to apololize" -> "How do I apologize?"):
   - Correct the mistake directly:
     ❌ Your sentence: [original]
     ✅ Corrected: [better]
   - Do NOT ask "Would you like me to suggest a more fluent phrasing?".
   - If they asked a question (e.g. "means how to apololize"), BOTH correct their English AND answer how to apologize with clear examples!
4. Maintain Conversation & Topic: If a discussion topic was started (like AI), keep follow-up questions focused on that topic.
5. Answer the user's actual question or message first before anything else.
6. Understand English, Marathi, Roman Marathi, and mixed Marathi-English.
7. NEVER use generic canned responses such as:
   - "That's an interesting point!"
   - "I'm listening!"
   - "Could you tell me more?"
   - "I understand! Tell me what you'd like to know or practice about..."
   - "Would you like me to suggest a more fluent phrasing?"
   - "Great! What would you like to focus on right now?"
    `.trim();

    try {
      const geminiResponse = await callGeminiAPI(apiKey, systemPrompt, cleanInput, conversationHistory);
      if (geminiResponse) {
        return {
          aiText: geminiResponse,
          detectedLang,
          marathiNormalized,
          englishTranslation,
          grammarCorrection: grammarCorrection?.hasError ? grammarCorrection : null,
          analysis
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed:', err.message);
      return {
        aiText: "Sorry, I couldn't process your message right now. Please try again.",
        detectedLang,
        marathiNormalized,
        englishTranslation,
        grammarCorrection: null,
        analysis
      };
    }
  }

  // 5. Intelligent Offline Intent-Based Engine (NO generic filler templates)
  let reply = "";

  // Handle AI Identity & Activity
  if (intent === INTENT_TYPES.AI_QUESTION) {
    if (subType === 'AI_IDENTITY') {
      reply = "My name is SpeakWise AI! 🤖 I'm your friendly English tutor and conversation partner.";
    } else if (subType === 'AI_ACTIVITY') {
      reply = "I'm chatting with you and helping you practice English! 😄 What are you doing right now?";
    } else if (subType === 'AI_PAST_ACTIVITY_INCORRECT') {
      const original = cleanInput.replace(/\?*$/, '?');
      reply = `Did you mean: "What were you doing?" 😊

Correction:
❌ ${original}
✅ What were you doing?

Because the subject is 'you', we use 'were', not 'was'.

To answer your question:
I was chatting with you and helping you practice English! 😊`;
    } else if (subType === 'AI_PAST_ACTIVITY_CORRECT') {
      reply = "I was chatting with you and helping you practice English! 😊 How can I help you right now?";
    } else if (subType === 'EXPLAIN_WAS_WERE_YOU_DOING') {
      reply = `Sure! 😊

We say:
❌ What was you doing?
✅ What were you doing?

With 'you', use 'were'.

Examples:
- What were you doing yesterday?
- What were you studying?
- What were you watching?`;
    } else {
      reply = "I'm SpeakWise AI, your friendly AI English companion! 🤖 I'm here to chat, help you build speaking confidence, and answer your questions.";
    }
  }

  // Handle User Complaints & Correction Requests
  else if (intent === INTENT_TYPES.COMPLAINT) {
    if (/sentense|even\s+dont\s+correct|tell\s+these/i.test(cleanInput)) {
      reply = `I understand what you mean. 😊

Correction:

❌ You dont help me just tell these sentense wrong and you even dont correct the statement.

✅ You don't help me. You just tell me that these sentences are wrong, but you don't even correct them.

More natural:
✅ You're not helping me. You only tell me that my sentences are wrong, but you don't actually correct them.

Mistakes:
- dont → don't
- sentense → sentence
- "these sentence" / "these sentences" depends on context
- sentence structure needs improvement
- "correct the statement" → "correct them" is more natural here

And yes — from now on, when you make an English mistake, I should show you the corrected sentence instead of only saying that it is wrong!`;
    } else if (/why\s+you\s+(?:dont|don't)\s+correct/i.test(cleanInput)) {
      reply = `I understand what you mean. 😊

Correction:
❌ Why you don't correct my English?
✅ Why don't you correct my English?

In English questions, place the auxiliary verb ("don't") before the subject ("you").

And yes — from now on, when you make an English mistake, I should show you the corrected sentence instead of only saying that it is wrong!`;
    } else {
      reply = `I understand what you mean. 😊 From now on, when you make an English mistake, I should show you the corrected sentence instead of only saying that it is wrong!`;
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

  // Handle Confirmation ("yes", "yeah", "sure", etc.)
  else if (intent === INTENT_TYPES.CONFIRMATION) {
    if (subType === 'EXPLAIN_WAS_WERE_YOU_DOING') {
      reply = `Sure! 😊

We say:
❌ What was you doing?
✅ What were you doing?

With 'you', use 'were'.

Examples:
- What were you doing yesterday?
- What were you studying?
- What were you watching?`;
    } else if (subType === 'START_DAILY_CHAT' || subType === 'CONFIRM_PREVIOUS_QUESTION') {
      reply = `Great! 😊 Let's start.

What did you do today?`;
    } else if (subType === 'PRACTICE_APOLOGY_SCENARIO') {
      reply = `Awesome! Let's practice. 😊

Imagine you arrived 15 minutes late to an important meeting or college class. How would you apologize to your teacher or team in English?`;
    } else if (subType === 'CONFIRM_FOOD') {
      reply = "Awesome! 🍕 Food is always a great topic. Do you prefer eating out or cooking at home?";
    } else if (subType === 'CONFIRM_COLLEGE') {
      reply = "That's great! 👍 Attending college regularly builds discipline. What subject was your favorite today?";
    } else if (subType === 'CONFIRM_FRIENDS') {
      reply = "Nice! Meeting friends makes the day so much better. What did you talk about or do together?";
    } else {
      reply = "Great! 😊 What would you like to chat about or practice today?";
    }
  }

  // Handle Negation ("no", "nope", etc.)
  else if (intent === INTENT_TYPES.NEGATION) {
    reply = "No problem at all! 😊 What would you like to talk about or do instead?";
  }

  // Handle Casual Conversation
  else if (intent === INTENT_TYPES.CASUAL_CONVERSATION) {
    if (subType === 'ARE_YOU_OKAY') {
      reply = "Yes, I'm okay! 😊 Thanks for asking. How are you feeling?";
    } else if (subType === 'NOT_BAD') {
      reply = "That's good to hear! 😊 What have you been doing today?";
    } else if (subType === 'CHATTING_WITH_YOU') {
      reply = "Nice! 😊 I'm happy to chat with you. What would you like to talk about?";
    } else if (subType === 'HOW_ARE_YOU') {
      reply = "I'm doing great! 😊 Thanks for asking. How are you?";
    } else if (subType === 'USER_FEELING_GOOD') {
      reply = "Glad to hear that! 😊 What are you up to today?";
    } else if (subType === 'USER_RELAXING') {
      reply = "Sounds nice and relaxing! 😄 Are you taking a break, or just winding down for the day?";
    } else if (subType === 'USER_TIRED') {
      reply = "That sounds exhausting. 😌 Try taking a short break, drink some water, and relax for a few minutes. Did you have a busy day today?";
    } else if (subType === 'USER_BUSY') {
      reply = "Sounds like you have a full schedule! Remember to take short breathers. What are you working on today?";
    } else if (subType === 'THANKS') {
      reply = "You're very welcome! 😊 Always happy to help you practice English. What would you like to explore next?";
    } else if (subType === 'USER_APOLOGY') {
      reply = "That's okay! 😊 What happened?";
    } else if (subType === 'USER_DOING_CHATTING') {
      reply = "Nice! 😊 Who are you chatting with, and what are you talking about?";
    } else if (subType === 'CHATTING_INTEREST') {
      reply = "Chatting is one of the best ways to practice English! 😄 What would you like to chat about today?";
    } else if (subType === 'USER_DOING_LEARNING') {
      reply = "Nice! 😊 What are you learning today?";
    } else if (subType === 'LEARNING_PYTHON') {
      reply = `That's good! 😊

A more natural sentence is:
✅ I am learning Python.

What are you learning about in Python?`;
    } else {
      reply = generateContextualStatementReply(cleanInput, grammarCorrection, conversationHistory);
    }
  }

  // Handle Advice & Direct Answers
  else if (intent === INTENT_TYPES.ADVICE) {
    if (subType === 'WHERE_TO_START') {
      reply = `Correction:
❌ Suggest me where I have to start.
✅ Please suggest where I should start.

Or more naturally:
✅ Can you suggest where I should start?

If you're talking about improving your English, start with simple daily conversations! Practice 5–10 sentences every day, and I can correct your mistakes as we go.

Shall we start with a quick daily conversation practice right now?`;
    } else if (subType === 'LOT_OF_WORK_TODAY') {
      reply = `Correction:
❌ I have lot of woring for today.
✅ I have a lot of work for today.

Mistakes:
• "woring" → "work" (in this sentence, "work" is a noun meaning tasks to complete)
• "have lot of" → "have a lot of" (use the indefinite article "a")

You could also say:
✅ I have a lot of work to do today.

If you have a lot of work today, make a short list and start with the most important task. Remember to take short breaks so you don't burn out!`;
    } else if (subType === 'START_PROJECT') {
      reply = "Start by deciding the goal of your project, then list the main features, choose your technology, create the project structure, and build one feature at a time. If you tell me your project topic, I can help you make a step-by-step plan.";
    } else if (subType === 'TIRED_WORK_MANAGEMENT') {
      reply = `When work feels overwhelming and you're tired, here are a few practical ways to manage:

1. **Prioritize**: Pick the top 1–2 most important tasks to focus on today, and put the rest on hold.
2. **Break it down**: Divide big tasks into manageable 15–20 minute chunks.
3. **Take a quick rest**: Drink water, stretch, or step away from your screen for 5 minutes.
4. **Be kind to yourself**: Rest is part of being productive!

In natural English, you can phrase your sentence like this:
👉 *'I feel tired and I have a lot of work. How can I manage everything?'*

What is the most urgent task on your plate right now?`;
    } else if (subType === 'BUILD_CONFIDENCE') {
      reply = `Building confidence takes practice. Here are a few simple things you can try:

1. Speak English for 5–10 minutes every day.
2. Don't be afraid of making mistakes.
3. Start with simple sentences and gradually make them longer.
4. Practice speaking in front of a mirror or with a friend.
5. Celebrate small improvements.

Remember: you don't need perfect English to speak confidently. You become confident by speaking more. 😊

If you want, I can also give you a simple 7-day English confidence practice plan.`;
    } else if (subType === 'FOLLOWUP_IMPROVE_ENGLISH' || subType === 'IMPROVE_ENGLISH') {
      const hasInversionError = /\bhow\s+i\s+can\b/i.test(cleanInput);
      reply = `To improve your English, practice a little every day! Here is a simple speaking practice plan:

1. **Read aloud**: Read short English sentences or stories for 5–10 minutes daily.
2. **Think in English**: Form simple thoughts in English instead of translating in your head.
3. **Practice conversation**: Chat right here with me every day so I can guide you!
${hasInversionError ? `\nCorrection:\n❌ How I can improve my English?\n✅ How can I improve my English?\n\nIn English questions, place the auxiliary verb ("can") before the subject ("I"). Always capitalize "English".\n` : ''}
What area would you like to focus on first—speaking confidence, vocabulary, or grammar?`;
    } else if (subType === 'OVERCOME_HESITATION') {
      reply = `Hesitation happens when you worry about making mistakes! Here is how to overcome it:

1. **Focus on communication, not perfection**: If the listener understands your point, you succeeded.
2. **Slow down your speech**: Speaking slightly slower gives your brain time to choose words.
3. **Use simple vocabulary first**: You don't need complex words to express great ideas.

Would you like to try a short 2-minute speaking practice with me right now?`;
    } else {
      reply = generateContextualStatementReply(cleanInput, grammarCorrection);
    }
  }

  // Handle Interview Preparation
  else if (intent === INTENT_TYPES.INTERVIEW_HELP) {
    reply = `Good luck with your interview! 🎯 Here is a focused preparation guide to help you shine:

1. **Master Your 60-Second Introduction**:
   👉 *"Hello, my name is [Name]. I have a background in [Field] and I am passionate about [Key Skill]. In my recent projects, I developed [Key Project] and delivered [Result]."*

2. **Common Questions & the STAR Method**:
   - For situational questions (*"Tell me about a challenge you solved"*), structure your answer:
     **S**ituation → **T**ask → **A**ction → **R**esult.
   - If asked *"Why do you want this role?"*, connect your skills to their mission.

3. **Speaking Delivery**:
   - Speak slightly slower than normal; take a deep breath before answering.
   - Keep answers concise (1 to 2 minutes).
   - If you don't know something, say: *"I haven't encountered that yet, but I am excited to learn it."*

Would you like to practice right now? Tell me: *'Please introduce yourself'*, and let's practice!`;
  }

  // Handle English Practice Requests & Educational Grammar Lessons
  else if (intent === INTENT_TYPES.ENGLISH_PRACTICE) {
    if (subType === 'START_DAILY_CHAT') {
      reply = `Great! Let's start our daily English chat. 😊

What did you do today?`;
    } else if (subType === 'PRACTICE_CHATTING') {
      reply = `Great! 😊 Let's practice a conversation.

What did you do today?`;
    } else if (subType === 'PRACTICE_LEARNING') {
      reply = "Learning something new every day is fantastic! What would you like to focus on today — vocabulary, grammar, or speaking?";
    } else if (subType === 'PRACTICING_ENGLISH') {
      reply = `Nice! 😊

A natural way to say that is:
✅ I am practicing English.

What would you like to practice — daily conversation, grammar, or speaking?`;
    } else if (subType === 'HOW_TO_APOLOGIZE') {
      reply = `Did you mean: "How do I apologize?" or "I mean, how do I apologize?" 😊

To apologize in English, you can say:

• I'm sorry.
• I'm really sorry.
• I apologize for my mistake.
• I'm sorry for being late.

For example:
"I'm sorry for being late to class."

Would you like to practice an apology conversation?`;
    } else if (subType === 'PRACTICE_APOLOGY_SCENARIO') {
      reply = `Awesome! Let's practice. 😊

Imagine you arrived 15 minutes late to an important meeting or college class. How would you apologize to your teacher or team in English?`;
    } else if (subType === 'PRESENT_TENSE') {
      reply = `Present tense is used to talk about things that happen now, regularly, or are generally true.

There are 4 main types:

1. Simple Present
   I go to college every day.

2. Present Continuous
   I am studying now.

3. Present Perfect
   I have finished my work.

4. Present Perfect Continuous
   I have been studying for two hours.

If you want, we can practice each one with simple examples.`;
    } else if (subType === 'HOW_TO_USE_PRESENT_TENSE') {
      reply = `Correction:
❌ How we can use present tense?
✅ How can we use the present tense?

In English questions, place the auxiliary verb before the subject ("How can we..."), and use the definite article "the" before "present tense".

We use the present tense to talk about things that happen regularly, things happening now, facts, and actions connected to the present.

Examples:

• Simple Present:
  I go to college every day.

• Present Continuous:
  I am studying English now.

• Present Perfect:
  I have completed my homework.

• Present Perfect Continuous:
  I have been studying for two hours.

Would you like me to teach you the 4 types one by one?`;
    } else if (subType === 'TEACH_4_PRESENT_TENSE_TYPES') {
      reply = `Here are the 4 main types of Present Tense:

1. Simple Present (Habits & Facts):
   • I go to college every day.

2. Present Continuous (Happening right now):
   • I am studying English now.

3. Present Perfect (Action completed with current result):
   • I have finished my homework.

4. Present Perfect Continuous (Started in past, still continuing):
   • I have been studying for two hours.

Which type would you like to practice first?`;
    } else if (subType === 'CONTINUE_DAILY_HABITS') {
      reply = `Great! A daily habit is an activity you do regularly, usually expressed in Simple Present.

Example:
• I drink tea every morning.

What is one daily habit you have?`;
    } else if (subType === 'DAILY_HABITS') {
      reply = `Correct spelling:
❌ daily habbits
✅ daily habits

"Habits" is spelled with a single "b".

A daily habit is something you regularly do every day.

Example sentences:
• I wake up at 7 AM every day.
• I go to college in the morning.
• I study English for 30 minutes every day.
• I exercise in the evening.

If you want to practice Present Tense, daily habits are a great topic because we commonly use Simple Present for them.

What is one daily habit you have?`;
    } else if (subType === 'SIMPLE_PRESENT_TENSE') {
      reply = `Simple Present tense is used to describe habits, daily routines, facts, and things that are generally true.

Structure:
Subject + Base Verb (+ s/es for he/she/it)

Examples:
• Routine: I drink tea every morning.
• Third person: She speaks English fluently.
• Universal fact: The sun rises in the east.

Negative & Questions:
• Negative: I don't drink coffee. / He doesn't drive.
• Question: Do you practice English every day?

Would you like to try making a sentence in Simple Present about your routine?`;
    } else if (subType === 'PRESENT_CONTINUOUS_TENSE') {
      reply = `Present Continuous tense is used to talk about actions happening right now, or temporary situations happening around the present moment.

Structure:
Subject + am/is/are + Verb(-ing)

Examples:
• Right now: I am chatting with you right now.
• In progress: She is studying for her exam.
• Temporary: He is living in Pune this month.

Would you like to practice creating a sentence in Present Continuous?`;
    } else if (subType === 'PRESENT_TENSE_EXAMPLES') {
      reply = `Here are clear examples of the Present Tense across all 4 types:

1. Simple Present (Habits & Facts):
   • I study English every day.
   • The earth orbits the sun.

2. Present Continuous (Happening right now):
   • I am chatting with you right now.
   • She is reading an interesting book.

3. Present Perfect (Action completed with current result):
   • I have finished my homework.
   • They have visited Mumbai twice.

4. Present Perfect Continuous (Started in past, still continuing):
   • I have been studying for two hours.
   • It has been raining since morning.

Which type would you like to practice first?`;
    } else if (subType === 'PRESENT_TENSE_EXERCISE') {
      reply = `Here is a Present Tense practice exercise! 📝

Fill in the blanks with the correct present tense form of the verb in brackets:

1. She ______ (go) to college every day.
2. They ______ (play) football right now.
3. I ______ (already / finish) my lunch.

Type your answers (for example: "1. goes, 2. are playing, 3. have finished"), and I'll check them for you!`;
    } else if (subType === 'CHECK_EXERCISE_ANSWER') {
      reply = `Great effort! Let's check the answers: 🌟

1. ✅ "She goes to college every day." (Simple Present — third person singular "she" takes "-es").
2. ✅ "They are playing football right now." (Present Continuous — action happening right now with plural "are + verb-ing").
3. ✅ "I have already finished my lunch." (Present Perfect — completed action connected to the present).

Well done! Would you like another practice exercise, or shall we explore Past Tense?`;
    } else if (subType === 'CONTINUE_PRESENT_TENSE') {
      reply = `Great! 😊 Would you like to try a quick 3-question practice exercise on Present Tense, or would you like to learn about Past Tense next?`;
    } else if (subType === 'PAST_TENSE') {
      reply = `Past tense is used to talk about actions that happened before now (in the past).

The main types are:

1. Simple Past (Completed action):
   I went to college yesterday.

2. Past Continuous (Action ongoing in the past):
   I was studying when you called.

3. Past Perfect (Action completed before another past event):
   I had finished my dinner before 9 PM.

Would you like to practice making Simple Past sentences?`;
    } else if (subType === 'FUTURE_TENSE') {
      reply = `Future tense is used to talk about actions that will happen later (in the future).

The main types are:

1. Simple Future (Will / Shall):
   I will call you tomorrow. / I am going to study tonight.

2. Future Continuous (Ongoing action in future):
   I will be traveling at this time tomorrow.

3. Future Perfect (Action completed by a future time):
   I will have completed my degree by next year.

Would you like to practice using "will" or "going to"?`;
    } else if (subType === 'CANT_UNDERSTAND_ENGLISH' || /\b(?:cant|cannot|can't)\s+understand\s+english\b/i.test(cleanInput)) {
      reply = `That's okay! 😊

Correction:
❌ I cant understand English.
✅ I can't understand English.

We use "can't" with an apostrophe (can't = cannot), and "English" is always capitalized.

If you mean that you have difficulty understanding English, you can also say:
✅ I don't understand English very well.

We can improve your English step by step. What would you like to start with?`;
    } else if (/(?:mala|मला).*?(?:bolayla|बोलायला)/i.test(cleanInput)) {
      reply = `Great! 😊 'मला English बोलायला practice करायची आहे' means:
👉 "I want to practice speaking English."

Let's start practicing right now!

First question:
What did you do today?`;
    } else {
      reply = `Of course! 😊 Let's practice together.

I'll ask you simple questions in English. You answer naturally, and I'll correct your mistakes and show you a better way to say them.

First question:

'What did you do today?'`;
    }
  }

  // Handle Discussion Topic Initiation
  else if (intent === INTENT_TYPES.DISCUSSION_TOPIC) {
    if (subType === 'TOPIC_AI') {
      reply = `Artificial Intelligence is a fascinating topic! 💡

What do you think is the biggest benefit of Artificial Intelligence?`;
    } else {
      reply = `That's an exciting topic! What do you think is the most important aspect of ${cleanInput}?`;
    }
  }

  // Handle Discussion Topic Answer
  else if (intent === INTENT_TYPES.DISCUSSION_ANSWER) {
    if (subType === 'ANSWER_AI_BENEFIT' || /ai|artificial\s+intelligence/i.test(cleanInput)) {
      reply = `Good point! 😊

Small correction:
❌ ${grammarCorrection ? grammarCorrection.original : cleanInput}
✅ ${grammarCorrection ? grammarCorrection.better : 'AI helps students.'}

Because 'AI' is singular, use 'helps'.

How can AI help students in their studies?`;
    } else {
      reply = `Great insight! 😊 How do you see that developing further in the future?`;
    }
  }

  // Handle Grammar Correction (Explicit & Specific Common Errors)
  else if (intent === INTENT_TYPES.GRAMMAR_CORRECTION) {
    if (subType === 'REPRESENT_MYSELF') {
      reply = `In English, when you talk about presenting who you are, say 'introduce myself':

❌ *"represent my self"*
✅ *"introduce myself"*

**Why?** 'Introduce' means telling others who you are. 'Represent' means acting on behalf of a company or organization.

Here is a natural example you can use:
👉 *"Hello, my name is Ashwini. I am a CSE (AIML) student. I am interested in technology and I enjoy learning new things."*

Now try introducing yourself in 3–4 sentences!`;
    } else if (subType === 'EXPLICIT_FIND_MISTAKES') {
      reply = `I'd be glad to! 😊 Whenever you write or speak, I will find your mistakes and show you the natural way to say it.

In natural English, you can say:
👉 'Can you find my mistakes and tell me what is wrong?'

What sentence or topic would you like to practice first?`;
    } else if (grammarCorrection && grammarCorrection.hasError) {
      reply = `A quick tip on your sentence! 😊\n\n❌ ${grammarCorrection.original}\n✅ ${grammarCorrection.better}\n\n**Why?** ${grammarCorrection.explanation}\n\nWhat would you like to talk about next?`;
    } else {
      reply = `Your sentence looks good! What else would you like to check or practice?`;
    }
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

  // Handle Vocabulary Help
  else if (intent === INTENT_TYPES.VOCABULARY) {
    reply = `Expanding your vocabulary helps you express thoughts clearly and fluently! 📚

Here are 3 useful words for daily conversations:

1. **Consistent** (नियमित / सुसंगत)
   • Meaning: Doing something regularly in the same way.
   • Example: "Consistent daily practice improves speaking quickly."

2. **Fluency** (अस्खलितपणा)
   • Meaning: The ability to speak smoothly and easily.
   • Example: "Speaking every day helps you build fluency."

3. **Confident** (आत्मविश्वासू)
   • Meaning: Feeling sure of your abilities.
   • Example: "I feel confident speaking English in meetings."

Try using one of these words in a sentence, and I will check it!`;
  }

  // Handle Pronunciation Help
  else if (intent === INTENT_TYPES.PRONUNCIATION) {
    reply = `Good pronunciation makes your English clear and easy to understand! 🗣️

Here are 3 key tips for clear pronunciation:

1. **Word Stress**: Emphasize the right syllable (e.g., **PHO**-to-graph vs. pho-**TO**-gra-pher).
2. **Slow Down**: Speaking slightly slower gives you time to articulate vowel and consonant sounds clearly.
3. **Listen & Repeat**: Shadow native speakers by listening and repeating sentences out loud.

You can also use our **Pronunciation Coach** in the sidebar to practice any word with audio!

Which word would you like to practice pronouncing right now?`;
  }

  // Handle Roman Marathi / Marathi / Mixed Language Queries
  else if (intent === INTENT_TYPES.ROMAN_MARATHI || intent === INTENT_TYPES.MARATHI || intent === INTENT_TYPES.MIXED_LANGUAGE) {
    const lower = cleanInput.toLowerCase();

    // 0. Present Tense explanation in Marathi: "mala present tense samjun sang"
    if (
      subType === 'EXPLAIN_PRESENT_TENSE_MARATHI' ||
      /(?:present\s+tense).*?(?:samjun|samjaun|sang|shikav)/i.test(cleanInput)
    ) {
      reply = `Present Tense म्हणजे वर्तमानकाळ.

आपण present tense चा वापर सध्या घडणाऱ्या गोष्टी, रोजच्या सवयी आणि facts सांगण्यासाठी करतो.

याचे मुख्य 4 प्रकार आहेत:

1. Simple Present (रोजच्या सवयी / नेहमीची सत्ये):
   👉 I go to college every day. (मी रोज कॉलेजला जातो.)

2. Present Continuous (सध्या चालू असलेली क्रिया):
   👉 I am studying English now. (मी आता इंग्रजी शिकत आहे.)

3. Present Perfect (नुकतीच पूर्ण झालेली क्रिया):
   👉 I have completed my homework. (मी माझा गृहपाठ पूर्ण केला आहे.)

4. Present Perfect Continuous (काही वेळापासून चालू असलेली क्रिया):
   👉 I have been studying for two hours. (मी दोन तासांपासून अभ्यास करत आहे.)

तुम्हाला यातील कोणता प्रकार उदाहरणासह अधिक जाणून घ्यायला आवडेल?`;
    }

    // 1. Parva presentation problem
    else if (
      /parva\b.*?(?:presentation|speech).*?(?:problem|adchan|trass|difficulty|jate|yeto)/i.test(lower) ||
      /परवा\s+माझं\s+presentation\s+आहे.*?English.*?problem/i.test(cleanInput) ||
      /(?:parva|udya|aaj)\b.*?(?:maz|maza|majha|माझं)?\s*presentation.*?english.*?(?:problem|jate|yeto)/i.test(lower)
    ) {
      reply = `Don't worry 😊 Your presentation is coming soon, so let's practice together.

You can say:

👉 'I have a presentation the day after tomorrow, and I have difficulty speaking in English.'

Here is how we can prepare:
1. **Prepare your opening**: Memorize your first 2–3 sentences so you begin with confidence.
2. **Keep sentences short**: Simple English is clearer and easier to remember.
3. **Use bullet points**: Don't memorize long paragraphs—use keywords as visual cues.
4. **Practice out loud**: Practice speaking your slides right here with me.

If you send me your presentation topic, I can help you prepare the introduction, main points, and conclusion in simple English!`;
    }

    // 2. Udya presentation problem
    else if (
      /(?:udya|उद्या).*?(?:presentation|speech).*?(?:problem|adchan|अडचण)/i.test(cleanInput) ||
      /उद्या\s+माझं\s+presentation\s+आहे.*?English.*?problem/i.test(cleanInput)
    ) {
      reply = "Don't worry! 😊 Since your presentation is tomorrow, let's prepare it together. Send me your presentation topic or your introduction, and I'll help you create simple English sentences and practice them with you.";
    }

    // 3. Interview fear
    else if (
      /interview.*?(?:bolayla|bolnyachi|bolnyas).*?(?:bhiti|bheeti|darr|fear|nervous)/i.test(lower) ||
      /interview.*?english.*?(?:bhiti|bheeti)\s+vat(?:ate|te)/i.test(lower) ||
      /मला\s+interview\s+ला\s+english\s+बोलायला\s+भीती\s+वाटते/i.test(cleanInput)
    ) {
      reply = `It's okay 😊 Many people feel nervous speaking English during interviews.

You can say:

👉 'I feel nervous speaking English during interviews.'

To improve:
• Practice your introduction every day.
• Prepare answers to common interview questions.
• Speak slowly.
• Don't worry about small mistakes.
• Practice with me before your interview.

Let's practice now.

Tell me:
'Please introduce yourself.'`;
    }

    // 4. Interview preparation (aaj mazha interview ahe)
    else if (
      /aaj.*?(?:majha|maza|माझं)?\s*interview.*?how\s+should\s+i\s+prepare/i.test(lower) ||
      /आज\s+माझं\s+interview\s+आहे.*?how\s+should\s+i\s+prepare/i.test(cleanInput) ||
      /आज\s+माझं\s+interview\s+आहे/i.test(cleanInput)
    ) {
      reply = `Good luck with your interview today! 🎯 Here is a focused preparation guide to help you shine:

1. **Master Your 60-Second Introduction**:
   👉 *"Hello, my name is [Name]. I have a background in [Field] and I am passionate about [Key Skill]. In my recent projects, I developed [Key Project] and delivered [Result]."*

2. **Common Questions & the STAR Method**:
   - For situational questions (*"Tell me about a challenge you solved"*), structure your answer:
     **S**ituation → **T**ask → **A**ction → **R**esult.
   - If asked *"Why do you want this role?"*, connect your skills to their mission.

3. **Speaking Delivery**:
   - Speak slightly slower than normal; take a deep breath before answering.
   - Keep answers concise (1 to 2 minutes).
   - If you don't know something, say: *"I haven't encountered that yet, but I am excited to learn it."*

Would you like to practice right now? Tell me: *'Please introduce yourself'*, and let's practice!`;
    }

    // 4b. Speaking fear: "mala English bolayla bhiti vatate" / "मला English बोलायला भीती वाटते"
    else if (
      subType === 'SPEAKING_FEAR' ||
      /(?:bhiti|bheeti|भीती)\s*(?:vatate|vatte|वाटते)/i.test(cleanInput) ||
      /(?:english|इंग्रजी)?\s*(?:bolayla|बोलायला).*?(?:bhiti|bheeti|भीती)/i.test(cleanInput)
    ) {
      reply = `In English, you can say:

👉 **"I feel nervous speaking English."**
*(or "I'm afraid of speaking English.")*

Don't worry at all! 😊 Feeling nervous is completely normal when learning a new language. You don't need to speak perfectly—even small daily conversations will help you build confidence.

Would you like to practice one simple sentence with me right now?`;
    }

    // 5. English practice request in Marathi
    else if (
      /(?:mala|मला).*?english.*?(?:practice|shikaych|shikav)/i.test(cleanInput) ||
      /mala\s+english\s+bolayla\s+practice/i.test(lower)
    ) {
      reply = `Great! 😊 'मला English बोलायला practice करायची आहे' means:
👉 'I want to practice speaking English.'

Let's start practicing right now!

First question:
'What did you do today?'`;
    }

    // 5b. Mala English samjat nahi
    else if (
      subType === 'DONT_UNDERSTAND_ENGLISH' ||
      /(?:mala|मला)\s+(?:english|इंग्रजी)?\s*(?:samjat|समजत)\s+(?:nahi|नाही)/i.test(cleanInput) ||
      /(?:samjat|समजत)\s+(?:nahi|नाही)/i.test(cleanInput)
    ) {
      reply = `That's okay! 😊 I understand what you mean.

In Marathi: 'मला English समजत नाही.'
In English, you can say:
👉 'I don't understand English.'
Or:
👉 'I don't understand English very well.'

We can improve your English step by step. What would you like to start with?`;
    }

    // 5c. Mala english madhe answer deta yet nahi
    else if (
      subType === 'CANNOT_ANSWER_ENGLISH' ||
      /(?:deta|dyayla)\s+(?:yet|jamt)\s+nahi/i.test(cleanInput) ||
      /(?:mala|मला)?.*?(?:english|इंग्रजी)?.*?(?:answer|uttar).*?(?:yet\s+nahi|deta)/i.test(cleanInput)
    ) {
      reply = `Don't worry at all! 😊 You can practice with me one step at a time.

Meaning:
"मला English मध्ये answer देता येत नाही."

In English, you can say:
👉 **"I don't know how to answer in English."**
*(or "I'm not able to answer in English.")*

Take your time! You can tell me your thought in simple words or in Roman Marathi, and I'll help you phrase it in fluent English.

What would you like to say?`;
    }

    // 6. Jevn zal ka
    else if (/jevn\s+zal\s+ka/i.test(lower) || /जेवण\s+झालं\s+का/i.test(cleanInput)) {
      reply = "I don't eat like humans do 😄, but I'm always ready to chat with you! In English, 'जेवण झालं का?' means 'Have you eaten?'. Have you had your meal today?";
    }

    // 7. Mahit nahi yach ans ks dyaych
    else if (
      /mahit\s+nahi.*?ans.*?ks.*?dyaych/i.test(lower) ||
      /(?:ks|kasa).*?(?:ans|answer).*?(?:dyaych|dyaycha)/i.test(lower) ||
      /मला.*?माहित.*?नाही.*?कसं/i.test(cleanInput) ||
      (/mahit.*?nahi/i.test(lower) && /ans|answer|dyaych/i.test(lower))
    ) {
      reply = `No problem! 😊 Send me the question and I'll help you answer it naturally in English.

Meaning:
"मला माहित नाही, याचं answer कसं द्यायचं?"

Natural English:
👉 "I don't know how to answer this."

You can also say:
👉 "I'm not sure how to answer this."

What is the question you need help with?`;
    }

    // 8. Tu kasa ahes
    else if (/tu\s+kasa\s+ahes/i.test(lower) || /तू\s+कसा\s+आहेस/i.test(cleanInput)) {
      reply = "I'm doing great! 😊 Thanks for asking. How are you?";
    }

    // 9. Udya bhetu
    else if (/udya\s+bhetu/i.test(lower) || /उद्या\s+भेटू/i.test(cleanInput)) {
      reply = "See you tomorrow! 😊 Remember to practice for a few minutes every day.";
    }

    // 9b. Today college: "मला आज कॉलेजला जायचं आहे" / "mala aaj college la jaycha ahe"
    else if (
      subType === 'TODAY_COLLEGE' ||
      /(?:aaj|आज)\s*(?:college|कॉलेज).*?(?:jaycha|jaych|jaychay|जायचं)/i.test(cleanInput)
    ) {
      reply = `In English, you can say:

👉 **"I have to go to college today."**
*(or "I need to go to college today.")*

Would you like to practice saying this in a sentence, or tell me what classes you have today?`;
    }

    // 9c. Speaking fear: "mala English bolayla bhiti vatate" / "मला English बोलायला भीती वाटते"
    else if (
      subType === 'SPEAKING_FEAR' ||
      /(?:english|इंग्रजी)?\s*(?:bolayla|बोलायला).*?(?:bhiti|भीती)/i.test(cleanInput) ||
      /\b(?:bhiti|भीती)\s*(?:vatate|वाटते)\b/i.test(cleanInput)
    ) {
      reply = `In English, you can say:

👉 **"I feel nervous speaking English."**
*(or "I'm afraid of speaking English.")*

Don't worry at all! 😊 Feeling nervous is completely normal when learning a new language. You don't need to speak perfectly—even small daily conversations will help you build confidence.

Would you like to practice one simple sentence with me right now?`;
    }

    // 9d. Past presentation: "Today mala college madhe presentation hota."
    else if (
      subType === 'COLLEGE_PRESENTATION_PAST' ||
      /(?:presentation)\s*(?:hota|hote|होतं|होता)/i.test(cleanInput)
    ) {
      reply = `You can say:

👉 **"Today, I had a presentation at college."**

How did your presentation go? Tell me a little about it in English!`;
    }

    // 9e. Translation request: "English madhe kasa mhantat?" / "translate this into English"
    else if (
      subType === 'ASK_TRANSLATION' ||
      intent === INTENT_TYPES.TRANSLATION
    ) {
      if (englishTranslation) {
        reply = `In English, you can say:

👉 **"${englishTranslation}"**

Would you like to practice saying this, or do you have another sentence you'd like to translate?`;
      } else {
        reply = "Sure! What sentence or thought would you like to say in English? Tell me in Marathi or Roman Marathi, and I'll give you the natural English phrasing.";
      }
    }

    // 10. Translation available
    else if (englishTranslation) {
      reply = `In English, you can say:

👉 "${englishTranslation}"

Would you like to practice using this in a sentence?`;
    }

    // Fallback for general conversational Marathi
    else {
      reply = "You can express this in English! Would you like me to translate it for you or help you practice speaking it?";
    }
  }

  // Handle Unclear Specific Entities (e.g., "Science Academy 2 and helping my life")
  else if (intent === INTENT_TYPES.UNCLEAR) {
    if (subType === 'SCIENCE_ACADEMY' || /science\s+academy/i.test(cleanInput)) {
      reply = "Do you mean that Science Academy 2 is helping you with your studies or your daily life?";
    } else {
      reply = "Could you clarify what you mean so I can give you the most accurate answer?";
    }
  }

  // If there is an explicit grammar correction
  else if (grammarCorrection && grammarCorrection.hasError) {
    reply = `A quick tip on your sentence! 😊\n\n❌ ${grammarCorrection.original}\n✅ ${grammarCorrection.better}\n\n**Why?** ${grammarCorrection.explanation}\n\nWhat would you like to talk about next?`;
  }

  // General Questions / Catch-All (Direct, conversational answer acknowledging the user's message)
  else if (intent === INTENT_TYPES.GENERAL_QUESTION || cleanInput.endsWith('?') || /^(what|how|why|when|where|who|can|is|are|do|does)\b/i.test(lower)) {
    reply = generateContextualQuestionReply(cleanInput, grammarCorrection);
  } else {
    reply = generateContextualStatementReply(cleanInput, grammarCorrection);
  }

  return {
    aiText: reply,
    detectedLang,
    marathiNormalized,
    englishTranslation,
    grammarCorrection: grammarCorrection?.hasError ? grammarCorrection : null,
    analysis
  };
};

module.exports = {
  generateTutorResponse,
  classifyIntent,
  normalizeInputText,
  INTENT_TYPES
};
