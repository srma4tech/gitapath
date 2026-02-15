const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1080;

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  let line = "";
  let lines = 0;

  for (let i = 0; i < words.length; i += 1) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines += 1;
      line = words[i];
      if (lines >= maxLines - 1) {
        break;
      }
    } else {
      line = testLine;
    }
  }

  if (line && lines < maxLines) {
    ctx.fillText(line, x, y);
  }
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

  ctx.fillStyle = "rgba(214, 178, 94, 0.2)";
  ctx.beginPath();
  ctx.arc(CARD_WIDTH * 0.8, CARD_HEIGHT * 0.2, 140, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(214, 178, 94, 0.5)";
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, CARD_WIDTH - 80, CARD_HEIGHT - 80);

  const textPrimary = appearance === "light" ? "#1f2d44" : "#f4e2ba";
  const textSecondary = appearance === "light" ? "rgba(24,32,48,0.9)" : "rgba(255,255,255,0.92)";
  const textBody = appearance === "light" ? "rgba(22,30,44,0.95)" : "rgba(255,255,255,0.95)";
  const textAccent = appearance === "light" ? "rgba(146,104,28,0.95)" : "rgba(214,178,94,0.95)";

  ctx.fillStyle = textPrimary;
  ctx.font = "600 42px Cinzel, Georgia, serif";
  ctx.fillText("GitaPath", 80, 110);

  ctx.fillStyle = textSecondary;
  ctx.font = "500 28px Cinzel, Georgia, serif";
  ctx.fillText(`Chapter ${verse.chapter}, Verse ${verse.verse}`, 80, 170);

  ctx.fillStyle = textPrimary;
  ctx.font = "500 36px 'Nirmala UI', serif";
  drawWrappedText(ctx, verse.sanskrit, 80, 250, 920, 56, 8);

  const meaning = language === "hi" ? verse.hindiMeaning : verse.englishMeaning;
  ctx.fillStyle = textBody;
  ctx.font = "400 30px Georgia, serif";
  drawWrappedText(ctx, meaning, 80, 680, 920, 42, 7);

  ctx.fillStyle = textAccent;
  ctx.font = "400 24px Cinzel, Georgia, serif";
  ctx.fillText("Daily verse. Daily reflection. Daily alignment.", 80, 980);

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
