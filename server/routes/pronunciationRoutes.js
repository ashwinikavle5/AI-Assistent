const express = require('express');
const router = express.Router();
const { runQuery, getAll } = require('../db/database');
const { authenticateToken } = require('../middleware/authMiddleware');
const { analyzeWordPronunciation } = require('../services/pronunciationService');
const { recordActivity } = require('../services/streakService');

// Look up word details dynamically (supports /lookup?word=... and /:word)
const handleLookup = async (req, res) => {
  try {
    const word = req.query.word || req.params.word;
    const result = await analyzeWordPronunciation(word);

    if (result && result.details) {
      return res.json({
        ...result,
        word: result.details.word,
        marathiMeaning: result.details.marathiMeaning,
        definition: result.details.simpleEnglishMeaning,
        simpleEnglishMeaning: result.details.simpleEnglishMeaning,
        example: result.details.example,
        partOfSpeech: result.details.partOfSpeech,
        details: {
          ...result.details,
          definition: result.details.simpleEnglishMeaning
        }
      });
    }

    return res.json(result);
  } catch (err) {
    console.error('Error looking up pronunciation:', err);
    res.status(500).json({ success: false, message: 'Failed to look up word pronunciation.' });
  }
};

router.get('/lookup', handleLookup);
router.get('/:word', (req, res, next) => {
  if (['lookup', 'history', 'practice'].includes(req.params.word)) {
    return next();
  }
  return handleLookup(req, res);
});

// Evaluate pronunciation practice attempt
router.post('/practice', authenticateToken, async (req, res) => {
  try {
    const { word, transcript, ipa } = req.body;

    if (!word || !transcript) {
      return res.status(400).json({ success: false, message: 'Word and spoken transcript are required.' });
    }

    const cleanWord = word.trim().toLowerCase().replace(/[^a-z]/g, '');
    const cleanSpoken = transcript.trim().toLowerCase().replace(/[^a-z]/g, '');

    const isExactMatch = cleanWord === cleanSpoken;
    const isCloseMatch = cleanSpoken.includes(cleanWord) || cleanWord.includes(cleanSpoken);

    let feedback = "";
    let isMatch = 0;

    if (isExactMatch) {
      feedback = `Excellent pronunciation! Your speech was clearly recognized as "${word}". Keep up the great articulation!`;
      isMatch = 1;
    } else if (isCloseMatch) {
      feedback = `Good attempt! Your speech was recognized as "${transcript}". You are very close to standard pronunciation. Try listening to the slow version and repeat once more.`;
      isMatch = 1;
    } else {
      feedback = `Your speech was detected as "${transcript}". Compare your pronunciation with the audio example and practice the syllable stress.`;
      isMatch = 0;
    }

    // Save history
    const histId = 'pron_' + Date.now();
    await runQuery(`
      INSERT INTO pronunciation_history (id, user_id, word, ipa, user_transcript, feedback, is_match)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [histId, req.userId, word, ipa || '', transcript, feedback, isMatch]);

    // Record activity for streak tracking!
    const streakResult = await recordActivity(req.userId, 'pronunciation', `Practiced pronunciation for ${word}`);

    res.json({
      success: true,
      isMatch: Boolean(isMatch),
      detectedTranscript: transcript,
      feedback,
      streak: streakResult
    });
  } catch (err) {
    console.error('Error evaluating pronunciation attempt:', err);
    res.status(500).json({ success: false, message: 'Failed to process pronunciation attempt.' });
  }
});

// Get user's recent pronunciation history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const history = await getAll(`
      SELECT * FROM pronunciation_history
      WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 15
    `, [req.userId]);

    res.json({
      success: true,
      history
    });
  } catch (err) {
    console.error('Error fetching pronunciation history:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch history.' });
  }
});

module.exports = router;
