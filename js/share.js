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

function drawLines(ctx, lines, x, y, lineHeight) {
  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillText(lines[i], x, y + i * lineHeight);
  }
  return y + lines.length * lineHeight;
}

function fitTextSingleLine(ctx, text, maxWidth) {
  let value = normalizeText(text);
  if (!value) {
    return "";
  }
  if (ctx.measureText(value).width <= maxWidth) {
    return value;
  }
  while (value.length > 0 && ctx.measureText(`${value}...`).width > maxWidth) {
    value = value.slice(0, -1);
  }
  return `${value}...`;
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

async function loadImageFromDataUrl(dataUrl) {
  if (!dataUrl) {
    return null;
  }
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = dataUrl;
  });
}

export async function buildShareCard(canvas, verse, language, appearance = "dark", profile = null, reflectionOverride = "") {
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
  const chapterLabel = language === "hi" ? "अध्याय" : "Chapter";
  const verseLabel = language === "hi" ? "श्लोक" : "Verse";
  const meaningLabel = language === "hi" ? "अर्थ" : "Meaning";
  const reflectionLabel = language === "hi" ? "मनन" : "Reflection";
  const footerLine = language === "hi"
    ? "दैनिक श्लोक. दैनिक चिंतन. दैनिक साधना."
    : "Daily verse. Daily reflection. Daily alignment.";

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
  ctx.fillText(`${chapterLabel} ${verse.chapter} \u2022 ${verseLabel} ${verse.verse}`, 96, 176);

  const contentX = 96;
  const contentWidth = CARD_WIDTH - 192;
  const contentTop = 248;
  const maxContentBottom = 900;

  const meaning = language === "hi" ? verse.hindiMeaning : verse.englishMeaning;
  const reflection = normalizeText(reflectionOverride) || (language === "hi"
    ? normalizeText(verse.hindiReflection || verse.reflection)
    : normalizeText(verse.reflection));

  function buildLayout(scale) {
    const sanskritSize = Math.round(50 * scale);
    const sanskritLine = Math.round(62 * scale);
    const translitSize = Math.round(33 * scale);
    const translitLine = Math.round(46 * scale);
    const labelSize = Math.round(26 * scale);
    const bodySize = Math.round(38 * scale);
    const bodyLine = Math.round(52 * scale);
    const reflectionSize = Math.round(32 * scale);
    const reflectionLine = Math.round(46 * scale);

    ctx.font = `500 ${sanskritSize}px 'Nirmala UI', serif`;
    const sanskritLines = wrapLines(ctx, verse.sanskrit, contentWidth, Number.POSITIVE_INFINITY);
    ctx.font = `italic 400 ${translitSize}px Georgia, serif`;
    const translitLines = wrapLines(ctx, verse.transliteration, contentWidth, Number.POSITIVE_INFINITY);
    ctx.font = `400 ${bodySize}px Georgia, serif`;
    const meaningLines = wrapLines(ctx, meaning, contentWidth, Number.POSITIVE_INFINITY);
    ctx.font = `400 ${reflectionSize}px Georgia, serif`;
    const reflectionLines = wrapLines(ctx, reflection, contentWidth, Number.POSITIVE_INFINITY);

    let y = contentTop;
    y += sanskritLines.length * sanskritLine;
    y += Math.round(16 * scale);
    y += translitLines.length * translitLine;
    y += Math.round(16 * scale);
    y += Math.round(36 * scale);
    y += Math.round(42 * scale);
    y += meaningLines.length * bodyLine;
    y += Math.round(20 * scale);
    y += Math.round(40 * scale);
    y += reflectionLines.length * reflectionLine;

    return {
      scale,
      sanskritSize,
      sanskritLine,
      translitSize,
      translitLine,
      labelSize,
      bodySize,
      bodyLine,
      reflectionSize,
      reflectionLine,
      sanskritLines,
      translitLines,
      meaningLines,
      reflectionLines,
      endY: y
    };
  }

  let layout = buildLayout(1);
  for (let scale = 0.97; layout.endY > maxContentBottom && scale >= 0.5; scale -= 0.02) {
    layout = buildLayout(Number(scale.toFixed(2)));
  }

  let cursorY = contentTop;

  ctx.fillStyle = textAccent;
  ctx.fillStyle = textPrimary;
  ctx.font = `500 ${layout.sanskritSize}px 'Nirmala UI', serif`;
  cursorY = drawLines(ctx, layout.sanskritLines, contentX, cursorY, layout.sanskritLine);
  cursorY += Math.round(16 * layout.scale);

  ctx.fillStyle = textSecondary;
  ctx.font = `italic 400 ${layout.translitSize}px Georgia, serif`;
  cursorY = drawLines(ctx, layout.translitLines, contentX, cursorY, layout.translitLine);
  cursorY += Math.round(16 * layout.scale);

  ctx.strokeStyle = borderStroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(contentX, cursorY);
  ctx.lineTo(contentX + contentWidth, cursorY);
  ctx.stroke();
  cursorY += Math.round(36 * layout.scale);

  ctx.fillStyle = textAccent;
  ctx.font = `600 ${layout.labelSize}px Cinzel, Georgia, serif`;
  ctx.fillText(meaningLabel, contentX, cursorY);
  cursorY += Math.round(42 * layout.scale);

  ctx.fillStyle = textBody;
  ctx.font = `400 ${layout.bodySize}px Georgia, serif`;
  cursorY = drawLines(ctx, layout.meaningLines, contentX, cursorY, layout.bodyLine);
  cursorY += Math.round(20 * layout.scale);

  ctx.fillStyle = textAccent;
  ctx.font = `600 ${layout.labelSize}px Cinzel, Georgia, serif`;
  ctx.fillText(reflectionLabel, contentX, cursorY);
  cursorY += Math.round(40 * layout.scale);

  ctx.fillStyle = textSecondary;
  ctx.font = `400 ${layout.reflectionSize}px Georgia, serif`;
  drawLines(ctx, layout.reflectionLines, contentX, cursorY, layout.reflectionLine);

  ctx.fillStyle = textAccent;
  ctx.font = "500 24px Cinzel, Georgia, serif";
  ctx.fillText(footerLine, 96, 964);
  ctx.font = "400 19px Georgia, serif";
  ctx.fillStyle = textSecondary;
  ctx.fillText("srma4tech.github.io/gitapath", 96, 996);

  const profileName = normalizeText(profile && profile.name ? profile.name : "");
  const profilePhotoData = profile && profile.photoDataUrl ? profile.photoDataUrl : "";
  if (profileName || profilePhotoData) {
    const badgeWidth = 300;
    const badgeHeight = 76;
    const badgeX = CARD_WIDTH - badgeWidth - 84;
    const badgeY = 92;

    ctx.fillStyle = appearance === "light" ? "rgba(255, 250, 237, 0.92)" : "rgba(8, 12, 31, 0.75)";
    ctx.strokeStyle = borderStroke;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 20);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
      ctx.strokeRect(badgeX, badgeY, badgeWidth, badgeHeight);
    }

    let textX = badgeX + 18;
    if (profilePhotoData) {
      const avatar = await loadImageFromDataUrl(profilePhotoData);
      if (avatar) {
        const avatarSize = 52;
        const avatarX = badgeX + 14;
        const avatarY = badgeY + (badgeHeight - avatarSize) / 2;
        const avatarScale = Math.max(avatarSize / avatar.width, avatarSize / avatar.height);
        const avatarDrawWidth = avatar.width * avatarScale;
        const avatarDrawHeight = avatar.height * avatarScale;
        const avatarDrawX = avatarX + (avatarSize - avatarDrawWidth) / 2;
        const avatarDrawY = avatarY + (avatarSize - avatarDrawHeight) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarDrawX, avatarDrawY, avatarDrawWidth, avatarDrawHeight);
        ctx.restore();
        ctx.strokeStyle = borderStroke;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        textX = avatarX + avatarSize + 14;
      }
    }

    const fittedName = fitTextSingleLine(ctx, profileName || "GitaPath Reader", 182);

    ctx.fillStyle = textAccent;
    ctx.font = "500 18px Cinzel, Georgia, serif";
    ctx.fillText(language === "hi" ? "प्रेषक" : "Shared by", textX, badgeY + 32);
    ctx.fillStyle = textPrimary;
    ctx.font = "600 22px Georgia, serif";
    ctx.fillText(fittedName, textX, badgeY + 58);
  }

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
  const appUrl = (() => {
    try {
      return new URL("./", window.location.href).href;
    } catch (error) {
      return "https://srma4tech.github.io/gitapath/";
    }
  })();
  const linkLabel = language === "hi" ? "\u0917\u0940\u0924\u093e\u092a\u0925 \u0932\u093f\u0902\u0915" : "GitaPath link";
  const meaningText = language === "hi" ? verse.hindiMeaning : verse.englishMeaning;
  const shareInvite = language === "hi"
    ? `\u0930\u094b\u091c\u093c \u090f\u0915 \u0917\u0940\u0924\u093e \u0936\u094d\u0932\u094b\u0915 \u092a\u0922\u093c\u0947\u0902, \u0905\u0930\u094d\u0925 \u0914\u0930 \u091a\u093f\u0902\u0924\u0928 \u0915\u0947 \u0938\u093e\u0925\u0964`
    : "Read one Bhagavad Gita verse daily with meaning and reflection.";
  const isWindows = /Windows/i.test(navigator.userAgent || "");
  const sharePayloadText = {
    title: "GitaPath Daily Verse",
    text: `${shareText}\n\n${meaningText}\n\n${shareInvite}\n${linkLabel}: ${appUrl}`
  };

  // File-sharing works well on most non-Windows targets.
  if (!isWindows && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: "GitaPath Daily Verse",
      text: `${shareText}\n\n${shareInvite}\n${linkLabel}: ${appUrl}`,
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


