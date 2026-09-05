const express = require('express');
const router = express.Router();
const { runQuery, getRow, getAll } = require('../db/database');
const { authenticateToken } = require('../middleware/authMiddleware');
const { generateTutorResponse } = require('../services/aiTutorService');
const { recordActivity } = require('../services/streakService');

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
      grammar_correction: m.grammar_correction ? JSON.parse(m.grammar_correction) : null
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
    const { conversationId, text } = req.body;

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
      ORDER BY created_at DESC LIMIT 6
    `, [activeConvId]);
    recentMessages.reverse();

    // Generate response using AI tutor service
    const tutorResult = await generateTutorResponse({
      userMessage: text.trim(),
      userLevel,
      conversationHistory: recentMessages,
      customApiKey
    });

    const userMsgId = 'msg_u_' + Date.now();
    const aiMsgId = 'msg_a_' + Date.now();

    // Store user message
    await runQuery(`
      INSERT INTO messages (id, conversation_id, sender, text, detected_lang, marathi_normalized, english_translation, grammar_correction)
      VALUES (?, ?, 'user', ?, ?, ?, ?, ?)
    `, [
      userMsgId,
      activeConvId,
      text.trim(),
      tutorResult.detectedLang,
      tutorResult.marathiNormalized,
      tutorResult.englishTranslation,
      tutorResult.grammarCorrection ? JSON.stringify(tutorResult.grammarCorrection) : null
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
        created_at: new Date().toISOString()
      },
      aiMessage: {
        id: aiMsgId,
        sender: 'ai',
        text: tutorResult.aiText,
        detected_lang: 'english',
        created_at: new Date().toISOString()
      },
      streak: streakResult
    });
  } catch (err) {
    console.error('Error in AI chat route:', err);
    res.status(500).json({ success: false, message: 'Error processing AI chat request.' });
  }
});

module.exports = router;
