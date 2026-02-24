import { loadVerses, getDateKey, getVerseForDate } from "./verse.js";
import { updateStreak, getMilestoneMessage } from "./streak.js";
import { buildShareCard, shareVerseImage, downloadBlob } from "./share.js";
import { registerServiceWorker, setupInstallPrompt } from "./pwa.js";

const startedKey = "gitapath_started";
const languageKey = "gitapath_language";
const appearanceKey = "gitapath_appearance";
const profileKey = "gitapath_profile";
const reminderKey = "gitapath_reminder";
const reminderLastSentKey = "gitapath_reminder_last_sent";
const voicePromptSeenPrefix = "gitapath_voice_prompt_seen_v1_";
const appFallbackUrl = "https://srma4tech.github.io/gitapath/";

const welcomeScreen = document.getElementById("welcome-screen");
const dailyScreen = document.getElementById("daily-screen");
const startButton = document.getElementById("start-btn");
const installButton = document.getElementById("install-btn");
const shareAppButton = document.getElementById("share-app-btn");
const headerShareStatus = document.getElementById("header-share-status");
const langSelect = document.getElementById("lang-select");
const translationStatus = document.getElementById("translation-status");
const themeDarkButton = document.getElementById("theme-dark");
const themeLightButton = document.getElementById("theme-light");
const shareButton = document.getElementById("share-btn");
const downloadButton = document.getElementById("download-btn");
const shareStatus = document.getElementById("share-status");
const speechStatus = document.getElementById("speech-status");
const speakShlokaButton = document.getElementById("speak-shloka-btn");
const speakDescButton = document.getElementById("speak-desc-btn");
const shareCanvas = document.getElementById("share-canvas");
const verseMeta = document.getElementById("verse-meta");
const verseSanskrit = document.getElementById("verse-sanskrit");
const verseTranslit = document.getElementById("verse-translit");
const verseMeaning = document.getElementById("verse-meaning");
const verseReflection = document.getElementById("verse-reflection");
const currentStreakEl = document.getElementById("current-streak");
const longestStreakEl = document.getElementById("longest-streak");
const milestoneBadge = document.getElementById("milestone-badge");
const streakCard = document.getElementById("streak-card");
const reminderEnabledInput = document.getElementById("reminder-enabled");
const reminderTimeInput = document.getElementById("reminder-time");
const saveReminderButton = document.getElementById("save-reminder-btn");
const testReminderButton = document.getElementById("test-reminder-btn");
const reminderStatus = document.getElementById("reminder-status");
const voiceModal = document.getElementById("voice-modal");
const voiceModalOverlay = document.getElementById("voice-modal-overlay");
const voiceModalClose = document.getElementById("voice-modal-close");
const voiceModalOk = document.getElementById("voice-modal-ok");
const voiceModalText = document.getElementById("voice-modal-text");

const requiredElements = [
  ["welcome-screen", welcomeScreen],
  ["daily-screen", dailyScreen],
  ["start-btn", startButton],
  ["install-btn", installButton],
  ["share-app-btn", shareAppButton],
  ["header-share-status", headerShareStatus],
  ["lang-select", langSelect],
  ["translation-status", translationStatus],
  ["theme-dark", themeDarkButton],
  ["theme-light", themeLightButton],
  ["share-btn", shareButton],
  ["download-btn", downloadButton],
  ["share-status", shareStatus],
  ["speech-status", speechStatus],
  ["speak-shloka-btn", speakShlokaButton],
  ["speak-desc-btn", speakDescButton],
  ["share-canvas", shareCanvas],
  ["verse-meta", verseMeta],
  ["verse-sanskrit", verseSanskrit],
  ["verse-translit", verseTranslit],
  ["verse-meaning", verseMeaning],
  ["verse-reflection", verseReflection],
  ["current-streak", currentStreakEl],
  ["longest-streak", longestStreakEl],
  ["milestone-badge", milestoneBadge],
  ["streak-card", streakCard],
  ["reminder-enabled", reminderEnabledInput],
  ["reminder-time", reminderTimeInput],
  ["save-reminder-btn", saveReminderButton],
  ["test-reminder-btn", testReminderButton],
  ["reminder-status", reminderStatus],
  ["voice-modal", voiceModal],
  ["voice-modal-overlay", voiceModalOverlay],
  ["voice-modal-close", voiceModalClose],
  ["voice-modal-ok", voiceModalOk],
  ["voice-modal-text", voiceModalText]
];

const chapterReflectionFocusHi = {
  1: "\u092e\u094b\u0939 \u0914\u0930 \u0938\u094d\u092a\u0937\u094d\u091f \u0926\u0943\u0937\u094d\u091f\u093f",
  2: "\u0906\u0924\u094d\u092e\u093e \u0915\u0940 \u0928\u093f\u0924\u094d\u092f\u0924\u093e \u0914\u0930 \u0938\u092e\u0924\u094d\u0935",
  3: "\u0928\u093f\u0937\u094d\u0915\u093e\u092e \u0915\u0930\u094d\u092e \u0914\u0930 \u0909\u0924\u094d\u0924\u0930\u0926\u093e\u092f\u093f\u0924\u094d\u0935",
  4: "\u091c\u094d\u091e\u093e\u0928 \u0938\u0947 \u0915\u0930\u094d\u092e \u0915\u0940 \u0936\u0941\u0926\u094d\u0927\u093f",
  5: "\u0924\u094d\u092f\u093e\u0917 \u0914\u0930 \u0915\u0930\u094d\u0924\u0935\u094d\u092f \u0915\u093e \u0938\u0902\u0924\u0941\u0932\u0928",
  6: "\u092e\u0928 \u0915\u093e \u0905\u0928\u0941\u0936\u093e\u0938\u0928 \u0914\u0930 \u0927\u094d\u092f\u093e\u0928",
  7: "\u0908\u0936\u094d\u0935\u0930 \u0915\u094b \u0938\u0930\u094d\u0935\u093e\u0927\u093e\u0930 \u0930\u0942\u092a \u092e\u0947\u0902 \u091c\u093e\u0928\u0928\u093e",
  8: "\u0939\u0930 \u0938\u094d\u0925\u093f\u0924\u093f \u092e\u0947\u0902 \u0908\u0936\u094d\u0935\u0930-\u0938\u094d\u092e\u0930\u0923",
  9: "\u092d\u0915\u094d\u0924\u093f \u0914\u0930 \u0908\u0936\u094d\u0935\u0930-\u0915\u0943\u092a\u093e \u0915\u093e \u0938\u0902\u092c\u0902\u0927",
  10: "\u0939\u0930 \u0936\u094d\u0930\u0947\u0937\u094d\u0920\u0924\u093e \u092e\u0947\u0902 \u0926\u093f\u0935\u094d\u092f\u0924\u093e \u0915\u093e \u0926\u0930\u094d\u0936\u0928",
  11: "\u0935\u093f\u0930\u093e\u091f \u0930\u0942\u092a \u0914\u0930 \u0938\u092e\u0930\u094d\u092a\u0923",
  12: "\u0938\u0930\u0932 \u092a\u094d\u0930\u0947\u092e\u092a\u0942\u0930\u094d\u0923 \u092d\u0915\u094d\u0924\u093f",
  13: "\u0936\u0930\u0940\u0930 \u0914\u0930 \u091a\u0947\u0924\u0928\u093e \u0915\u093e \u092d\u0947\u0926",
  14: "\u0924\u0940\u0928 \u0917\u0941\u0923\u094b\u0902 \u0938\u0947 \u090a\u092a\u0930 \u0909\u0920\u0928\u093e",
  15: "\u092a\u0930\u092e \u092a\u0941\u0930\u0941\u0937 \u0914\u0930 \u091c\u0940\u0935\u0928 \u0915\u093e \u092e\u0942\u0932",
  16: "\u0926\u0948\u0935\u0940 \u0917\u0941\u0923\u094b\u0902 \u0915\u093e \u0935\u093f\u0915\u093e\u0938",
  17: "\u0936\u094d\u0930\u0926\u094d\u0927\u093e, \u0935\u093e\u0923\u0940 \u0914\u0930 \u0906\u091a\u0930\u0923 \u0915\u0940 \u0936\u0941\u0926\u094d\u0927\u093f",
  18: "\u091c\u094d\u091e\u093e\u0928, \u0915\u0930\u094d\u092e \u0914\u0930 \u092d\u0915\u094d\u0924\u093f \u0915\u093e \u0938\u092e\u0928\u094d\u0935\u092f"
};

const languageConfig = {
  en: { speechLang: "en-IN", translateTarget: "en", name: "English" },
  as: { speechLang: "as-IN", translateTarget: "as", name: "Assamese" },
  bn: { speechLang: "bn-IN", translateTarget: "bn", name: "Bengali" },
  brx: { speechLang: "en-IN", translateTarget: "brx", name: "Bodo" },
  doi: { speechLang: "hi-IN", translateTarget: "doi", name: "Dogri" },
  gu: { speechLang: "gu-IN", translateTarget: "gu", name: "Gujarati" },
  hi: { speechLang: "hi-IN", translateTarget: "hi", name: "Hindi" },
  kn: { speechLang: "kn-IN", translateTarget: "kn", name: "Kannada" },
  ks: { speechLang: "ur-IN", translateTarget: "ks", name: "Kashmiri" },
  kok: { speechLang: "kok-IN", translateTarget: "gom", name: "Konkani" },
  mai: { speechLang: "hi-IN", translateTarget: "mai", name: "Maithili" },
  ml: { speechLang: "ml-IN", translateTarget: "ml", name: "Malayalam" },
  mni: { speechLang: "bn-IN", translateTarget: "mni-Mtei", name: "Manipuri" },
  mr: { speechLang: "mr-IN", translateTarget: "mr", name: "Marathi" },
  ne: { speechLang: "ne-IN", translateTarget: "ne", name: "Nepali" },
  or: { speechLang: "or-IN", translateTarget: "or", name: "Odia" },
  pa: { speechLang: "pa-IN", translateTarget: "pa", name: "Punjabi" },
  sa: { speechLang: "hi-IN", translateTarget: "sa", name: "Sanskrit" },
  sat: { speechLang: "hi-IN", translateTarget: "sat", name: "Santali" },
  sd: { speechLang: "ur-IN", translateTarget: "sd", name: "Sindhi" },
  ta: { speechLang: "ta-IN", translateTarget: "ta", name: "Tamil" },
  te: { speechLang: "te-IN", translateTarget: "te", name: "Telugu" },
  ur: { speechLang: "ur-IN", translateTarget: "ur", name: "Urdu" }
};
const translationCache = new Map();

function getSafeLanguage(code) {
  return languageConfig[code] ? code : "en";
}

let language = getSafeLanguage(localStorage.getItem(languageKey) || "en");
let appearance = localStorage.getItem(appearanceKey) || "dark";
let todayVerse = null;
let activeSpeechTarget = null;
let reminderTimeoutId = null;
let renderVersion = 0;

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function setShareStatus(message) {
  shareStatus.textContent = message;
}

function setHeaderShareStatus(message) {
  headerShareStatus.textContent = message;
}

function setReminderStatus(message) {
  reminderStatus.textContent = message;
}

function setSpeechStatus(message) {
  speechStatus.textContent = message;
}

function setTranslationStatus(message) {
  translationStatus.textContent = message;
}

function getAppUrl() {
  try {
    return new URL("./", window.location.href).href;
  } catch (error) {
    return appFallbackUrl;
  }
}

function getVoicePromptKey(langCode) {
  return `${voicePromptSeenPrefix}${langCode}`;
}

function markVoicePromptSeen(langCode) {
  localStorage.setItem(getVoicePromptKey(langCode), "true");
}

function hasSeenVoicePrompt(langCode) {
  return localStorage.getItem(getVoicePromptKey(langCode)) === "true";
}

function getLanguageDisplayName(langCode) {
  return languageConfig[langCode]?.name || "Selected";
}

function getPreferredSpeechLang(langCode) {
  return languageConfig[langCode]?.speechLang || "en-IN";
}

function closeVoiceModal() {
  voiceModal.classList.add("hidden");
  voiceModalOverlay.classList.add("hidden");
  voiceModalOverlay.setAttribute("aria-hidden", "true");
}

function openVoiceModal(message, langCode) {
  voiceModalText.textContent = message;
  voiceModal.classList.remove("hidden");
  voiceModalOverlay.classList.remove("hidden");
  voiceModalOverlay.setAttribute("aria-hidden", "false");
  markVoicePromptSeen(langCode);
}

async function getAvailableVoices() {
  if (!("speechSynthesis" in window)) {
    return [];
  }

  const initial = window.speechSynthesis.getVoices();
  if (initial.length > 0) {
    return initial;
  }

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) {
        return;
      }
      done = true;
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    const onVoicesChanged = () => finish();
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged, { once: true });
    window.setTimeout(finish, 1200);
  });
}

function pickBestVoice(langCode, voices) {
  if (!voices || voices.length === 0) {
    return null;
  }

  const preferred = getPreferredSpeechLang(langCode).toLowerCase();
  const base = preferred.split("-")[0];
  const byExact = voices.find((voice) => voice.lang.toLowerCase() === preferred);
  if (byExact) {
    return byExact;
  }

  const byStartsWithPreferred = voices.find((voice) => voice.lang.toLowerCase().startsWith(preferred));
  if (byStartsWithPreferred) {
    return byStartsWithPreferred;
  }

  const byBaseIndian = voices.find((voice) => {
    const voiceLang = voice.lang.toLowerCase();
    return voiceLang.startsWith(`${base}-`) && voiceLang.includes("-in");
  });
  if (byBaseIndian) {
    return byBaseIndian;
  }

  const byBase = voices.find((voice) => voice.lang.toLowerCase().startsWith(base));
  if (byBase) {
    return byBase;
  }

  return null;
}

function hasIndianAccentVoice(langCode, voices) {
  const preferred = getPreferredSpeechLang(langCode).toLowerCase();
  const base = preferred.split("-")[0];
  return voices.some((voice) => {
    const voiceLang = voice.lang.toLowerCase();
    return voiceLang.includes("-in") && (voiceLang.startsWith(base) || voiceLang === preferred);
  });
}

async function maybePromptForIndianVoice(langCode) {
  const safeLang = getSafeLanguage(langCode);
  if (hasSeenVoicePrompt(safeLang)) {
    return;
  }
  if (!("speechSynthesis" in window)) {
    return;
  }

  const voices = await getAvailableVoices();
  if (hasIndianAccentVoice(safeLang, voices)) {
    return;
  }

  const languageName = getLanguageDisplayName(safeLang);
  const locale = getPreferredSpeechLang(safeLang);
  openVoiceModal(
    `No ${languageName} Indian voice (${locale}) was found in your browser. Add this local accent for the best pronunciation and listening experience.`,
    safeLang
  );
}

function applyLanguageToggleUi() {
  langSelect.value = language;
}

function applyAppearanceUi() {
  document.body.classList.remove("theme-dark", "theme-light");
  document.body.classList.add(`theme-${appearance}`);

  if (appearance === "light") {
    themeLightButton.className = "rounded-full px-4 py-1.5 text-sm bg-gp-gold text-[#1f1908]";
    themeDarkButton.className = "rounded-full px-4 py-1.5 text-sm text-white/85";
    themeLightButton.setAttribute("aria-pressed", "true");
    themeDarkButton.setAttribute("aria-pressed", "false");
  } else {
    themeDarkButton.className = "rounded-full px-4 py-1.5 text-sm bg-gp-gold text-[#1f1908]";
    themeLightButton.className = "rounded-full px-4 py-1.5 text-sm text-white/85";
    themeDarkButton.setAttribute("aria-pressed", "true");
    themeLightButton.setAttribute("aria-pressed", "false");
  }
}

function getLocalizedReflection(verse) {
  if (language !== "hi") {
    return normalizeText(verse.reflection);
  }
  if (verse.hindiReflection) {
    return normalizeText(verse.hindiReflection);
  }

  const focus = chapterReflectionFocusHi[verse.chapter] || "\u0915\u0930\u094d\u0924\u0935\u094d\u092f \u0914\u0930 \u0906\u0902\u0924\u0930\u093f\u0915 \u0938\u094d\u0925\u093f\u0930\u0924\u093e";
  return `\u092f\u0939 \u0936\u094d\u0932\u094b\u0915 \u0939\u092e\u0947\u0902 ${focus} \u092a\u0930 \u092e\u0928\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u092a\u094d\u0930\u0947\u0930\u093f\u0924 \u0915\u0930\u0924\u093e \u0939\u0948\u0964 \u0907\u0938\u0947 \u0936\u093e\u0902\u0924\u093f \u0938\u0947 \u092a\u0922\u093c\u0947\u0902, \u0905\u092a\u0928\u0947 \u0935\u0930\u094d\u0924\u092e\u093e\u0928 \u0915\u0930\u094d\u0924\u0935\u094d\u092f \u0915\u094b \u092c\u093f\u0928\u093e \u092d\u092f \u0915\u0947 \u0926\u0947\u0916\u0947\u0902, \u0914\u0930 \u0915\u0930\u094d\u092e \u0915\u094b \u0938\u0947\u0935\u093e-\u092d\u093e\u0935 \u0938\u0947 \u0915\u0930\u0947\u0902\u0964 \u091c\u092c \u0905\u0939\u0902\u0915\u093e\u0930 \u0938\u0947 \u0939\u091f\u0915\u0930 \u0938\u092e\u0930\u094d\u092a\u0923 \u0906\u0924\u093e \u0939\u0948, \u0924\u092c \u0935\u093f\u0935\u0947\u0915, \u0927\u0948\u0930\u094d\u092f \u0914\u0930 \u0906\u0927\u094d\u092f\u093e\u0924\u094d\u092e\u093f\u0915 \u092a\u094d\u0930\u0917\u0924\u093f \u0938\u094d\u0935\u093e\u092d\u093e\u0935\u093f\u0915 \u0930\u0942\u092a \u0938\u0947 \u092c\u0922\u093c\u0924\u0940 \u0939\u0948\u0964`;
}

async function translateText(sourceText, targetLanguage) {
  const clean = normalizeText(sourceText);
  if (!clean) {
    return "";
  }

  if (targetLanguage === "en") {
    return clean;
  }

  const target = languageConfig[targetLanguage]
    ? languageConfig[targetLanguage].translateTarget
    : "en";
  const cacheKey = `${target}::${clean}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(clean)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("translate request failed");
    }
    const payload = await response.json();
    const translated = Array.isArray(payload?.[0])
      ? payload[0].map((chunk) => normalizeText(chunk?.[0])).join(" ").trim()
      : "";
    if (!translated) {
      throw new Error("empty translation");
    }
    translationCache.set(cacheKey, translated);
    return translated;
  } catch (error) {
    return "";
  }
}

async function getLocalizedVerseContent(verse, targetLanguage) {
  const activeLanguage = getSafeLanguage(targetLanguage);
  const englishMeaning = normalizeText(verse.englishMeaning);
  const englishReflection = normalizeText(verse.reflection);

  if (activeLanguage === "hi") {
    return {
      meaning: normalizeText(verse.hindiMeaning),
      reflection: getLocalizedReflection(verse),
      translated: true
    };
  }

  if (activeLanguage === "en") {
    return {
      meaning: englishMeaning,
      reflection: englishReflection,
      translated: true
    };
  }

  const [meaning, reflection] = await Promise.all([
    translateText(englishMeaning, activeLanguage),
    translateText(englishReflection, activeLanguage)
  ]);

  if (meaning && reflection) {
    return { meaning, reflection, translated: true };
  }

  return {
    meaning: englishMeaning,
    reflection: englishReflection,
    translated: false
  };
}

function readProfileFromStorage() {
  try {
    const raw = localStorage.getItem(profileKey);
    if (!raw) {
      return { name: "", photoDataUrl: "" };
    }
    const parsed = JSON.parse(raw);
    return {
      name: normalizeText(parsed.name || "").slice(0, 40),
      photoDataUrl: normalizeText(parsed.photoDataUrl || "")
    };
  } catch (error) {
    return { name: "", photoDataUrl: "" };
  }
}

function getProfileForShare() {
  const profile = readProfileFromStorage();
  if (!profile.name && !profile.photoDataUrl) {
    return null;
  }
  return profile;
}

function readReminderFromStorage() {
  try {
    const raw = localStorage.getItem(reminderKey);
    if (!raw) {
      return { enabled: true, time: "06:00" };
    }
    const parsed = JSON.parse(raw);
    const time = /^\d{2}:\d{2}$/.test(parsed.time) ? parsed.time : "06:00";
    return { enabled: Boolean(parsed.enabled), time };
  } catch (error) {
    return { enabled: true, time: "06:00" };
  }
}

function persistReminder(reminder) {
  localStorage.setItem(reminderKey, JSON.stringify(reminder));
}

async function showReminderNotification() {
  const dateKey = getDateKey(new Date());
  if (localStorage.getItem(reminderLastSentKey) === dateKey) {
    return;
  }

  const body = "Your daily Gita verse is ready. Read with meaning and reflection.";
  try {
    let didNotify = false;
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification("GitaPath Reminder", {
          body,
          icon: "./assets/images/app-icon.jpeg",
          badge: "./assets/images/app-icon.jpeg",
          data: { url: getAppUrl() }
        });
        didNotify = true;
      } else if ("Notification" in window && Notification.permission === "granted") {
        new Notification("GitaPath Reminder", { body, icon: "./assets/images/app-icon.jpeg" });
        didNotify = true;
      }
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification("GitaPath Reminder", { body, icon: "./assets/images/app-icon.jpeg" });
      didNotify = true;
    }
    if (didNotify) {
      localStorage.setItem(reminderLastSentKey, dateKey);
    }
  } catch (error) {
    setReminderStatus("Could not show notification in this browser.");
  }
}

function scheduleReminderTimer(reminder) {
  if (reminderTimeoutId) {
    clearTimeout(reminderTimeoutId);
    reminderTimeoutId = null;
  }

  if (!reminder.enabled) {
    return;
  }

  const [hours, minutes] = reminder.time.split(":").map((part) => Number(part));
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return;
  }

  const now = new Date();
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  const delay = Math.max(1000, next.getTime() - now.getTime());
  reminderTimeoutId = window.setTimeout(async () => {
    await showReminderNotification();
    scheduleReminderTimer(readReminderFromStorage());
  }, delay);
}

async function maybeSendReminderOnLaunch(reminder) {
  if (!reminder.enabled) {
    return;
  }
  const [hours, minutes] = reminder.time.split(":").map((part) => Number(part));
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return;
  }
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const reminderMinutes = hours * 60 + minutes;
  if (nowMinutes >= reminderMinutes) {
    await showReminderNotification();
  }
}

function resetSpeechButtons() {
  speakShlokaButton.textContent = "Shloka";
  speakDescButton.textContent = "Explain";
  speakShlokaButton.classList.remove("is-speaking");
  speakDescButton.classList.remove("is-speaking");
}

function stopSpeech() {
  if (!("speechSynthesis" in window)) {
    return;
  }
  window.speechSynthesis.cancel();
  activeSpeechTarget = null;
  resetSpeechButtons();
}

function applySpeechButtonState(target, speaking) {
  resetSpeechButtons();
  if (speaking && target === "shloka") {
    speakShlokaButton.textContent = "Stop";
    speakShlokaButton.classList.add("is-speaking");
  }
  if (speaking && target === "desc") {
    speakDescButton.textContent = "Stop";
    speakDescButton.classList.add("is-speaking");
  }
}

function speakText(text, langCode, target) {
  if (!("speechSynthesis" in window)) {
    setSpeechStatus("Speech is not supported in this browser.");
    return;
  }

  const clean = normalizeText(text);
  if (!clean) {
    setSpeechStatus("Nothing to speak.");
    return;
  }

  if (activeSpeechTarget === target && window.speechSynthesis.speaking) {
    stopSpeech();
    setSpeechStatus("Speech stopped.");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = langCode;

  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = pickBestVoice(language, voices) || pickBestVoice(langCode.slice(0, 2), voices);
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  utterance.onstart = () => {
    activeSpeechTarget = target;
    applySpeechButtonState(target, true);
    setSpeechStatus("Speaking...");
  };
  utterance.onend = () => {
    activeSpeechTarget = null;
    resetSpeechButtons();
    setSpeechStatus("Speech completed.");
  };
  utterance.onerror = () => {
    activeSpeechTarget = null;
    resetSpeechButtons();
    setSpeechStatus("Unable to speak this content.");
  };
  window.speechSynthesis.speak(utterance);
}

async function renderVerse() {
  if (!todayVerse) {
    return;
  }

  const localRenderVersion = renderVersion + 1;
  renderVersion = localRenderVersion;

  verseMeta.textContent = `Chapter ${todayVerse.chapter} - Verse ${todayVerse.verse}`;
  verseSanskrit.textContent = normalizeText(todayVerse.sanskrit);
  verseTranslit.textContent = normalizeText(todayVerse.transliteration);

  if (language !== "en" && language !== "hi") {
    setTranslationStatus(`Translating to ${languageConfig[language]?.name || "selected language"}...`);
  } else {
    setTranslationStatus("");
  }

  const content = await getLocalizedVerseContent(todayVerse, language);
  if (localRenderVersion !== renderVersion) {
    return;
  }

  verseMeaning.textContent = content.meaning;
  verseReflection.textContent = content.reflection;
  if (language !== "en" && language !== "hi" && !content.translated) {
    setTranslationStatus("Automatic translation is unavailable right now. Showing English text.");
  } else if (language !== "en" && language !== "hi") {
    setTranslationStatus(`${languageConfig[language]?.name || "Selected language"} translation ready.`);
  }
}

function renderStreak() {
  const todayKey = getDateKey(new Date());
  const streak = updateStreak(todayKey);
  currentStreakEl.textContent = String(streak.currentStreak);
  longestStreakEl.textContent = String(streak.longestStreak);

  const milestone = getMilestoneMessage(streak.currentStreak);
  if (milestone) {
    milestoneBadge.textContent = milestone;
    milestoneBadge.classList.remove("hidden");
    streakCard.classList.add("milestone-active");
  } else {
    milestoneBadge.classList.add("hidden");
    streakCard.classList.remove("milestone-active");
  }
}

function showDailyScreen() {
  localStorage.setItem(startedKey, "true");
  welcomeScreen.classList.add("hidden");
  dailyScreen.classList.remove("hidden");
  verseMeta.setAttribute("tabindex", "-1");
  verseMeta.focus();
}

function setupShareButtons() {
  shareButton.addEventListener("click", async () => {
    if (!todayVerse) {
      return;
    }

    const content = await getLocalizedVerseContent(todayVerse, language);
    const blob = await buildShareCard(
      shareCanvas,
      todayVerse,
      language,
      appearance,
      getProfileForShare(),
      content.reflection,
      content.meaning
    );
    if (!blob) {
      setShareStatus("Could not prepare share card right now.");
      return;
    }

    const shareResult = await shareVerseImage(blob, todayVerse, language, content.meaning).catch(() => "failed");
    if (shareResult === "shared") {
      setShareStatus("Shared successfully.");
      return;
    }
    if (shareResult === "mail") {
      setShareStatus("Email draft opened. Use Download Card to attach image.");
      return;
    }
    if (shareResult === "cancelled") {
      setShareStatus("Share cancelled.");
      return;
    }
    setShareStatus("Share not supported here. Use Download Card.");
  });

  downloadButton.addEventListener("click", async () => {
    if (!todayVerse) {
      return;
    }

    const content = await getLocalizedVerseContent(todayVerse, language);
    const blob = await buildShareCard(
      shareCanvas,
      todayVerse,
      language,
      appearance,
      getProfileForShare(),
      content.reflection,
      content.meaning
    );
    if (!blob) {
      setShareStatus("Could not prepare download card right now.");
      return;
    }
    downloadBlob(blob, todayVerse);
    setShareStatus("Card downloaded.");
  });
}

async function ensureNotificationPermission() {
  if (!("Notification" in window)) {
    setReminderStatus("Notifications are not supported in this browser.");
    return false;
  }
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission === "denied") {
    setReminderStatus("Notifications are blocked. Enable them in browser settings.");
    return false;
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    setReminderStatus("Notification permission is required for reminders.");
    return false;
  }
  return true;
}

function setupReminderControls() {
  const reminder = readReminderFromStorage();
  reminderEnabledInput.checked = reminder.enabled;
  reminderTimeInput.value = reminder.time;

  const initializeReminder = async () => {
    let activeReminder = reminder;
    if (activeReminder.enabled) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        activeReminder = { ...activeReminder, enabled: false };
        reminderEnabledInput.checked = false;
        persistReminder(activeReminder);
      }
    }
    scheduleReminderTimer(activeReminder);
    maybeSendReminderOnLaunch(activeReminder);
  };

  initializeReminder();

  saveReminderButton.addEventListener("click", async () => {
    const nextReminder = {
      enabled: Boolean(reminderEnabledInput.checked),
      time: /^\d{2}:\d{2}$/.test(reminderTimeInput.value) ? reminderTimeInput.value : "06:00"
    };

    if (nextReminder.enabled) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        reminderEnabledInput.checked = false;
        nextReminder.enabled = false;
      }
    }

    persistReminder(nextReminder);
    scheduleReminderTimer(nextReminder);
    setReminderStatus(nextReminder.enabled
      ? `Reminder saved for ${nextReminder.time} daily.`
      : "Reminder disabled.");
  });

  testReminderButton.addEventListener("click", async () => {
    const granted = await ensureNotificationPermission();
    if (!granted) {
      return;
    }
    await showReminderNotification();
    localStorage.removeItem(reminderLastSentKey);
    setReminderStatus("Test notification sent.");
  });
}

function setupShareAppButton() {
  shareAppButton.addEventListener("click", async () => {
    const appUrl = getAppUrl();
    const shareMessage = [
      "Begin your day with one Bhagavad Gita verse on GitaPath.",
      "Read Sanskrit, Hindi/English meaning, reflection, and grow your spiritual streak.",
      "",
      `Start here: ${appUrl}`
    ].join("\n");
    const payload = {
      title: "GitaPath",
      text: shareMessage
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        setHeaderShareStatus("App link shared.");
        return;
      } catch (error) {
        if (error && error.name === "AbortError") {
          setHeaderShareStatus("Share cancelled.");
          return;
        }
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(appUrl);
        setHeaderShareStatus("App link copied.");
        return;
      } catch (error) {
        // Ignore and fallback to manual copy instructions below.
      }
    }

    setHeaderShareStatus(`Copy and share: ${appUrl}`);
  });
}

function setupLanguageSelector() {
  langSelect.addEventListener("change", () => {
    language = getSafeLanguage(langSelect.value);
    localStorage.setItem(languageKey, language);
    applyLanguageToggleUi();
    renderVerse();
    maybePromptForIndianVoice(language);
  });
}

function setupAppearanceButtons() {
  themeDarkButton.addEventListener("click", () => {
    appearance = "dark";
    localStorage.setItem(appearanceKey, appearance);
    applyAppearanceUi();
  });

  themeLightButton.addEventListener("click", () => {
    appearance = "light";
    localStorage.setItem(appearanceKey, appearance);
    applyAppearanceUi();
  });
}

function setupSpeechButtons() {
  speakShlokaButton.addEventListener("click", () => {
    if (!todayVerse) {
      return;
    }
    const speechLang = languageConfig[language]?.speechLang || "hi-IN";
    speakText(todayVerse.sanskrit, speechLang, "shloka");
  });

  speakDescButton.addEventListener("click", async () => {
    if (!todayVerse) {
      return;
    }
    const speechLang = languageConfig[language]?.speechLang || "en-IN";
    const content = await getLocalizedVerseContent(todayVerse, language);
    speakText(`${content.meaning}. ${content.reflection}`, speechLang, "desc");
  });

  window.addEventListener("beforeunload", stopSpeech);
}

function setupVoiceModal() {
  const close = () => closeVoiceModal();
  voiceModalClose.addEventListener("click", close);
  voiceModalOk.addEventListener("click", close);
  voiceModalOverlay.addEventListener("click", close);
}

async function boot() {
  const missing = requiredElements.filter(([, el]) => !el).map(([id]) => id);
  if (missing.length > 0) {
    throw new Error(
      `GitaPath UI mismatch: missing required element(s): ${missing.join(", ")}. ` +
      "Make sure you are serving this project's index.html."
    );
  }

  registerServiceWorker();
  setupInstallPrompt(installButton);
  setupShareAppButton();
  setupLanguageSelector();
  setupAppearanceButtons();
  setupSpeechButtons();
  setupVoiceModal();
  setupShareButtons();
  setupReminderControls();
  applyLanguageToggleUi();
  applyAppearanceUi();
  resetSpeechButtons();

  const verses = await loadVerses();
  todayVerse = getVerseForDate(verses, new Date());
  renderVerse();
  maybePromptForIndianVoice(language);
  renderStreak();

  if (localStorage.getItem(startedKey) === "true") {
    showDailyScreen();
  }

  startButton.addEventListener("click", showDailyScreen);
}

boot().catch((error) => {
  console.error(error);
  if (welcomeScreen) {
    welcomeScreen.innerHTML = `
      <h2 class="mb-2 text-2xl font-semibold text-gp-goldSoft">Unable to load GitaPath</h2>
      <p class="text-white/80">Please refresh once while online to cache verse data for offline use.</p>
    `;
  }
});
