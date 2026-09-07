const express = require('express');
const router = express.Router();
const { runQuery, getRow, getAll } = require('../db/database');
const { authenticateToken } = require('../middleware/authMiddleware');
const { generateTutorResponse } = require('../services/aiTutorService');
const { detectLanguage, processRomanMarathi, translateMarathiToEnglish, translateNativeToEnglish } = require('../services/romanMarathiService');
const { recordActivity } = require('../services/streakService');
const { getPracticeSentence, evaluatePracticeAnswer, getSentenceById } = require('../services/practiceTranslationService');

// Get all conversations for current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await getAll(`
      SELECT * FROM conversations
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `, [req.userId]);

    res.json({
      success: true,
      conversations
    });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations.' });
  }
});

// Create new conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    const convId = 'conv_' + Date.now();
    const convTitle = title || 'English Conversation';

    await runQuery(`
      INSERT INTO conversations (id, user_id, title)
      VALUES (?, ?, ?)
    `, [convId, req.userId, convTitle]);

    // Insert welcoming greeting from AI tutor
    const welcomeMsgId = 'msg_' + Date.now();
    const welcomeText = "Hello! 👋 I am SpeakWise AI, your personal English tutor. You can speak with me in English, Marathi, or Roman Marathi (like 'jevn zal ka?'). How are you feeling today?";

    await runQuery(`
      INSERT INTO messages (id, conversation_id, sender, text, detected_lang)
      VALUES (?, ?, 'ai', ?, 'english')
    `, [welcomeMsgId, convId, welcomeText]);

    res.status(201).json({
      success: true,
      conversation: {
        id: convId,
        title: convTitle,
        created_at: new Date().toISOString()
      },
      welcomeMessage: {
        id: welcomeMsgId,
        sender: 'ai',
        text: welcomeText,
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ success: false, message: 'Failed to create conversation.' });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const convId = req.params.id;

    // Verify conversation belongs to user
    const conv = await getRow(`SELECT id FROM conversations WHERE id = ? AND user_id = ?`, [convId, req.userId]);
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const messages = await getAll(`
      SELECT * FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `, [convId]);

    const formattedMessages = messages.map(m => ({
      ...m,
      grammar_correction: m.grammar_correction ? JSON.parse(m.grammar_correction) : null,
      analysis: m.analysis ? JSON.parse(m.analysis) : null
    }));

    res.json({
      success: true,
      messages: formattedMessages
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
});

// Send message to AI Tutor
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { conversationId, text, practiceMode, assistantMode } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    let activeConvId = conversationId;

    // If no conversation ID, find most recent or create one
    if (!activeConvId) {
      let recent = await getRow(`
        SELECT id FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1
      `, [req.userId]);

      if (!recent) {
        activeConvId = 'conv_' + Date.now();
        await runQuery(`
          INSERT INTO conversations (id, user_id, title)
          VALUES (?, ?, 'English Practice')
        `, [activeConvId, req.userId]);
      } else {
        activeConvId = recent.id;
      }
    }

    // Get user settings for English level and API key
    const settings = await getRow(`SELECT * FROM user_settings WHERE user_id = ?`, [req.userId]);
    const userLevel = settings?.english_level || 'intermediate';
    const customApiKey = settings?.api_key || null;

    // Fetch recent message history for context
    const recentMessages = await getAll(`
      SELECT sender, text FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at DESC LIMIT 10
    `, [activeConvId]);
    recentMessages.reverse();

    // Generate response using AI tutor service
    const tutorResult = await generateTutorResponse({
      userMessage: text.trim(),
      userLevel,
      conversationHistory: recentMessages,
      customApiKey,
      practiceMode: Boolean(practiceMode),
      assistantMode: assistantMode || 'discussion'
    });

    const userMsgId = 'msg_u_' + Date.now();
    const aiMsgId = 'msg_a_' + Date.now();

    // Store user message
    await runQuery(`
      INSERT INTO messages (id, conversation_id, sender, text, detected_lang, marathi_normalized, english_translation, grammar_correction, analysis)
      VALUES (?, ?, 'user', ?, ?, ?, ?, ?, ?)
    `, [
      userMsgId,
      activeConvId,
      text.trim(),
      tutorResult.detectedLang,
      tutorResult.marathiNormalized,
      tutorResult.englishTranslation,
      tutorResult.grammarCorrection ? JSON.stringify(tutorResult.grammarCorrection) : null,
      tutorResult.analysis ? JSON.stringify(tutorResult.analysis) : null
    ]);

    // Store AI tutor message
    await runQuery(`
      INSERT INTO messages (id, conversation_id, sender, text, detected_lang)
      VALUES (?, ?, 'ai', ?, 'english')
    `, [
      aiMsgId,
      activeConvId,
      tutorResult.aiText
    ]);

    // Update conversation timestamp
    await runQuery(`UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [activeConvId]);

    // Record activity for streak tracking!
    const streakResult = await recordActivity(req.userId, 'conversation', `Chat practice in ${tutorResult.detectedLang}`);

    res.json({
      success: true,
      conversationId: activeConvId,
      userMessage: {
        id: userMsgId,
        sender: 'user',
        text: text.trim(),
        detected_lang: tutorResult.detectedLang,
        marathi_normalized: tutorResult.marathiNormalized,
        english_translation: tutorResult.englishTranslation,
        grammar_correction: tutorResult.grammarCorrection,
        analysis: tutorResult.analysis,
        created_at: new Date().toISOString()
      },
      aiMessage: {
        id: aiMsgId,
        sender: 'ai',
        text: tutorResult.aiText,
        detected_lang: 'english',
        analysis: tutorResult.analysis,
        created_at: new Date().toISOString()
      },
      analysis: tutorResult.analysis,
      streak: streakResult
    });
  } catch (err) {
    console.error('Error in AI chat route:', err);
    res.status(500).json({ success: false, message: 'Error processing AI chat request.' });
  }
});

// Native Language Translation Endpoint (Marathi -> English)
router.post('/translate', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'EMPTY_INPUT',
        message: 'Please enter a Marathi or Roman Marathi sentence.'
      });
    }

    const result = await translateNativeToEnglish(text);
    return res.json(result);
  } catch (err) {
    console.error('Error in translate route:', err);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: err?.message || 'Error processing translation request.'
    });
  }
});

// Get next Marathi practice sentence by level
router.get('/practice/sentence', authenticateToken, async (req, res) => {
  try {
    const level = req.query.level || 'beginner';
    const excludeId = req.query.excludeId || null;
    const sentence = getPracticeSentence(level, excludeId);

    res.json({
      success: true,
      sentence
    });
  } catch (err) {
    console.error('Error getting practice sentence:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch practice sentence.' });
  }
});

// Evaluate user's English translation of a Marathi practice sentence
router.post('/practice/check', authenticateToken, async (req, res) => {
  try {
    const { sentenceId, userEnglish, level } = req.body;

    if (!userEnglish || !userEnglish.trim()) {
      return res.status(400).json({ success: false, message: 'Translation cannot be empty.' });
    }

    const evaluation = evaluatePracticeAnswer(sentenceId, userEnglish.trim(), level || 'beginner');

    // Record learning activity for user's streak
    const streakResult = await recordActivity(
      req.userId,
      'practice',
      `Marathi -> English Practice (${evaluation.isCorrect ? 'Correct' : 'Needs Practice'})`
    );

    res.json({
      success: true,
      ...evaluation,
      streak: streakResult
    });
  } catch (err) {
    console.error('Error evaluating practice translation:', err);
    res.status(500).json({ success: false, message: 'Failed to evaluate translation.' });
  }
});

module.exports = router;
