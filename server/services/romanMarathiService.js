/**
 * Roman Marathi & Multilingual Understanding Service
 * Handles:
 * 1. Language Detection (English, Devanagari Marathi, Roman Marathi, Mixed)
 * 2. Roman Marathi Normalization (spelling variation tolerance, phonetic mapping)
 * 3. Devanagari Representation
 * 4. Contextual English Meaning (Sentence-level semantic translation, NOT word-by-word)
 */

const https = require('https');

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
  "aaj": "aaj", "aj": "aaj", "udya": "udya", "kal": "kal", "parva": "parva", "parwa": "parva",
  "maz": "maza", "madye": "madhe",
  "bhiti": "bhiti", "bheeti": "bhiti", "vatate": "vatate", "vatte": "vatate",
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
    intent: "ASK_HOW_TO_ANSWER",
    learningSupport: {
      naturalEnglish: "I don't know how to answer this.",
      simpleExplanation: "Use this phrase when you are unsure of the right words or information to reply.",
      example: "I don't know how to answer this question right now, but let me think."
    }
  },

  // 1b. "mala English samjat nahi"
  {
    patterns: [
      /\b(?:mala|मला)\s+(?:english|इंग्रजी)\s+(?:samjat|समजत)\s+(?:nahi|नाही)\b/i,
      /\b(?:mala|मला)\s+(?:samjat|समजत)\s+(?:nahi|नाही)\b/i
    ],
    marathi: "मला English समजत नाही.",
    english: "I don't understand English.",
    category: "learning_help",
    intent: "DONT_UNDERSTAND_ENGLISH",
    learningSupport: {
      naturalEnglish: "I don't understand English.",
      simpleExplanation: "A clear way to express that you are having trouble following spoken or written English.",
      example: "I don't understand English well yet, could you speak a bit slower?"
    }
  },

  // 1c. "mala english madhe answer deta yet nahi" / "मला इंग्रजीमध्ये answer देता येत नाही."
  {
    patterns: [
      /(?:mala|मला)?.*?(?:english|इंग्रजी)?.*?(?:madhe|मध्ये)?.*?(?:answer|uttar|उत्तर|bolta|बोलता)?.*?(?:deta\s+yet\s+nahi|yet\s+nahi|देता\s+येत\s+नाही|येत\s+नाही)/i,
      /\b(?:deta|dyayla)\s+(?:yet|jamt)\s+nahi\b/i
    ],
    marathi: "मला इंग्रजीमध्ये answer देता येत नाही.",
    english: "I can't answer in English.",
    category: "learning_help",
    intent: "CANNOT_ANSWER_ENGLISH",
    learningSupport: {
      naturalEnglish: "I can't answer in English.",
      simpleExplanation: "This clearly expresses that you are currently unable to respond in English.",
      example: "I can't answer in English right now, but I am learning every day."
    }
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
    intent: "ASK_EATEN",
    learningSupport: {
      naturalEnglish: "Have you eaten?",
      simpleExplanation: "In English, we ask 'Have you eaten?' to check if someone has had their meal or food.",
      example: "Have you eaten yet, or should we order lunch together?"
    }
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

  // 6a. "mala english shikaycha aahe" / "मला इंग्रजी शिकायची आहे."
  {
    patterns: [
      /\b(?:mala|मला)\s+(?:english|ingraji|इंग्रजी|इंग्लिश)\s+(?:shikaych[aeiy]*|शिकाय[चचीचेचा])\s*(?:aa?he|आहे)?\b/i,
      /\b(?:mala|मला)\s+(?:shikaych[aeiy]*|शिकाय[चचीचेचा])\s+(?:aa?he|आहे)\s+(?:english|ingraji|इंग्रजी|इंग्लिश)\b/i,
      /\bmala\s+english\s+shikaychay\b/i,
      /\bmala\s+ingraji\s+shikaych\s+ahe\b/i
    ],
    marathi: "मला इंग्रजी शिकायची आहे.",
    english: "I want to learn English.",
    category: "learning",
    intent: "WANT_LEARN_ENGLISH",
    learningSupport: {
      naturalEnglish: "I want to learn English.",
      simpleExplanation: "Use 'I want to learn...' to express a desire or goal to acquire a new language or skill.",
      example: "I want to learn English so I can speak with confidence."
    }
  },

  // 6b. "mala English bolayla practice karaychi aahe" / "मला इंग्रजी बोलायला practice करायची आहे"
  {
    patterns: [
      /\bmala\s+english\s+(?:bolayla\s+)?practice\s+(?:karaychi|karaycha)\s*(?:aa?he)?\b/i,
      /\b(?:mala|मला)\s+(?:english|इंग्रजी)\s+बोलायला\s+(?:practice|सराव)\s+करायची\s+आहे\b/i,
      /\bmala\s+english\s+बोलायला\s+practice\s+karaychi\s+aahe\b/i
    ],
    marathi: "मला इंग्रजी बोलायला practice करायची आहे.",
    english: "I want to practice speaking English.",
    category: "learning",
    intent: "WANT_PRACTICE_ENGLISH",
    learningSupport: {
      naturalEnglish: "I want to practice speaking English.",
      simpleExplanation: "Use this to express your desire to practice spoken English skills.",
      example: "I want to practice speaking English every day."
    }
  },

  // 6c. "मला आज कॉलेजला जायचं आहे" / "mala aaj college la jaych ahe"
  {
    patterns: [
      /\b(?:mala|मला)\s+(?:aaj|aj|आज)\s+(?:college|कॉलेज)(?:la|ला)?\s+(?:jaych[aeiy]*|jaaych[aeiy]*|जाय[चचीचेचा])\s*(?:aa?he|आहे)?\b/i,
      /\b(?:mala|मला)\s+(?:college|कॉलेज)(?:la|ला)?\s+(?:jaych[aeiy]*|jaaych[aeiy]*|जाय[चचीचेचा])\s*(?:aa?he|आहे)?\b/i
    ],
    marathi: "मला आज कॉलेजला जायचं आहे.",
    english: "I have to go to college today.",
    category: "college",
    intent: "HAVE_TO_GO_COLLEGE",
    learningSupport: {
      naturalEnglish: "I have to go to college today.",
      simpleExplanation: "We use 'I have to...' to express an obligation or plan to do something today.",
      example: "I have to go to college today because we have an important lecture."
    }
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

  // 10b. "parva maz presentation ahe ani mala english madye problem jate"
  {
    patterns: [
      /\bparva\b.*?(?:presentation|speech).*?(?:problem|adchan|trass|difficulty)/i,
      /\b(?:parva|udya|aaj)\b.*?(?:maz|maza|majha|माझं)?\s*presentation.*?english.*?(?:problem|jate|yeto|adchan)/i,
      /\bmala\s+english\s+mad[hy]e\s+problem\s+(?:jate|yeto)\b/i,
      /परवा\s+माझं\s+presentation\s+आहे.*?English.*?problem/i
    ],
    marathi: "परवा माझं presentation आहे आणि मला English मध्ये problem जाते.",
    english: "I have a presentation the day after tomorrow, and I have difficulty speaking in English.",
    category: "presentation",
    intent: "PRESENTATION_PROBLEM_PARVA"
  },

  // 10c. "mala udya presentation ahe ani mala english madhe problem jate"
  {
    patterns: [
      /(?:mala|मला)?\s*(?:udya|उद्या)\s*(?:presentation|speech)\s*(?:ahe|aahe|आहे).*?(?:english|इंग्रजी).*?(?:problem|adchan|अडचण)/i,
      /उद्या\s+माझं\s+presentation\s+आहे\s+आणि\s+मला\s+English\s+मध्ये\s+problem\s+जाते/i
    ],
    marathi: "मला उद्या presentation आहे आणि मला English मध्ये problem जाते.",
    english: "I have a presentation tomorrow and I have difficulty speaking English.",
    category: "presentation",
    intent: "PRESENTATION_PROBLEM_UDYA"
  },

  // 10d. "mala interview la english bolayla bhiti vatate"
  {
    patterns: [
      /interview.*?(?:bolayla|bolnyachi|bolnyas).*?(?:bhiti|bheeti|darr|fear|nervous)/i,
      /interview.*?english.*?(?:bhiti|bheeti)\s+vat(?:ate|te)/i,
      /मला\s+interview\s+ला\s+english\s+बोलायला\s+भीती\s+वाटते/i
    ],
    marathi: "मला interview ला english बोलायला भीती वाटते.",
    english: "I feel nervous speaking English during interviews.",
    category: "interview",
    intent: "INTERVIEW_FEAR"
  },

  // 10e. "मला आज कॉलेजला जायचं आहे" / "mala aaj college la jaycha ahe"
  {
    patterns: [
      /(?:mala|मला)?\s*(?:aaj|aj|आज)\s*(?:college|collegela|कॉलेज)\s*(?:la|ला)?\s*(?:jaycha|jaych|jaychay|जायचं)\s*(?:aa?he|ahe|आहे)?/i,
      /\b(?:aaj|aj|आज)\s+(?:college|collegela|कॉलेज)\s*(?:la|ला)?\s*(?:jaycha|jaych|जायचं)\b/i,
      /\bमला\s+आज\s+कॉलेजला\s+जायचं\s+आहे\b/i
    ],
    marathi: "मला आज कॉलेजला जायचं आहे.",
    english: "I have to go to college today.",
    category: "college",
    intent: "TODAY_COLLEGE",
    learningSupport: {
      naturalEnglish: "I have to go to college today.",
      simpleExplanation: "We use 'I have to...' to express an obligation or plan to do something today.",
      example: "I have to go to college today because we have an important lecture."
    }
  },

  // 10f. "mala English bolayla bhiti vatate" / "मला English बोलायला भीती वाटते"
  {
    patterns: [
      /(?:mala|मला)?\s*(?:english|इंग्रजी)?\s*(?:bolayla|bolnyachi|बोलायला).*?(?:bhiti|bheeti|भीती)\s*(?:vatate|vatte|वाटते)/i,
      /\b(?:english|इंग्रजी)\s+(?:bolayla|बोलायला)\s+(?:bhiti|भीती)\s+(?:vatate|वाटते)\b/i,
      /\b(?:bhiti|bheeti)\s+(?:vatate|vatte)\b/i,
      /\bमला\s+english\s+बोलायला\s+भीती\s+वाटते\b/i
    ],
    marathi: "मला English बोलायला भीती वाटते.",
    english: "I am afraid to speak English.",
    category: "confidence",
    intent: "SPEAKING_FEAR",
    learningSupport: {
      naturalEnglish: "I am afraid to speak English.",
      simpleExplanation: "This is a natural way to express that you feel nervous or scared when speaking English.",
      example: "I am afraid to speak English in front of my classmates."
    }
  },

  // 10g. "Today mala college madhe presentation hota." / "aaj college madhe presentation hota"
  {
    patterns: [
      /(?:today|aaj|आज)\s+(?:mala|मला)?\s*(?:college|कॉलेज)\s*(?:madhe|मध्ये)\s*presentation\s*(?:hota|hote|होतं|होता)/i,
      /\bpresentation\s+(?:hota|hote|होतं|होता)\b/i
    ],
    marathi: "आज कॉलेजमध्ये presentation होतं.",
    english: "Today, I had a presentation at college.",
    category: "college",
    intent: "COLLEGE_PRESENTATION_PAST"
  },

  // 10h. Translation requests: "English madhe kasa mhantat?" / "translate this into English"
  {
    patterns: [
      /(?:english\s+madhe\s+kasa\s+mhantat|kasa\s+mhantat|kasa\s+bolaycha|kasa\s+boltat)/i,
      /(?:translate\s+(?:this\s+)?into\s+english|how\s+to\s+say\s+(?:this\s+)?in\s+english|how\s+do\s+you\s+say\s+(?:this\s+)?in\s+english)/i,
      /इंग्रजीत\s+कसं\s+(?:म्हणतात|बोलायचं)/i
    ],
    marathi: "English मध्ये कसं म्हणतात?",
    english: "How do you say this in English?",
    category: "translation",
    intent: "ASK_TRANSLATION"
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
  "udya", "kal", "aaj", "aj", "parva", "parwa", "diwas", "divas", "shikaych", "shikaycha", "shikaychay", "bolaych",
  "bolaycha", "samjat", "samajla", "kalala", "kuthe", "kadhi", "kiti", "bhetu", "bhetuya",
  "madat", "abhyas", "shala", "kam", "ghar", "ghari", "mitra", "pani", "chaha", "khup", "chhan", "chan",
  "maz", "madye", "madhe", "bhiti", "bheeti", "vatate", "vatte", "problem", "jate", "yeto",
  "jaycha", "jaych", "jaychay", "bolayla", "jaych", "deta", "yet"
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
          learningSupport: item.learningSupport || {
            naturalEnglish: item.english,
            simpleExplanation: `A natural English sentence to express this thought in everyday conversation.`,
            example: `Practice saying this sentence aloud to build fluency.`
          },
          category: item.category,
          intent: item.intent
        };
      }
    }
  }

  // 2. Semantic clause checks
  const lower = clean.toLowerCase();
  
  if (/mala\b.*?\b(?:shik|bol|practice)\b/i.test(lower)) {
    const english = "I want to practice speaking English.";
    return {
      isRomanMarathi: true,
      normalizedMarathi: "मला इंग्रजी बोलायला शिकायचं / practice करायची आहे.",
      englishTranslation: english,
      learningSupport: {
        naturalEnglish: english,
        simpleExplanation: "Use this to politely let others know that you want to practice your spoken English.",
        example: "I want to practice speaking English every morning with my tutor."
      },
      category: "learning",
      intent: "WANT_PRACTICE_ENGLISH"
    };
  }

  if (/mahit\s+nahi|mahiti\s+nahi|samjat\s+nahi/i.test(lower)) {
    const english = "I don't know.";
    return {
      isRomanMarathi: true,
      normalizedMarathi: "मला माहित नाही.",
      englishTranslation: english,
      learningSupport: {
        naturalEnglish: english,
        simpleExplanation: "A straightforward, polite expression when you do not possess the required information.",
        example: "I don't know the exact schedule yet, but I will check and let you know."
      },
      category: "conversation",
      intent: "DO_NOT_KNOW"
    };
  }

  if (/jevn|jevan|jevna/i.test(lower)) {
    const english = "Have you eaten?";
    return {
      isRomanMarathi: true,
      normalizedMarathi: "जेवण झालं का?",
      englishTranslation: english,
      learningSupport: {
        naturalEnglish: english,
        simpleExplanation: "In English, we ask 'Have you eaten?' to check if someone has had their meal or food.",
        example: "Have you eaten yet, or should we order lunch together?"
      },
      category: "food",
      intent: "ASK_EATEN"
    };
  }

  if (/kasa\s+ahes|kashi\s+ahes|kase\s+ahat/i.test(lower)) {
    const english = "How are you?";
    return {
      isRomanMarathi: true,
      normalizedMarathi: "तू कसा आहेस?",
      englishTranslation: english,
      learningSupport: {
        naturalEnglish: english,
        simpleExplanation: "The most common and friendly greeting to ask about someone's wellbeing.",
        example: "Hello! How are you doing today?"
      },
      category: "greeting",
      intent: "ASK_HOW_ARE_YOU"
    };
  }

  // Generic Roman Marathi detected: return clean sentence interpretation
  return {
    isRomanMarathi: true,
    normalizedMarathi: clean,
    englishTranslation: null,
    learningSupport: null,
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
    "माझं जेवण झालं": "I have eaten.",
    "माझे जेवण झाले": "I have eaten.",
    "जेवण झालं का": "Have you eaten?",
    "तू कसा आहेस": "How are you?",
    "तुम्ही कसे आहात": "How are you?",
    "काय चाललंय": "What's going on?",
    "काय करतोय": "What are you doing?",
    "मला इंग्रजी शिकायचं आहे": "I want to learn English.",
    "मला इंग्रजी शिकायची आहे": "I want to learn English.",
    "मला इंग्रजी शिकायचे आहे": "I want to learn English.",
    "मला इंग्रजी शिकायचा आहे": "I want to learn English.",
    "मला इंग्लिश शिकायची आहे": "I want to learn English.",
    "मला इंग्लिश शिकायचं आहे": "I want to learn English.",
    "मी कॉलेजला जात आहे": "I am going to college.",
    "उद्या भेटू": "See you tomorrow.",
    "कुठे आहेस": "Where are you?",
    "मला समजत नाही": "I do not understand.",
    "मला माहित नाही": "I do not know.",
    "आज कॉलेजमध्ये प्रेझेंटेशन आहे": "I have a presentation in college today.",
    "आज college मध्ये presentation आहे": "I have a presentation in college today.",
    "आज कॉलेजमध्ये presentation होतं": "Today, I had a presentation at college.",
    "मला आज कॉलेजला जायचं आहे": "I have to go to college today.",
    "मला आज कॉलेजला जायचे आहे": "I have to go to college today.",
    "मला आज कॉलेजला जायचा आहे": "I have to go to college today.",
    "मला कॉलेजला जायचं आहे": "I have to go to college.",
    "मला कॉलेजला जायचे आहे": "I have to go to college.",
    "मला अभ्यास करायचा आहे": "I want to study.",
    "मला मदत हवी आहे": "I need help.",
    "मला मदत पाहिजे": "I need help.",
    "मला इंग्रजी बोलायला भीती वाटते": "I am afraid to speak English.",
    "मला English बोलायला भीती वाटते": "I am afraid to speak English.",
    "मला इंग्रजीमध्ये answer देता येत नाही": "I can't answer in English.",
    "मला English मध्ये answer देता येत नाही": "I can't answer in English."
  };

  for (const [key, val] of Object.entries(DEVANAGARI_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return val;
    }
  }

  return null;
};

// Map Roman Marathi words & common variations to Marathi Devanagari
const ROMAN_TO_MARATHI_MAP = {
  "mala": "मला", "tula": "तुला", "tyala": "त्याला", "tila": "तिला",
  "amhi": "आम्ही", "aamhi": "आम्ही", "tumhi": "तुम्ही", "tumi": "तुम्ही",
  "mi": "मी", "mee": "मी", "tu": "तू",
  "aj": "आज", "aaj": "आज", "udya": "उद्या", "kal": "काल", "parva": "परवा", "parwa": "परवा",
  "college": "कॉलेज", "la": "ला", "madhe": "मध्ये", "madye": "मध्ये",
  "jaych": "जायचं", "jaycha": "जायचं", "jaaych": "जायचं", "jaaycha": "जायचं",
  "ahe": "आहे", "aahe": "आहे", "ahes": "आहेस", "aahes": "आहेस", "ahat": "आहात", "aahat": "आहात",
  "hota": "होता", "hoti": "होती", "hote": "होते",
  "mahit": "माहित", "mahiti": "माहिती", "maheeth": "माहित",
  "samjat": "समजत", "samajla": "समजलं", "samajle": "समजले",
  "nahi": "नाही", "naahi": "नाही", "nahiy": "नाही", "nay": "नाही",
  "yach": "याचं", "yacha": "याचा", "yachi": "याची", "yache": "याचे",
  "ans": "answer", "answer": "answer", "uttar": "उत्तर",
  "ks": "कसं", "kasa": "कसं", "kashi": "कशी", "kase": "कसे",
  "dyaych": "द्यायचं", "dyaycha": "द्यायचं", "daycha": "द्यायचं", "dyave": "द्यावे",
  "english": "English", "ingreji": "इंग्रजी",
  "bolayla": "बोलायला", "bolaych": "बोलायचं", "bolta": "बोलता", "bolto": "बोलतो", "bolte": "बोलते",
  "bhiti": "भीती", "bheeti": "भीती",
  "vatate": "वाटते", "vatte": "वाटते", "watate": "वाटते",
  "jevn": "जेवण", "jevan": "जेवण", "jevna": "जेवण", "jevlis": "जेवलीस", "jevla": "जेवला",
  "zal": "झालं", "zala": "झालं", "zali": "झाली", "jhala": "झालं", "jhale": "झाले",
  "ka": "का", "kaa": "का", "kay": "काय", "kaay": "काय",
  "kuthe": "कुठे", "kothe": "कुठे", "kadhi": "कधी", "kiti": "किती",
  "shikaych": "शिकायचं", "shikaycha": "शिकायचं", "shikto": "शिकतो", "shikte": "शिकते",
  "karaych": "करायचं", "karaycha": "करायचं", "kartoy": "करतोय", "kartes": "करतेस",
  "ghari": "घरी", "ghar": "घरी", "kam": "काम", "kaam": "काम",
  "khup": "खूप", "khoop": "खूप", "chhan": "छान", "chan": "छान",
  "bhetu": "भेटू", "bhetuya": "भेटूया", "ho": "हो", "ha": "हो",
  "nakki": "नक्की", "lavkar": "लवकर", "sang": "सांग", "sanga": "सांगा",
  "yenar": "येणार", "janar": "जाणार", "bhuk": "भूक", "lagli": "लागली",
  "paani": "पाणी", "pani": "पाणी", "dya": "द्या", "ghya": "घ्या"
};

// Convert Roman Marathi words/variations into natural Marathi Devanagari
const convertRomanMarathiToDevanagari = (text) => {
  let res = text.trim();
  // Multi-word phrases and idioms first
  res = res.replace(/\bcollege\s+la\b/gi, 'कॉलेजला');
  res = res.replace(/\bdeta\s+yet\s+nahi\b/gi, 'देता येत नाही');
  res = res.replace(/\bbhiti\s+(?:vatate|vatte|watate)\b/gi, 'भीती वाटते');
  res = res.replace(/\byach\s+(?:ans|answer)\b/gi, 'याचं answer');
  res = res.replace(/\b(?:ans|answer)\s+ks\s+dyaych\b/gi, 'answer कसं द्यायचं');
  res = res.replace(/\bjevn\s+(?:zal|zala|jhala)\s+ka\b/gi, 'जेवण झालं का');

  const tokens = res.split(/(\s+|[.,?!;:])/);
  const converted = tokens.map(token => {
    const cleanWord = token.toLowerCase();
    return ROMAN_TO_MARATHI_MAP[cleanWord] || token;
  });

  return converted.join('');
};

// Local rule-based translation for common Marathi grammar patterns and vocabulary
const translateMarathiRuleBased = (text) => {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();

  // 1. Desire / Intention: मला [X] शिकायची / शिकायचं / शिकायचे / शिकायचा आहे
  const learnPattern = clean.match(/मला\s+(.*?)\s+शिकाय[चचीचेचा]\s+(?:आहे|नाही)/i);
  if (learnPattern) {
    const topic = learnPattern[1].trim();
    const isNeg = clean.includes('नाही');
    const topicMap = {
      'इंग्रजी': 'English',
      'इंग्लिश': 'English',
      'मराठी': 'Marathi',
      'हिंदी': 'Hindi',
      'संगणक': 'computers',
      'कोडिंग': 'coding',
      'गाडी चालवायला': 'to drive',
      'गाणे': 'to sing',
      'पोहणे': 'to swim',
      'नवीन भाषा': 'a new language'
    };
    const topicEng = topicMap[topic] || topic;
    return isNeg ? `I do not want to learn ${topicEng}.` : `I want to learn ${topicEng}.`;
  }

  // e.g. मला [आज/उद्या/काल] [X]ला जायचं / जायची / जायचे आहे
  const goPattern = clean.match(/मला\s+(?:(आज|उद्या|काल)\s+)?(.*?)(?:ला)?\s+जाय[चचीचेचा]\s+(?:आहे|नाही)/i);
  if (goPattern) {
    const timeWord = goPattern[1] || '';
    const dest = goPattern[2].trim();
    const isNeg = clean.includes('नाही');
    const destMap = {
      'कॉलेज': 'college',
      'शाळा': 'school',
      'शाळेत': 'school',
      'ऑफिस': 'office',
      'ऑफिसला': 'office',
      'घरी': 'home',
      'गावाला': 'my village',
      'गावी': 'my village',
      'बाहेर': 'out',
      'मार्केट': 'the market'
    };
    const destEng = destMap[dest] || dest;
    const timeEng = timeWord === 'आज' ? ' today' : timeWord === 'उद्या' ? ' tomorrow' : '';
    return isNeg
      ? `I do not have to go to ${destEng}${timeEng}.`
      : `I have to go to ${destEng}${timeEng}.`;
  }

  // e.g. मला [X] करायचा / करायची / करायचं आहे
  const doPattern = clean.match(/मला\s+(.*?)\s+कराय[चचीचेचा]\s+(?:आहे|नाही)/i);
  if (doPattern) {
    const act = doPattern[1].trim();
    const isNeg = clean.includes('नाही');
    const actMap = {
      'अभ्यास': 'study',
      'काम': 'work',
      'व्यायाम': 'exercise',
      'विश्रांती': 'rest',
      'मदत': 'help',
      'फोन': 'make a call',
      'प्रयत्न': 'try'
    };
    const actEng = actMap[act] || `do ${act}`;
    return isNeg ? `I do not want to ${actEng}.` : `I want to ${actEng}.`;
  }

  // 2. Needs / Wants: मला [X] पाहिजे / हवे आहे / हवी आहे
  const needPattern = clean.match(/मला\s+(.*?)\s+(?:पाहिजे|हवे\s+आहे|हवी\s+आहे|हवा\s+आहे|हवेत)/i);
  if (needPattern) {
    const item = needPattern[1].trim();
    const itemMap = {
      'मदत': 'help',
      'पाणी': 'water',
      'वेळ': 'time',
      'पैसे': 'money',
      'पुस्तक': 'a book',
      'सुट्टी': 'leave / a holiday'
    };
    const itemEng = itemMap[item] || item;
    return `I need ${itemEng}.`;
  }

  // 3. Continuous actions: मी [X] [verb]त आहे / नाही
  const contPattern = clean.match(/मी\s+(.*?)\s*(करत|जात|येत|शिकत|वाचत|पाहत|लिहीत|बोलत)\s+(?:आहे|नाही)/i);
  if (contPattern) {
    const obj = (contPattern[1] || '').trim();
    const verb = contPattern[2];
    const isNeg = clean.includes('नाही');
    const verbMap = {
      'करत': obj === 'अभ्यास' ? 'studying' : obj === 'काम' ? 'working' : 'doing',
      'जात': 'going',
      'येत': 'coming',
      'शिकत': 'learning',
      'वाचत': 'reading',
      'पाहत': 'watching',
      'लिहीत': 'writing',
      'बोलत': 'speaking'
    };
    const verbEng = verbMap[verb] || 'doing';
    const objMap = {
      'कॉलेजला': 'to college',
      'घरी': 'home',
      'इंग्रजी': 'English',
      'पुस्तक': 'a book',
      'टीव्ही': 'TV'
    };
    const objEng = objMap[obj] || (verb === 'करत' && (obj === 'अभ्यास' || obj === 'काम') ? '' : obj);
    const fullAction = [verbEng, objEng].filter(Boolean).join(' ');
    return isNeg ? `I am not ${fullAction}.` : `I am ${fullAction}.`;
  }

  // 4. Questions: तू / तुम्ही ...
  if (/\b(?:tu|तू)\s+(?:kasa|कसा|kashi|कशी)\s+(?:ahes|आहेस)\b/i.test(clean) ||
      /\b(?:tumhi|तुम्ही)\s+(?:kase|कसे|kashi|कशी)\s+(?:ahat|आहात)\b/i.test(clean)) {
    return 'How are you?';
  }
  if (/\b(?:tujha?|तुझं|तुझे|तुमचे)\s+नाव\s+काय\s+आहे\b/i.test(clean)) {
    return 'What is your name?';
  }
  if (/\bकाय\s+(?:करत\s+आहेस|करतोस|चाललंय)\b/i.test(clean)) {
    return "What are you doing?";
  }
  if (/\bकुठे\s+(?:आहेस|चाललास|चाललीस|राहतोस)\b/i.test(clean)) {
    return "Where are you?";
  }

  // 5. Past tense actions: मी [X] गेलो / आलो / जेवलो
  if (/\bमी\s+जेवलो\b/i.test(clean) || /\bमाझं\s+जेवण\s+झालं\b/i.test(clean)) {
    return 'I had my meal / I have eaten.';
  }
  if (/\bमी\s+अभ्यास\s+केला\b/i.test(clean)) {
    return 'I studied.';
  }
  if (/\bमी\s+कॉलेजला\s+गेलो\b/i.test(clean)) {
    return 'I went to college.';
  }

  return null;
};

// Reliable translation helper for Marathi -> English using free translation API with multi-tier fallback
const translateMarathiSentenceToEnglish = async (marathiText) => {
  // Strategy 1: MyMemory Public Translation API
  try {
    const myMemoryResult = await new Promise((resolve) => {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(marathiText)}&langpair=mr|en`;
      const req = https.get(url, (res) => {
        if (res.statusCode !== 200) return resolve(null);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const text = parsed?.responseData?.translatedText;
            if (text && !text.startsWith('MYMEMORY WARNING') && text.trim().toLowerCase() !== marathiText.trim().toLowerCase()) {
              resolve(text.trim());
            } else {
              resolve(null);
            }
          } catch (e) {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(3500, () => {
        req.destroy();
        resolve(null);
      });
    });

    if (myMemoryResult && myMemoryResult.length > 0) {
      return myMemoryResult;
    }
  } catch (err) {
    // Continue to Google fallback
  }

  // Strategy 2: Google Translate API fallback with desktop User-Agent
  try {
    const googleResult = await new Promise((resolve) => {
      const options = {
        hostname: 'translate.googleapis.com',
        path: `/translate_a/single?client=gtx&sl=mr&tl=en&dt=t&q=${encodeURIComponent(marathiText)}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      };
      const req = https.get(options, (res) => {
        if (res.statusCode !== 200) return resolve(null);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
              const fullTranslation = parsed[0].map(item => item[0]).filter(Boolean).join('');
              resolve(fullTranslation.trim());
            } else {
              resolve(null);
            }
          } catch (e) {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(2500, () => {
        req.destroy();
        resolve(null);
      });
    });

    if (googleResult && googleResult.length > 0) {
      return googleResult;
    }
  } catch (err) {
    // Continue to local rules
  }

  return null;
};

// Comprehensive Native to English Translation Orchestrator
const translateNativeToEnglish = async (rawText) => {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return {
      success: false,
      error: 'EMPTY_INPUT',
      message: 'Please enter a Marathi or Roman Marathi sentence.'
    };
  }

  const clean = rawText.trim();

  // Reject pure digits or pure punctuation/symbols without letters or Devanagari characters
  const lettersOnly = clean.replace(/[^a-zA-Z\u0900-\u097F]/g, '');
  if (lettersOnly.length < 2) {
    return {
      success: false,
      error: 'UNCLEAR',
      message: "I didn't fully understand that sentence. Please enter a valid sentence."
    };
  }

  // Reject pure gibberish with no vowels, 5+ consecutive consonants, or repetitive characters
  if (
    (!/[aeiouy\u0900-\u097F]/i.test(clean) && clean.length > 2) ||
    /[b-df-hj-np-tv-z]{5,}/i.test(clean) ||
    /(.)\1{4,}/i.test(clean)
  ) {
    return {
      success: false,
      error: 'UNCLEAR',
      message: "I didn't fully understand that sentence."
    };
  }

  const detectedLang = detectLanguage(clean);
  let englishTranslation = null;
  let marathiNormalized = clean;
  let learningSupport = null;

  // Convert Roman Marathi to Devanagari Marathi representation
  const convertedMarathi = /[\u0900-\u097F]/.test(clean)
    ? clean
    : convertRomanMarathiToDevanagari(clean);

  const normalizedRoman = normalizeRomanMarathiText(clean);

  // 1. Check phrase dictionary first across original input, converted Devanagari, and normalized text
  for (const item of PHRASE_DICTIONARY) {
    let matched = false;
    for (const pattern of item.patterns) {
      if (pattern.test(clean) || pattern.test(normalizedRoman) || pattern.test(convertedMarathi)) {
        matched = true;
        break;
      }
    }

    if (matched || clean.includes(item.marathi.replace(/[.?!]/g, '')) || convertedMarathi.includes(item.marathi.replace(/[.?!]/g, ''))) {
      englishTranslation = item.english;
      marathiNormalized = item.marathi;
      learningSupport = item.learningSupport;
      break;
    }
  }

  // 2. If not matched in PHRASE_DICTIONARY, check DEVANAGARI_MAP
  if (!englishTranslation) {
    englishTranslation = translateMarathiToEnglish(clean) || translateMarathiToEnglish(convertedMarathi);
    if (englishTranslation) {
      marathiNormalized = convertedMarathi;
    }
  }

  // 3. If still not matched, try dynamic translation engine (MyMemory + Google)
  let networkError = false;
  let lastErrorMessage = '';
  if (!englishTranslation) {
    try {
      const onlineEng = await translateMarathiSentenceToEnglish(convertedMarathi);
      if (onlineEng && onlineEng.trim()) {
        const trimmed = onlineEng.trim();
        const hasDevanagari = /[\u0900-\u097F]/.test(clean);
        const isEcho = trimmed.toLowerCase() === clean.toLowerCase() && !hasDevanagari;
        if (!isEcho) {
          englishTranslation = trimmed;
          marathiNormalized = convertedMarathi;
          learningSupport = {
            naturalEnglish: englishTranslation,
            simpleExplanation: "A natural English translation to communicate this thought effectively.",
            example: `Practice saying: "${englishTranslation}" in your daily conversations.`
          };
        }
      }
    } catch (err) {
      console.warn('Online Marathi translation warning:', err.message);
      networkError = true;
      lastErrorMessage = err.message;
    }
  }

  // 4. If still not matched, check local rule-based grammar and semantic sentence translator
  if (!englishTranslation) {
    const localEng = translateMarathiRuleBased(convertedMarathi) || translateMarathiRuleBased(clean);
    if (localEng && localEng.trim()) {
      englishTranslation = localEng.trim();
      marathiNormalized = convertedMarathi;
      learningSupport = {
        naturalEnglish: englishTranslation,
        simpleExplanation: "This is a natural way in English to express your Marathi thought clearly.",
        example: `Practice saying: "${englishTranslation}" in your daily conversations.`
      };
    }
  }

  // 5. Return result if translation was successful
  if (englishTranslation) {
    englishTranslation = englishTranslation.replace(/^\s*["']|["']\s*$/g, '').trim();

    if (!learningSupport) {
      learningSupport = {
        naturalEnglish: englishTranslation,
        simpleExplanation: `This is a natural way in English to express your Marathi thought clearly.`,
        example: `Practice saying: "${englishTranslation}" in your daily conversations.`
      };
    }

    return {
      success: true,
      original: clean,
      detectedLang,
      marathiNormalized,
      englishTranslation,
      learningSupport
    };
  }

  // 6. If network failed and no local translation could be matched, show the real error
  if (networkError) {
    return {
      success: false,
      error: 'TRANSLATION_FAILED',
      message: `Translation error: ${lastErrorMessage || 'Network connection issue'}. Please try again.`
    };
  }

  // 7. Genuinely unclear sentence
  return {
    success: false,
    error: 'UNCLEAR',
    message: "I didn't fully understand that sentence. Please check the spelling or phrasing."
  };
};

module.exports = {
  detectLanguage,
  processRomanMarathi,
  translateMarathiToEnglish,
  translateNativeToEnglish,
  normalizeRomanMarathiText,
  PHRASE_DICTIONARY
};
