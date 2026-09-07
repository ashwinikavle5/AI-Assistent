const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const defaultDbDir = path.join(__dirname, '..', 'data');
const dbPath = process.env.DATABASE_PATH || path.join(defaultDbDir, 'speakwise.db');
const activeDbDir = path.dirname(dbPath);

if (!fs.existsSync(activeDbDir)) {
  fs.mkdirSync(activeDbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SpeakWise SQLite database at', dbPath);
  }
});

// Helper for promise-based queries
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const getRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const getAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Initialize schema
const initDb = async () => {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      theme TEXT DEFAULT 'purple',
      english_level TEXT DEFAULT 'intermediate',
      daily_goal_minutes INTEGER DEFAULT 15,
      preferred_lang TEXT DEFAULT 'mixed',
      speech_speed REAL DEFAULT 1.0,
      auto_play_audio INTEGER DEFAULT 0,
      practice_reminder INTEGER DEFAULT 1,
      streak_reminder INTEGER DEFAULT 1,
      api_key TEXT DEFAULT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT DEFAULT 'English Conversation',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      text TEXT NOT NULL,
      detected_lang TEXT,
      marathi_normalized TEXT,
      english_translation TEXT,
      grammar_correction TEXT,
      analysis TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(conversation_id) REFERENCES conversations(id)
    )
  `);

  try {
    await runQuery(`ALTER TABLE messages ADD COLUMN analysis TEXT`);
  } catch (e) {
    // Column already exists
  }

  await runQuery(`
    CREATE TABLE IF NOT EXISTS practice_questions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      marathi_sentence TEXT NOT NULL,
      standard_english TEXT NOT NULL,
      explanation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS practice_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      user_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      score INTEGER DEFAULT 0,
      better_sentence TEXT,
      explanation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(question_id) REFERENCES practice_questions(id)
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS pronunciation_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      word TEXT NOT NULL,
      ipa TEXT,
      user_transcript TEXT,
      feedback TEXT,
      is_match INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS learning_activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS streaks (
      user_id TEXT PRIMARY KEY,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_practice_date TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  console.log('Database tables initialized successfully.');
};

module.exports = {
  db,
  runQuery,
  getRow,
  getAll,
  initDb
};
