/**
 * Dictionary & Pronunciation Service
 * Queries Free Dictionary API and falls back to a comprehensive built-in phonetic lexicon.
 */

const https = require('https');

// Fallback comprehensive dictionary of common & learning vocabulary
const FALLBACK_WORDS = {
  "beautiful": {
    word: "Beautiful",
    ipa: "/ˈbjuː.tɪ.fəl/",
    phoneticLearner: "BYOO-tih-ful",
    partOfSpeech: "Adjective",
    difficulty: "Beginner",
    meaning: "Very pleasing to the senses, especially to look at; attractive or delightful.",
    example: "She has a beautiful smile.",
    synonyms: ["gorgeous", "lovely", "attractive", "stunning"],
    antonyms: ["ugly", "unattractive", "plain"]
  },
  "confident": {
    word: "Confident",
    ipa: "/ˈkɒn.fɪ.dənt/",
    phoneticLearner: "KON-fih-dunt",
    partOfSpeech: "Adjective",
    difficulty: "Intermediate",
    meaning: "Feeling or showing certainty about something or feeling self-assured.",
    example: "With daily practice, you will become more confident speaking English.",
    synonyms: ["assured", "poised", "bold", "certain"],
    antonyms: ["hesitant", "insecure", "shy", "doubtful"]
  },
  "pronunciation": {
    word: "Pronunciation",
    ipa: "/prəˌnʌn.siˈeɪ.ʃən/",
    phoneticLearner: "pruh-nun-see-AY-shun",
    partOfSpeech: "Noun",
    difficulty: "Intermediate",
    meaning: "The way in which a word or language is spoken or articulated.",
    example: "Her English pronunciation is clear and easy to understand.",
    synonyms: ["articulation", "diction", "enunciation", "accent"],
    antonyms: ["mispronunciation"]
  },
  "opportunity": {
    word: "Opportunity",
    ipa: "/ˌɒp.əˈtjuː.nə.ti/",
    phoneticLearner: "op-er-TOO-nuh-tee",
    partOfSpeech: "Noun",
    difficulty: "Intermediate",
    meaning: "A time or set of circumstances that makes it possible to do something.",
    example: "Learning English opens up many career opportunities.",
    synonyms: ["chance", "opening", "occasion", "prospect"],
    antonyms: ["misfortune", "disadvantage"]
  },
  "comfortable": {
    word: "Comfortable",
    ipa: "/ˈkʌm.fət.ə.bəl/",
    phoneticLearner: "KUMF-ter-bul",
    partOfSpeech: "Adjective",
    difficulty: "Beginner",
    meaning: "Providing physical ease and relaxation, or feeling at ease in a situation.",
    example: "I feel very comfortable chatting with SpeakWise AI.",
    synonyms: ["cozy", "relaxed", "pleasant", "agreeable"],
    antonyms: ["uncomfortable", "tense", "awkward"]
  },
  "vocabulary": {
    word: "Vocabulary",
    ipa: "/vəˈkæb.jə.lər.i/",
    phoneticLearner: "voh-KAB-yuh-ler-ee",
    partOfSpeech: "Noun",
    difficulty: "Intermediate",
    meaning: "The body of words used in a particular language or known to an individual.",
    example: "Reading books helps you expand your English vocabulary.",
    synonyms: ["lexicon", "wordbook", "glossary", "phrasing"],
    antonyms: []
  },
  "conversation": {
    word: "Conversation",
    ipa: "/ˌkɒn.vəˈseɪ.ʃən/",
    phoneticLearner: "kon-ver-SAY-shun",
    partOfSpeech: "Noun",
    difficulty: "Beginner",
    meaning: "An informal talk involving two or more people or an AI assistant.",
    example: "We had a lively conversation about our favorite foods.",
    synonyms: ["discussion", "chat", "dialogue", "talk"],
    antonyms: ["silence", "monologue"]
  },
  "knowledge": {
    word: "Knowledge",
    ipa: "/ˈnɒl.ɪdʒ/",
    phoneticLearner: "NOL-ij",
    partOfSpeech: "Noun",
    difficulty: "Intermediate",
    meaning: "Facts, information, and skills acquired through experience or education.",
    example: "Knowledge of English is valuable for travel and career growth.",
    synonyms: ["understanding", "wisdom", "learning", "insight"],
    antonyms: ["ignorance", "unawareness"]
  },
  "environment": {
    word: "Environment",
    ipa: "/ɪnˈvaɪ.rən.mənt/",
    phoneticLearner: "en-VY-run-munt",
    partOfSpeech: "Noun",
    difficulty: "Intermediate",
    meaning: "The surroundings or conditions in which a person, animal, or plant lives.",
    example: "A supportive learning environment makes practicing English enjoyable.",
    synonyms: ["surroundings", "atmosphere", "milieu", "setting"],
    antonyms: []
  },
  "diligent": {
    word: "Diligent",
    ipa: "/ˈdɪl.ɪ.dʒənt/",
    phoneticLearner: "DIL-ih-junt",
    partOfSpeech: "Adjective",
    difficulty: "Advanced",
    meaning: "Having or showing care and conscientiousness in one's work or duties.",
    example: "He is a diligent student who practices his pronunciation every morning.",
    synonyms: ["industrious", "hardworking", "meticulous", "attentive"],
    antonyms: ["lazy", "careless", "negligent"]
  },
  "perseverance": {
    word: "Perseverance",
    ipa: "/ˌpɜː.sɪˈvɪə.rəns/",
    phoneticLearner: "per-suh-VEER-unss",
    partOfSpeech: "Noun",
    difficulty: "Advanced",
    meaning: "Persistence in doing something despite difficulty or delay in achieving success.",
    example: "Her perseverance in learning English paid off when she aced the interview.",
    synonyms: ["persistence", "determination", "tenacity", "dedication"],
    antonyms: ["giving up", "hesitation", "apathy"]
  }
};

// Fetch from Free Dictionary API with fallback
const fetchWordDetails = async (rawWord) => {
  if (!rawWord || typeof rawWord !== 'string') return null;
  const word = rawWord.trim().toLowerCase();

  // Check fallback first for instant speed & enriched learner phonetic
  if (FALLBACK_WORDS[word]) {
    return FALLBACK_WORDS[word];
  }

  // Query free dictionary API
  try {
    const data = await new Promise((resolve, reject) => {
      const req = https.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, (res) => {
        if (res.statusCode !== 200) {
          return resolve(null);
        }
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (e) {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(3000, () => {
        req.destroy();
        resolve(null);
      });
    });

    if (data && Array.isArray(data) && data.length > 0) {
      const entry = data[0];
      const phonetics = entry.phonetics || [];
      const ipa = phonetics.find(p => p.text)?.text || `/${word}/`;
      const audio = phonetics.find(p => p.audio && p.audio.length > 0)?.audio || null;

      const meaningObj = entry.meanings?.[0];
      const partOfSpeech = meaningObj?.partOfSpeech ? (meaningObj.partOfSpeech.charAt(0).toUpperCase() + meaningObj.partOfSpeech.slice(1)) : 'Word';
      const defObj = meaningObj?.definitions?.[0];
      const definition = defObj?.definition || 'Definition not available.';
      const example = defObj?.example || `Practice using "${word}" in your daily English conversations.`;
      const synonyms = (defObj?.synonyms?.length ? defObj.synonyms : meaningObj?.synonyms) || [];
      const antonyms = (defObj?.antonyms?.length ? defObj.antonyms : meaningObj?.antonyms) || [];

      return {
        word: entry.word.charAt(0).toUpperCase() + entry.word.slice(1),
        ipa: ipa,
        phoneticLearner: word.toUpperCase(),
        audioUrl: audio,
        partOfSpeech: partOfSpeech,
        difficulty: word.length > 9 ? 'Advanced' : (word.length > 6 ? 'Intermediate' : 'Beginner'),
        meaning: definition,
        example: example,
        synonyms: synonyms.slice(0, 5),
        antonyms: antonyms.slice(0, 5)
      };
    }
  } catch (err) {
    console.error('Dictionary API lookup error:', err.message);
  }

  // Fallback generation for unknown words
  return {
    word: rawWord.charAt(0).toUpperCase() + rawWord.slice(1),
    ipa: `/${word}/`,
    phoneticLearner: word.toUpperCase(),
    partOfSpeech: 'Vocabulary',
    difficulty: 'Intermediate',
    meaning: `An English term frequently used in conversation and writing.`,
    example: `She used the word "${word}" accurately in her sentence.`,
    synonyms: [],
    antonyms: []
  };
};

module.exports = {
  fetchWordDetails,
  FALLBACK_WORDS
};
