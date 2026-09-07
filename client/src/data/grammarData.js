/**
 * SpeakWise AI — Complete English Grammar Library
 * Contains all 34 core grammar topics and dedicated 12 tenses.
 *
 * Each topic includes:
 * - number, id, title, marathiTitle, category, level, shortDesc
 * - definition, marathiExplanation, rules, usage
 * - structure: { affirmative, negative, interrogative, negativeInterrogative, whQuestions }
 * - examples: list of practical examples
 * - correctVsIncorrect: [{ wrong, right, why }]
 * - commonMistakes: explanation
 * - practiceQuestions: list of questions/challenges
 */

export const TENSES_DATA = [
  {
    id: 'simple-present',
    number: 1,
    title: 'Simple Present Tense',
    marathiTitle: 'साधा वर्तमानकाळ (सवयी, नित्यक्रम, त्रिकालाबाधित सत्ये)',
    level: 'Beginner',
    definition: 'The Simple Present Tense expresses habitual actions, routines, universal truths, facts, and permanent situations.',
    marathiExplanation: 'दररोज घडणाऱ्या गोष्टी, सवयी, आवडीनिवडी किंवा त्रिकालाबाधित सत्य सांगण्यासाठी साधा वर्तमानकाळ वापरतात. मराठी वाक्याच्या शेवटी "तो, ते, तात" येते.',
    whenToUse: 'Use for daily habits, recurring routines, universal scientific facts, scheduled future events, and general truths.',
    rules: [
      'With I / You / We / They / Plural Nouns: Always use base verb V1.',
      'With He / She / It / Singular Nouns: Add -s, -es, or -ies to the base verb (e.g., play → plays, watch → watches, study → studies).',
      'In Negatives and Questions: Use "do/does" as helping verb. Never add -s to the main verb after "does".'
    ],
    structure: {
      affirmative: {
        formula: 'Subject + V1(s/es) + Object',
        example: 'I play cricket. / She plays cricket.'
      },
      negative: {
        formula: 'Subject + do/does + not + V1 + Object',
        example: 'I do not play cricket. / She does not play cricket.'
      },
      interrogative: {
        formula: 'Do/Does + Subject + V1 + Object?',
        example: 'Do you play cricket? / Does she play cricket?'
      },
      negativeInterrogative: {
        formula: 'Do/Does + Subject + not + V1 + Object?',
        example: 'Do you not play cricket? / Does she not play cricket?'
      },
      whQuestions: {
        formula: 'WH word + do/does + Subject + V1 + Object?',
        example: 'Why do you play cricket? / Where does she live?'
      }
    },
    examples: [
      'I wake up early in the morning every day.',
      'She speaks English and Marathi fluently.',
      'The sun rises in the east and sets in the west.',
      'My brother works at an IT company in Pune.',
      'Trains depart from platform number 3 on schedule.'
    ],
    commonMistakes: 'Forgetting to add -s/-es for He/She/It (e.g., saying "She play" instead of "She plays", or "AI help" instead of "AI helps").',
    correctVsIncorrect: [
      { wrong: 'She play cricket everyday.', right: 'She plays cricket every day.', why: 'Third-person singular "She" takes "plays". "every day" is two words.' },
      { wrong: 'He do not know the answer.', right: 'He does not know the answer.', why: 'Use "does" with singular subject "He".' },
      { wrong: 'Does she works in a bank?', right: 'Does she work in a bank?', why: 'After "does", always revert the main verb to base form V1.' }
    ],
    practiceQuestions: [
      'Translate to English: "मी रोज कॉलेजला जातो."',
      'Change to negative: "Rohan teaches mathematics."',
      'Form a question: "She lives in Mumbai."'
    ]
  },
  {
    id: 'present-continuous',
    number: 2,
    title: 'Present Continuous Tense',
    marathiTitle: 'चालू वर्तमानकाळ (सध्या सुरू असणाऱ्या क्रिया)',
    level: 'Beginner',
    definition: 'Describes an action that is happening right now, at the moment of speaking, or an ongoing temporary action.',
    marathiExplanation: 'बोलत असताना जी क्रिया सध्या चालू आहे ती व्यक्त करण्यासाठी चालू वर्तमानकाळ वापरतात. उदा. मी अभ्यास करत आहे.',
    whenToUse: 'Actions occurring at the moment of speech, temporary situations, and near future plans.',
    rules: [
      'Use "am" with I.',
      'Use "is" with He / She / It / Singular Nouns.',
      'Use "are" with We / You / They / Plural Nouns.',
      'Always use verb ending in -ing (V1-ing).'
    ],
    structure: {
      affirmative: {
        formula: 'Subject + am/is/are + V1-ing + Object',
        example: 'I am reading a book. / She is coding.'
      },
      negative: {
        formula: 'Subject + am/is/are + not + V1-ing + Object',
        example: 'I am not watching TV. / She is not playing.'
      },
      interrogative: {
        formula: 'Am/Is/Are + Subject + V1-ing + Object?',
        example: 'Are you listening to me? / Is she working?'
      },
      negativeInterrogative: {
        formula: 'Am/Is/Are + Subject + not + V1-ing + Object?',
        example: 'Are you not coming with us? / Isn\'t she studying?'
      },
      whQuestions: {
        formula: 'WH word + am/is/are + Subject + V1-ing + Object?',
        example: 'What are you doing right now? / Where is he going?'
      }
    },
    examples: [
      'I am practicing English conversation right now.',
      'They are developing a mobile application.',
      'The professor is explaining an important concept.',
      'We are preparing for our campus placements.'
    ],
    commonMistakes: 'Using stative verbs (know, believe, understand, love, have) in continuous tense.',
    correctVsIncorrect: [
      { wrong: 'I am knowing the answer.', right: 'I know the answer.', why: '"Know" is a state of mind, not an active process; use Simple Present.' },
      { wrong: 'She is having two brothers.', right: 'She has two brothers.', why: 'Possession is stative; use "has".' }
    ],
    practiceQuestions: [
      'Convert to negative: "They are waiting outside."',
      'Ask what someone is studying right now.'
    ]
  },
  {
    id: 'present-perfect',
    number: 3,
    title: 'Present Perfect Tense',
    marathiTitle: 'पूर्ण वर्तमानकाळ (नुकतीच पूर्ण झालेली क्रिया)',
    level: 'Intermediate',
    definition: 'Connects past actions with the present moment. Expresses actions completed recently or life experiences with no specific past timestamp.',
    marathiExplanation: 'क्रिया भूतकाळात नुकतीच पूर्ण झाली असून तिचा संबंध वर्तमानाशी आहे हे दाखवण्यासाठी हा काळ वापरतात. (has/have + V3).',
    whenToUse: 'Recent events with present impact, life experiences, uncompleted time periods, and actions with "already", "just", "yet".',
    rules: [
      'Use "has" with He / She / It / Singular subjects.',
      'Use "have" with I / We / You / They / Plural subjects.',
      'Always use Past Participle form of the main verb (V3).'
    ],
    structure: {
      affirmative: {
        formula: 'Subject + has/have + V3 + Object',
        example: 'I have finished my assignment. / He has left.'
      },
      negative: {
        formula: 'Subject + has/have + not + V3 + Object',
        example: 'I have not received the email. / She hasn\'t arrived.'
      },
      interrogative: {
        formula: 'Has/Have + Subject + V3 + Object?',
        example: 'Have you visited Mumbai? / Has he completed the code?'
      },
      negativeInterrogative: {
        formula: 'Has/Have + Subject + not + V3 + Object?',
        example: 'Have you not submitted the form? / Hasn\'t she called?'
      },
      whQuestions: {
        formula: 'WH word + has/have + Subject + V3 + Object?',
        example: 'What have you learned today? / Where has she gone?'
      }
    },
    examples: [
      'I have lived in Pune for five years.',
      'She has just delivered an inspiring speech.',
      'They have resolved the software bug successfully.',
      'Have you ever given a speech in public?'
    ],
    commonMistakes: 'Using specific past timestamps like "yesterday" or "last year" with Present Perfect.',
    correctVsIncorrect: [
      { wrong: 'I have seen him yesterday.', right: 'I saw him yesterday.', why: 'Specific past times like "yesterday" require Simple Past.' },
      { wrong: 'She has wrote a letter.', right: 'She has written a letter.', why: 'Use V3 past participle ("written"), not V2 ("wrote").' }
    ],
    practiceQuestions: [
      'Fill in: "She ______ (has / have) completed her bachelor degree."',
      'Make negative: "I have visited London."'
    ]
  },
  {
    id: 'present-perfect-continuous',
    number: 4,
    title: 'Present Perfect Continuous Tense',
    marathiTitle: 'चालू पूर्ण वर्तमानकाळ (भूतकाळात सुरू होऊन अजूनही चालू असणारी क्रिया)',
    level: 'Intermediate',
    definition: 'Expresses an action that began in the past and is still ongoing in the present, emphasized with "since" or "for".',
    marathiExplanation: 'एखादी क्रिया पूर्वी सुरू झाली असून ती अजूनही सुरू आहे हे दर्शवण्यासाठी has/have been + V1-ing वापरतात.',
    whenToUse: 'Ongoing actions over a duration, temporary habits, or actions that explain a present situation.',
    rules: [
      'Subject + has/have been + V1-ing.',
      'Use "since" for starting point (since 9 AM, since 2021).',
      'Use "for" for duration (for 2 hours, for 5 years).'
    ],
    structure: {
      affirmative: {
        formula: 'Subject + has/have + been + V1-ing + Object + since/for + Time',
        example: 'I have been studying for three hours.'
      },
      negative: {
        formula: 'Subject + has/have + not + been + V1-ing + Object',
        example: 'He has not been attending lectures regularly.'
      },
      interrogative: {
        formula: 'Has/Have + Subject + been + V1-ing + Object?',
        example: 'Have you been practicing English speaking?'
      },
      negativeInterrogative: {
        formula: 'Has/Have + Subject + not + been + V1-ing + Object?',
        example: 'Have you not been preparing for the interview?'
      },
      whQuestions: {
        formula: 'How long + has/have + Subject + been + V1-ing?',
        example: 'How long have you been learning to code?'
      }
    },
    examples: [
      'She has been working as a software developer since 2022.',
      'It has been raining continuously since morning.',
      'We have been preparing our final presentation for two weeks.'
    ],
    commonMistakes: 'Using Present Continuous when duration is specified (e.g., "I am waiting since two hours").',
    correctVsIncorrect: [
      { wrong: 'I am waiting here since two hours.', right: 'I have been waiting here for two hours.', why: 'Continuous action over a duration requires Present Perfect Continuous with "for".' }
    ],
    practiceQuestions: [
      'Fill in: "He has been practicing ______ two hours (since / for)."'
    ]
  },
  {
    id: 'simple-past',
    number: 5,
    title: 'Simple Past Tense',
    marathiTitle: 'साधा भूतकाळ (भूतकाळात घडलेली क्रिया — "Did + V1" नियम)',
    level: 'Beginner',
    definition: 'Expresses an action that occurred and finished at a definite time in the past.',
    marathiExplanation: 'भूतकाळात एखादी क्रिया घडली हे सांगण्यासाठी साधा भूतकाळ वापरतात. वाक्याच्या शेवटी "ला, ली, ले, लो" येते.',
    whenToUse: 'Completed past actions, historical events, past habits, and events with specific past times (yesterday, in 2020).',
    rules: [
      'Affirmative: Use second form of the verb (V2) (e.g., visited, went, played).',
      'IMPORTANT RULE: In Negatives and Questions, use auxiliary "did" followed by base verb V1.',
      'After "did", NEVER use V2. Always use V1 (Did you go? — NOT "Did you went?").'
    ],
    structure: {
      affirmative: {
        formula: 'Subject + V2 + Object',
        example: 'I visited Mumbai yesterday. / She wrote a letter.'
      },
      negative: {
        formula: 'Subject + did not (didn\'t) + V1 + Object',
        example: 'I did not visit Mumbai yesterday. / She didn\'t write.'
      },
      interrogative: {
        formula: 'Did + Subject + V1 + Object?',
        example: 'Did you visit Mumbai yesterday? / Did she write?'
      },
      negativeInterrogative: {
        formula: 'Did + Subject + not + V1 + Object?',
        example: 'Did you not visit Mumbai? / Didn\'t she call you?'
      },
      whQuestions: {
        formula: 'WH word + did + Subject + V1 + Object?',
        example: 'Where did you go yesterday? / Why did he leave?'
      }
    },
    examples: [
      'Rahul graduated from college last year.',
      'We attended an inspiring technical seminar yesterday.',
      'She explained the complex algorithm with total clarity.'
    ],
    commonMistakes: 'Using V2 after "did" (e.g., "Did you went?", "I didn\'t saw").',
    correctVsIncorrect: [
      { wrong: 'Did you went?', right: 'Did you go?', why: 'After "did", always use base verb V1 (never V2).' },
      { wrong: 'Did you went to college yesterday?', right: 'Did you go to college yesterday?', why: 'After "did", always use base verb V1.' },
      { wrong: 'I didn\'t saw him at the library.', right: 'I didn\'t see him at the library.', why: 'After "didn\'t", use base verb "see".' }
    ],
    practiceQuestions: [
      'Correct: "She didn\'t bought any vegetables."',
      'Form question: "He completed his college project."'
    ]
  },
  {
    id: 'past-continuous',
    number: 6,
    title: 'Past Continuous Tense',
    marathiTitle: 'चालू भूतकाळ (भूतकाळात सुरू असणारी क्रिया)',
    level: 'Intermediate',
    definition: 'Describes an action that was ongoing or in progress at a specific moment in the past.',
    marathiExplanation: 'भूतकाळात एखादी क्रिया चालू होती हे दाखवण्यासाठी चालू भूतकाळ वापरतात. (was/were + V1-ing).',
    whenToUse: 'Interrupted past actions, parallel actions in the past, and setting the scene in storytelling.',
    rules: [
      'Use "was" with I, He, She, It, Singular subjects.',
      'Use "were" with We, You, They, Plural subjects.',
      'With "you", ALWAYS use "were" (never "was").'
    ],
    structure: {
      affirmative: {
        formula: 'Subject + was/were + V1-ing + Object',
        example: 'I was studying when you called. / They were playing.'
      },
      negative: {
        formula: 'Subject + was/were + not + V1-ing + Object',
        example: 'I was not sleeping. / They were not arguing.'
      },
      interrogative: {
        formula: 'Was/Were + Subject + V1-ing + Object?',
        example: 'Were you studying last night? / Was she working?'
      },
      negativeInterrogative: {
        formula: 'Was/Were + Subject + not + V1-ing + Object?',
        example: 'Were you not listening? / Wasn\'t she paying attention?'
      },
      whQuestions: {
        formula: 'WH word + was/were + Subject + V1-ing + Object?',
        example: 'What were you doing yesterday at 8 PM?'
      }
    },
    examples: [
      'I was practicing my interview answers when the power went off.',
      'Students were discussing the project in the laboratory.',
      'She was speaking in English throughout the seminar.'
    ],
    commonMistakes: 'Using "was" with the subject pronoun "you" (e.g., "What was you doing?").',
    correctVsIncorrect: [
      { wrong: 'What was you doing yesterday?', right: 'What were you doing yesterday?', why: 'Always pair "you" with "were".' },
      { wrong: 'They was discussing the issue.', right: 'They were discussing the issue.', why: 'Plural subject "They" takes "were".' }
    ],
    practiceQuestions: [
      'Fill in: "While she ______ (cook), her phone rang."'
    ]
  },
  {
    id: 'past-perfect',
    number: 7,
    title: 'Past Perfect Tense',
    marathiTitle: 'पूर्ण भूतकाळ (भूतकाळातील दोन घटनांपैकी पहिली घडलेली क्रिया)',
    level: 'Intermediate',
    definition: 'Expresses an action completed before another past action occurred (the past of the past).',
    marathiExplanation: 'भूतकाळात घडलेल्या दोन घटनांपैकी पहिली पूर्ण झालेली घटना दाखवण्यासाठी Had + V3 वापरतात.',
    whenToUse: 'Sequencing two past actions, reported speech, and conditional statements (3rd conditional).',
    rules: [
      'Use "had" + Past Participle (V3) for all subjects.',
      'The earlier action takes Past Perfect (had + V3); the later action takes Simple Past (V2).'
    ],
    structure: {
      affirmative: {
        formula: 'Subject + had + V3 + Object (+ before + Simple Past)',
        example: 'The train had left before I reached the station.'
      },
      negative: {
        formula: 'Subject + had + not + V3 + Object',
        example: 'I had not seen him before the meeting.'
      },
      interrogative: {
        formula: 'Had + Subject + V3 + Object?',
        example: 'Had they finished the exam before the bell rang?'
      },
      negativeInterrogative: {
        formula: 'Had + Subject + not + V3 + Object?',
        example: 'Had she not prepared her slides before the demo?'
      },
      whQuestions: {
        formula: 'WH word + had + Subject + V3 + Object?',
        example: 'What had you done before joining this company?'
      }
    },
    examples: [
      'When the doctor arrived, the patient had already recovered.',
      'She had completed her engineering before moving to Pune.',
      'We had practiced the presentation thoroughly prior to our stage demo.'
    ],
    commonMistakes: 'Using Past Perfect for a single isolated past event without another past reference point.',
    correctVsIncorrect: [
      { wrong: 'I had gone to college yesterday.', right: 'I went to college yesterday.', why: 'Use Simple Past when there is only one past event.' }
    ],
    practiceQuestions: [
      'Combine: "She finished her work. Then her friends called."'
    ]
  },
  {
    id: 'past-perfect-continuous',
    number: 8,
    title: 'Past Perfect Continuous Tense',
    marathiTitle: 'चालू पूर्ण भूतकाळ (भूतकाळात काही काळ सुरू राहिलेली क्रिया)',
    level: 'Advanced',
    definition: 'Describes an action that was ongoing in the past up until another specific past event occurred.',
    marathiExplanation: 'भूतकाळातील एखाद्या घटनेपूर्वी बऱ्याच काळापासून सुरू असणारी क्रिया दर्शवण्यासाठी Had been + V1-ing वापरतात.',
    whenToUse: 'Emphasizing duration of a past activity before another past milestone.',
    rules: [
      'Subject + had been + V1-ing + for/since + Time duration.'
    ],
    structure: {
      affirmative: {
        formula: 'Subject + had been + V1-ing + Object + for/since',
        example: 'She had been working for three hours before taking a break.'
      },
      negative: {
        formula: 'Subject + had not been + V1-ing + Object',
        example: 'They had not been practicing regularly before the match.'
      },
      interrogative: {
        formula: 'Had + Subject + been + V1-ing + Object?',
        example: 'Had you been waiting long before the bus arrived?'
      },
      negativeInterrogative: {
        formula: 'Had + Subject + not + been + V1-ing + Object?',
        example: 'Had they not been studying before the exam?'
      },
      whQuestions: {
        formula: 'How long + had + Subject + been + V1-ing?',
        example: 'How long had you been living in Mumbai before moving to Pune?'
      }
    },
    examples: [
      'He had been coding for six hours straight before resolving the bug.',
      'The team had been preparing the presentation for weeks.'
    ],
    commonMistakes: 'Confusing past continuous with past perfect continuous when duration is stated.',
    correctVsIncorrect: [
      { wrong: 'She was waiting for two hours when he arrived.', right: 'She had been waiting for two hours when he arrived.', why: 'Duration before a past event requires Past Perfect Continuous.' }
    ],
    practiceQuestions: [
      'Fill in: "I ______ (study) for three hours when the power cut occurred."'
    ]
  },
  {
    id: 'simple-future',
    number: 9,
    title: 'Simple Future Tense',
    marathiTitle: 'साधा भविष्यकाळ (भविष्यात घडणारी क्रिया — "will + V1")',
    level: 'Beginner',
    definition: 'Expresses decisions made at the moment of speaking, predictions, promises, or future events.',
    marathiExplanation: 'भविष्यात घडणारी साधी क्रिया दर्शवण्यासाठी साधा भविष्यकाळ वापरतात. (Subject + will + V1). उदा. मी उद्या येईन.',
    whenToUse: 'Instant decisions, promises, future predictions, and offers.',
    rules: [
      'In modern English, "will" is used with all subjects (I, you, he, she, it, we, they) + V1.',
      'Never use "will" in conditional "if" clauses.'
    ],
    structure: {
      affirmative: {
        formula: 'Subject + will + V1 + Object',
        example: 'I will call you tomorrow. / She will pass the exam.'
      },
      negative: {
        formula: 'Subject + will not (won\'t) + V1 + Object',
        example: 'I will not make this mistake again. / He won\'t attend.'
      },
      interrogative: {
        formula: 'Will + Subject + V1 + Object?',
        example: 'Will you attend the presentation tomorrow?'
      },
      negativeInterrogative: {
        formula: 'Will + Subject + not + V1 + Object? / Won\'t + Subject + V1?',
        example: 'Will you not help your teammate? / Won\'t you come?'
      },
      whQuestions: {
        formula: 'WH word + will + Subject + V1 + Object?',
        example: 'When will the campus placement results be announced?'
      }
    },
    examples: [
      'I will practice speaking English for thirty minutes every morning.',
      'Our college will host a national technical hackathon next month.',
      'Artificial Intelligence will transform education worldwide.'
    ],
    commonMistakes: 'Using "will" in "if" conditional clauses.',
    correctVsIncorrect: [
      { wrong: 'If you will work hard, you will succeed.', right: 'If you work hard, you will succeed.', why: 'Do not use "will" in the if-clause.' },
      { wrong: 'I will to come tomorrow.', right: 'I will come tomorrow.', why: '"Will" takes base verb V1 without "to".' }
    ],
    practiceQuestions: [
      'Translate: "मी उद्या कॉलेजला जाईन."',
      'Make negative: "She will help us."'
    ]
  },
  {
    id: 'future-continuous',
    number: 10,
    title: 'Future Continuous Tense',
    marathiTitle: 'चालू भविष्यकाळ (भविष्यातील ठराविक वेळी चालू असणारी क्रिया)',
    level: 'Intermediate',
    definition: 'Expresses an action that will be ongoing or in progress at a specific time in the future.',
    marathiExplanation: 'भविष्यात एखाद्या ठराविक वेळी एखादी क्रिया चालू असेल हे दाखवण्यासाठी हा काळ वापरतात. (will be + V1-ing).',
    whenToUse: 'Action in progress at a future point, polite inquiries about future plans.',
    rules: [
      'Subject + will be + V1-ing.'
    ],
    structure: {
      affirmative: {
        formula: 'Subject + will be + V1-ing + Object',
        example: 'This time tomorrow, I will be flying to Bengaluru.'
      },
      negative: {
        formula: 'Subject + will not be + V1-ing + Object',
        example: 'I will not be using the laptop this evening.'
      },
      interrogative: {
        formula: 'Will + Subject + be + V1-ing + Object?',
        example: 'Will you be attending the seminar tomorrow afternoon?'
      },
      negativeInterrogative: {
        formula: 'Won\'t + Subject + be + V1-ing + Object?',
        example: 'Won\'t you be traveling with your team?'
      },
      whQuestions: {
        formula: 'What will + Subject + be doing + at + Time?',
        example: 'What will you be doing at this time next year?'
      }
    },
    examples: [
      'At 10:00 AM tomorrow, our team will be demonstrating our project.',
      'She will be preparing for her viva throughout the weekend.'
    ],
    commonMistakes: 'Omitting "be" in future continuous.',
    correctVsIncorrect: [
      { wrong: 'I will studying tomorrow morning.', right: 'I will be studying tomorrow morning.', why: 'Future continuous formula is "will be + V-ing".' }
    ],
    practiceQuestions: [
      'Fill in: "Don\'t call at 9 PM; I ______ (watch) the webinar."'
    ]
  },
  {
    id: 'future-perfect',
    number: 11,
    title: 'Future Perfect Tense',
    marathiTitle: 'पूर्ण भविष्यकाळ (भविष्यातील वेळेपूर्वी पूर्ण झालेली क्रिया)',
    level: 'Intermediate',
    definition: 'Expresses an action that will be completed by or before a specific point in the future (commonly with "by [time]").',
    marathiExplanation: 'भविष्यातील एखाद्या वेळेपूर्वी एखादी क्रिया पूर्ण झाली असेल हे सांगण्यासाठी will have + V3 वापरतात.',
    whenToUse: 'Completed actions with a future deadline.',
    rules: [
      'Subject + will have + Past Participle (V3). Always use "have", never "has".'
    ],
    structure: {
      affirmative: {
        formula: 'Subject + will have + V3 + Object + by + Time',
        example: 'By next year, I will have completed my bachelor degree.'
      },
      negative: {
        formula: 'Subject + will not have + V3 + Object',
        example: 'She will not have finished the report by noon.'
      },
      interrogative: {
        formula: 'Will + Subject + have + V3 + Object?',
        example: 'Will you have submitted your project by Friday?'
      },
      negativeInterrogative: {
        formula: 'Won\'t + Subject + have + V3 + Object?',
        example: 'Won\'t they have finalized the syllabus by next month?'
      },
      whQuestions: {
        formula: 'When will + Subject + have + V3 + Object?',
        example: 'What goals will you have achieved by 2027?'
      }
    },
    examples: [
      'By 5:00 PM today, we will have fixed all critical backend issues.',
      'She will have mastered 1000 English vocabulary words by December.'
    ],
    commonMistakes: 'Using "has" with third-person subjects after "will".',
    correctVsIncorrect: [
      { wrong: 'She will has completed the course.', right: 'She will have completed the course.', why: 'After modal "will", always use base form "have".' }
    ],
    practiceQuestions: [
      'Fill in: "By 2028, they ______ (build) the new metro line."'
    ]
  },
  {
    id: 'future-perfect-continuous',
    number: 12,
    title: 'Future Perfect Continuous Tense',
    marathiTitle: 'चालू पूर्ण भविष्यकाळ (भविष्यात काही काळापासून सुरू राहिलेली क्रिया)',
    level: 'Advanced',
    definition: 'Describes an ongoing action that will continue up until a specific point or milestone in the future.',
    marathiExplanation: 'भविष्यातील एखाद्या वेळेपर्यंत एखादी क्रिया किती काळापासून चालू असेल हे दर्शवण्यासाठी will have been + V1-ing वापरतात.',
    whenToUse: 'Emphasizing duration of future activities leading up to a specific milestone.',
    rules: [
      'Subject + will have been + V1-ing + for + duration + by + time.'
    ],
    structure: {
      affirmative: {
        formula: 'Subject + will have been + V1-ing + Object + for + Time',
        example: 'By next month, I will have been learning English for six months.'
      },
      negative: {
        formula: 'Subject + will not have been + V1-ing + Object',
        example: 'He will not have been working here long enough to qualify.'
      },
      interrogative: {
        formula: 'Will + Subject + have been + V1-ing + Object?',
        example: 'Will you have been living in Pune for a decade by next year?'
      },
      negativeInterrogative: {
        formula: 'Won\'t + Subject + have been + V1-ing + Object?',
        example: 'Won\'t they have been collaborating for five years by then?'
      },
      whQuestions: {
        formula: 'How long will + Subject + have been + V1-ing?',
        example: 'How long will she have been teaching when she retires?'
      }
    },
    examples: [
      'By graduation day, we will have been studying together for four years.',
      'In December, she will have been practicing with SpeakWise AI for an entire year.'
    ],
    commonMistakes: 'Using "will be" instead of "will have been" when duration is stated.',
    correctVsIncorrect: [
      { wrong: 'By next year I will be studying for five years.', right: 'By next year I will have been studying for five years.', why: 'Duration before a future point requires Future Perfect Continuous.' }
    ],
    practiceQuestions: [
      'Complete: "By next October, he ______ (work) at Google for two years."'
    ]
  }
];

export const GRAMMAR_TOPICS = [
  {
    number: 1,
    id: 'parts-of-speech',
    title: 'Parts of Speech',
    marathiTitle: 'शब्दांच्या जाती (८ मुख्य प्रकार)',
    shortDesc: 'Noun, Pronoun, Verb, Adjective, Adverb, Preposition, Conjunction, Interjection.',
    category: 'Foundations',
    level: 'Beginner',
    definition: 'Words are divided into eight classes called Parts of Speech according to their syntactic function and role in sentences.',
    marathiExplanation: 'इंग्रजी भाषेतील सर्व शब्दांचे वाक्यातील वापरानुसार आठ मुख्य भागांत वर्गीकरण केले जाते. प्रत्येक शब्द वाक्यात काय कार्य करतो यावरून त्याची जात ठरते.',
    rules: [
      'Every single word in a sentence serves as one of the 8 parts of speech.',
      'The same word can function as different parts of speech depending on context (e.g., "fast" can be an adjective, adverb, or verb).'
    ],
    usage: 'Understanding parts of speech is the absolute foundation for mastering sentence construction, subject-verb agreement, and fluent speaking.',
    structure: {
      affirmative: {
        formula: 'Subject (Noun/Pronoun) + Verb + Object (Noun/Pronoun)',
        example: 'Ashu (Noun) speaks (Verb) fluent English (Adjective + Noun).'
      },
      negative: {
        formula: 'Subject + Helping Verb + not + Main Verb + Object',
        example: 'She does not speak Hindi at college.'
      },
      interrogative: {
        formula: 'Helping Verb + Subject + Main Verb + Object?',
        example: 'Does Ashu speak fluent English?'
      },
      negativeInterrogative: {
        formula: 'Helping Verb + Subject + not + Main Verb + Object?',
        example: 'Does she not speak fluent English?'
      },
      whQuestions: {
        formula: 'WH word + Helping Verb + Subject + Main Verb?',
        example: 'Which language does she speak fluently?'
      }
    },
    examples: [
      'Noun: Pune is a historic city.',
      'Pronoun: She is learning Python programming.',
      'Verb: Students practice speaking English daily.',
      'Adjective: SpeakWise AI provides instant, intelligent feedback.',
      'Adverb: He spoke very fluently and confidently.',
      'Preposition: We met at the library.',
      'Conjunction: I like tea and coffee.',
      'Interjection: Wow! That presentation was brilliant.'
    ],
    correctVsIncorrect: [
      { wrong: 'He speaks English fluent.', right: 'He speaks English fluently.', why: 'Use adverb "fluently" to modify verb "speaks".' },
      { wrong: 'She gave advice me.', right: 'She gave me advice / She advised me.', why: '"Advice" is a noun; "advise" is a verb.' }
    ],
    commonMistakes: 'Using an adjective instead of an adverb, or confusing noun and verb forms.',
    practiceQuestions: [
      'Identify the part of speech of "quickly" in: "She solved the problem quickly."',
      'Identify the conjunction in: "He worked hard but he did not pass."'
    ]
  },
  {
    number: 2,
    id: 'nouns',
    title: 'Nouns',
    marathiTitle: 'नामे व प्रकार (Common, Proper, Collective, Abstract, Countable)',
    shortDesc: 'Names of people, places, things, concepts, and countable vs uncountable rules.',
    category: 'Foundations',
    level: 'Beginner',
    definition: 'A noun is a naming word for a person, place, animal, thing, quality, or concept.',
    marathiExplanation: 'व्यक्ती, वस्तू, स्थळ, प्राणी किंवा भावनेच्या नावाला Noun म्हणतात. Proper (विशेषनाम), Common (सामान्यनाम), Collective (समुदायवाचक), Abstract (भाववाचक).',
    rules: [
      'Proper nouns always start with a capital letter.',
      'Uncountable nouns (water, information, furniture) do not take plural forms (-s) and take singular verbs.'
    ],
    usage: 'Nouns serve as subjects or objects in almost every English sentence.',
    structure: {
      affirmative: {
        formula: 'Subject (Noun) + Verb + Object (Noun)',
        example: 'Knowledge gives confidence.'
      },
      negative: {
        formula: 'Subject (Noun) + Helping Verb + not + Verb',
        example: 'This company does not accept cash.'
      },
      interrogative: {
        formula: 'Is/Are/Does + Subject (Noun) + ...?',
        example: 'Is Pune a safe city for students?'
      },
      negativeInterrogative: {
        formula: 'Is/Are + Subject + not + ...?',
        example: 'Is honesty not the best policy?'
      },
      whQuestions: {
        formula: 'Which/What + Noun + Verb + ...?',
        example: 'Which college do you attend?'
      }
    },
    examples: [
      'Proper: Mumbai is the financial capital of India.',
      'Common: The students are studying in the classroom.',
      'Collective: The team won the national championship.',
      'Abstract: Honesty is respected everywhere.'
    ],
    correctVsIncorrect: [
      { wrong: 'He gave me many informations.', right: 'He gave me a lot of information.', why: '"Information" is uncountable and never takes plural -s.' },
      { wrong: 'The childrens are playing.', right: 'The children are playing.', why: '"Children" is already the plural form of "child".' }
    ],
    commonMistakes: 'Adding -s to uncountable nouns like information, furniture, luggage, advice.',
    practiceQuestions: [
      'What is the plural of "city"?',
      'Identify the abstract noun in: "Her bravery inspired everyone."'
    ]
  },
  {
    number: 3,
    id: 'pronouns',
    title: 'Pronouns',
    marathiTitle: 'सर्वनामे (Personal, Possessive, Reflexive, Relative)',
    shortDesc: 'Words used in place of nouns (I, you, he, she, it, we, they, me, him, her).',
    category: 'Foundations',
    level: 'Beginner',
    definition: 'A pronoun is a word used in place of a noun to avoid unnecessary repetition.',
    marathiExplanation: 'नामाची वारंवार होणारी पुनरावृत्ती टाळण्यासाठी वापरल्या जाणाऱ्या शब्दाला Pronoun म्हणतात.',
    rules: [
      'Subject pronouns (I, he, she, we, they) do the action.',
      'Object pronouns (me, him, her, us, them) receive the action.',
      'Never use "Me and Rahul" as a subject.'
    ],
    usage: 'Use to create smooth, natural dialogue and avoid repeating names.',
    structure: {
      affirmative: {
        formula: 'Subject Pronoun + Verb + Object Pronoun',
        example: 'She invited them to her presentation.'
      },
      negative: {
        formula: 'Subject Pronoun + Helping Verb + not + Verb + Object',
        example: 'He did not tell me about the meeting.'
      },
      interrogative: {
        formula: 'Did/Do + Subject Pronoun + Verb + Object Pronoun?',
        example: 'Did she inform you yesterday?'
      },
      negativeInterrogative: {
        formula: 'Did/Do + Subject Pronoun + not + Verb + Object Pronoun?',
        example: 'Did they not help us with the code?'
      },
      whQuestions: {
        formula: 'Whom/Who + Helping Verb + Subject + Verb?',
        example: 'Whom did you meet at the office?'
      }
    },
    examples: [
      'Personal: I practice speaking English every morning.',
      'Possessive: This laptop is mine; that one is hers.',
      'Reflexive: He prepared the entire project himself.'
    ],
    correctVsIncorrect: [
      { wrong: 'Me and Rahul went to college.', right: 'Rahul and I went to college.', why: 'Use subject pronoun "I" in subject position.' },
      { wrong: 'Between you and I, this is a secret.', right: 'Between you and me, this is a secret.', why: 'Prepositions require object pronoun "me".' }
    ],
    commonMistakes: 'Confusing subject and object pronouns, especially in compound subjects ("Him and me went").',
    practiceQuestions: [
      'Fill in: "Neither of the boys brought ______ (his / their) laptop."',
      'Correct: "Give the certificates to she."'
    ]
  },
  {
    number: 4,
    id: 'articles',
    title: 'Articles',
    marathiTitle: 'उपपदे (A, An, The & Zero Article)',
    shortDesc: 'Definite (The) vs Indefinite (A, An) articles and pronunciation rules.',
    category: 'Foundations',
    level: 'Beginner',
    definition: 'Articles define whether a noun is specific (The) or general (A, An). Zero Article refers to nouns that take no article.',
    marathiExplanation: 'व्यंजन उच्चाराआधी "A", स्वर उच्चाराआधी (a, e, i, o, u ध्वनी) "An", आणि ठराविक किंवा अद्वितीय गोष्टींसाठी "The" वापरतात.',
    rules: [
      'Choose "A" vs "An" by spoken sound, not the written letter.',
      'Use "The" when the listener already knows which specific item is meant.'
    ],
    usage: 'Essential for accuracy in formal, academic, and spoken English.',
    structure: {
      affirmative: {
        formula: 'A/An + Singular Countable Noun OR The + Specific Noun',
        example: 'An honest student received the award.'
      },
      negative: {
        formula: 'Subject + does not have + a/an + Noun',
        example: 'He does not have an umbrella.'
      },
      interrogative: {
        formula: 'Is there + a/an + Noun + ...?',
        example: 'Is there an ATM on this street?'
      },
      negativeInterrogative: {
        formula: 'Isn\'t + there + a/an + Noun + ...?',
        example: 'Isn\'t that the boy who won first prize?'
      },
      whQuestions: {
        formula: 'Where is + the + Specific Noun?',
        example: 'Where is the main seminar hall?'
      }
    },
    examples: [
      'A university student (starts with consonant sound "yu").',
      'An hour ago (silent "h", starts with vowel sound "ow-er").',
      'The sun rises in the east (unique objects).'
    ],
    correctVsIncorrect: [
      { wrong: 'I waited for a hour.', right: 'I waited for an hour.', why: '"Hour" begins with a vowel sound.' },
      { wrong: 'She is an European citizen.', right: 'She is a European citizen.', why: '"European" begins with consonant "yu" sound.' }
    ],
    commonMistakes: 'Determining "a" vs "an" by spelling letter instead of spoken phonetics.',
    practiceQuestions: [
      'Insert article: "He is ______ honest police officer."',
      'Insert article: "______ Mount Everest is the highest peak."'
    ]
  },
  {
    number: 5,
    id: 'adjectives',
    title: 'Adjectives',
    marathiTitle: 'विशेषणे (Descriptive, Quantitative, Demonstrative)',
    shortDesc: 'Words that describe or qualify nouns (qualities, sizes, quantities).',
    category: 'Foundations',
    level: 'Beginner',
    definition: 'An adjective describes, modifies, or gives more information about a noun or pronoun.',
    marathiExplanation: 'नामाबद्दल किंवा सर्वनामाबद्दल अधिक माहिती सांगणाऱ्या शब्दाला Adjective म्हणतात.',
    rules: [
      'Adjectives usually precede nouns (a brilliant speech) or follow linking verbs (the speech was brilliant).',
      'Never make adjectives plural (say "smart students", not "smarts students").'
    ],
    usage: 'Adds color, precision, and depth to spoken and written descriptions.',
    structure: {
      affirmative: {
        formula: 'Subject + Linking Verb + Adjective OR Adjective + Noun',
        example: 'Her presentation was exceptionally clear.'
      },
      negative: {
        formula: 'Subject + Linking Verb + not + Adjective',
        example: 'The instructions were not complicated.'
      },
      interrogative: {
        formula: 'Is/Was + Subject + Adjective?',
        example: 'Is this concept easy to understand?'
      },
      negativeInterrogative: {
        formula: 'Isn\'t/Wasn\'t + Subject + Adjective?',
        example: 'Isn\'t English grammar interesting?'
      },
      whQuestions: {
        formula: 'How + Adjective + is/are + Subject?',
        example: 'How difficult was your interview?'
      }
    },
    examples: [
      'She is a diligent and creative programmer.',
      'The weather is pleasant today in Pune.'
    ],
    correctVsIncorrect: [
      { wrong: 'My speaking is getting more better.', right: 'My speaking is getting much better.', why: '"Better" is already comparative.' }
    ],
    commonMistakes: 'Using double comparatives (more bigger, more better).',
    practiceQuestions: [
      'Identify adjectives: "The clever student solved the tricky algorithmic puzzle."'
    ]
  },
  {
    number: 6,
    id: 'adverbs',
    title: 'Adverbs',
    marathiTitle: 'क्रियाविशेषणे (Manner, Time, Place, Frequency, Degree)',
    shortDesc: 'Words that modify verbs, adjectives, or other adverbs (how, when, where).',
    category: 'Foundations',
    level: 'Beginner',
    definition: 'An adverb modifies a verb, adjective, or another adverb, indicating how, when, where, why, or how often.',
    marathiExplanation: 'क्रियापदाबद्दल, विशेषणाबद्दल किंवा दुसऱ्या क्रियाविशेषणाबद्दल अधिक माहिती देणाऱ्या शब्दाला Adverb म्हणतात.',
    rules: [
      'Adverbs of manner commonly end in -ly (quick → quickly, fluent → fluently).',
      'Do not confuse adjective "good" with adverb "well".'
    ],
    usage: 'Explains action delivery and frequency in storytelling and daily chat.',
    structure: {
      affirmative: {
        formula: 'Subject + Verb + Adverb of manner',
        example: 'She speaks English fluently.'
      },
      negative: {
        formula: 'Subject + Helping Verb + not + Verb + Adverb',
        example: 'He does not speak loudly during lectures.'
      },
      interrogative: {
        formula: 'Do/Does + Subject + Verb + Adverb?',
        example: 'Do you practice speaking English regularly?'
      },
      negativeInterrogative: {
        formula: 'Don\'t/Doesn\'t + Subject + Verb + Adverb?',
        example: 'Doesn\'t she speak English beautifully?'
      },
      whQuestions: {
        formula: 'How + Adverb + do/does + Subject + Verb?',
        example: 'How fluently can you speak English now?'
      }
    },
    examples: [
      'Manner: The students listened attentively.',
      'Time: We will submit our project tomorrow.',
      'Frequency: I always revise grammar rules.'
    ],
    correctVsIncorrect: [
      { wrong: 'He speaks English good.', right: 'He speaks English well.', why: 'Use adverb "well" to modify verb "speaks".' }
    ],
    commonMistakes: 'Using adjectives instead of adverbs to modify verbs.',
    practiceQuestions: [
      'Turn adjective "fluent" into an adverb.'
    ]
  },
  {
    number: 7,
    id: 'verbs',
    title: 'Verbs',
    marathiTitle: 'मुख्य क्रियापदे व क्रियांचे प्रकार (Action & Stative Verbs)',
    shortDesc: 'Action verbs, stative verbs, regular vs irregular verb forms (V1, V2, V3).',
    category: 'Verbs & Tenses',
    level: 'Beginner',
    definition: 'A verb expresses an action, occurrence, or state of being. It is the heart of every English sentence.',
    marathiExplanation: 'वाक्याचा अर्थ पूर्ण करणाऱ्या आणि कृती दर्शवणाऱ्या शब्दाला Verb म्हणतात. उदा. run, speak, study, is, feel.',
    rules: [
      'Every English sentence must contain a verb.',
      'Verbs must agree with subjects in number and person.'
    ],
    usage: 'Core engine of communication across all 12 tenses.',
    structure: {
      affirmative: {
        formula: 'Subject + Main Verb (+ Object)',
        example: 'She studies computer science.'
      },
      negative: {
        formula: 'Subject + Helping Verb + not + Main Verb',
        example: 'He does not drink coffee.'
      },
      interrogative: {
        formula: 'Helping Verb + Subject + Main Verb?',
        example: 'Do you speak English?'
      },
      negativeInterrogative: {
        formula: 'Helping Verb + Subject + not + Main Verb?',
        example: 'Doesn\'t he study hard?'
      },
      whQuestions: {
        formula: 'WH + Helping Verb + Subject + Main Verb?',
        example: 'What do you study?'
      }
    },
    examples: [
      'Action: She coded the complete application.',
      'State: He seems very confident today.'
    ],
    correctVsIncorrect: [
      { wrong: 'He speak English very well.', right: 'He speaks English very well.', why: 'Add -s for third-person singular.' }
    ],
    commonMistakes: 'Missing -s on singular subjects, mixing irregular verb past forms.',
    practiceQuestions: [
      'Give V1, V2, and V3 forms of "write".'
    ]
  },
  {
    number: 8,
    id: 'helping-verbs',
    title: 'Helping Verbs',
    marathiTitle: 'सहाय्यकारी क्रियापदे (am, is, are, was, were, has, have, had, do, does, did)',
    shortDesc: 'Primary auxiliary verbs that support main verbs to form tenses and questions.',
    category: 'Verbs & Tenses',
    level: 'Beginner',
    definition: 'Helping (auxiliary) verbs assist the main verb to indicate tense, voice, mood, and form questions or negatives.',
    marathiExplanation: 'मुख्य क्रियापदाला काळ, नकार किंवा प्रश्न तयार करण्यासाठी मदत करणारी क्रियापदे. उदा. am, is, are, was, were, do, did, have.',
    rules: [
      'In questions, invert the helping verb with the subject.',
      'In negatives, place "not" immediately after the helping verb.'
    ],
    usage: 'Building questions, negations, and all compound tenses.',
    structure: {
      affirmative: {
        formula: 'Subject + Helping Verb + Main Verb',
        example: 'I am learning conversational English.'
      },
      negative: {
        formula: 'Subject + Helping Verb + not + Main Verb',
        example: 'I am not afraid of speaking in public.'
      },
      interrogative: {
        formula: 'Helping Verb + Subject + Main Verb?',
        example: 'Are you preparing for the campus interview?'
      },
      negativeInterrogative: {
        formula: 'Helping Verb + Subject + not + Main Verb?',
        example: 'Have you not submitted your assignment yet?'
      },
      whQuestions: {
        formula: 'WH word + Helping Verb + Subject + Main Verb?',
        example: 'What were you doing yesterday at 5:00 PM?'
      }
    },
    examples: [
      'Be forms: I am speaking; They were practicing.',
      'Have forms: She has graduated; We had finished.'
    ],
    correctVsIncorrect: [
      { wrong: 'What was you doing?', right: 'What were you doing?', why: 'Always use "were" with subject "you".' }
    ],
    commonMistakes: 'Using "was" with "you", or omitting helping verbs in questions ("Where you going?").',
    practiceQuestions: [
      'Fill in: "They ______ (was / were) late for class."'
    ]
  },
  {
    number: 9,
    id: 'modal-verbs',
    title: 'Modal Verbs',
    marathiTitle: 'कौशल्य व शक्यता दर्शक क्रियापदे (can, could, may, might, should, must)',
    shortDesc: 'Express ability, permission, advice, obligation, probability, and politeness.',
    category: 'Verbs & Tenses',
    level: 'Beginner',
    definition: 'Modal verbs express ability, permission, advice, obligation, necessity, or possibility.',
    marathiExplanation: 'Can (क्षमता), Should (सल्ला/कर्तव्य), Must (सक्ती), May (परवानगी), Could (नम्र विनंती).',
    rules: [
      'Followed directly by base verb V1 without "to" (except ought to).',
      'Never add -s, -ed, or -ing to modal verbs.'
    ],
    usage: 'Polite conversation, professional requests, and advice.',
    structure: {
      affirmative: {
        formula: 'Subject + Modal + Base Verb (V1) + Object',
        example: 'You should practice speaking English out loud.'
      },
      negative: {
        formula: 'Subject + Modal + not + Base Verb (V1)',
        example: 'We must not skip our daily practice.'
      },
      interrogative: {
        formula: 'Modal + Subject + Base Verb (V1)?',
        example: 'Could you please repeat that explanation?'
      },
      negativeInterrogative: {
        formula: 'Modal + Subject + not + Base Verb (V1)?',
        example: 'Shouldn\'t we review our notes before the exam?'
      },
      whQuestions: {
        formula: 'WH word + Modal + Subject + Base Verb (V1)?',
        example: 'How can I improve my English pronunciation?'
      }
    },
    examples: [
      'Ability: I can code in JavaScript and Python.',
      'Advice: You should speak slowly and clearly.'
    ],
    correctVsIncorrect: [
      { wrong: 'You should to practice daily.', right: 'You should practice daily.', why: 'Modals take bare infinitive without "to".' },
      { wrong: 'He cans speak three languages.', right: 'He can speak three languages.', why: 'Modals do not take -s.' }
    ],
    commonMistakes: 'Adding "to" after modals (e.g. "I must to go").',
    practiceQuestions: [
      'Rewrite politely: "Give me your notes." (Use "Could you...")'
    ]
  },
  {
    number: 10,
    id: 'tenses',
    title: 'Tenses',
    marathiTitle: 'काळ व १२ मुख्य प्रकार (Present, Past, Future)',
    shortDesc: 'Dedicated comprehensive sub-library containing all 12 English tenses.',
    category: 'Verbs & Tenses',
    level: 'Intermediate',
    isTenses: true,
    definition: 'Tenses locate actions in time (Past, Present, Future), each divided into Simple, Continuous, Perfect, and Perfect Continuous.',
    marathiExplanation: 'काळ हे इंग्रजी व्याकरणाचे हृदय आहे. भूतकाळ, वर्तमानकाळ आणि भविष्यकाळ प्रत्येकी ४ उपप्रकारांसह एकूण १२ काळ बनतात.',
    rules: [
      'Click this topic to explore the dedicated 12 Tenses directory with complete formulas, examples, and mistake analysis.'
    ],
    usage: 'Expressing any action in correct chronological time.',
    structure: {
      affirmative: { formula: 'See dedicated 12 Tenses sub-section', example: 'I practice English every day.' },
      negative: { formula: 'Subject + auxiliary + not + verb', example: 'I do not waste time.' },
      interrogative: { formula: 'Auxiliary + Subject + verb?', example: 'Do you practice daily?' },
      negativeInterrogative: { formula: 'Auxiliary + Subject + not + verb?', example: 'Don\'t you want to speak fluently?' },
      whQuestions: { formula: 'WH + auxiliary + Subject + verb?', example: 'When do you practice?' }
    },
    examples: [
      'Present Simple: I speak English.',
      'Past Simple: I spoke English.',
      'Future Simple: I will speak English.'
    ],
    correctVsIncorrect: [
      { wrong: 'Did you went?', right: 'Did you go?', why: 'Always use V1 after "did".' }
    ],
    commonMistakes: 'Tense inconsistency and using past forms after "did".',
    practiceQuestions: [
      'Explore the 12 Tenses directory below.'
    ]
  },
  {
    number: 11,
    id: 'subject-verb-agreement',
    title: 'Subject-Verb Agreement',
    marathiTitle: 'कर्ता-क्रियापद सुसंगती (नियम व अपवाद)',
    shortDesc: 'Rules ensuring singular subjects take singular verbs and plural take plural.',
    category: 'Sentence Structure',
    level: 'Intermediate',
    definition: 'A singular subject requires a singular verb, while a plural subject requires a plural verb.',
    marathiExplanation: 'कर्त्याच्या वचनानुसार क्रियापद असणे. एकवचनी कर्त्याला V+s/es, अनेकवचनी कर्त्याला V1.',
    rules: [
      'Words like everyone, somebody, each, neither, nobody take singular verbs.',
      'Phrases like "along with", "as well as" between subject and verb do not change the subject\'s number.'
    ],
    usage: 'Eliminating grammar errors in competitive exams and professional writing.',
    structure: {
      affirmative: {
        formula: 'Singular Subject + Singular Verb (V+s/es) | Plural Subject + Plural Verb (V1)',
        example: 'Artificial Intelligence helps students learn faster.'
      },
      negative: {
        formula: 'Neither + S1 + nor + S2 + Verb (agrees with nearest subject)',
        example: 'Neither the manager nor the employees were informed.'
      },
      interrogative: {
        formula: 'Does/Do + Subject + Verb?',
        example: 'Does everyone understand the project requirements?'
      },
      negativeInterrogative: {
        formula: 'Doesn\'t + each student + have + ...?',
        example: 'Doesn\'t each participant have a certificate?'
      },
      whQuestions: {
        formula: 'Why does + Singular Subject + Verb?',
        example: 'Why does this algorithm run so efficiently?'
      }
    },
    examples: [
      'The quality of these mangoes is excellent (subject is "quality").',
      'Each of the students has received a participation badge.'
    ],
    correctVsIncorrect: [
      { wrong: 'The quality of these apples are great.', right: 'The quality of these apples is great.', why: 'Subject is singular "quality".' },
      { wrong: 'Everyone have done their homework.', right: 'Everyone has done their homework.', why: '"Everyone" is grammatically singular.' }
    ],
    commonMistakes: 'Matching the verb to the nearest noun instead of the true grammatical subject.',
    practiceQuestions: [
      'Choose: "One of my best friends (live / lives) in London."'
    ]
  },
  {
    number: 12,
    id: 'active-passive-voice',
    title: 'Active & Passive Voice',
    marathiTitle: 'कर्तरी व कर्मणी प्रयोग (नियम व काळानुसार रचना)',
    shortDesc: 'Subject doing the action (Active) vs Subject receiving the action (Passive).',
    category: 'Sentence Structure',
    level: 'Intermediate',
    definition: 'Active voice emphasizes the doer of the action; passive voice emphasizes the receiver or the action itself.',
    marathiExplanation: 'Active Voice मध्ये कर्त्याला महत्त्व, Passive Voice मध्ये कर्माला महत्त्व. Passive मध्ये नेहमी "be चे रूप + V3" वापरतात.',
    rules: [
      'Object becomes Subject + appropriate form of "be" + Past Participle (V3) + by + Agent.',
      'Only transitive verbs (verbs that take objects) can be changed into passive voice.'
    ],
    usage: 'Formal writing, scientific reports, news, and official announcements.',
    structure: {
      affirmative: {
        formula: 'Active: S + V + O | Passive: O + be + V3 + by S',
        example: 'Active: She wrote an email. | Passive: An email was written by her.'
      },
      negative: {
        formula: 'Passive: O + be + not + V3 + by S',
        example: 'The faulty module was not approved by the QA manager.'
      },
      interrogative: {
        formula: 'Passive: Be + O + V3 + by S?',
        example: 'Was the project submitted on time by the team?'
      },
      negativeInterrogative: {
        formula: 'Passive: Was/Were + O + not + V3?',
        example: 'Were the hall tickets not distributed to students?'
      },
      whQuestions: {
        formula: 'WH word + be + O + V3?',
        example: 'When was this software architecture designed?'
      }
    },
    examples: [
      'English is spoken across the globe.',
      'The presentation was recorded for absent students.'
    ],
    correctVsIncorrect: [
      { wrong: 'The email was wrote by him.', right: 'The email was written by him.', why: 'Passive requires V3 past participle ("written").' }
    ],
    commonMistakes: 'Using V2 instead of V3 in passive sentences.',
    practiceQuestions: [
      'Convert to Passive: "The professor explained the theorem."'
    ]
  },
  {
    number: 13,
    id: 'direct-indirect-speech',
    title: 'Direct & Indirect Speech',
    marathiTitle: 'प्रत्यक्ष व अप्रत्यक्ष कथन (Narration, Tense & Pronoun Changes)',
    shortDesc: 'Quoting exact words (Direct) vs reporting meaning in your own words (Indirect).',
    category: 'Sentence Structure',
    level: 'Advanced',
    definition: 'Direct speech quotes exact spoken words inside quotation marks; Indirect speech reports the meaning with backshifted tenses and adjusted pronouns.',
    marathiExplanation: 'एखाद्याचे बोलणे जसेच्या तसे सांगणे (Direct) किंवा बदल करून सांगणे (Indirect). भूतकाळी reporting verb असल्यास काळ मागे जातो.',
    rules: [
      'When reporting verb is past (said, told), shift present tenses to past tenses.',
      'Reported questions take statement word order (Subject + Verb), not question inversion.'
    ],
    usage: 'Storytelling, reporting discussions, meeting minutes, journalism.',
    structure: {
      affirmative: {
        formula: 'Direct: S + said, "Quote." | Indirect: S + said that + backshifted clause',
        example: 'Direct: He said, "I am busy." | Indirect: He said that he was busy.'
      },
      negative: {
        formula: 'Indirect: S + told me that + S + had not + V3',
        example: 'She told me that she had not received the message.'
      },
      interrogative: {
        formula: 'Indirect: S + asked if/whether + Subject + Verb',
        example: 'She asked me if I was ready for the interview.'
      },
      negativeInterrogative: {
        formula: 'Indirect: S + asked why + Subject + was not + V-ing',
        example: 'The teacher asked why I was not attending lectures.'
      },
      whQuestions: {
        formula: 'Indirect: S + asked + WH word + Subject + Verb',
        example: 'He asked where I lived. (Not "where did I live")'
      }
    },
    examples: [
      'Direct: Rahul said, "I will come tomorrow."',
      'Indirect: Rahul said that he would come the next day.'
    ],
    correctVsIncorrect: [
      { wrong: 'He asked me where was I going.', right: 'He asked me where I was going.', why: 'Reported questions take statement order.' }
    ],
    commonMistakes: 'Keeping question inversion in indirect questions.',
    practiceQuestions: [
      'Convert to Indirect: Priya said, "I have completed the assignment."'
    ]
  },
  {
    number: 14,
    id: 'question-tags',
    title: 'Question Tags',
    marathiTitle: 'अनुप्रश्न (isn\'t it, aren\'t you, don\'t they)',
    shortDesc: 'Short questions added at sentence ends to confirm agreement or truth.',
    category: 'Sentence Structure',
    level: 'Intermediate',
    definition: 'Short confirmation questions added to the end of a statement.',
    marathiExplanation: 'वाक्याच्या शेवटी होकारार्थी असल्यास नकारार्थी आणि नकारार्थी असल्यास होकारार्थी छोटा प्रश्न जोडतात.',
    rules: [
      'Positive statement → Negative tag.',
      'Negative statement → Positive tag.',
      'Use the auxiliary verb from the statement.'
    ],
    usage: 'Casual conversation, verifying facts, polite engagement.',
    structure: {
      affirmative: {
        formula: 'Positive Statement + , + Negative Tag?',
        example: 'You speak English fluently, don\'t you?'
      },
      negative: {
        formula: 'Negative Statement + , + Positive Tag?',
        example: 'She isn\'t late for the lecture, is she?'
      },
      interrogative: {
        formula: 'Let\'s + Verb + , + shall we?',
        example: 'Let\'s start our practice session, shall we?'
      },
      negativeInterrogative: {
        formula: 'I am + Adjective + , + aren\'t I?',
        example: 'I am right about this solution, aren\'t I?'
      },
      whQuestions: {
        formula: 'Pass me the notes, will you?',
        example: 'Imperatives take "will you?"'
      }
    },
    examples: [
      'You are coming tomorrow, aren\'t you?',
      'They haven\'t submitted yet, have they?'
    ],
    correctVsIncorrect: [
      { wrong: 'You are coming tomorrow, no?', right: 'You are coming tomorrow, aren\'t you?', why: 'Standard English uses question tags, not "no?".' }
    ],
    commonMistakes: 'Using "no?" or "na?" instead of grammatical question tags.',
    practiceQuestions: [
      'Add tag: "She is a diligent student, ______?"'
    ]
  },
  {
    number: 15,
    id: 'wh-questions',
    title: 'WH Questions',
    marathiTitle: 'माहिती विचारणारे प्रश्न (What, Where, When, Why, Who, Whom, Whose, Which, How)',
    shortDesc: 'Forming accurate questions seeking specific information.',
    category: 'Sentence Structure',
    level: 'Beginner',
    definition: 'Questions that begin with WH-words to ask for specific information (not just yes/no).',
    marathiExplanation: 'माहिती विचारण्यासाठी वापरले जाणारे प्रश्न: What (काय), Where (कुठे), When (केव्हा), Why (का), Who (कोण), How (कसे).',
    rules: [
      'Follow the word order: WH-word + Auxiliary Verb + Subject + Main Verb.'
    ],
    usage: 'Daily inquiry, interviews, discussions.',
    structure: {
      affirmative: {
        formula: 'WH word + Auxiliary + Subject + Main Verb?',
        example: 'What do you want to study today?'
      },
      negative: {
        formula: 'WH word + Auxiliary + not + Subject + Main Verb?',
        example: 'Why don\'t you join our study group?'
      },
      interrogative: {
        formula: 'How + Adjective/Adverb + Auxiliary + Subject + Verb?',
        example: 'How often do you practice speaking?'
      },
      negativeInterrogative: {
        formula: 'Why didn\'t you + V1 + Object?',
        example: 'Why didn\'t you inform the teacher?'
      },
      whQuestions: {
        formula: 'Which + Noun + do you prefer?',
        example: 'Which programming language do you like most?'
      }
    },
    examples: [
      'Where do you live in Pune?',
      'When does your college semester begin?'
    ],
    correctVsIncorrect: [
      { wrong: 'What you are doing?', right: 'What are you doing?', why: 'Invert auxiliary before subject in questions.' }
    ],
    commonMistakes: 'Placing subject before auxiliary in direct questions.',
    practiceQuestions: [
      'Form a WH question for: "I live in Pune." (Ask for location)'
    ]
  },
  {
    number: 16,
    id: 'sentence-structure',
    title: 'Sentence Structure',
    marathiTitle: 'वाक्य रचना (SVO, Complement, Modifiers)',
    shortDesc: 'Subject, Verb, Object, Indirect Object, and adverbial placement.',
    category: 'Sentence Structure',
    level: 'Beginner',
    definition: 'The standard architectural pattern of words in English sentences.',
    marathiExplanation: 'इंग्रजी वाक्यांचा मूलभूत ढाचा: कर्ता + क्रियापद + कर्म + स्थळ + वेळ.',
    rules: [
      'English is SVO (Subject-Verb-Object), unlike Marathi which is SOV.',
      'Place time and place adverbials at the end or beginning, not between verb and object.'
    ],
    usage: 'Forming coherent sentences without grammatical fragmentation.',
    structure: {
      affirmative: {
        formula: 'Subject + Verb + Object + Place + Time',
        example: 'I study English at the library every afternoon.'
      },
      negative: {
        formula: 'Subject + Helping Verb + not + Verb + Object',
        example: 'He does not write code on Sundays.'
      },
      interrogative: {
        formula: 'Auxiliary + Subject + Verb + Object?',
        example: 'Do you practice speaking every morning?'
      },
      negativeInterrogative: {
        formula: 'Don\'t + Subject + Verb + Object?',
        example: 'Don\'t you practice speaking every morning?'
      },
      whQuestions: {
        formula: 'When do you + Verb + Object?',
        example: 'When do you study English?'
      }
    },
    examples: [
      'S-V: Birds sing.',
      'S-V-O: She reads books.'
    ],
    correctVsIncorrect: [
      { wrong: 'I English speak.', right: 'I speak English.', why: 'English is SVO.' }
    ],
    commonMistakes: 'Transferring Marathi SOV order directly into English.',
    practiceQuestions: [
      'Rearrange: "an apple / eats / she / daily"'
    ]
  },
  {
    number: 17,
    id: 'types-of-sentences',
    title: 'Types of Sentences',
    marathiTitle: 'वाक्यांचे प्रकार (Assertive, Interrogative, Imperative, Exclamatory)',
    shortDesc: 'Categorizing sentences by purpose: statements, questions, commands, exclamations.',
    category: 'Sentence Structure',
    level: 'Beginner',
    definition: 'Classifies sentences into Assertive (statements), Interrogative (questions), Imperative (commands/requests), and Exclamatory (emotions).',
    marathiExplanation: 'विधानाती, प्रश्नार्थी, आज्ञार्थी, आणि उद्गारार्थी वाक्ये.',
    rules: [
      'Assertive and Imperative end in a period (.).',
      'Interrogative ends in (?). Exclamatory ends in (!).'
    ],
    usage: 'Stylistic variation in conversation and speeches.',
    structure: {
      affirmative: { formula: 'Assertive: Subject + Verb + Object.', example: 'Regular practice creates fluency.' },
      negative: { formula: 'Imperative: Do not + V1!', example: 'Do not interrupt the speaker!' },
      interrogative: { formula: 'Interrogative: Auxiliary + S + V?', example: 'Have you registered for the seminar?' },
      negativeInterrogative: { formula: 'Exclamatory: What a / How + Adj!', example: 'What a brilliant presentation she gave!' },
      whQuestions: { formula: 'WH Question: WH + Aux + S + V?', example: 'How did you solve the bug?' }
    },
    examples: [
      'Assertive: Knowledge brings confidence.',
      'Imperative: Please open your book.',
      'Exclamatory: How wonderfully she speaks!'
    ],
    correctVsIncorrect: [
      { wrong: 'I asked where does he live?', right: 'I asked where he lived.', why: 'Indirect questions end with a period.' }
    ],
    commonMistakes: 'Punctuating indirect questions with question marks.',
    practiceQuestions: [
      'Convert to Exclamatory: "She speaks very eloquently."'
    ]
  },
  {
    number: 18,
    id: 'phrases',
    title: 'Phrases',
    marathiTitle: 'वाक्प्रचार व शब्दसमूह (Noun, Prepositional, Verb Phrases)',
    shortDesc: 'Groups of words without a subject-verb unit acting as a single part of speech.',
    category: 'Mastery',
    level: 'Intermediate',
    definition: 'A phrase is a group of words without a subject-predicate unit, functioning together as a single part of speech.',
    marathiExplanation: 'शब्दांचा असा समूह ज्यामध्ये कर्ता आणि क्रियापद नसते, परंतु तो वाक्यात एकत्र अर्थ देतो.',
    rules: [
      'A phrase cannot stand alone as a complete sentence.'
    ],
    usage: 'Enriching sentence details and description.',
    structure: {
      affirmative: { formula: 'Subject + Verb + Prepositional Phrase', example: 'The students studied in the library.' },
      negative: { formula: 'Subject + not + Verb + Phrase', example: 'He was not at home.' },
      interrogative: { formula: 'Auxiliary + S + V + Phrase?', example: 'Are you going to the market?' },
      negativeInterrogative: { formula: 'Aren\'t + S + in + Phrase?', example: 'Aren\'t you in the seminar room?' },
      whQuestions: { formula: 'Where + Aux + S + V + Phrase?', example: 'Where did you put the book on the table?' }
    },
    examples: [
      'Noun Phrase: The brilliant young engineer designed the chip.',
      'Prepositional Phrase: In the early morning, we practice.'
    ],
    correctVsIncorrect: [
      { wrong: 'In the morning. I study.', right: 'In the morning, I study.', why: 'A phrase cannot stand alone as a sentence.' }
    ],
    commonMistakes: 'Treating phrases as independent sentences (sentence fragments).',
    practiceQuestions: [
      'Identify the prepositional phrase in: "She sat on the wooden bench."'
    ]
  },
  {
    number: 19,
    id: 'clauses',
    title: 'Clauses',
    marathiTitle: 'उपवाक्ये (Independent, Dependent, Noun, Adjective, Adverb Clauses)',
    shortDesc: 'Groups of words containing a subject and verb, forming parts of complex sentences.',
    category: 'Mastery',
    level: 'Advanced',
    definition: 'A clause is a group of words containing a subject and a predicate. Clauses are either independent (main) or dependent (subordinate).',
    marathiExplanation: 'ज्या शब्दसमूहात कर्ता आणि क्रियापद दोन्ही असतात त्याला Clause म्हणतात. Main Clause स्वतंत्र अर्थ देऊ शकतो; Subordinate Clause दुसऱ्यावर अवलंबून असतो.',
    rules: [
      'An independent clause expresses a complete thought.',
      'A dependent clause begins with a subordinating conjunction or relative pronoun.'
    ],
    usage: 'Constructing complex sentences in academic and formal English.',
    structure: {
      affirmative: { formula: 'Main Clause + Subordinating Conjunction + Dependent Clause', example: 'I will call you when I arrive.' },
      negative: { formula: 'Unless + Dependent Clause, + Main Clause (Negative)', example: 'Unless you practice, you will not improve.' },
      interrogative: { formula: 'Can we begin + since + Dependent Clause?', example: 'Can we begin since everyone is here?' },
      negativeInterrogative: { formula: 'Won\'t you join + although + ...?', example: 'Won\'t you join although you are busy?' },
      whQuestions: { formula: 'Why did you leave + before + ...?', example: 'Why did you leave before the lecture finished?' }
    },
    examples: [
      'Noun Clause: What you just said is completely true.',
      'Adjective Clause: The laptop that I purchased is fast.'
    ],
    correctVsIncorrect: [
      { wrong: 'Because it was late. We left.', right: 'Because it was late, we left.', why: 'Connect dependent clauses to main clauses.' }
    ],
    commonMistakes: 'Creating sentence fragments with dependent clauses.',
    practiceQuestions: [
      'Identify dependent clause: "Although it was raining, we played the match."'
    ]
  },
  {
    number: 20,
    id: 'gerunds',
    title: 'Gerunds',
    marathiTitle: 'धातुसाधित नामे (V-ing functioning as a Noun)',
    shortDesc: 'Verb ending in -ing acting as a subject or object (Swimming is fun).',
    category: 'Mastery',
    level: 'Intermediate',
    definition: 'A gerund is a verb form ending in -ing that functions as a noun in a sentence.',
    marathiExplanation: 'क्रियापदाला -ing लावून ते नामाप्रमाणे वापरणे. उदा. "Swimming is good for health" (पोहणे आरोग्यासाठी चांगले आहे).',
    rules: [
      'Always use a gerund after prepositions (interested in learning, good at speaking).',
      'Certain verbs are always followed by gerunds (enjoy, avoid, suggest, admit).'
    ],
    usage: 'Expressing activities, hobbies, and ideas as nouns.',
    structure: {
      affirmative: { formula: 'Gerund (Subject) + Verb + Object', example: 'Speaking English daily builds lasting confidence.' },
      negative: { formula: 'Subject + avoids / dislikes + Gerund', example: 'He avoids speaking in public.' },
      interrogative: { formula: 'Do you enjoy + Gerund?', example: 'Do you enjoy reading technical books?' },
      negativeInterrogative: { formula: 'Don\'t you mind + Gerund?', example: 'Don\'t you mind waiting for five minutes?' },
      whQuestions: { formula: 'What is your favorite + Gerund?', example: 'How did you improve your coding skills?' }
    },
    examples: [
      'I enjoy speaking with my AI tutor.',
      'She is interested in learning data science.'
    ],
    correctVsIncorrect: [
      { wrong: 'I look forward to meet you.', right: 'I look forward to meeting you.', why: '"To" is a preposition here; requires a gerund.' },
      { wrong: 'She avoids to make mistakes.', right: 'She avoids making mistakes.', why: '"Avoid" takes a gerund.' }
    ],
    commonMistakes: 'Using an infinitive after prepositions instead of a gerund.',
    practiceQuestions: [
      'Fill in: "She suggested ______ (go) to the library."'
    ]
  },
  {
    number: 21,
    id: 'infinitives',
    title: 'Infinitives',
    marathiTitle: 'मूळ धातुसाधिते (to + V1)',
    shortDesc: 'The base form of a verb preceded by "to" (I want to learn).',
    category: 'Mastery',
    level: 'Intermediate',
    definition: 'An infinitive is "to + base verb (V1)" that functions as a noun, adjective, or adverb.',
    marathiExplanation: 'क्रियापदाचे "to + V1" हे रूप. उदा. "I want to learn" (मला शिकायचे आहे).',
    rules: [
      'Certain verbs take infinitives (want, decide, hope, promise, plan, agree).',
      'Bare infinitives (without "to") follow modal verbs (can go, should study).'
    ],
    usage: 'Expressing intentions, goals, and desires.',
    structure: {
      affirmative: { formula: 'Subject + Verb + to + V1 + Object', example: 'I want to learn English.' },
      negative: { formula: 'Subject + decided + not to + V1', example: 'She decided not to give up.' },
      interrogative: { formula: 'Do you want + to + V1?', example: 'Do you want to practice conversation?' },
      negativeInterrogative: { formula: 'Didn\'t you promise + to + V1?', example: 'Didn\'t you promise to help him?' },
      whQuestions: { formula: 'What do you plan + to + V1?', example: 'What do you plan to do after college?' }
    },
    examples: [
      'I want to improve my English.',
      'He went to college to submit his assignment.'
    ],
    correctVsIncorrect: [
      { wrong: 'I want learn English.', right: 'I want to learn English.', why: '"Want" requires an infinitive "to learn".' }
    ],
    commonMistakes: 'Omitting "to" after verbs that require full infinitives.',
    practiceQuestions: [
      'Fill in: "She decided ______ (apply) for the internship."'
    ]
  },
  {
    number: 22,
    id: 'participles',
    title: 'Participles',
    marathiTitle: 'धातुसाधित विशेषणे (Present & Past Participles)',
    shortDesc: 'Verbs acting as adjectives: Present (-ing) and Past (-ed/-en).',
    category: 'Mastery',
    level: 'Advanced',
    definition: 'A participle is a verb form used as an adjective or used with helping verbs to create continuous and perfect tenses.',
    marathiExplanation: 'क्रियापदापासून बनलेली विशेषणे. Present Participle (-ing: an interesting book) आणि Past Participle (V3: an excited student).',
    rules: [
      '-ing participle describes what causes the feeling (The lecture was boring).',
      '-ed participle describes who experiences the feeling (The students were bored).'
    ],
    usage: 'Advanced descriptions and participle clauses.',
    structure: {
      affirmative: { formula: 'Subject + Verb + Participle (Adjective) + Noun', example: 'She gave an inspiring speech.' },
      negative: { formula: 'Subject + was not + Participle', example: 'The students were not interested.' },
      interrogative: { formula: 'Was the movie + Participle?', example: 'Was the lecture interesting?' },
      negativeInterrogative: { formula: 'Aren\'t you + Participle?', example: 'Aren\'t you excited about the hackathon?' },
      whQuestions: { formula: 'Why were you so + Participle?', example: 'Why were you so confused by the question?' }
    },
    examples: [
      'A barking dog rarely bites.',
      'The broken window was replaced yesterday.'
    ],
    correctVsIncorrect: [
      { wrong: 'I am very boring in this class.', right: 'I am very bored in this class.', why: 'Use -ed for how you feel; -ing for what causes it.' }
    ],
    commonMistakes: 'Confusing -ed (feeling) with -ing (cause of feeling).',
    practiceQuestions: [
      'Choose: "The results were very (disappointing / disappointed)."'
    ]
  },
  {
    number: 23,
    id: 'conditionals',
    title: 'Conditionals',
    marathiTitle: 'अटदर्शक वाक्ये (0, 1st, 2nd, 3rd & Mixed Conditionals)',
    shortDesc: 'If-then sentences: scientific facts, real futures, hypothetical situations, past regrets.',
    category: 'Mastery',
    level: 'Advanced',
    definition: 'Conditionals express that one action depends on the fulfillment of another condition.',
    marathiExplanation: 'जर... तर... अशी अट दर्शवणारी वाक्ये.',
    rules: [
      'Zero: If + present, present.',
      '1st: If + present, will + V1.',
      '2nd: If + past simple, would + V1.',
      '3rd: If + had V3, would have V3.'
    ],
    usage: 'Negotiations, planning, hypothetical problem-solving.',
    structure: {
      affirmative: { formula: 'If + Condition, + Result', example: 'If you practice speaking, you will become fluent.' },
      negative: { formula: 'If + negative condition, + negative result', example: 'If you don\'t practice, you won\'t improve.' },
      interrogative: { formula: 'If + condition, + will you + V1?', example: 'If it rains, will you stay home?' },
      negativeInterrogative: { formula: 'Wouldn\'t you + V1 + if + ...?', example: 'Wouldn\'t you help him if he asked?' },
      whQuestions: { formula: 'What would you do if + past condition?', example: 'What would you do if you won the hackathon?' }
    },
    examples: [
      '1st: If you study hard, you will pass the exam.',
      '2nd: If I were you, I would accept the job.'
    ],
    correctVsIncorrect: [
      { wrong: 'If you will work hard, you will pass.', right: 'If you work hard, you will pass.', why: 'Never use "will" in the if-clause.' }
    ],
    commonMistakes: 'Using "will" or "would" inside the if-clause.',
    practiceQuestions: [
      'Complete 2nd conditional: "If I ______ (have) money, I would travel."'
    ]
  },
  {
    number: 24,
    id: 'degrees-of-comparison',
    title: 'Degrees of Comparison',
    marathiTitle: 'तुलनादर्शक रूपे (Positive, Comparative, Superlative)',
    shortDesc: 'Comparing qualities: as...as, more/-er than, the most/-est.',
    category: 'Mastery',
    level: 'Intermediate',
    definition: 'Adjectives have three degrees of comparison: Positive, Comparative, and Superlative.',
    marathiExplanation: 'तुलना करण्यासाठी वापरली जाणारी रूपे: Positive (as...as), Comparative (taller than), Superlative (the tallest).',
    rules: [
      'Use Comparative for comparing two items (-er or more).',
      'Use Superlative for comparing three or more items (the -est or the most).'
    ],
    usage: 'Comparing products, performance, candidates, benchmarks.',
    structure: {
      affirmative: { formula: 'S1 + is + more + Adj + than + S2', example: 'Python is easier than C++.' },
      negative: { formula: 'S1 + is not as + Adj + as + S2', example: 'Pune is not as humid as Mumbai.' },
      interrogative: { formula: 'Is + S1 + better than + S2?', example: 'Is this method more efficient than that one?' },
      negativeInterrogative: { formula: 'Isn\'t + S + the + Superlative?', example: 'Isn\'t Mount Everest the highest peak?' },
      whQuestions: { formula: 'Which is + the + Superlative?', example: 'Which programming language is the most popular?' }
    },
    examples: [
      'Comparative: She is taller than her brother.',
      'Superlative: He is the smartest student in the class.'
    ],
    correctVsIncorrect: [
      { wrong: 'He is more taller than me.', right: 'He is taller than I am.', why: 'Do not use double comparatives.' }
    ],
    commonMistakes: 'Double comparatives (more better) and omitting "the" before superlatives.',
    practiceQuestions: [
      'Give comparative and superlative of "clever".'
    ]
  },
  {
    number: 25,
    id: 'determiners',
    title: 'Determiners',
    marathiTitle: 'निश्चायक शब्द (Articles, Demonstratives, Possessives, Numbers)',
    shortDesc: 'Words placed before nouns to clarify reference (this, that, my, each, every).',
    category: 'Mastery',
    level: 'Intermediate',
    definition: 'Determiners introduce a noun and provide context about quantity, possession, or definiteness.',
    marathiExplanation: 'नामाच्या आधी येऊन त्या नामाचा संदर्भ निश्चित करणारे शब्द. उदा. this, that, my, your, each, every.',
    rules: [
      'Determiners always come before the noun and any adjectives modifying it.'
    ],
    usage: 'Precise grammatical references.',
    structure: {
      affirmative: { formula: 'Determiner + Noun + Verb + Object', example: 'Every student submitted their assignment.' },
      negative: { formula: 'No + Noun + Verb', example: 'No student was absent.' },
      interrogative: { formula: 'Which + Determiner + Noun?', example: 'Which book belongs to you?' },
      negativeInterrogative: { formula: 'Isn\'t this + Determiner + Noun?', example: 'Isn\'t this your laptop?' },
      whQuestions: { formula: 'Whose + Noun + is this?', example: 'Whose bag is on the desk?' }
    },
    examples: [
      'Demonstrative: These laptops are configured.',
      'Distributive: Each candidate received an interview slot.'
    ],
    correctVsIncorrect: [
      { wrong: 'Every students have submitted.', right: 'Every student has submitted.', why: '"Every" takes a singular noun and singular verb.' }
    ],
    commonMistakes: 'Using plural nouns after "each" or "every".',
    practiceQuestions: [
      'Fill in: "______ (Each / All) student has a pass."'
    ]
  },
  {
    number: 26,
    id: 'quantifiers',
    title: 'Quantifiers',
    marathiTitle: 'प्रमाणदर्शक शब्द (some, any, much, many, few, little, a lot of)',
    shortDesc: 'Expressing quantity with countable and uncountable nouns.',
    category: 'Mastery',
    level: 'Intermediate',
    definition: 'Quantifiers indicate amount or quantity of nouns without stating exact numbers.',
    marathiExplanation: 'प्रमाण दाखवणारे शब्द: Countable साठी many, few; Uncountable साठी much, little; दोघांसाठी some, any, a lot of.',
    rules: [
      'Use "many", "few", "a few" with Countable nouns.',
      'Use "much", "little", "a little" with Uncountable nouns.',
      'Use "any" in questions and negative statements; "some" in positive statements.'
    ],
    usage: 'Describing supplies, time, money, and resources.',
    structure: {
      affirmative: { formula: 'Subject + Verb + some / a lot of + Noun', example: 'I have some questions about the project.' },
      negative: { formula: 'Subject + does not have + any / much + Noun', example: 'We do not have much time left.' },
      interrogative: { formula: 'Do you have + any / many + Noun?', example: 'Do you have any questions?' },
      negativeInterrogative: { formula: 'Don\'t you have + any + Noun?', example: 'Don\'t you have any reference notes?' },
      whQuestions: { formula: 'How much / How many + Noun + ...?', example: 'How many students attended the seminar?' }
    },
    examples: [
      'I bought a few books from the fair.',
      'There is a little milk in the refrigerator.'
    ],
    correctVsIncorrect: [
      { wrong: 'How much students are there?', right: 'How many students are there?', why: '"Students" is countable; use "many".' }
    ],
    commonMistakes: 'Using "much" with countable nouns.',
    practiceQuestions: [
      'Fill in: "There isn\'t ______ (many / much) water left."'
    ]
  },
  {
    number: 27,
    id: 'prepositions',
    title: 'Prepositions',
    marathiTitle: 'शब्दयोगी अव्यये (in, on, at, by, for, to, with, into, between)',
    shortDesc: 'Connecting words showing spatial, temporal, or logical relationships.',
    category: 'Foundations',
    level: 'Beginner',
    definition: 'Prepositions connect nouns or pronouns to other words in the sentence to show time, place, direction, or relationship.',
    marathiExplanation: 'शब्दांचा वाक्यातील इतर शब्दांशी संबंध दाखवणारी अव्यये. उदा. in, on, at, to, into, with, between, among.',
    rules: [
      'Use "at" for precise clock times and specific points.',
      'Use "on" for days, dates, and surfaces.',
      'Use "in" for months, years, centuries, and enclosed spaces.'
    ],
    usage: 'Locating objects, meeting times, and travel directions.',
    structure: {
      affirmative: { formula: 'Subject + Verb + Preposition + Object', example: 'I go to college at 8:00 AM on Monday.' },
      negative: { formula: 'Subject + Helping Verb + not + Preposition + Noun', example: 'He was not at home.' },
      interrogative: { formula: 'Are you + Preposition + Place?', example: 'Are you at the library?' },
      negativeInterrogative: { formula: 'Aren\'t you going to + Noun?', example: 'Aren\'t you going to the lecture?' },
      whQuestions: { formula: 'Where do you + Verb + Preposition?', example: 'Where did you travel to last week?' }
    },
    examples: [
      'The meeting is on Friday at 4:00 PM in Conference Hall 1.',
      'She walked into the room with confidence.'
    ],
    correctVsIncorrect: [
      { wrong: 'I go college everyday.', right: 'I go to college every day.', why: 'Movement verbs require "to" before destination.' },
      { wrong: 'Let us discuss about the matter.', right: 'Let us discuss the matter.', why: '"Discuss" takes direct object.' }
    ],
    commonMistakes: 'Omitting "to" after "go", or saying "discuss about".',
    practiceQuestions: [
      'Fill in: "The train arrives ______ 6:30 PM (at / on)."'
    ]
  },
  {
    number: 28,
    id: 'conjunctions',
    title: 'Conjunctions',
    marathiTitle: 'उभयान्वयी अव्यये (Coordinating, Subordinating, Correlative)',
    shortDesc: 'Connecting words and clauses (and, but, or, because, although, so, neither...nor).',
    category: 'Foundations',
    level: 'Beginner',
    definition: 'Conjunctions join words, phrases, or clauses together.',
    marathiExplanation: 'दोन किंवा अधिक शब्द, वाक्ये यांना जोडणाऱ्या शब्दाला Conjunction म्हणतात.',
    rules: [
      'Never use both "although" and "but" in the same sentence.',
      'Never pair "because" with "so".'
    ],
    usage: 'Creating compound and complex sentences.',
    structure: {
      affirmative: { formula: 'Clause 1 + Conjunction + Clause 2', example: 'She practiced daily and she succeeded.' },
      negative: { formula: 'Clause 1 + although + Negative Clause', example: 'He succeeded although he was not experienced.' },
      interrogative: { formula: 'Would you prefer + A + or + B?', example: 'Would you prefer tea or coffee?' },
      negativeInterrogative: { formula: 'Can\'t we start + although + ...?', example: 'Can\'t we start although it is raining?' },
      whQuestions: { formula: 'Why did you leave + because + ...?', example: 'Why did you resign when you loved the role?' }
    },
    examples: [
      'Coordinating: He worked hard, but he failed.',
      'Subordinating: I study English because it unlocks global careers.'
    ],
    correctVsIncorrect: [
      { wrong: 'Although he worked hard, but he failed.', right: 'Although he worked hard, he failed.', why: 'Do not use both "although" and "but".' }
    ],
    commonMistakes: 'Pairing "although...but" or "because...so".',
    practiceQuestions: [
      'Combine using "Although": "He was exhausted. He finished the work."'
    ]
  },
  {
    number: 29,
    id: 'punctuation',
    title: 'Punctuation',
    marathiTitle: 'विरामचिन्हे व लेखन नियम (Capitalization, Comma, Period, Apostrophe)',
    shortDesc: 'Rules governing capital letters, commas, periods, apostrophes, and quotation marks.',
    category: 'Mastery',
    level: 'Intermediate',
    definition: 'Punctuation marks clarify grammatical relationships and prevent ambiguity in writing.',
    marathiExplanation: 'Full Stop (.), Comma (,), Apostrophe (\'), Question Mark (?) इत्यादी विरामचिन्हे अचूक अर्थ समजण्यासाठी आवश्यक असतात.',
    rules: [
      'Always capitalize "I" and Proper Nouns.',
      'Do not use apostrophes on possessive pronouns (its, hers, theirs).'
    ],
    usage: 'Professional email writing, essays, and resumes.',
    structure: {
      affirmative: { formula: 'Capital + Sentence + Period (.)', example: 'SpeakWise AI is an intelligent tutor.' },
      negative: { formula: 'Subject + didn\'t + V1.', example: 'He didn\'t make any mistakes.' },
      interrogative: { formula: 'Capital + Question + (?)', example: 'Have you practiced today?' },
      negativeInterrogative: { formula: 'Aren\'t you coming?', example: 'Aren\'t you coming with us?' },
      whQuestions: { formula: 'Where did you go?', example: 'Where did you go yesterday?' }
    },
    examples: [
      'Contraction: It\'s raining (It is).',
      'Possession: Rohan\'s laptop (belonging to Rohan).'
    ],
    correctVsIncorrect: [
      { wrong: 'The dog wagged it\'s tail.', right: 'The dog wagged its tail.', why: '"Its" is possessive; "it\'s" is short for "it is".' }
    ],
    commonMistakes: 'Confusing "it\'s" and "its", putting apostrophes on plurals.',
    practiceQuestions: [
      'Correct: "its raining heavily outside"'
    ]
  },
  {
    number: 30,
    id: 'phrasal-verbs',
    title: 'Phrasal Verbs',
    marathiTitle: 'वाक्प्रचार (Verb + Preposition combinations)',
    shortDesc: 'Verbs combined with particles to create idiomatic meanings (give up, figure out).',
    category: 'Mastery',
    level: 'Advanced',
    definition: 'A phrasal verb combines a verb with a preposition or adverb to produce a unique idiomatic meaning.',
    marathiExplanation: 'Verb + Preposition एकत्र येऊन नवीन अर्थ तयार होतो. उदा. turn off, look after, figure out, give up.',
    rules: [
      'Learn phrasal verbs in context rather than memorizing isolated prepositions.'
    ],
    usage: 'Essential for natural native-like spoken fluency.',
    structure: {
      affirmative: { formula: 'Subject + Phrasal Verb + Object', example: 'She came up with an ingenious solution.' },
      negative: { formula: 'Subject + did not + Phrasal Verb', example: 'He did not back down.' },
      interrogative: { formula: 'Did you + Phrasal Verb?', example: 'Did you figure out the issue?' },
      negativeInterrogative: { formula: 'Why didn\'t you + Phrasal Verb?', example: 'Why didn\'t you bring up this topic?' },
      whQuestions: { formula: 'How did you + Phrasal Verb?', example: 'How did you come across this opportunity?' }
    },
    examples: [
      'Turn off: Please turn off the light before leaving.',
      'Give up: Never give up on your dreams.'
    ],
    correctVsIncorrect: [
      { wrong: 'Please close the light.', right: 'Please turn off the light.', why: 'Use "turn off" for appliances, not "close".' }
    ],
    commonMistakes: 'Translating idioms word-by-word from regional languages.',
    practiceQuestions: [
      'Replace "cancel" with a phrasal verb: "They canceled the meeting."'
    ]
  },
  {
    number: 31,
    id: 'common-grammar-mistakes',
    title: 'Common Grammar Mistakes',
    marathiTitle: 'वारंवार होणाऱ्या चुका व अचूक नियम (Indian English Pitfalls)',
    shortDesc: 'Diagnosing common transfer errors: "myself Ashu", "revert back", "did went".',
    category: 'Mastery',
    level: 'Intermediate',
    definition: 'Identifies and corrects the most frequent errors made by language learners.',
    marathiExplanation: 'मराठी किंवा हिंदीतून शब्दशः भाषांतर केल्यामुळे वारंवार होणाऱ्या चुका आणि त्यांचे योग्य इंग्रजी रूप.',
    rules: [
      'Avoid literal word-by-word translation from mother tongue.'
    ],
    usage: 'Job interviews, campus placements, and client communications.',
    structure: {
      affirmative: { formula: 'Standard: My name is [Name].', example: 'My name is Ashwini Kawale.' },
      negative: { formula: 'Standard: I did not understand.', example: 'I did not understand the requirement.' },
      interrogative: { formula: 'Standard: Could you please reply?', example: 'Could you please reply to this email?' },
      negativeInterrogative: { formula: 'Standard: Aren\'t you coming?', example: 'You are coming, aren\'t you?' },
      whQuestions: { formula: 'Standard: Why are you late?', example: 'Why did you arrive late?' }
    },
    examples: [
      '"revert back" → simply "revert" or "reply".',
      '"today morning" → "this morning".',
      '"cousin brother" → simply "cousin".'
    ],
    correctVsIncorrect: [
      { wrong: 'Myself Rahul from Pune.', right: 'I am Rahul from Pune.', why: '"Myself" is reflexive, not a subject.' },
      { wrong: 'I have a doubt in this chapter.', right: 'I have a question in this chapter.', why: 'Use "question" instead of "doubt".' }
    ],
    commonMistakes: 'Using reflexive pronouns for self-introduction, adding "back" after "revert".',
    practiceQuestions: [
      'Correct: "Please revert back as soon as possible."'
    ]
  },
  {
    number: 32,
    id: 'formal-informal-english',
    title: 'Formal & Informal English',
    marathiTitle: 'औपचारिक व अनौपचारिक भाषा शैली (Corporate vs Casual English)',
    shortDesc: 'Adapting vocabulary and tone for emails, interviews, and casual conversations.',
    category: 'Mastery',
    level: 'Advanced',
    definition: 'Stylistic variation in English depending on relationship, audience, and setting.',
    marathiExplanation: 'कॉलेज, ऑफिस किंवा मुलाखतीत Formal English वापरतात; मित्रांसोबत Informal English बोलतात.',
    rules: [
      'Avoid slang, casual contractions, and emojis in professional communications.'
    ],
    usage: 'Business emails, interviews, meetings, and presentations.',
    structure: {
      affirmative: { formula: 'Formal: I would be grateful if you could + V1', example: 'I would appreciate it if you could review my resume.' },
      negative: { formula: 'Formal: I regret to inform you that + ...', example: 'I regret to inform you that I cannot attend.' },
      interrogative: { formula: 'Formal: Could you please + V1?', example: 'Could you please grant me permission?' },
      negativeInterrogative: { formula: 'Formal: Would it not be advisable to + V1?', example: 'Would it not be advisable to check the metrics?' },
      whQuestions: { formula: 'Formal: At what time would it be convenient to meet?', example: 'When would it be convenient for our discussion?' }
    },
    examples: [
      'Informal: Thanks a lot! → Formal: Thank you very much for your assistance.',
      'Informal: Can you fix this? → Formal: Could you please look into this issue?'
    ],
    correctVsIncorrect: [
      { wrong: 'Hey sir, check my resume.', right: 'Dear Sir, would you please review my resume?', why: 'Use respectful professional phrasing.' }
    ],
    commonMistakes: 'Using casual slang in corporate emails.',
    practiceQuestions: [
      'Make formal: "Tell me what happened."'
    ]
  },
  {
    number: 33,
    id: 'sentence-transformation',
    title: 'Sentence Transformation',
    marathiTitle: 'वाक्य रूपांतरण (Affirmative to Negative, Exclamatory to Assertive)',
    shortDesc: 'Changing the form of a sentence without altering its original meaning.',
    category: 'Mastery',
    level: 'Advanced',
    definition: 'Sentence transformation involves rewriting a sentence in a different grammatical structure without changing its core meaning.',
    marathiExplanation: 'वाक्याचा मूळ अर्थ न बदलता त्याचे रूप बदलणे. उदा. होकारार्थीचे नकारार्थी किंवा उद्गारार्थीचे विधानाती करणे.',
    rules: [
      'When converting affirmative to negative, use opposite words with "not" (e.g. He is wise → He is not foolish).'
    ],
    usage: 'English grammar examinations and stylistic writing versatility.',
    structure: {
      affirmative: { formula: 'Affirmative: He is an honest person.', example: 'He is an honest person.' },
      negative: { formula: 'Negative: He is not a dishonest person.', example: 'He is not a dishonest person.' },
      interrogative: { formula: 'Interrogative to Assertive: Who does not know Mahatma Gandhi? → Everyone knows Mahatma Gandhi.', example: 'Who does not love freedom?' },
      negativeInterrogative: { formula: 'Isn\'t knowledge power? → Knowledge is power.', example: 'Isn\'t truth powerful?' },
      whQuestions: { formula: 'How can anyone forget this kindness? → No one can forget this kindness.', example: 'Who does not desire happiness?' }
    },
    examples: [
      'Assertive to Exclamatory: It is a very beautiful flower. → What a beautiful flower it is!',
      'Active to Passive transformation.'
    ],
    correctVsIncorrect: [
      { wrong: 'Affirmative: She is rich. → Negative: She is not rich.', right: 'Negative: She is not poor.', why: 'Transformation must preserve the original meaning.' }
    ],
    commonMistakes: 'Inverting the sentence meaning when making negative transformations.',
    practiceQuestions: [
      'Transform into negative without changing meaning: "She is always punctual."'
    ]
  },
  {
    number: 34,
    id: 'question-formation',
    title: 'Question Formation',
    marathiTitle: 'प्रश्न निर्मितीचे नियम (Yes/No & Subject-Auxiliary Inversion)',
    shortDesc: 'Rules for building accurate Yes/No questions and subject-verb inversions.',
    category: 'Mastery',
    level: 'Beginner',
    definition: 'The grammatical process of constructing inquiries by inverting the auxiliary verb before the subject.',
    marathiExplanation: 'इंग्रजीत प्रश्न तयार करण्याचे अचूक नियम. Yes/No प्रश्नांमध्ये Helping Verb कर्त्याच्या आधी येते.',
    rules: [
      'If an auxiliary verb is present: Auxiliary + Subject + Main Verb.',
      'If no auxiliary verb is present: Insert Do / Does / Did.'
    ],
    usage: 'Conducting conversations, interviews, inquiries.',
    structure: {
      affirmative: { formula: 'Statement: Subject + Auxiliary + Verb.', example: 'She is learning English.' },
      negative: { formula: 'Negative Question: Auxiliary + not + Subject + Verb?', example: 'Isn\'t she learning English?' },
      interrogative: { formula: 'Auxiliary + Subject + Verb?', example: 'Is she learning English?' },
      negativeInterrogative: { formula: 'Don\'t / Doesn\'t + Subject + Verb?', example: 'Doesn\'t he speak Marathi?' },
      whQuestions: { formula: 'WH + Auxiliary + Subject + Verb?', example: 'Why is she learning English?' }
    },
    examples: [
      'Statement: They live in Pune. → Question: Do they live in Pune?',
      'Statement: He finished the work. → Question: Did he finish the work?'
    ],
    correctVsIncorrect: [
      { wrong: 'You are coming to college?', right: 'Are you coming to college?', why: 'In English, invert the auxiliary verb in questions.' }
    ],
    commonMistakes: 'Using statement word order with rising intonation instead of auxiliary inversion.',
    practiceQuestions: [
      'Form a question: "She has completed her bachelor degree."'
    ]
  }
];

export const GRAMMAR_DATA = {
  basic: GRAMMAR_TOPICS.filter(t => t.category === 'Foundations'),
  tenses: TENSES_DATA,
  advanced: GRAMMAR_TOPICS.filter(t => t.category === 'Mastery' || t.category === 'Sentence Structure')
};
