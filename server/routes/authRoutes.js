const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery, getRow } = require('../db/database');
const { authenticateToken, JWT_SECRET } = require('../middleware/authMiddleware');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Check if email already exists
    const existing = await getRow('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    await runQuery(`
      INSERT INTO users (id, name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `, [userId, name.trim(), email.toLowerCase().trim(), passwordHash]);

    // Insert default settings
    await runQuery(`
      INSERT INTO user_settings (user_id, theme, english_level, daily_goal_minutes, preferred_lang)
      VALUES (?, 'purple', 'intermediate', 15, 'mixed')
    `, [userId]);

    // Insert default streak
    await runQuery(`
      INSERT INTO streaks (user_id, current_streak, longest_streak)
      VALUES (?, 0, 0)
    `, [userId]);

    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim() },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        theme: 'purple',
        english_level: 'intermediate',
        daily_goal_minutes: 15
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email/username and password.'
      });
    }

    const user = await getRow(`
      SELECT u.id, u.name, u.email, u.password_hash, u.created_at,
             s.theme, s.english_level, s.daily_goal_minutes, s.preferred_lang, s.speech_speed, s.auto_play_audio
      FROM users u
      LEFT JOIN user_settings s ON u.id = s.user_id
      WHERE u.email = ?
    `, [email.toLowerCase().trim()]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Welcome back to SpeakWise AI!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        theme: user.theme || 'purple',
        english_level: user.english_level || 'intermediate',
        daily_goal_minutes: user.daily_goal_minutes || 15,
        preferred_lang: user.preferred_lang || 'mixed',
        speech_speed: user.speech_speed || 1.0,
        auto_play_audio: Boolean(user.auto_play_audio),
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
});

// Current user session check
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getRow(`
      SELECT u.id, u.name, u.email, u.created_at,
             s.theme, s.english_level, s.daily_goal_minutes, s.preferred_lang, s.speech_speed, s.auto_play_audio
      FROM users u
      LEFT JOIN user_settings s ON u.id = s.user_id
      WHERE u.id = ?
    `, [req.userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User session not found.'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        theme: user.theme || 'purple',
        english_level: user.english_level || 'intermediate',
        daily_goal_minutes: user.daily_goal_minutes || 15,
        preferred_lang: user.preferred_lang || 'mixed',
        speech_speed: user.speech_speed || 1.0,
        auto_play_audio: Boolean(user.auto_play_audio),
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Session retrieval error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session.'
    });
  }
});

// Update user settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { theme, english_level, daily_goal_minutes, preferred_lang, speech_speed, auto_play_audio, api_key } = req.body;

    const current = await getRow(`SELECT * FROM user_settings WHERE user_id = ?`, [req.userId]);
    if (!current) {
      await runQuery(`
        INSERT INTO user_settings (user_id, theme, english_level, daily_goal_minutes, preferred_lang, speech_speed, auto_play_audio, api_key)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        req.userId,
        theme || 'purple',
        english_level || 'intermediate',
        daily_goal_minutes || 15,
        preferred_lang || 'mixed',
        speech_speed || 1.0,
        auto_play_audio ? 1 : 0,
        api_key || null
      ]);
    } else {
      await runQuery(`
        UPDATE user_settings
        SET theme = COALESCE(?, theme),
            english_level = COALESCE(?, english_level),
            daily_goal_minutes = COALESCE(?, daily_goal_minutes),
            preferred_lang = COALESCE(?, preferred_lang),
            speech_speed = COALESCE(?, speech_speed),
            auto_play_audio = COALESCE(?, auto_play_audio),
            api_key = COALESCE(?, api_key)
        WHERE user_id = ?
      `, [
        theme !== undefined ? theme : null,
        english_level !== undefined ? english_level : null,
        daily_goal_minutes !== undefined ? daily_goal_minutes : null,
        preferred_lang !== undefined ? preferred_lang : null,
        speech_speed !== undefined ? speech_speed : null,
        auto_play_audio !== undefined ? (auto_play_audio ? 1 : 0) : null,
        api_key !== undefined ? api_key : null,
        req.userId
      ]);
    }

    res.json({
      success: true,
      message: 'Settings updated successfully!'
    });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings.'
    });
  }
});

// Update profile name / password
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    if (name) {
      await runQuery(`UPDATE users SET name = ? WHERE id = ?`, [name.trim(), req.userId]);
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
      }
      const user = await getRow(`SELECT password_hash FROM users WHERE id = ?`, [req.userId]);
      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }
      const newHash = await bcrypt.hash(newPassword, 10);
      await runQuery(`UPDATE users SET password_hash = ? WHERE id = ?`, [newHash, req.userId]);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!'
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile.'
    });
  }
});

module.exports = router;
