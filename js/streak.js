import { dayDiff } from "./verse.js";

const STORAGE_KEY = "gitapath_streak";

const MILESTONES = {
  7: "Day 7 Milestone: One full week of steady sadhana.",
  21: "Day 21 Milestone: Your practice is becoming a way of life.",
  108: "Day 108 Milestone: Sacred consistency achieved. Keep walking the path."
};

function defaultStreak() {
  return {
    currentStreak: 1,
    longestStreak: 1,
    lastOpenedDate: null
  };
}

export function updateStreak(todayKey) {
  const raw = localStorage.getItem(STORAGE_KEY);
  const streak = raw ? JSON.parse(raw) : defaultStreak();

  if (!streak.lastOpenedDate) {
    streak.currentStreak = 1;
  } else {
    const diff = dayDiff(streak.lastOpenedDate, todayKey);
    if (diff === 1) {
      streak.currentStreak += 1;
    } else if (diff > 1) {
      streak.currentStreak = 1;
    }
  }

  streak.lastOpenedDate = todayKey;
  streak.longestStreak = Math.max(streak.longestStreak || 1, streak.currentStreak);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(streak));

  return streak;
}

export function getMilestoneMessage(streakDays) {
  return MILESTONES[streakDays] || "";
}
