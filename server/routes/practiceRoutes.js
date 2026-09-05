const express = require('express');
const router = express.Router();
const { getAll } = require('../db/database');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getNextQuestion, evaluateAttempt } = require('../services/practiceService');
const { recordActivity } = require('../services/streakService');

// Get next practice question (guaranteed non-repeating)
router.get('/next', authenticateToken, async (req, res) => {
  try {
    const { difficulty, category } = req.query;

    const question = await getNextQuestion(
      req.userId,
      difficulty || 'Beginner',
      category || null
    );

    res.json({
      success: true,
      question
    });
  } catch (err) {
    console.error('Error fetching practice question:', err);
    res.status(500).json({ success: false, message: 'Failed to generate practice question.' });
  }
});

// Evaluate translation answer
router.post('/evaluate', authenticateToken, async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;

    if (!questionId || !userAnswer || !userAnswer.trim()) {
      return res.status(400).json({ success: false, message: 'Question ID and your English answer are required.' });
    }

    const evaluation = await evaluateAttempt(req.userId, questionId, userAnswer.trim());

    if (!evaluation.success) {
      return res.status(404).json(evaluation);
    }

    // Record activity for streak tracking!
    const streakResult = await recordActivity(req.userId, 'practice', `Translation practice attempt`);

    res.json({
      ...evaluation,
      streak: streakResult
    });
  } catch (err) {
    console.error('Error evaluating practice attempt:', err);
    res.status(500).json({ success: false, message: 'Failed to evaluate practice attempt.' });
  }
});

// Get user practice history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const history = await getAll(`
      SELECT a.*, q.marathi_sentence, q.category, q.difficulty
      FROM practice_attempts a
      JOIN practice_questions q ON a.question_id = q.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC LIMIT 15
    `, [req.userId]);

    res.json({
      success: true,
      history
    });
  } catch (err) {
    console.error('Error fetching practice history:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch practice history.' });
  }
});

module.exports = router;
