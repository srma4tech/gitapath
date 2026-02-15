const VERSE_FILE = "./data/verses.json";
const DAY_MS = 24 * 60 * 60 * 1000;

let verseCache = null;

export async function loadVerses() {
  if (verseCache) {
    return verseCache;
  }

  const response = await fetch(VERSE_FILE, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Failed to load verses (${response.status})`);
  }

  const verses = await response.json();
  if (!Array.isArray(verses) || verses.length === 0) {
    throw new Error("Invalid verses dataset");
  }

  verseCache = verses;
  return verseCache;
}

export function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateFromKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function dayDiff(fromDateKey, toDateKey) {
  const from = dateFromKey(fromDateKey);
  const to = dateFromKey(toDateKey);
  return Math.round((to - from) / DAY_MS);
}

export function getVerseForDate(verses, date = new Date()) {
  const dayIndex = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / DAY_MS);
  const safeIndex = ((dayIndex % verses.length) + verses.length) % verses.length;
  return verses[safeIndex];
}
