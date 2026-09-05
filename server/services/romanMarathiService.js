/**
 * Roman Marathi & Multilingual Understanding Service
 * Handles:
 * 1. Language Detection (English, Devanagari Marathi, Roman Marathi, Mixed)
 * 2. Roman Marathi Normalization (spelling variation tolerance, phonetic mapping)
 * 3. Devanagari Representation
 * 4. Contextual English Meaning (Sentence-level semantic translation, NOT word-by-word)
 */

// Normalization dictionary for common Roman Marathi words and spelling variations
const NORMALIZATION_MAP = {
  // Pronouns & Postpositions
  "mal": "mala", "mala": "mala",
  "tul": "tula", "tula": "tula",
  "tyala": "tyala", "tila": "tila",
  "aamhi": "amhi", "amhi": "amhi",
  "tumhi": "tumhi", "tumi": "tumhi",
  "mi": "mi", "mee": "mi",

  // Knowledge & negation
  "mahit": "mahit", "mahiti": "mahit", "maheeth": "mahit", "mahitey": "mahit",
  "samjat": "samjat", "samajla": "samjat", "kalala": "samjat",
  "nahi": "nahi", "naahi": "nahi", "nahiy": "nahi", "nay": "nahi",

  // Demonstratives
  "yach": "yach", "yacha": "yach", "yachi": "yach", "yache": "yach",
  "hach": "yach", "hacha": "yach",

  // Question words & Adverbs
  "ans": "answer", "uttar": "answer",
  "ks": "kasa", "kasa": "kasa", "kashi": "kasa", "kase": "kasa",
  "kay": "kay", "kaay": "kay",
  "kuthe": "kuthe", "kothe": "kuthe",
  "kadhi": "kadhi", "kewha": "kadhi",
  "ka": "ka", "kaa": "ka",
  "kiti": "kiti",

  // Verbs
  "dyaych": "dyaych", "dyaycha": "dyaych", "dyaychi": "dyaych", "dyave": "dyaych", "daycha": "dyaych",
  "karaych": "karaych", "karaycha": "karaych", "karaychi": "karaych", "kartoy": "kartoy", "kartes": "kartoy",
  "shikaych": "shikaych", "shikaycha": "shikaych", "shikaychay": "shikaych", "bolaych": "bolaych", "bolaycha": "bolaych",
  "aahe": "aahe", "ahe": "aahe", "aahes": "aahes", "ahes": "aahes", "ahat": "ahat", "aahat": "ahat",
  "hota": "hota", "hoti": "hota", "hote": "hota",

  // Food & state
  "jevn": "jevn", "jevan": "jevn", "jevna": "jevn", "jevlis": "jevn", "jevla": "jevn",
  "zal": "zal", "zala": "zal", "jhala": "zal", "jhale": "zal",

  // Time & others
  "aaj": "aaj", "udya": "udya", "kal": "kal",
  "bhetu": "bhetu", "bhetuya": "bhetu",
  "khup": "khup", "chan": "chhan", "chhan": "chhan"
};

// Normalize Roman Marathi text tokens for robust pattern matching
const normalizeRomanMarathiText = (text) => {
  if (!text || typeof text !== 'string') return '';
  const words = text.toLowerCase().split(/\s+/);
  const normalizedWords = words.map(w => {
    const cleanWord = w.replace(/[^a-z0-9]/g, '');
    return NORMALIZATION_MAP[cleanWord] || w;
  });
  return normalizedWords.join(' ');
};

// Sentence and intent dictionary for accurate idiom & conversational matching
const PHRASE_DICTIONARY = [
  // 1. "mala mahit nahi yach ans ks dyaych" and variants
  {
    patterns: [
      /(?:mala|मला)?.*?(?:mahit|mahiti|माहित|माहिती|samjat|समजत).*?(?:nahi|नाही).*?(?:ans|answer|उत्तर|dyaych|dyaycha|द्यायचं|ks|kasa|कसं)/i,
      /(?:ks|kasa|कसं).*?(?:ans|answer|उत्तर).*?(?:dyaych|dyaycha|द्यायचं)/i,
      /(?:mala|मला)\s+(?:mahit|mahiti|माहित|माहिती)\s+(?:nahi|नाही)/i,
      /how\s+(to|should\s+i|can\s+i)\s+answer\s+this/i
    ],
    marathi: "मला माहित नाही, याचं answer कसं द्यायचं?",
    english: "I don't know how to answer this.",
    category: "learning_help",
    intent: "ASK_HOW_TO_ANSWER"
  },

  // 2. "jevn zal ka?" and variants
  {
    patterns: [
      /\b(?:jevn|jevan|jevna|jevlis|jevla)\s+(?:zal|zala|jhala|jhale)\s+ka\b/i,
      /\bजेवण\s+झालं\s+का\b/i
    ],
    marathi: "जेवण झालं का?",
    english: "Have you eaten?",
    category: "food",
    intent: "ASK_EATEN"
  },

  // 3. "majhe jevn zal"
  {
    patterns: [
      /\b(?:majhe?|mazan?|majha|maza|majh|माझं|माझे)\s+(?:jevn|jevan|जेवण)\s+(?:zal|zala|jhala|झालं|झाले)\b/i
    ],
    marathi: "माझं जेवण झालं.",
    english: "I have eaten / I had my meal.",
    category: "food",
    intent: "STATEMENT_EATEN"
  },

  // 4. "tu kasa ahes"
  {
    patterns: [
      /\btu\s+(?:kasa|kasi|ks)\s+(?:ahes|aahes)\b/i,
      /\b(?:tumi|tumhi)\s+(?:kase|kashi)\s+(?:ahat|aahat)\b/i,
      /\bतू\s+कसा\s+आहेस\b/i,
      /\bतुम्ही\s+कसे\s+आहात\b/i
    ],
    marathi: "तू कसा आहेस?",
    english: "How are you?",
    category: "greeting",
    intent: "ASK_HOW_ARE_YOU"
  },

  // 5. "kay chalalay" / "kay kartoy"
  {
    patterns: [
      /\bkay\s+(?:chalalay|chalu\s+ahe|kartoy|kartes|challa|chalay)\b/i,
      /\bकाय\s+(?:चाललंय|करतोय|चालू\s+आहे)\b/i
    ],
    marathi: "काय चाललंय? / काय करतोय?",
    english: "What are you doing? / What's going on?",
    category: "greeting",
    intent: "ASK_WHAT_DOING"
  },

  // 6. "mala english shikaycha aahe" / "mala English bolayla practice karaychi aahe"
  {
    patterns: [
      /\bmala\s+english\s+(?:bolayla\s+)?practice\s+(?:karaychi|karaycha)\s*(?:aa?he)?\b/i,
      /\bmala\s+english\s+shikaycha\s+aa?he\b/i,
      /\bmala\s+ingraji\s+shikaych\s+ahe\b/i,
      /\bmala\s+english\s+bolaycha\s+aa?he\b/i,
      /\bmala\s+english\s+shikaychay\b/i,
      /\bमला\s+इंग्रजी\s+शिकायचं\s+आहे\b/i,
      /\bमला\s+english\s+बोलायला\s+practice\s+करायची\s+आहे\b/i,
      /\bmala\s+english\s+बोलायला\s+practice\s+karaychi\s+aahe\b/i
    ],
    marathi: "मला इंग्रजी बोलायला practice करायची आहे.",
    english: "I want to practice speaking English.",
    category: "learning",
    intent: "WANT_PRACTICE_ENGLISH"
  },

  // 7. "interview" / "aaj majha interview aahe"
  {
    patterns: [
      /\b(?:aaj|aajcha)\s+(?:majha|maza|माझं)?\s*interview\s+aa?he\b/i,
      /\binterview\s+chi\s+tayari\s+(?:karaychi|karaycha)\s*(?:aa?he)?\b/i,
      /\b(?:interview\s+aahe|interview\s+ahe).*?how\s+should\s+i\s+prepare\b/i,
      /\bआज\s+माझं\s+interview\s+आहे\b/i
    ],
    marathi: "आज माझं interview आहे, how should I prepare? / मला interview ची तयारी करायची आहे.",
    english: "I have an interview today, how should I prepare? / I want to prepare for an interview.",
    category: "interview",
    intent: "INTERVIEW_PREP"
  },

  // 8. "mi college la jat aahe"
  {
    patterns: [
      /\bmi\s+college\s+la\s+jat\s+aa?he\b/i,
      /\bmi\s+collegela\s+jat\s+ahe\b/i,
      /\bmi\s+college\s+madhe\s+aa?he\b/i,
      /\bमी\s+कॉलेजला\s+जात\s+आहे\b/i
    ],
    marathi: "मी कॉलेजला जात आहे.",
    english: "I am going to college.",
    category: "college",
    intent: "GOING_COLLEGE"
  },

  // 9. "udya college la jaycha aahe"
  {
    patterns: [
      /\budya\s+college\s+la\s+jaycha\s+aa?he\b/i,
      /\budya\s+collegela\s+jaych\s+ahe\b/i,
      /\bmala\s+udya\s+college\s+la\s+jaych(?:a|ay)\b/i,
      /\bउद्या\s+कॉलेजला\s+जायचं\s+आहे\b/i
    ],
    marathi: "उद्या कॉलेजला जायचं आहे.",
    english: "I have to go to college tomorrow.",
    category: "college",
    intent: "TOMORROW_COLLEGE"
  },

  // 10. "aaj college madhe presentation aahe"
  {
    patterns: [
      /\baaj\s+college\s+madhe\s+presentation\s+aa?he\b/i,
      /\bआज\s+college\s+मध्ये\s+presentation\s+आहे\b/i,
      /\bcollege\s+madhe\s+presentation\b/i
    ],
    marathi: "आज college मध्ये presentation आहे.",
    english: "I have a presentation in college today.",
    category: "college",
    intent: "COLLEGE_PRESENTATION"
  },

  // 11. "udya bhetu"
  {
    patterns: [
      /\budya\s+(?:bhetu|bhetuya)\b/i,
      /\bmag\s+bhetu\b/i,
      /\bnantar\s+bhetu\b/i,
      /\bउद्या\s+भेटू\b/i
    ],
    marathi: "उद्या भेटू.",
    english: "See you tomorrow.",
    category: "farewell",
    intent: "SEE_YOU_TOMORROW"
  },

  // 12. "kuthe ahes"
  {
    patterns: [
      /\bkuthe\s+(?:ahes|aahes|chalala|chalalas)\b/i,
      /\bकुठे\s+आहेस\b/i
    ],
    marathi: "कुठे आहेस?",
    english: "Where are you?",
    category: "location",
    intent: "ASK_LOCATION"
  },

  // 13. "mala samjat nahi"
  {
    patterns: [
      /\bmala\s+(?:samjat|samajla|kalala)\s+nahi\b/i,
      /\bkalat\s+nahi\b/i,
      /\bमला\s+समजत\s+नाही\b/i
    ],
    marathi: "मला समजत नाही.",
    english: "I do not understand.",
    category: "conversation",
    intent: "DO_NOT_UNDERSTAND"
  },

  // 14. "shubh sakal"
  {
    patterns: [
      /\b(?:shubh\s+sakal|shubhodaya)\b/i,
      /\bशुभ\s+सकाळ\b/i
    ],
    marathi: "शुभ सकाळ!",
    english: "Good morning!",
    category: "greeting",
    intent: "GREETING_MORNING"
  },

  // 15. "shubh ratri"
  {
    patterns: [
      /\bshubh\s+ratree?\b/i,
      /\bशुभ\s+रात्री\b/i
    ],
    marathi: "शुभ रात्री!",
    english: "Good night!",
    category: "greeting",
    intent: "GREETING_NIGHT"
  },

  // 16. "khup chhan"
  {
    patterns: [
      /\b(?:khup\s+chhan|chan\s+ahe|khup\s+chan)\b/i,
      /\bखूप\s+छान\b/i
    ],
    marathi: "खूप छान आहे.",
    english: "It is very nice / Great.",
    category: "praise",
    intent: "PRAISE"
  }
];

// Core vocabulary for identifying Roman Marathi terms
const ROMAN_MARATHI_KEYWORDS = new Set([
  "jevn", "jevan", "jevna", "zal", "zala", "jhala", "jhale", "ks", "kasa", "kashi", "kase",
  "kay", "mala", "tula", "tyala", "tila", "aamhi", "tumhi", "mahit", "mahiti", "nahi", "naahi",
  "yach", "yacha", "yachi", "yache", "ans", "uttar", "dyaych", "dyaycha", "dyaychi", "karaych",
  "karaycha", "karaychi", "aahe", "ahe", "ahes", "aahes", "ahat", "aahat", "hota", "hoti", "hote",
  "udya", "kal", "aaj", "diwas", "divas", "shikaych", "shikaycha", "shikaychay", "bolaych",
  "bolaycha", "samjat", "samajla", "kalala", "kuthe", "kadhi", "kiti", "bhetu", "bhetuya",
  "madat", "abhyas", "shala", "kam", "ghar", "ghari", "mitra", "pani", "chaha", "khup", "chhan", "chan"
]);

// Detect script and language mode
const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'english';
  const clean = text.trim();

  // Check Devanagari Unicode block
  const devanagariRegex = /[\u0900-\u097F]/;
  const hasDevanagari = devanagariRegex.test(clean);

  // Check Latin letters
  const latinRegex = /[a-zA-Z]/;
  const hasLatin = latinRegex.test(clean);

  if (hasDevanagari && hasLatin) {
    return 'mixed'; // Mixed Devanagari + English
  }

  if (hasDevanagari && !hasLatin) {
    return 'marathi';
  }

  // Pure Latin: check if contains Roman Marathi keywords
  const words = clean.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'english';

  let marathiMatches = 0;
  for (const w of words) {
    if (ROMAN_MARATHI_KEYWORDS.has(w)) {
      marathiMatches++;
    }
  }

  // Check phrase dictionary match directly
  for (const phrase of PHRASE_DICTIONARY) {
    for (const pattern of phrase.patterns) {
      if (pattern.test(clean)) {
        return 'roman_marathi';
      }
    }
  }

  if (marathiMatches >= 2 || (marathiMatches === 1 && words.length <= 3)) {
    return 'roman_marathi';
  }

  if (marathiMatches > 0 && words.length > 3) {
    return 'mixed';
  }

  return 'english';
};

// Process Roman Marathi and return whole-sentence normalized meaning
const processRomanMarathi = (text) => {
  const clean = text.trim();
  const normalizedText = normalizeRomanMarathiText(clean);

  // 1. Check exact phrase and semantic intent dictionary first (both original and normalized)
  for (const item of PHRASE_DICTIONARY) {
    for (const pattern of item.patterns) {
      if (pattern.test(clean) || pattern.test(normalizedText)) {
        return {
          isRomanMarathi: true,
          normalizedMarathi: item.marathi,
          englishTranslation: item.english,
          category: item.category,
          intent: item.intent
        };
      }
    }
  }

  // 2. Semantic clause checks
  const lower = clean.toLowerCase();
  
  if (/mala\b.*?\b(?:shik|bol|practice)\b/i.test(lower)) {
    return {
      isRomanMarathi: true,
      normalizedMarathi: "मला इंग्रजी बोलायला शिकायचं / practice करायची आहे.",
      englishTranslation: "I want to practice speaking English.",
      category: "learning",
      intent: "WANT_PRACTICE_ENGLISH"
    };
  }

  if (/mahit\s+nahi|mahiti\s+nahi|samjat\s+nahi/i.test(lower)) {
    return {
      isRomanMarathi: true,
      normalizedMarathi: "मला माहित नाही.",
      englishTranslation: "I don't know / I'm not sure.",
      category: "conversation",
      intent: "DO_NOT_KNOW"
    };
  }

  if (/jevn|jevan|jevna/i.test(lower)) {
    return {
      isRomanMarathi: true,
      normalizedMarathi: "जेवण झालं का?",
      englishTranslation: "Have you eaten?",
      category: "food",
      intent: "ASK_EATEN"
    };
  }

  if (/kasa\s+ahes|kashi\s+ahes|kase\s+ahat/i.test(lower)) {
    return {
      isRomanMarathi: true,
      normalizedMarathi: "तू कसा आहेस?",
      englishTranslation: "How are you?",
      category: "greeting",
      intent: "ASK_HOW_ARE_YOU"
    };
  }

  // Generic Roman Marathi detected: return clean sentence interpretation (never word-by-word string concatenation)
  return {
    isRomanMarathi: true,
    normalizedMarathi: clean,
    englishTranslation: null,
    category: "general",
    intent: "CONVERSATIONAL_MARATHI"
  };
};

// Translate Devanagari Marathi to English
const translateMarathiToEnglish = (text) => {
  const clean = text.trim();

  for (const item of PHRASE_DICTIONARY) {
    if (clean.includes(item.marathi.replace(/[.?!]/g, '')) || item.marathi.includes(clean)) {
      return item.english;
    }
  }

  const DEVANAGARI_MAP = {
    "माझं जेवण झालं": "I have eaten / I had my meal.",
    "माझे जेवण झाले": "I had my meal / I have eaten.",
    "जेवण झालं का": "Have you eaten?",
    "तू कसा आहेस": "How are you?",
    "तुम्ही कसे आहात": "How are you?",
    "काय चाललंय": "What's going on?",
    "काय करतोय": "What are you doing?",
    "मला इंग्रजी शिकायचं आहे": "I want to learn English.",
    "मी कॉलेजला जात आहे": "I am going to college.",
    "उद्या भेटू": "See you tomorrow.",
    "कुठे आहेस": "Where are you?",
    "मला समजत नाही": "I do not understand.",
    "मला माहित नाही": "I do not know.",
    "आज कॉलेजमध्ये प्रेझेंटेशन आहे": "I have a presentation in college today.",
    "आज college मध्ये presentation आहे": "I have a presentation in college today."
  };

  for (const [key, val] of Object.entries(DEVANAGARI_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return val;
    }
  }

  return null;
};

module.exports = {
  detectLanguage,
  processRomanMarathi,
  translateMarathiToEnglish,
  normalizeRomanMarathiText,
  PHRASE_DICTIONARY
};
