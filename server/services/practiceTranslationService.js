/**
 * Practice Translation Service — SpeakWise AI
 * Handles Marathi -> English interactive translation practice.
 * Supports 4 progressive difficulty levels, Roman & Devanagari Marathi,
 * mistake diagnostics, grammar rule explanations, and context preservation.
 */

const { detectLanguage, processRomanMarathi } = require('./romanMarathiService');

// Comprehensive Sentence Bank across 4 Difficulty Levels
const PRACTICE_SENTENCES = [
  // ==========================================
  // LEVEL 1 — BEGINNER (Simple Sentences)
  // ==========================================
  {
    id: 'b1',
    level: 'beginner',
    levelName: 'Level 1 — Beginner',
    marathi: 'मी विद्यार्थी आहे.',
    roman: 'mi vidyarthi ahe',
    primaryEnglish: 'I am a student.',
    acceptable: ['I am a student.', "I'm a student.", 'I am a student'],
    grammarRule: 'Subject (I) + am + a + Noun (student)',
    ruleExplanation: 'Use "am" with the subject "I". Always place the article "a" before a singular countable noun.',
    examples: [
      'I am a teacher.',
      'I am an engineer.'
    ],
    commonMistakes: [
      { pattern: /\bi\s+(?:is|are)\b/i, explanation: 'With the subject "I", always use "am" (not "is" or "are").' },
      { pattern: /\bi\s+am\s+student\b/i, explanation: 'Remember to include the article "a" before "student": "I am a student."' }
    ]
  },
  {
    id: 'b2',
    level: 'beginner',
    levelName: 'Level 1 — Beginner',
    marathi: 'हे माझे पुस्तक आहे.',
    roman: 'he majhe pustak ahe',
    primaryEnglish: 'This is my book.',
    acceptable: ['This is my book.', 'This is my book', "It is my book.", "It's my book."],
    grammarRule: 'Demonstrative Pronoun (This) + is + Possessive (my) + Noun',
    ruleExplanation: 'Use "This is" when referring to a single object close to you.',
    examples: [
      'This is my pen.',
      'This is my laptop.'
    ],
    commonMistakes: [
      { pattern: /\bthis\s+are\b/i, explanation: 'Use "is" with singular "This", not "are".' }
    ]
  },
  {
    id: 'b3',
    level: 'beginner',
    levelName: 'Level 1 — Beginner',
    marathi: 'तो माझा मित्र आहे.',
    roman: 'to majha mitra ahe',
    primaryEnglish: 'He is my friend.',
    acceptable: ['He is my friend.', "He's my friend.", 'He is my friend'],
    grammarRule: 'Subject (He) + is + my + Noun',
    ruleExplanation: 'Use "He is" when referring to a male person in the singular third person.',
    examples: [
      'She is my sister.',
      'Rohan is my friend.'
    ],
    commonMistakes: [
      { pattern: /\bhe\s+are\b/i, explanation: 'Use "is" with singular pronoun "He".' }
    ]
  },
  {
    id: 'b4',
    level: 'beginner',
    levelName: 'Level 1 — Beginner',
    marathi: 'आम्ही आनंदी आहोत.',
    roman: 'amhi anandi ahot',
    primaryEnglish: 'We are happy.',
    acceptable: ['We are happy.', "We're happy.", 'We are happy'],
    grammarRule: 'Plural Subject (We) + are + Adjective (happy)',
    ruleExplanation: 'Use "are" with plural subjects like "We", "They", and "You".',
    examples: [
      'They are happy.',
      'We are ready.'
    ],
    commonMistakes: [
      { pattern: /\bwe\s+is\b/i, explanation: 'With plural subject "We", always use "are", not "is".' }
    ]
  },
  {
    id: 'b5',
    level: 'beginner',
    levelName: 'Level 1 — Beginner',
    marathi: 'ते शिक्षक आहेत.',
    roman: 'te shikshak ahet',
    primaryEnglish: 'They are teachers.',
    acceptable: ['They are teachers.', "They're teachers.", 'He is a teacher.'],
    grammarRule: 'Subject (They) + are + Plural Noun (teachers)',
    ruleExplanation: 'In Marathi, respect uses plural "ते", which in English translates to "They are teachers" or singular respectful "He is a teacher".',
    examples: [
      'They are doctors.',
      'He is a professor.'
    ],
    commonMistakes: [
      { pattern: /\bthey\s+is\b/i, explanation: 'With "They", use "are", not "is".' }
    ]
  },

  // ==========================================
  // LEVEL 2 — BASIC (Daily-Life Sentences)
  // ==========================================
  {
    id: 'ba1',
    level: 'basic',
    levelName: 'Level 2 — Basic',
    marathi: 'मी रोज सकाळी सात वाजता उठतो.',
    roman: 'mi roj sakali saat vajta uthto',
    primaryEnglish: 'I wake up at seven o\'clock every morning.',
    acceptable: [
      'I wake up at seven in the morning every day.',
      'I wake up at 7 AM every day.',
      'I wake up at 7 o\'clock every morning.',
      'I get up at 7 AM every day.',
      'I wake up at seven every morning.'
    ],
    grammarRule: 'Simple Present Habit: Subject (I) + V1 (wake up) + at + time + frequency',
    ruleExplanation: 'Use the preposition "at" for exact clock times (at 7:00 AM) and "in the morning" for periods of the day.',
    examples: [
      'I wake up at 6 AM every day.',
      'She wakes up at 7 o\'clock in the morning.'
    ],
    commonMistakes: [
      { pattern: /\bon\s+7\b|\bin\s+7\b/i, explanation: 'Use "at" for specific clock times, not "in" or "on".' },
      { pattern: /\beveryday\b/i, explanation: '"every day" is written as two separate words when it means each day.' }
    ]
  },
  {
    id: 'ba2',
    level: 'basic',
    levelName: 'Level 2 — Basic',
    marathi: 'तो दररोज सकाळी धावतो.',
    roman: 'to darroj sakali dhavto',
    primaryEnglish: 'He runs every morning.',
    acceptable: [
      'He runs every morning.',
      'He runs in the morning every day.',
      'He runs daily in the morning.'
    ],
    grammarRule: 'Simple Present: He / She / It + V1 + s/es',
    ruleExplanation: 'Because "He" is a third-person singular subject, add "-s" to the verb: "runs".',
    examples: [
      'She walks every morning.',
      'Rohan exercises every day.'
    ],
    commonMistakes: [
      { pattern: /\bhe\s+run\b/i, explanation: '"He" is singular. Simple Present Rule: He + V1 + s/es -> "He runs", not "He run".' }
    ]
  },
  {
    id: 'ba3',
    level: 'basic',
    levelName: 'Level 2 — Basic',
    marathi: 'मला चहा आवडतो.',
    roman: 'mala chaha aavdto',
    primaryEnglish: 'I like tea.',
    acceptable: ['I like tea.', 'I love tea.'],
    grammarRule: 'Subject (I) + like + Object (tea)',
    ruleExplanation: 'In English, the feeling/preference is expressed as "I like [thing]", not "To me tea likes".',
    examples: [
      'I like coffee.',
      'She likes fruits.'
    ],
    commonMistakes: [
      { pattern: /\bme\s+like\b/i, explanation: 'Use the subject pronoun "I", not "Me": "I like tea."' }
    ]
  },
  {
    id: 'ba4',
    level: 'basic',
    levelName: 'Level 2 — Basic',
    marathi: 'आम्ही संध्याकाळी अभ्यास करतो.',
    roman: 'amhi sandhyakali abhyas karto',
    primaryEnglish: 'We study in the evening.',
    acceptable: [
      'We study in the evening.',
      'We study every evening.',
      'We do study in the evening.'
    ],
    grammarRule: 'Subject (We) + V1 (study) + in the evening',
    ruleExplanation: 'Use "in the evening" to denote habitual time of day. "Study" is already a verb.',
    examples: [
      'They study in the afternoon.',
      'I study in the morning.'
    ],
    commonMistakes: [
      { pattern: /\bwe\s+do\s+study\b/i, explanation: 'In regular affirmative sentences, say "We study" instead of "We do study".' },
      { pattern: /\bat\s+evening\b/i, explanation: 'Say "in the evening" (not "at evening").' }
    ]
  },
  {
    id: 'ba5',
    level: 'basic',
    levelName: 'Level 2 — Basic',
    marathi: 'ती रोज इंग्रजीचा सराव करते.',
    roman: 'ti roj ingrajicha sarav karte',
    primaryEnglish: 'She practices English every day.',
    acceptable: [
      'She practices English every day.',
      'She practices English daily.',
      'She practises English every day.'
    ],
    grammarRule: 'Subject (She) + V1+s (practices) + Object (English) + frequency (every day)',
    ruleExplanation: 'Singular subject "She" takes verb with "-s" ("practices"). "every day" is two words.',
    examples: [
      'He practices coding every day.',
      'We practice speaking English every day.'
    ],
    commonMistakes: [
      { pattern: /\bshe\s+practice\b/i, explanation: '"She" is singular, so add "-s" to the verb: "She practices", not "She practice".' },
      { pattern: /\beveryday\b/i, explanation: '"every day" is written as two words when modifying frequency.' }
    ]
  },

  // ==========================================
  // LEVEL 3 — INTERMEDIATE (Tenses & Modals)
  // ==========================================
  {
    id: 'i1',
    level: 'intermediate',
    levelName: 'Level 3 — Intermediate',
    marathi: 'मी रोज कॉलेजला जातो.',
    roman: 'mi roj college la jato',
    primaryEnglish: 'I go to college every day.',
    acceptable: [
      'I go to college every day.',
      'I go to college daily.',
      'Every day I go to college.'
    ],
    grammarRule: 'go + to + place',
    ruleExplanation: 'We use the preposition "to" after movement verbs like "go" before a destination. Also, "every day" is two words.',
    examples: [
      'I go to school every day.',
      'She goes to college every day.'
    ],
    commonMistakes: [
      { pattern: /\bi\s+go\s+college\b/i, explanation: 'We use "to" before "college" when expressing destination: "go to college".' },
      { pattern: /\beveryday\b/i, explanation: '"every day" = two words when it means each day.' }
    ]
  },
  {
    id: 'i2',
    level: 'intermediate',
    levelName: 'Level 3 — Intermediate',
    marathi: 'ती रोज क्रिकेट खेळते.',
    roman: 'ti roj cricket khelte',
    primaryEnglish: 'She plays cricket every day.',
    acceptable: [
      'She plays cricket every day.',
      'She plays cricket daily.'
    ],
    grammarRule: 'He / She / It + V1 + s/es',
    ruleExplanation: '"She" is a third-person singular subject. Therefore, use "plays", not "play". "every day" is written as two words.',
    examples: [
      'He plays football every evening.',
      'Rohit plays cricket very well.'
    ],
    commonMistakes: [
      { pattern: /\bshe\s+play\s+cricket\b/i, explanation: '"She" is a singular subject. Simple Present Rule: He/She/It + V1 + s/es. Therefore: She plays (not "She play").' },
      { pattern: /\beveryday\b/i, explanation: '"every day" is two words when it means each day.' }
    ]
  },
  {
    id: 'i3',
    level: 'intermediate',
    levelName: 'Level 3 — Intermediate',
    marathi: 'मला इंग्रजी शिकायची आहे.',
    roman: 'mala english shikaychi ahe',
    primaryEnglish: 'I want to learn English.',
    acceptable: [
      'I want to learn English.',
      'I would like to learn English.'
    ],
    grammarRule: 'want + to + V1',
    ruleExplanation: 'When expressing desire to perform an action, use "want to" followed by base verb V1.',
    examples: [
      'I want to improve my English.',
      'She wants to speak fluently.'
    ],
    commonMistakes: [
      { pattern: /\bi\s+want\s+learn\b/i, explanation: 'Use the infinitive: "want to learn", not "want learn".' },
      { pattern: /\bme\s+want\b/i, explanation: 'Subject is "I", not "Me": "I want to learn English."' }
    ]
  },
  {
    id: 'i4',
    level: 'intermediate',
    levelName: 'Level 3 — Intermediate',
    marathi: 'मला रोज इंग्रजी बोलायचा सराव करायचा आहे.',
    roman: 'mala roj english bolaycha sarav karaycha ahe',
    primaryEnglish: 'I want to practice speaking English every day.',
    acceptable: [
      'I want to practice speaking English every day.',
      'I want to practice speaking English daily.',
      'I want to practice English speaking every day.'
    ],
    grammarRule: 'want + to + practice + Gerund (speaking)',
    ruleExplanation: 'After "practice", use the gerund (-ing form): "practice speaking English".',
    examples: [
      'She wants to practice speaking in public.',
      'We need to practice writing code daily.'
    ],
    commonMistakes: [
      { pattern: /\bpractice\s+to\s+speak\b/i, explanation: 'Use "practice speaking", because "practice" is followed by a gerund (-ing).' }
    ]
  },
  {
    id: 'i5',
    level: 'intermediate',
    levelName: 'Level 3 — Intermediate',
    marathi: 'काल तू काय करत होतास?',
    roman: 'kaal tu kay karat hotas?',
    primaryEnglish: 'What were you doing yesterday?',
    acceptable: [
      'What were you doing yesterday?',
      'What were you doing yesterday'
    ],
    grammarRule: 'Past Continuous Question: WH + were + Subject (you) + V1-ing + Time',
    ruleExplanation: 'With the subject "you", always use "were" (never "was") in past tense questions and statements.',
    examples: [
      'What were you studying last night?',
      'Where were you going yesterday afternoon?'
    ],
    commonMistakes: [
      { pattern: /\bwhat\s+was\s+you\s+doing\b/i, explanation: 'With "you", always use "were", not "was": "What were you doing?"' },
      { pattern: /\bwhat\s+you\s+were\s+doing\b/i, explanation: 'In questions, invert the auxiliary: "What were you doing?", not "What you were doing?".' }
    ]
  },
  {
    id: 'i6',
    level: 'intermediate',
    levelName: 'Level 3 — Intermediate',
    marathi: 'तू काल कॉलेजला गेला होतास का?',
    roman: 'tu kaal college la gela hotas ka?',
    primaryEnglish: 'Did you go to college yesterday?',
    acceptable: [
      'Did you go to college yesterday?',
      'Did you go to college yesterday'
    ],
    grammarRule: 'Simple Past Question: Did + Subject + V1 + Object?',
    ruleExplanation: 'After the auxiliary "Did", always use the base form (V1) of the verb: "Did you go?", never "Did you went?".',
    examples: [
      'Did you complete the homework?',
      'Did she attend the seminar?'
    ],
    commonMistakes: [
      { pattern: /\bdid\s+you\s+went\b/i, explanation: 'Important rule: After "did", always use base verb V1. Say "Did you go?", not "Did you went?".' }
    ]
  },

  // ==========================================
  // LEVEL 4 — ADVANCED (Complex & Conditionals)
  // ==========================================
  {
    id: 'a1',
    level: 'advanced',
    levelName: 'Level 4 — Advanced',
    marathi: 'जर तू कठोर सराव केलास, तर तू नक्कीच अस्खलित इंग्रजी बोलशील.',
    roman: 'jar tu kathor sarav kelas, tar tu nakkich askhalit ingraji bolshil',
    primaryEnglish: 'If you practice hard, you will definitely speak fluent English.',
    acceptable: [
      'If you practice hard, you will definitely speak fluent English.',
      'If you practice hard, you will surely speak English fluently.',
      'If you practice diligently, you will speak fluent English.'
    ],
    grammarRule: 'First Conditional: If + Simple Present (V1), will + V1',
    ruleExplanation: 'In real future conditions, use the Simple Present in the "if" clause and "will + base verb" in the main clause. Never use "will" in the if-clause.',
    examples: [
      'If you study daily, you will pass the exam easily.',
      'If it rains tomorrow, we will stay indoors.'
    ],
    commonMistakes: [
      { pattern: /\bif\s+you\s+will\s+practice\b/i, explanation: 'Do not use "will" in the if-clause. Say "If you practice", not "If you will practice".' }
    ]
  },
  {
    id: 'a2',
    level: 'advanced',
    levelName: 'Level 4 — Advanced',
    marathi: 'हा प्रकल्प काल आमच्या विद्यार्थ्यांद्वारे पूर्ण करण्यात आला.',
    roman: 'ha prakalp kaal amchya vidyarthyandware purna karnyat aala',
    primaryEnglish: 'This project was completed by our students yesterday.',
    acceptable: [
      'This project was completed by our students yesterday.',
      'The project was completed yesterday by our students.'
    ],
    grammarRule: 'Past Simple Passive: Object + was + V3 (completed) + by + Agent',
    ruleExplanation: 'In passive voice, emphasize the receiver: use "was" + past participle (V3) "completed".',
    examples: [
      'The presentation was prepared by Rohan.',
      'The email was sent by the manager.'
    ],
    commonMistakes: [
      { pattern: /\bwas\s+complete\b/i, explanation: 'Passive requires past participle V3: "was completed", not "was complete".' },
      { pattern: /\bproject\s+completed\s+yesterday\s+by\b/i, explanation: 'Include auxiliary "was": "This project was completed by...".' }
    ]
  },
  {
    id: 'a3',
    level: 'advanced',
    levelName: 'Level 4 — Advanced',
    marathi: 'राघवने मला सांगितले की तो उद्या नवीन लॅपटॉप खरेदी करणार आहे.',
    roman: 'raghavne mala sangitle ki to udya navin laptop kharedi karnar ahe',
    primaryEnglish: 'Raghav told me that he was going to buy a new laptop the next day.',
    acceptable: [
      'Raghav told me that he would buy a new laptop the next day.',
      'Raghav told me that he was going to buy a new laptop tomorrow.',
      'Raghav told me that he would buy a new laptop tomorrow.'
    ],
    grammarRule: 'Reported / Indirect Speech: Reporting verb in past -> backshift tenses',
    ruleExplanation: 'In indirect speech, when the reporting verb is in the past ("told"), "will" changes to "would" or "is going to" changes to "was going to".',
    examples: [
      'She said that she would attend the meeting.',
      'He told me that he had finished his work.'
    ],
    commonMistakes: [
      { pattern: /\braghav\s+said\s+to\s+me\b/i, explanation: 'Use "told me" without "to", or "said to me". "Raghav told me" is most natural.' }
    ]
  },
  {
    id: 'a4',
    level: 'advanced',
    levelName: 'Level 4 — Advanced',
    marathi: 'जरी त्याला खूप थकवा जाणवत होता, तरी त्याने आपले सादरीकरण यशस्वीरीत्या पूर्ण केले.',
    roman: 'jari tyala khup thakva janvat hota, tari tyane aple sadarikaran yashasviritya purna kele',
    primaryEnglish: 'Although he felt very tired, he completed his presentation successfully.',
    acceptable: [
      'Although he felt very tired, he completed his presentation successfully.',
      'Even though he was very tired, he completed his presentation successfully.',
      'Though he felt exhausted, he successfully completed his presentation.'
    ],
    grammarRule: 'Concession: Although / Even though + Clause 1, + Clause 2',
    ruleExplanation: 'Never use both "although" and "but" in the same sentence. "Although" handles the contrast alone.',
    examples: [
      'Although it was raining, they played the match.',
      'Even though he was nervous, he spoke confidently.'
    ],
    commonMistakes: [
      { pattern: /\balthough.*?,\s*but\b/i, explanation: 'Never use both "although" and "but" together. Use only one.' }
    ]
  }
];

/**
 * Get next Marathi practice sentence
 */
function getPracticeSentence(level = 'beginner', excludeId = null) {
  const filtered = PRACTICE_SENTENCES.filter(s => s.level === level && s.id !== excludeId);
  if (filtered.length === 0) {
    return PRACTICE_SENTENCES.find(s => s.level === level) || PRACTICE_SENTENCES[0];
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

/**
 * Get sentence by ID
 */
function getSentenceById(id) {
  return PRACTICE_SENTENCES.find(s => s.id === id) || null;
}

/**
 * Clean & normalize text for flexible comparison
 */
function cleanText(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[.,?!;:'"“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if the user's answer is correct, almost correct, or incorrect
 */
function evaluatePracticeAnswer(sentenceId, userEnglish, requestedLevel = 'beginner') {
  const currentSentence = getSentenceById(sentenceId) || getPracticeSentence(requestedLevel);
  const cleanUser = cleanText(userEnglish);

  // 1. Direct match with primary or acceptable translations
  const isExactMatch = currentSentence.acceptable.some(acc => cleanText(acc) === cleanUser);

  // 2. Check for common learner mistakes
  let detectedMistake = null;
  if (!isExactMatch && currentSentence.commonMistakes) {
    for (const cm of currentSentence.commonMistakes) {
      if (cm.pattern.test(userEnglish)) {
        detectedMistake = cm.explanation;
        break;
      }
    }
  }

  // 3. Evaluate degree of match
  let isCorrect = false;
  let status = 'wrong'; // 'correct', 'almost', 'wrong'

  if (isExactMatch) {
    isCorrect = true;
    status = 'correct';
  } else {
    // Check semantic word overlap
    const expectedWords = cleanText(currentSentence.primaryEnglish).split(' ');
    const userWords = cleanUser.split(' ');
    let matchedWords = 0;
    for (const w of userWords) {
      if (expectedWords.includes(w)) matchedWords++;
    }
    const matchRatio = matchedWords / Math.max(expectedWords.length, userWords.length);

    if (matchRatio >= 0.8 && !detectedMistake) {
      isCorrect = true;
      status = 'correct';
    } else if (matchRatio >= 0.5 || detectedMistake) {
      status = 'almost';
    } else {
      status = 'wrong';
    }
  }

  // Determine next sentence in sequence or higher level
  let nextLevel = requestedLevel;
  if (isCorrect) {
    // Optionally level up
    const levels = ['beginner', 'basic', 'intermediate', 'advanced'];
    const currIdx = levels.indexOf(requestedLevel);
    // Stay on current or advance
    nextLevel = requestedLevel;
  }
  const nextSentence = getPracticeSentence(nextLevel, currentSentence.id);

  // Construct structured AI explanation matching user exact format
  let responseText = '';

  if (status === 'correct') {
    responseText = `✅ **Correct!**\n\n"${currentSentence.primaryEnglish}"\n\n**Grammar Rule:**\n${currentSentence.grammarRule}\n\n**Example:**\n• ${currentSentence.examples[0] || currentSentence.primaryEnglish}\n\n---\n\n**Next Marathi sentence:**\n"${nextSentence.marathi}"\n*(${nextSentence.roman})*`;
  } else {
    const errorPrefix = status === 'almost' ? '❌ **Almost correct.**' : '❌ **Correction:**';
    const mistakeText = detectedMistake || `Review the sentence structure: "${currentSentence.primaryEnglish}".`;

    responseText = `${errorPrefix}\n\n✅ **Correct:**\n"${currentSentence.primaryEnglish}"\n\n**Mistake:**\n${mistakeText}\n\n**Rule:**\n${currentSentence.grammarRule}\n*(${currentSentence.ruleExplanation})*\n\n**Examples:**\n• ${currentSentence.examples[0]}\n${currentSentence.examples[1] ? `• ${currentSentence.examples[1]}` : ''}\n\n---\n\n**Next sentence:**\n"${nextSentence.marathi}"\n*(${nextSentence.roman})*`;
  }

  return {
    isCorrect,
    status,
    userSentence: userEnglish.trim(),
    correctEnglish: currentSentence.primaryEnglish,
    grammarRule: currentSentence.grammarRule,
    ruleExplanation: currentSentence.ruleExplanation,
    mistakeExplanation: detectedMistake,
    examples: currentSentence.examples,
    currentSentence,
    nextSentence,
    aiResponseText: responseText
  };
}

module.exports = {
  PRACTICE_SENTENCES,
  getPracticeSentence,
  getSentenceById,
  evaluatePracticeAnswer
};
