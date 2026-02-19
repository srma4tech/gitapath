const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1080;

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function wrapLines(ctx, text, maxWidth, maxLines) {
  const cleanText = normalizeText(text);
  if (!cleanText) {
    return [];
  }

  const words = cleanText.split(" ");
  const lines = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i += 1) {
    const candidate = currentLine ? `${currentLine} ${words[i]}` : words[i];
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    } else {
      lines.push(words[i]);
    }
    currentLine = currentLine ? words[i] : "";

    if (lines.length >= maxLines) {
      break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  if (lines.length === maxLines && words.length > 0) {
    let lastLine = lines[maxLines - 1];
    while (ctx.measureText(`${lastLine}...`).width > maxWidth && lastLine.length > 0) {
      lastLine = lastLine.slice(0, -1);
    }
    lines[maxLines - 1] = `${lastLine}...`;
  }

  return lines;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const lines = wrapLines(ctx, text, maxWidth, maxLines);
  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillText(lines[i], x, y + i * lineHeight);
  }
  return y + lines.length * lineHeight;
}

function drawCoverImage(ctx, image, width, height, alpha = 1) {
  if (!image || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    return;
  }

  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
  ctx.restore();
}

function getTemplateImage(id) {
  return document.getElementById(id);
}

function loadImageBySrc(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function ensureImageReady(image) {
  if (!image) {
    return null;
  }
  if (image.complete && image.naturalWidth > 0) {
    return image;
  }
  if (typeof image.decode === "function") {
    await image.decode().catch(() => {});
    return image;
  }
  await new Promise((resolve) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });
  return image;
}

export async function buildShareCard(canvas, verse, language, appearance = "dark") {
  const ctx = canvas.getContext("2d");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  let lightTemplate = getTemplateImage("share-light-template");
  let darkTemplate = getTemplateImage("share-dark-template");
  let parchmentTemplate = getTemplateImage("share-parchment-template");

  const selectedTemplate = appearance === "light" ? lightTemplate : darkTemplate;
  await ensureImageReady(selectedTemplate);
  await ensureImageReady(parchmentTemplate);

  if (!lightTemplate || lightTemplate.naturalWidth === 0) {
    lightTemplate = await loadImageBySrc("./assets/images/share-card-light.jpeg");
  }
  if (!darkTemplate || darkTemplate.naturalWidth === 0) {
    darkTemplate = await loadImageBySrc("./assets/images/share-card-dark.jpeg");
  }
  if (!parchmentTemplate || parchmentTemplate.naturalWidth === 0) {
    parchmentTemplate = await loadImageBySrc("./assets/images/parchment-texture.png");
  }

  const resolvedTemplate = appearance === "light" ? lightTemplate : darkTemplate;
  drawCoverImage(ctx, resolvedTemplate, CARD_WIDTH, CARD_HEIGHT, 1);
  drawCoverImage(ctx, parchmentTemplate, CARD_WIDTH, CARD_HEIGHT, 0.2);

  if (!resolvedTemplate || resolvedTemplate.naturalWidth === 0) {
    const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    gradient.addColorStop(0, "#070b1a");
    gradient.addColorStop(0.5, "#121f4e");
    gradient.addColorStop(1, "#090f26");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  }

  const textPrimary = appearance === "light" ? "#1f2d44" : "#f4e2ba";
  const textSecondary = appearance === "light" ? "rgba(24,32,48,0.9)" : "rgba(255,255,255,0.92)";
  const textBody = appearance === "light" ? "rgba(22,30,44,0.95)" : "rgba(255,255,255,0.95)";
  const textAccent = appearance === "light" ? "rgba(146,104,28,0.95)" : "rgba(214,178,94,0.95)";
  const panelFill = appearance === "light" ? "rgba(248,242,225,0.78)" : "rgba(5,9,24,0.62)";
  const borderStroke = appearance === "light" ? "rgba(155,113,45,0.62)" : "rgba(214,178,94,0.56)";

  ctx.fillStyle = "rgba(214, 178, 94, 0.16)";
  ctx.beginPath();
  ctx.arc(CARD_WIDTH * 0.82, CARD_HEIGHT * 0.18, 132, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = panelFill;
  ctx.strokeStyle = borderStroke;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(56, 56, CARD_WIDTH - 112, CARD_HEIGHT - 112, 26);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillRect(56, 56, CARD_WIDTH - 112, CARD_HEIGHT - 112);
    ctx.strokeRect(56, 56, CARD_WIDTH - 112, CARD_HEIGHT - 112);
  }

  ctx.fillStyle = textPrimary;
  ctx.font = "600 46px Cinzel, Georgia, serif";
  ctx.fillText("GitaPath", 96, 126);

  ctx.fillStyle = textSecondary;
  ctx.font = "500 27px Cinzel, Georgia, serif";
  ctx.fillText(`Chapter ${verse.chapter} \u2022 Verse ${verse.verse}`, 96, 176);

  let cursorY = 248;
  const contentX = 96;
  const contentWidth = CARD_WIDTH - 192;

  ctx.fillStyle = textPrimary;
  ctx.font = "500 50px 'Nirmala UI', serif";
  cursorY = drawWrappedText(ctx, verse.sanskrit, contentX, cursorY, contentWidth, 62, 4);
  cursorY += 16;

  ctx.fillStyle = textSecondary;
  ctx.font = "italic 400 33px Georgia, serif";
  cursorY = drawWrappedText(ctx, verse.transliteration, contentX, cursorY, contentWidth, 46, 2);
  cursorY += 16;

  ctx.strokeStyle = borderStroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(contentX, cursorY);
  ctx.lineTo(contentX + contentWidth, cursorY);
  ctx.stroke();
  cursorY += 36;

  const meaning = language === "hi" ? verse.hindiMeaning : verse.englishMeaning;
  const reflection = language === "hi"
    ? normalizeText(verse.hindiReflection || verse.reflection)
    : normalizeText(verse.reflection);

  ctx.fillStyle = textAccent;
  ctx.font = "600 26px Cinzel, Georgia, serif";
  ctx.fillText(language === "hi" ? "Arth" : "Meaning", contentX, cursorY);
  cursorY += 42;

  ctx.fillStyle = textBody;
  ctx.font = "400 38px Georgia, serif";
  cursorY = drawWrappedText(ctx, meaning, contentX, cursorY, contentWidth, 52, 5);
  cursorY += 20;

  ctx.fillStyle = textAccent;
  ctx.font = "600 26px Cinzel, Georgia, serif";
  ctx.fillText(language === "hi" ? "Manan" : "Reflection", contentX, cursorY);
  cursorY += 40;

  ctx.fillStyle = textSecondary;
  ctx.font = "400 32px Georgia, serif";
  drawWrappedText(ctx, reflection, contentX, cursorY, contentWidth, 46, 3);

  ctx.fillStyle = textAccent;
  ctx.font = "500 24px Cinzel, Georgia, serif";
  ctx.fillText("Daily verse. Daily reflection. Daily alignment.", 96, 964);
  ctx.font = "400 19px Georgia, serif";
  ctx.fillStyle = textSecondary;
  ctx.fillText("srma4tech.github.io/gitapath", 96, 996);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export async function shareVerseImage(blob, verse, language) {
  if (!blob || blob.size === 0) {
    return "failed";
  }

  const file = new File([blob], `gitapath-${verse.chapter}-${verse.verse}.png`, { type: "image/png" });
  const shareText = language === "hi"
    ? `\u0906\u091c \u0915\u093e \u0917\u0940\u0924\u093e \u0936\u094d\u0932\u094b\u0915: \u0905\u0927\u094d\u092f\u093e\u092f ${verse.chapter}, \u0936\u094d\u0932\u094b\u0915 ${verse.verse}`
    : `Today's Gita verse: Chapter ${verse.chapter}, Verse ${verse.verse}`;
  const isWindows = /Windows/i.test(navigator.userAgent || "");
  const sharePayloadText = {
    title: "GitaPath Daily Verse",
    text: `${shareText}\n\n${language === "hi" ? verse.hindiMeaning : verse.englishMeaning}`
  };

  // File-sharing works well on most non-Windows targets.
  if (!isWindows && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: "GitaPath Daily Verse",
      text: shareText,
      files: [file]
    });
    return "shared";
  }

  // Keep native share options available to user (email, apps, etc.) without forcing email.
  if (navigator.share) {
    try {
      await navigator.share(sharePayloadText);
      return "shared";
    } catch (error) {
      if (error && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  // Final fallback only when native share is unavailable.
  if (isWindows) {
    const subject = encodeURIComponent(`GitaPath Verse: ${verse.chapter}.${verse.verse}`);
    const body = encodeURIComponent(sharePayloadText.text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    return "mail";
  }

  return "failed";
}

export function downloadBlob(blob, verse) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `gitapath-${verse.chapter}-${verse.verse}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
