/**
 * English Grammar Detection and Polite Correction Service
 * Analyzes user English input for real grammatical errors.
 * IMPORTANT: Never invents errors for grammatically correct sentences like "I am going to college."
 */

const GRAMMAR_RULES = [
  {
    name: "practicing_eng",
    pattern: /\bi\s+am\s+practicing\s+eng\b/i,
    better: "I am practicing English.",
    reason: "Spell out 'English' in full with a capital 'E', rather than using the abbreviation 'eng'."
  },
  {
    name: "eng_abbreviation",
    pattern: /\b(speak|learning|practicing|studying|speak|learn|practice)\s+eng\b/i,
    better: (match) => match.input.replace(/\beng\b/gi, "English"),
    reason: "Use the full word 'English' (capitalized) instead of the informal abbreviation 'eng'."
  },
  {
    name: "means_how_to_apologize",
    pattern: /\bmeans?\s+how\s+to\s+(?:apololize|apologize|apolagize)\b/i,
    better: "I mean, how do I apologize?",
    reason: "In English, express this as a clear question: 'How do I apologize?' or 'I mean, how do I apologize?'"
  },
  {
    name: "ai_help_students",
    pattern: /\bai\s+help\s+students?\b/i,
    better: (match) => match.input.replace(/\bai\s+help\s+students?/gi, "AI helps students"),
    reason: "Because 'AI' is singular, use 'helps'."
  },
  {
    name: "spelling_apologize",
    pattern: /\b(apololize|apolagize)\b/i,
    better: (match) => match.input.replace(/\b(apololize|apolagize)\b/gi, "apologize"),
    reason: "'apologize' is spelled a-p-o-l-o-g-i-z-e."
  },
  {
    name: "spelling_my_self",
    pattern: /\bmy\s+self\b/i,
    better: (match) => match.input.replace(/\bmy\s+self\b/gi, "myself"),
    reason: "'myself' is written as a single word."
  },
  {
    name: "capitalization_i_am_learning_python",
    pattern: /^i\s+am\s+learning\s+python\.?$/i,
    better: "I am learning Python.",
    reason: "In English, always capitalize 'I' and proper nouns like the programming language 'Python'."
  },
  {
    name: "multi_mistake_wake_up_go_college_scold",
    pattern: /\btoday\s+i\s+wake\s+up\s+late\s+and\s+i\s+go\s+(?:to\s+)?college\.?\s*(?:the\s+)?teacher\s+scold(?:ed)?\s+me\b/i,
    better: "Today I woke up late and went to college. The teacher scolded me.",
    reason: "Mistakes:\n• 'wake up' → 'woke up' (use simple past for an action completed earlier today)\n• 'go college' → 'went to college' (use preposition 'to' and past tense 'went')\n• 'teacher scold me' → 'the teacher scolded me' (use definite article 'the' and past tense 'scolded')"
  },
  {
    name: "i_go_college_and_meet_my_friends",
    pattern: /\bi\s+go\s+(?:to\s+)?college\s+and\s+meet\s+my\s+friends?\b/i,
    better: "I went to college and met my friends.",
    reason: "Mistakes:\n• 'go college' → 'went to college' (use preposition 'to' and past tense 'went' for an event that happened earlier)\n• 'meet' → 'met' (use past tense 'met')"
  },
  {
    name: "yesterday_i_eat",
    pattern: /\byesterday\s+i\s+eat\b/i,
    better: (match) => match.input.replace(/\byesterday\s+i\s+eat\b/i, "Yesterday I ate"),
    reason: "Because 'yesterday' refers to a completed past action, use the past tense verb 'ate' instead of the present tense 'eat'."
  },
  {
    name: "i_am_doing_study",
    pattern: /\bi\s+am\s+doing\s+study\b/i,
    better: "I am studying.",
    reason: "In English, 'study' is already an active verb, so we say 'I am studying' rather than 'I am doing study'."
  },
  {
    name: "continuous_present_simple_confusion",
    pattern: /\bi\s+am\s+go\s+(?:to\s+)?college\s+(everyday|every\s+day)\b/i,
    better: "I go to college every day.",
    reason: "For regular daily habits, we use the simple present tense ('I go to college every day') rather than 'I am go'."
  },
  {
    name: "she_he_subject_verb_agreement",
    pattern: /\b(he|she|it|everyone|someone)\s+(go|come|do|like|want|speak|play)\b/i,
    better: (match) => {
      const verbMap = { go: 'goes', come: 'comes', do: 'does', like: 'likes', want: 'wants', speak: 'speaks', play: 'plays' };
      const sub = match[1];
      const verb = match[2].toLowerCase();
      const correctedVerb = verbMap[verb] || `${verb}s`;
      return match.input.replace(new RegExp(`\\b${sub}\\s+${verb}\\b`, 'i'), `${sub} ${correctedVerb}`);
    },
    reason: "With 'she/he/it' (third-person singular) in the simple present tense, the verb takes -s/-es (e.g. 'She goes to college every day')."
  },
  {
    name: "she_he_dont",
    pattern: /\b(he|she|it)\s+don't\b/i,
    better: (match) => match.input.replace(/\bdon't\b/i, "doesn't"),
    reason: "Use 'doesn't' with third-person singular subjects like 'he' or 'she' ('She doesn't know')."
  },
  {
    name: "past_tense_yesterday",
    pattern: /\bi\s+go\s+(to\s+)?college\s+yesterday\s+and\s+meet\s+my\s+friend\b/i,
    better: "I went to college yesterday and met my friend.",
    reason: "Because you are talking about an action completed in the past ('yesterday'), use past tense verbs: 'went' and 'met'."
  },
  {
    name: "missing_to_destination",
    pattern: /\b(i|we|they|you|he|she)\s+(go|went|going)\s+(college|school|hospital|market|home)\b/i,
    better: (match) => {
      const dest = match[3].toLowerCase();
      if (dest === 'home') return null; // 'go home' is correct!
      return match.input.replace(new RegExp(`\\b(${match[2]})\\s+(${match[3]})\\b`, 'i'), `$1 to $2`);
    },
    reason: "When referring to movement toward a destination like college or school, use the preposition 'to' ('go to college')."
  },
  {
    name: "double_past_didnt",
    pattern: /\b(i|you|he|she|we|they)\s+didn't\s+(went|came|saw|ate|met)\b/i,
    better: (match) => {
      const verbMap = { went: 'go', came: 'come', saw: 'see', ate: 'eat', met: 'meet' };
      const verb = match[2].toLowerCase();
      return match.input.replace(new RegExp(`didn't\\s+${verb}`, 'i'), `didn't ${verbMap[verb] || verb}`);
    },
    reason: "After 'didn't' (did not), the main verb should remain in its base form ('didn't go', not 'didn't went')."
  },
  {
    name: "i_am_agree",
    pattern: /\bi\s+am\s+agree\b/i,
    better: (match) => match.input.replace(/\bi\s+am\s+agree\b/i, "I agree"),
    reason: "'Agree' is already an active verb in English, so we say 'I agree' instead of 'I am agree'."
  },
  {
    name: "article_an_university",
    pattern: /\ban\s+university\b/i,
    better: (match) => match.input.replace(/\ban\s+university\b/i, "a university"),
    reason: "'University' begins with a consonant sound ('yoo'), so we use 'a' instead of 'an'."
  },
  {
    name: "article_a_hour",
    pattern: /\ba\s+hour\b/i,
    better: (match) => match.input.replace(/\ba\s+hour\b/i, "an hour"),
    reason: "The 'h' in 'hour' is silent, beginning with an open vowel sound, so we use 'an hour'."
  },
  {
    name: "represent_myself",
    pattern: /\b(?:would\s+like\s+to\s+)?represent\s+(?:my\s*self|myself)\b/i,
    better: (match) => match.input.replace(/\brepresent\s+(?:my\s*self|myself)\b/i, "introduce myself"),
    reason: "When talking about presenting who you are, use 'introduce myself'. 'Represent' usually means acting or speaking on behalf of a company or organization."
  },
  {
    name: "you_find_my_mistake",
    pattern: /\byou\s+find\s+my\s+mistake(?:s)?\s+and\s+tell\s+me\s+(?:this\s+is\s+wrong|what\s+is\s+wrong)\b/i,
    better: "Can you find my mistakes and tell me what is wrong?",
    reason: "In English, phrasing this as a polite request is natural: 'Can you find my mistakes and tell me what is wrong?'"
  },
  {
    name: "what_are_you_okay",
    pattern: /^what\s+are\s+you\s+okay\??$/i,
    better: "Are you okay?",
    reason: "To ask about someone's wellbeing, say 'Are you okay?' rather than 'what are you okay'."
  },
  {
    name: "feel_tired_lot_of_work",
    pattern: /\bi\s+feel\s+tired\s+and\s+i\s+have\s+(?:a\s+)?lot\s+of\s+work\s+how\s+i\s+can\s+manage\b/i,
    better: "I feel tired and I have a lot of work. How can I manage everything?",
    reason: "Use 'a lot of work' (with 'a') and invert the subject and auxiliary verb in questions: 'How can I manage...'."
  },
  {
    name: "cant_understand_english",
    pattern: /\bi\s+(?:cant|cannot)\s+understand\s+english\b/i,
    better: "I can't understand English.",
    reason: "We use 'can't' with an apostrophe (contraction for 'cannot'), and 'English' should always be capitalized."
  },
  {
    name: "suggest_me_where_to_start",
    pattern: /\bsuggest\s+me\s+where\s+i\s+(?:have|need|should)\s+to\s+start\b/i,
    better: "Please suggest where I should start.",
    reason: "In English, 'suggest' does not take an indirect pronoun like 'suggest me'. Instead, say 'Please suggest where I should start' or 'Can you suggest where I should start?'. Also, use 'should start' rather than 'have to start'."
  },
  {
    name: "lot_of_woring_for_today",
    pattern: /\b(?:have|got)\s+(?:a\s+)?lot\s+of\s+woring\s+(?:for\s+|to\s+)?today\b/i,
    better: "I have a lot of work for today.",
    reason: "Mistakes:\n- 'woring' → 'work' (in this sentence, 'work' is a noun meaning tasks to complete)\n- 'have lot of' → 'have a lot of' (use the indefinite article 'a')"
  },
  {
    name: "spelling_woring_work",
    pattern: /\bworing\b/i,
    better: (match) => {
      if (/(?:lot\s+of|much|have|had)\s+woring/i.test(match.input)) {
        return match.input.replace(/\bworing\b/gi, 'work');
      }
      return match.input.replace(/\bworing\b/gi, 'working');
    },
    reason: "Based on the sentence context, 'work' is the intended noun."
  },
  {
    name: "how_i_can_improve",
    pattern: /\bhow\s+i\s+can\s+(?:improve|learn|speak|practice)\s+(?:my\s+)?english\b/i,
    better: "How can I improve my English?",
    reason: "In English questions, place the modal auxiliary verb ('can') before the subject ('I'): 'How can I improve my English?'. Always capitalize 'English'."
  },
  {
    name: "how_we_can_use_tense",
    pattern: /\bhow\s+we\s+can\s+use\s+(?:the\s+)?(present|past|future)\s+tense\??/i,
    better: (match) => {
      const tense = match[1].toLowerCase();
      return `How can we use the ${tense} tense?`;
    },
    reason: "In English questions, place the auxiliary verb ('can') before the subject ('we'): 'How can we use...'. Also use the definite article 'the' before tense names."
  },
  {
    name: "spelling_daily_habits",
    pattern: /\bdaily\s+habbits\b/i,
    better: "daily habits",
    reason: "'habits' is spelled with a single 'b' ('daily habits')."
  },
  {
    name: "spelling_habbits",
    pattern: /\bhabbits\b/i,
    better: (match) => match.input.replace(/\bhabbits\b/gi, "habits"),
    reason: "'habits' is spelled with a single 'b'."
  },
  {
    name: "cant_apostrophe",
    pattern: /\b(i|you|he|she|we|they)\s+cant\b/i,
    better: (match) => match.input.replace(/\bcant\b/gi, "can't"),
    reason: "Use 'can't' with an apostrophe (contraction of 'cannot')."
  },
  {
    name: "what_was_doing",
    pattern: /^what\s+(?:was|were)\s+doing\??$/i,
    better: "What were you doing?",
    reason: "Because the subject is 'you', we use 'were', not 'was'."
  },
  {
    name: "what_was_you_doing",
    pattern: /\bwhat\s+(?:was|is)\s+(?:you|u)\s+doing\b/i,
    better: "What were you doing?",
    reason: "Because the subject is 'you', we use 'were', not 'was'."
  },
  {
    name: "what_you_was_doing",
    pattern: /\bwhat\s+(?:you|u)\s+was\s+doing\b/i,
    better: "What were you doing?",
    reason: "Because the subject is 'you', we use 'were', not 'was'."
  },
  {
    name: "what_you_were_doing_question",
    pattern: /^what\s+(?:you|u)\s+were\s+doing\??$/i,
    better: "What were you doing?",
    reason: "In English questions, invert the auxiliary verb ('were') before the subject ('you'): 'What were you doing?'."
  },
  {
    name: "complaint_dont_help_sentense_wrong",
    pattern: /\byou\s+dont\s+help\s+me\s+just\s+tell\s+these\s+sentense\s+wrong\s+and\s+you\s+even\s+dont\s+correct\s+the\s+statement\b/i,
    better: "You don't help me. You just tell me that these sentences are wrong, but you don't even correct them.",
    reason: "Mistakes:\n• dont → don't\n• sentense → sentence\n• 'these sentense' → 'these sentences'\n• 'correct the statement' → 'correct them'"
  },
  {
    name: "why_you_dont_correct",
    pattern: /\bwhy\s+you\s+(?:dont|don't)\s+correct\s+(?:my\s+)?english\b/i,
    better: "Why don't you correct my English?",
    reason: "In English questions, place the auxiliary verb ('don't') before the subject ('you')."
  },
  {
    name: "spelling_sentense",
    pattern: /\bsentense\b/i,
    better: (match) => match.input.replace(/\bsentense\b/gi, "sentence"),
    reason: "'sentence' is spelled with 'c', not 's'."
  },
  {
    name: "missing_article_a_lot_of",
    pattern: /\b(?:have|has|had|got)\s+lot\s+of\b/i,
    better: (match) => match.input.replace(/\blot\s+of\b/gi, "a lot of"),
    reason: "Use the indefinite article 'a' in the phrase 'a lot of'."
  }
];

// Check text for actual grammar mistakes
const checkGrammar = (text, context = {}) => {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();

  // Explicit safe checks: grammatically valid sentences or educational queries should NEVER trigger false positives
  if (
    /^i\s+went\s+to\s+college(\s+today)?\.?$/i.test(clean) ||
    /^i\s+studied\s+(?:python|english|maths|science)(\s+today)?\.?$/i.test(clean) ||
    /^i\s+ate\s+pizza(\s+yesterday)?\.?$/i.test(clean) ||
    /^i\s+met\s+my\s+friends?\.?$/i.test(clean) ||
    /^i\s+am\s+going\s+to\s+college\b/i.test(clean) ||
    /^i\s+am\s+chatting\s+with\s+you\b/i.test(clean) ||
    /^i\s+am\s+tired(\s+today)?\.?$/i.test(clean) ||
    /^not\s+bad\.?$/i.test(clean) ||
    /^(?:the\s+)?present\s+tense$/i.test(clean) ||
    /^what\s+is\s+simple\s+present(\s+tense)?\??$/i.test(clean) ||
    /^give\s+me\s+examples?\s+of\s+present\s+tense$/i.test(clean) ||
    /^how\s+can\s+i\s+improve\s+my\s+english\??$/i.test(clean) ||
    /^what\s+were\s+you\s+doing\??$/i.test(clean) ||
    /^what\s+are\s+you\s+doing\??$/i.test(clean) ||
    /^(?:yes|no)(?:,\s*i\s+(?:did|didn't|do|don't))?\.?$/i.test(clean) ||
    /^check\s+my\s+answer$/i.test(clean)
  ) {
    return null;
  }

  for (const rule of GRAMMAR_RULES) {
    const match = clean.match(rule.pattern);
    if (match) {
      const better = typeof rule.better === 'function' ? rule.better(match) : rule.better;
      if (!better) continue;

      return {
        hasError: true,
        original: clean,
        better: better,
        explanation: rule.reason,
        ruleName: rule.name
      };
    }
  }

  // Check past tense with 'yesterday' if base form verbs were used
  if (/\byesterday\b/i.test(clean)) {
    if (/\b(i|we|he|she|they)\s+(go|eat|see|meet|come|buy)\b/i.test(clean)) {
      return {
        hasError: true,
        original: clean,
        better: clean
          .replace(/\bgo\b/gi, 'went')
          .replace(/\beat\b/gi, 'ate')
          .replace(/\bsee\b/gi, 'saw')
          .replace(/\bmeet\b/gi, 'met')
          .replace(/\bcome\b/gi, 'came')
          .replace(/\bbuy\b/gi, 'bought'),
        explanation: "When describing events that occurred 'yesterday', verbs should be in the simple past tense.",
        ruleName: "past_tense_indicator"
      };
    }
  }

  // Context-aware past tense checks (e.g. answering "What did you do today?")
  if (context && context.isPastContext) {
    if (/^i\s+meet\s+my\s+friends?\.?$/i.test(clean)) {
      return {
        hasError: true,
        original: clean,
        better: clean.replace(/\bmeet\b/i, 'met'),
        explanation: "Since you are talking about an action completed earlier today, use the past tense verb 'met' instead of 'meet'.",
        ruleName: "context_past_tense_meet"
      };
    }
    if (/^i\s+go\s+to\s+college\.?$/i.test(clean)) {
      return {
        hasError: true,
        original: clean,
        better: clean.replace(/\bgo\b/i, 'went'),
        explanation: "Since you are talking about what you did earlier today, use the past tense verb 'went' instead of 'go'.",
        ruleName: "context_past_tense_go"
      };
    }
  }

  return null;
};

module.exports = {
  checkGrammar,
  GRAMMAR_RULES
};
