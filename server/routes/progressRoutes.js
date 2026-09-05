const express = require('express');
const router = express.Router();
const { getRow, getAll } = require('../db/database');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getStreakStatus } = require('../services/streakService');

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Fetch Streak
    const streak = await getStreakStatus(userId);

    // 2. Count AI Conversations & Messages
    const convCountRow = await getRow(`
      SELECT COUNT(*) as total_conv FROM conversations WHERE user_id = ?
    `, [userId]);
    const totalConversations = convCountRow?.total_conv || 0;

    const msgCountRow = await getRow(`
      SELECT COUNT(*) as total_msgs FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.user_id = ? AND m.sender = 'user'
    `, [userId]);
    const userMessages = msgCountRow?.total_msgs || 0;

    // 3. Count Grammar Corrections
    const grammarCountRow = await getRow(`
      SELECT COUNT(*) as total_corrections FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.user_id = ? AND m.grammar_correction IS NOT NULL
    `, [userId]);
    const grammarCorrections = grammarCountRow?.total_corrections || 0;

    // 4. Pronunciation Practice Count & Words Learned
    const pronCountRow = await getRow(`
      SELECT COUNT(*) as total_pron, COUNT(DISTINCT word) as unique_words
      FROM pronunciation_history WHERE user_id = ?
    `, [userId]);
    const pronunciationSessions = pronCountRow?.total_pron || 0;
    const wordsLearned = pronCountRow?.unique_words || 0;

    // 5. Practice Attempts & Correct Translations
    const practiceCountRow = await getRow(`
      SELECT COUNT(*) as total_attempts,
             SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts
      FROM practice_attempts WHERE user_id = ?
    `, [userId]);
    const practiceCompleted = practiceCountRow?.total_attempts || 0;
    const correctPractice = practiceCountRow?.correct_attempts || 0;

    // 6. Distinct Practice Days
    const practiceDaysRow = await getRow(`
      SELECT COUNT(DISTINCT SUBSTR(created_at, 1, 10)) as total_days
      FROM learning_activities WHERE user_id = ?
    `, [userId]);
    const totalPracticeDays = practiceDaysRow?.total_days || (streak.currentStreak > 0 ? streak.currentStreak : 0);

    // 7. Dynamic Skill Scores calculation (grounded in real usage with progressive curve)
    // Base foundational level + bonus from practice
    const speakingScore = Math.min(95, Math.max(45, 50 + userMessages * 4 + pronunciationSessions * 2));
    const grammarAccuracy = practiceCompleted > 0 ? (correctPractice / practiceCompleted) : 0.7;
    const grammarScore = Math.min(95, Math.max(40, Math.round(55 + grammarAccuracy * 30 + practiceCompleted * 2)));
    const vocabScore = Math.min(96, Math.max(45, 52 + wordsLearned * 4 + userMessages * 2));
    const pronScore = Math.min(98, Math.max(42, 50 + pronunciationSessions * 5));
    const translationScore = Math.min(96, Math.max(40, Math.round(50 + grammarAccuracy * 35)));
    const listeningScore = Math.min(94, Math.max(48, 55 + userMessages * 3 + pronunciationSessions * 2));

    // 8. Weekly Activity Trend (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayActivity = await getRow(`
        SELECT COUNT(*) as cnt FROM learning_activities
        WHERE user_id = ? AND SUBSTR(created_at, 1, 10) = ?
      `, [userId, dateStr]);

      weeklyData.push({
        day: dayName,
        date: dateStr,
        activities: dayActivity?.cnt || 0
      });
    }

    res.json({
      success: true,
      stats: {
        totalPracticeDays,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        wordsLearned: Math.max(wordsLearned, userMessages > 0 ? userMessages * 3 : 0),
        aiConversations: totalConversations,
        userMessages,
        practiceQuestionsCompleted: practiceCompleted,
        grammarCorrections,
        pronunciationSessions,
        skills: {
          speaking: speakingScore,
          grammar: grammarScore,
          vocabulary: vocabScore,
          pronunciation: pronScore,
          translation: translationScore,
          listening: listeningScore
        },
        weeklyActivity: weeklyData
      }
    });
  } catch (err) {
    console.error('Error calculating progress stats:', err);
    res.status(500).json({ success: false, message: 'Failed to calculate progress stats.' });
  }
});

module.exports = router;
