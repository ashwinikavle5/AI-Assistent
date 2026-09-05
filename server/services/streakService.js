/**
 * Real Persistent Streak & Calendar Service
 * Calculates consecutive daily learning activities, manages longest streaks,
 * detects streak increments to trigger celebration, and generates monthly calendar status.
 */

const { getRow, getAll, runQuery } = require('../db/database');

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Record learning activity and update streak
const recordActivity = async (userId, activityType, details = '') => {
  const today = getTodayDateStr();
  const yesterday = getYesterdayDateStr();

  // Log activity
  const actId = 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  await runQuery(`
    INSERT INTO learning_activities (id, user_id, activity_type, details)
    VALUES (?, ?, ?, ?)
  `, [actId, userId, activityType, details]);

  // Fetch or initialize streak
  let streak = await getRow(`SELECT * FROM streaks WHERE user_id = ?`, [userId]);
  if (!streak) {
    await runQuery(`
      INSERT INTO streaks (user_id, current_streak, longest_streak, last_practice_date)
      VALUES (?, 1, 1, ?)
    `, [userId, today]);
    return {
      currentStreak: 1,
      longestStreak: 1,
      streakIncreased: true,
      lastPracticeDate: today
    };
  }

  let currentStreak = streak.current_streak || 0;
  let longestStreak = streak.longest_streak || 0;
  const lastDate = streak.last_practice_date;

  let streakIncreased = false;

  if (lastDate === today) {
    // Already practiced today; keep current streak
    return {
      currentStreak,
      longestStreak,
      streakIncreased: false,
      lastPracticeDate: today
    };
  } else if (lastDate === yesterday) {
    // Consecutive practice!
    currentStreak += 1;
    streakIncreased = true;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  } else {
    // Missed at least one day or first practice
    currentStreak = 1;
    streakIncreased = true;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }

  await runQuery(`
    UPDATE streaks
    SET current_streak = ?, longest_streak = ?, last_practice_date = ?
    WHERE user_id = ?
  `, [currentStreak, longestStreak, today, userId]);

  return {
    currentStreak,
    longestStreak,
    streakIncreased,
    lastPracticeDate: today
  };
};

// Get current streak status
const getStreakStatus = async (userId) => {
  let streak = await getRow(`SELECT * FROM streaks WHERE user_id = ?`, [userId]);
  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      practicedToday: false
    };
  }

  const today = getTodayDateStr();
  const yesterday = getYesterdayDateStr();

  // If user hasn't practiced today or yesterday, the active streak has broken
  let activeStreak = streak.current_streak || 0;
  if (streak.last_practice_date !== today && streak.last_practice_date !== yesterday && streak.last_practice_date) {
    activeStreak = 0; // Streak broken due to missed day
  }

  return {
    currentStreak: activeStreak,
    longestStreak: streak.longest_streak || 0,
    lastPracticeDate: streak.last_practice_date,
    practicedToday: streak.last_practice_date === today
  };
};

// Get monthly calendar data for current user
const getStreakCalendar = async (userId, year, month) => {
  const d = new Date();
  const targetYear = year || d.getFullYear();
  const targetMonth = month || (d.getMonth() + 1);

  const monthPrefix = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

  const activities = await getAll(`
    SELECT DISTINCT SUBSTR(created_at, 1, 10) as practice_date
    FROM learning_activities
    WHERE user_id = ? AND SUBSTR(created_at, 1, 7) = ?
  `, [userId, monthPrefix]);

  const practicedDays = new Set(activities.map(a => a.practice_date));

  // Determine total days in month
  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
  const calendarDays = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
    calendarDays.push({
      date: dateStr,
      day: day,
      practiced: practicedDays.has(dateStr)
    });
  }

  return {
    year: targetYear,
    month: targetMonth,
    calendarDays,
    totalPracticedDays: practicedDays.size
  };
};

module.exports = {
  recordActivity,
  getStreakStatus,
  getStreakCalendar,
  getTodayDateStr
};
