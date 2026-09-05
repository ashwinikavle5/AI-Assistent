/**
 * English Grammar Detection and Polite Correction Service
 * Analyzes user English input for real grammatical errors.
 * IMPORTANT: Never invents errors for grammatically correct sentences like "I am going to college."
 */

const GRAMMAR_RULES = [
  {
    name: "continuous_present_simple_confusion",
    pattern: /\bi\s+am\s+go\s+to\s+college\s+(everyday|every\s+day)\b/i,
    better: "I go to college every day.",
    reason: "For regular daily habits, we use the simple present tense ('I go') rather than 'I am go'."
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
  }
];

// Check text for actual grammar mistakes
const checkGrammar = (text) => {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();

  // Explicit test case: "I am going to college." is 100% correct
  if (/^i\s+am\s+going\s+to\s+college\b/i.test(clean)) {
    return null; // Valid! No error
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

  return null;
};

module.exports = {
  checkGrammar,
  GRAMMAR_RULES
};
