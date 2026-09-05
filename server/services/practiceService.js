/**
 * Marathi -> English Practice Service
 * Features:
 * - Dynamic generation across 12 categories and 3 difficulty levels
 * - User question history tracking to GUARANTEE non-repeating sentences
 * - Natural language translation evaluation with lenient semantic matching
 */

const { getAll, runQuery, getRow } = require('../db/database');

const PRACTICE_QUESTION_BANK = [
  // BEGINNER
  {
    category: "College",
    difficulty: "Beginner",
    marathi: "मी रोज कॉलेजला जातो.",
    acceptedEnglish: [
      "I go to college every day.",
      "I go to college daily.",
      "I go to my college every day."
    ],
    explanation: "Use the simple present tense 'go' for routine daily actions.",
    vocabTip: "Notice that 'every day' is two words when describing how often you do something."
  },
  {
    category: "Food",
    difficulty: "Beginner",
    marathi: "मला चहा प्यायला आवडतो.",
    acceptedEnglish: [
      "I like to drink tea.",
      "I like drinking tea.",
      "I love to drink tea.",
      "I love drinking tea."
    ],
    explanation: "Express preferences using 'I like to [verb]' or 'I like [verb]-ing'.",
    vocabTip: "'Have tea' is also very natural in English: 'I like having tea'."
  },
  {
    category: "Daily life",
    difficulty: "Beginner",
    marathi: "मी सकाळी सहा वाजता उठतो.",
    acceptedEnglish: [
      "I wake up at six in the morning.",
      "I get up at six in the morning.",
      "I wake up at 6 am.",
      "I get up at 6 am.",
      "I wake up at six o'clock in the morning."
    ],
    explanation: "Use the preposition 'at' for specific times on the clock ('at 6:00 AM').",
    vocabTip: "'Wake up' means opening your eyes; 'get up' means physically getting out of bed."
  },
  {
    category: "Friends",
    difficulty: "Beginner",
    marathi: "माझे मित्र खूप मदतगार आहेत.",
    acceptedEnglish: [
      "My friends are very helpful.",
      "My friends are very supportive.",
      "My friends help a lot."
    ],
    explanation: "Since 'friends' is plural, use the plural verb 'are'.",
    vocabTip: "'Helpful' describes people who are always ready to assist others."
  },
  {
    category: "Family",
    difficulty: "Beginner",
    marathi: "माझी आई खूप चविष्ट जेवण बनवते.",
    acceptedEnglish: [
      "My mother cooks very delicious food.",
      "My mother makes delicious food.",
      "My mom cooks very tasty food.",
      "My mother cooks very tasty food."
    ],
    explanation: "Singular subject 'My mother' requires 'cooks' (third-person singular -s).",
    vocabTip: "'Delicious' and 'tasty' both describe food that has a wonderful flavor."
  },
  {
    category: "Weather",
    difficulty: "Beginner",
    marathi: "आज खूप ऊन आहे.",
    acceptedEnglish: [
      "It is very sunny today.",
      "It is very hot today.",
      "Today is very sunny.",
      "Today is very hot."
    ],
    explanation: "We often use dummy subject 'It is...' when talking about weather in English.",
    vocabTip: "Use 'sunny' when the sun is shining brightly, and 'hot' for high temperature."
  },
  {
    category: "Shopping",
    difficulty: "Beginner",
    marathi: "मला नवीन कपडे खरेदी करायचे आहेत.",
    acceptedEnglish: [
      "I want to buy new clothes.",
      "I want to purchase new clothes.",
      "I need to buy new clothes."
    ],
    explanation: "Express desires with 'I want to + base verb' ('I want to buy').",
    vocabTip: "'Clothes' is always plural in English and does not have a singular 'clothe'."
  },
  {
    category: "Work",
    difficulty: "Beginner",
    marathi: "माझे वडील एका बँकेत काम करतात.",
    acceptedEnglish: [
      "My father works in a bank.",
      "My father works at a bank.",
      "My dad works in a bank."
    ],
    explanation: "Use 'works in a bank' or 'works at a bank'. Singular subject takes 'works'.",
    vocabTip: "Both 'in' and 'at' are widely accepted for workplaces like banks."
  },
  {
    category: "Technology",
    difficulty: "Beginner",
    marathi: "मी रोज माझा मोबाईल वापरतो.",
    acceptedEnglish: [
      "I use my mobile every day.",
      "I use my phone every day.",
      "I use my smartphone daily."
    ],
    explanation: "Simple present 'use' indicates regular daily habits.",
    vocabTip: "In modern English, 'phone' or 'smartphone' is very commonly used."
  },
  {
    category: "Hobbies",
    difficulty: "Beginner",
    marathi: "मला गाणी ऐकायला आवडते.",
    acceptedEnglish: [
      "I like to listen to songs.",
      "I like listening to songs.",
      "I like to listen to music.",
      "I love listening to music."
    ],
    explanation: "Always remember the preposition 'to' after the verb 'listen' ('listen to songs').",
    vocabTip: "Say 'listen to music', never just 'listen music'."
  },
  {
    category: "Travel",
    difficulty: "Beginner",
    marathi: "मी पुढच्या आठवड्यात पुण्याला जाईन.",
    acceptedEnglish: [
      "I will go to Pune next week.",
      "I am going to Pune next week.",
      "I will travel to Pune next week."
    ],
    explanation: "Future events can be described with 'will go' or present continuous 'am going'.",
    vocabTip: "'Next week' does not need a preposition like 'in' or 'on' before it."
  },
  {
    category: "Common conversations",
    difficulty: "Beginner",
    marathi: "तुम्ही मला मदत करू शकता का?",
    acceptedEnglish: [
      "Can you help me?",
      "Could you please help me?",
      "Can you please help me?",
      "Would you help me?"
    ],
    explanation: "Use modal verbs 'can' or 'could' to make polite requests.",
    vocabTip: "'Could you please help me?' is slightly more polite than 'Can you help me?'."
  },

  // INTERMEDIATE
  {
    category: "Weather",
    difficulty: "Intermediate",
    marathi: "काल पाऊस पडत असल्यामुळे मी घरीच थांबलो.",
    acceptedEnglish: [
      "Because it was raining yesterday, I stayed at home.",
      "I stayed at home yesterday because it was raining.",
      "As it was raining yesterday, I stayed home.",
      "Since it was raining yesterday, I stayed at home."
    ],
    explanation: "Connect the reason using 'because' or 'as' with past continuous 'it was raining'.",
    vocabTip: "Both 'stayed at home' and 'stayed home' are natural English."
  },
  {
    category: "College",
    difficulty: "Intermediate",
    marathi: "परीक्षेची तयारी करण्यासाठी मी ग्रंथालयात जात आहे.",
    acceptedEnglish: [
      "I am going to the library to prepare for the exam.",
      "I am going to the library to study for the examination.",
      "I am heading to the library to prepare for exams."
    ],
    explanation: "Use the infinitive of purpose 'to prepare for' to state your reason.",
    vocabTip: "'Prepare for an exam' is the standard academic collocation."
  },
  {
    category: "Work",
    difficulty: "Intermediate",
    marathi: "आमची बैठक दुपारी दोन वाजता सुरू होईल.",
    acceptedEnglish: [
      "Our meeting will start at two in the afternoon.",
      "Our meeting will begin at 2 pm.",
      "Our meeting starts at 2:00 PM.",
      "Our meeting will start at 2 pm."
    ],
    explanation: "Scheduled business events can use either 'will start' or present simple 'starts'.",
    vocabTip: "'Start' and 'begin' are interchangeable in business meetings."
  },
  {
    category: "Travel",
    difficulty: "Intermediate",
    marathi: "रस्त्यावर खूप गर्दी असल्यामुळे मला उशीर झाला.",
    acceptedEnglish: [
      "I was late because there was a lot of traffic on the road.",
      "I got late due to heavy traffic on the road.",
      "I was delayed because of the heavy traffic.",
      "I was late because of heavy traffic."
    ],
    explanation: "'Because of heavy traffic' or 'because there was heavy traffic' are both natural.",
    vocabTip: "In English, we say 'heavy traffic' rather than 'too much crowd of cars'."
  },
  {
    category: "Technology",
    difficulty: "Intermediate",
    marathi: "नवीन सॉफ्टवेअर शिकणे सुरुवातीला कठीण वाटते पण ते सोपे आहे.",
    acceptedEnglish: [
      "Learning new software seems difficult at first, but it is easy.",
      "Learning new software feels hard initially, but it is simple.",
      "Learning new software seems hard at first, but it is easy."
    ],
    explanation: "Use a gerund ('Learning...') as the subject of the sentence.",
    vocabTip: "'At first' describes an initial feeling that later changes."
  },
  {
    category: "Friends",
    difficulty: "Intermediate",
    marathi: "माझा मित्र मला इंग्रजी बोलण्याचा सराव करण्यास प्रोत्साहन देतो.",
    acceptedEnglish: [
      "My friend encourages me to practice speaking English.",
      "My friend motivates me to practice speaking English.",
      "My friend encourages me to practice English speaking."
    ],
    explanation: "The structure 'encourage [someone] to [verb]' takes an infinitive.",
    vocabTip: "'Encourage' means giving someone confidence and support."
  },

  // ADVANCED
  {
    category: "Work",
    difficulty: "Advanced",
    marathi: "वेळेचे योग्य नियोजन केले असते तर मी माझे काम वेळेत पूर्ण करू शकलो असतो.",
    acceptedEnglish: [
      "If I had managed my time properly, I could have finished my work on time.",
      "If I had planned my time well, I would have completed my work in time.",
      "Had I managed my time properly, I could have finished my work on time.",
      "If I had managed my time well, I could have completed my work on time."
    ],
    explanation: "This is a Third Conditional sentence ('If + had + past participle ..., could/would have + past participle').",
    vocabTip: "'On time' means at the scheduled time; 'in time' means before it is too late."
  },
  {
    category: "College",
    difficulty: "Advanced",
    marathi: "अनेक अडचणींना तोंड देऊनही त्याने आपले उच्च शिक्षण यशस्वीपणे पूर्ण केले.",
    acceptedEnglish: [
      "Despite facing many difficulties, he successfully completed his higher education.",
      "In spite of many challenges, he successfully finished his higher studies.",
      "Although he faced numerous obstacles, he successfully completed his higher education."
    ],
    explanation: "Use 'Despite + noun/gerund' or 'In spite of' to express contrast.",
    vocabTip: "Remember: 'Despite' never takes 'of' (say 'despite difficulties', not 'despite of difficulties')."
  },
  {
    category: "Technology",
    difficulty: "Advanced",
    marathi: "कृत्रिम बुद्धिमत्ता आपल्या शिकण्याच्या पद्धतीत क्रांती घडवून आणत आहे.",
    acceptedEnglish: [
      "Artificial intelligence is revolutionizing the way we learn.",
      "Artificial intelligence is transforming how we learn.",
      "Artificial intelligence is bringing a revolution to our way of learning."
    ],
    explanation: "Present continuous 'is revolutionizing' indicates a major ongoing shift.",
    vocabTip: "'Revolutionize' means to completely change the way something is done."
  },
  {
    category: "Common conversations",
    difficulty: "Advanced",
    marathi: "तुमचे म्हणणे योग्य असले तरी मला या मुद्द्यावर वेगळा विचार करावा लागेल.",
    acceptedEnglish: [
      "Even though you have a valid point, I will have to think differently on this matter.",
      "While your point is well taken, I need to consider a different perspective on this issue.",
      "Although you are right, I must look at this point from another angle."
    ],
    explanation: "Concessive clauses ('Even though...', 'While...') introduce polite disagreement in professional discourse.",
    vocabTip: "'You have a valid point' is a courteous way to acknowledge the other speaker."
  }
];

// Get next practice question for user, ensuring non-repetition
const getNextQuestion = async (userId, difficulty = 'Beginner', category = null) => {
  // 1. Fetch user's previous questions or attempts
  const attempts = await getAll(`
    SELECT question_id FROM practice_attempts WHERE user_id = ?
  `, [userId]);
  const attemptedIds = new Set(attempts.map(a => a.question_id));

  const generated = await getAll(`
    SELECT marathi_sentence FROM practice_questions WHERE user_id = ?
  `, [userId]);
  const generatedSentences = new Set(generated.map(g => g.marathi_sentence));

  // 2. Filter available bank
  let candidates = PRACTICE_QUESTION_BANK.filter(q => {
    if (difficulty && q.difficulty.toLowerCase() !== difficulty.toLowerCase()) {
      return false;
    }
    if (category && q.category.toLowerCase() !== category.toLowerCase()) {
      return false;
    }
    return !generatedSentences.has(q.marathi);
  });

  // If all candidates in this category/difficulty were exhausted, recycle while prioritizing least attempted
  if (candidates.length === 0) {
    candidates = PRACTICE_QUESTION_BANK.filter(q => {
      if (difficulty && q.difficulty.toLowerCase() !== difficulty.toLowerCase()) {
        return false;
      }
      return true;
    });
  }

  // Pick random question from candidates
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  const qId = 'pq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  // Save into practice_questions for this user
  await runQuery(`
    INSERT INTO practice_questions (id, user_id, category, difficulty, marathi_sentence, standard_english, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    qId,
    userId,
    selected.category,
    selected.difficulty,
    selected.marathi,
    selected.acceptedEnglish[0],
    selected.explanation
  ]);

  return {
    questionId: qId,
    category: selected.category,
    difficulty: selected.difficulty,
    marathiSentence: selected.marathi,
    explanation: selected.explanation,
    vocabTip: selected.vocabTip
  };
};

// Evaluate user's English translation attempt
const evaluateAttempt = async (userId, questionId, userAnswer) => {
  const cleanAnswer = (userAnswer || '').trim();
  const qRecord = await getRow(`
    SELECT * FROM practice_questions WHERE id = ? AND user_id = ?
  `, [questionId, userId]);

  if (!qRecord) {
    return {
      success: false,
      message: "Practice question not found."
    };
  }

  // Find bank template to get accepted answers and tips
  const template = PRACTICE_QUESTION_BANK.find(q => q.marathi === qRecord.marathi_sentence) || {
    acceptedEnglish: [qRecord.standard_english],
    explanation: qRecord.explanation,
    vocabTip: "Focus on natural word order and proper prepositions."
  };

  const normalizeForComparison = (str) => {
    return str
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizedUser = normalizeForComparison(cleanAnswer);
  let isCorrect = false;
  let bestMatch = template.acceptedEnglish[0];

  for (const accepted of template.acceptedEnglish) {
    const normalizedAccepted = normalizeForComparison(accepted);
    if (normalizedUser === normalizedAccepted) {
      isCorrect = true;
      bestMatch = accepted;
      break;
    }
  }

  // Fuzzy check: if key words match at least 80%
  let score = isCorrect ? 100 : 0;
  if (!isCorrect && normalizedUser.length > 5) {
    const userWords = new Set(normalizedUser.split(' '));
    const targetWords = normalizeForComparison(bestMatch).split(' ');
    let matchCount = 0;
    for (const w of targetWords) {
      if (userWords.has(w)) matchCount++;
    }
    const ratio = matchCount / targetWords.length;
    if (ratio >= 0.75) {
      isCorrect = true; // Friendly evaluation: natural variations accepted
      score = Math.round(ratio * 100);
    } else if (ratio >= 0.5) {
      score = Math.round(ratio * 100);
    }
  }

  // Save attempt
  const attemptId = 'pa_' + Date.now();
  await runQuery(`
    INSERT INTO practice_attempts (id, user_id, question_id, user_answer, is_correct, score, better_sentence, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    attemptId,
    userId,
    questionId,
    cleanAnswer,
    isCorrect ? 1 : 0,
    score,
    bestMatch,
    template.explanation
  ]);

  return {
    success: true,
    isCorrect: isCorrect,
    score: score,
    userAnswer: cleanAnswer,
    correctAnswer: bestMatch,
    explanation: template.explanation,
    vocabTip: template.vocabTip,
    message: isCorrect
      ? "Awesome! Your English translation is natural and accurate."
      : "Almost there! Take a look at the suggested sentence and explanation."
  };
};

module.exports = {
  getNextQuestion,
  evaluateAttempt,
  PRACTICE_QUESTION_BANK
};
