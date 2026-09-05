const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getStreakStatus, getStreakCalendar, recordActivity } = require('../services/streakService');

// Get user streak status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const status = await getStreakStatus(req.userId);
    res.json({
      success: true,
      streak: status
    });
  } catch (err) {
    console.error('Error getting streak status:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve streak status.' });
  }
});

// Get user streak calendar
router.get('/calendar', authenticateToken, async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
    const month = req.query.month ? parseInt(req.query.month, 10) : undefined;

    const calendar = await getStreakCalendar(req.userId, year, month);
    const status = await getStreakStatus(req.userId);

    res.json({
      success: true,
      calendar,
      currentStreak: status.currentStreak,
      longestStreak: status.longestStreak,
      practicedToday: status.practicedToday
    });
  } catch (err) {
    console.error('Error getting streak calendar:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve streak calendar.' });
  }
});

// Explicit activity check-in
router.post('/record', authenticateToken, async (req, res) => {
  try {
    const { activityType, details } = req.body;
    const result = await recordActivity(req.userId, activityType || 'general', details || 'Manual check-in');
    res.json({
      success: true,
      streak: result
    });
  } catch (err) {
    console.error('Error recording activity:', err);
    res.status(500).json({ success: false, message: 'Failed to record activity.' });
  }
});

module.exports = router;
