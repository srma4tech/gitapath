import { loadVerses, getDateKey, getVerseForDate } from "./verse.js";
import { updateStreak, getMilestoneMessage } from "./streak.js";
import { buildShareCard, shareVerseImage, downloadBlob } from "./share.js";
import { registerServiceWorker, setupInstallPrompt } from "./pwa.js";

const startedKey = "gitapath_started";
const languageKey = "gitapath_language";
const appearanceKey = "gitapath_appearance";

const welcomeScreen = document.getElementById("welcome-screen");
const dailyScreen = document.getElementById("daily-screen");
const startButton = document.getElementById("start-btn");
const installButton = document.getElementById("install-btn");
const langEnButton = document.getElementById("lang-en");
const langHiButton = document.getElementById("lang-hi");
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

const requiredElements = [
  ["welcome-screen", welcomeScreen],
  ["daily-screen", dailyScreen],
  ["start-btn", startButton],
  ["install-btn", installButton],
  ["lang-en", langEnButton],
  ["lang-hi", langHiButton],
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
  ["streak-card", streakCard]
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

let language = localStorage.getItem(languageKey) || "en";
let appearance = localStorage.getItem(appearanceKey) || "dark";
let todayVerse = null;
let activeSpeechTarget = null;

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function setShareStatus(message) {
  shareStatus.textContent = message;
}

function setSpeechStatus(message) {
  speechStatus.textContent = message;
}

function applyLanguageToggleUi() {
  if (language === "hi") {
    langHiButton.className = "rounded-full px-4 py-1.5 text-sm bg-gp-gold text-[#1f1908]";
    langEnButton.className = "rounded-full px-4 py-1.5 text-sm text-white/85";
    langHiButton.setAttribute("aria-pressed", "true");
    langEnButton.setAttribute("aria-pressed", "false");
  } else {
    langEnButton.className = "rounded-full px-4 py-1.5 text-sm bg-gp-gold text-[#1f1908]";
    langHiButton.className = "rounded-full px-4 py-1.5 text-sm text-white/85";
    langEnButton.setAttribute("aria-pressed", "true");
    langHiButton.setAttribute("aria-pressed", "false");
  }
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

function resetSpeechButtons() {
  speakShlokaButton.innerHTML = "&#128266; Shloka";
  speakDescButton.innerHTML = "&#128266; Explain";
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
    speakShlokaButton.innerHTML = "&#9208; Stop";
  }
  if (speaking && target === "desc") {
    speakDescButton.innerHTML = "&#9208; Stop";
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
  const matchingVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith(langCode.toLowerCase().slice(0, 2))
  );
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

function renderVerse() {
  if (!todayVerse) {
    return;
  }

  verseMeta.textContent = `Chapter ${todayVerse.chapter} - Verse ${todayVerse.verse}`;
  verseSanskrit.textContent = normalizeText(todayVerse.sanskrit);
  verseTranslit.textContent = normalizeText(todayVerse.transliteration);
  verseMeaning.textContent = language === "hi"
    ? normalizeText(todayVerse.hindiMeaning)
    : normalizeText(todayVerse.englishMeaning);
  verseReflection.textContent = getLocalizedReflection(todayVerse);
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

    const blob = await buildShareCard(shareCanvas, todayVerse, language, appearance);
    if (!blob) {
      setShareStatus("Could not prepare share card right now.");
      return;
    }

    const shareResult = await shareVerseImage(blob, todayVerse, language).catch(() => "failed");
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

    const blob = await buildShareCard(shareCanvas, todayVerse, language, appearance);
    if (!blob) {
      setShareStatus("Could not prepare download card right now.");
      return;
    }
    downloadBlob(blob, todayVerse);
    setShareStatus("Card downloaded.");
  });
}

function setupLanguageButtons() {
  langEnButton.addEventListener("click", () => {
    language = "en";
    localStorage.setItem(languageKey, language);
    applyLanguageToggleUi();
    renderVerse();
  });

  langHiButton.addEventListener("click", () => {
    language = "hi";
    localStorage.setItem(languageKey, language);
    applyLanguageToggleUi();
    renderVerse();
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
    speakText(todayVerse.sanskrit, "hi-IN", "shloka");
  });

  speakDescButton.addEventListener("click", () => {
    if (!todayVerse) {
      return;
    }
    const meaning = language === "hi" ? todayVerse.hindiMeaning : todayVerse.englishMeaning;
    const reflection = getLocalizedReflection(todayVerse);
    speakText(`${meaning}. ${reflection}`, language === "hi" ? "hi-IN" : "en-IN", "desc");
  });

  window.addEventListener("beforeunload", stopSpeech);
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
  setupLanguageButtons();
  setupAppearanceButtons();
  setupSpeechButtons();
  setupShareButtons();
  applyLanguageToggleUi();
  applyAppearanceUi();
  resetSpeechButtons();

  const verses = await loadVerses();
  todayVerse = getVerseForDate(verses, new Date());
  renderVerse();
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
