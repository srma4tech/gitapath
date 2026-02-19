const profileKey = "gitapath_profile";
const appearanceKey = "gitapath_appearance";
const defaultName = "Seeker";
const defaultAvatar = "./assets/images/app-icon.jpeg";

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function readProfile() {
  try {
    const raw = localStorage.getItem(profileKey);
    if (!raw) {
      return { name: "", photoDataUrl: "" };
    }
    const parsed = JSON.parse(raw);
    return {
      name: normalizeText(parsed.name).slice(0, 40),
      photoDataUrl: normalizeText(parsed.photoDataUrl)
    };
  } catch (error) {
    return { name: "", photoDataUrl: "" };
  }
}

function saveProfile(profile) {
  localStorage.setItem(profileKey, JSON.stringify(profile));
}

function applyProfileToPage() {
  const profile = readProfile();
  const displayName = profile.name || defaultName;
  const avatar = profile.photoDataUrl || defaultAvatar;

  document.querySelectorAll(".user-name").forEach((el) => {
    el.textContent = displayName;
  });
  document.querySelectorAll(".user-avatar").forEach((el) => {
    el.setAttribute("src", avatar);
    el.setAttribute("alt", `${displayName} avatar`);
  });
}

function applyStoredAppearance() {
  const appearance = localStorage.getItem(appearanceKey) || "dark";
  document.body.classList.remove("theme-dark", "theme-light");
  document.body.classList.add(`theme-${appearance}`);
}

function setupMenuAndModals() {
  const menu = document.getElementById("menu-modal");
  const menuOverlay = document.getElementById("menu-modal-overlay");
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const quickProfile = document.getElementById("quick-profile-btn");
  const quickReminder = document.getElementById("quick-reminder-btn");
  const menuOpenReminder = document.getElementById("menu-open-reminder");

  const reminderModal = document.getElementById("reminder-modal");
  const reminderOverlay = document.getElementById("reminder-modal-overlay");
  const reminderClose = document.getElementById("reminder-modal-close");

  const openMenu = () => {
    if (!menu || !menuOverlay) {
      return;
    }
    menu.classList.remove("hidden");
    menu.classList.add("is-open");
    menuOverlay.classList.remove("hidden");
  };

  const closeMenu = () => {
    if (!menu || !menuOverlay) {
      return;
    }
    menu.classList.remove("is-open");
    menu.classList.add("hidden");
    menuOverlay.classList.add("hidden");
  };

  const openReminder = () => {
    if (!reminderModal || !reminderOverlay) {
      return;
    }
    reminderModal.classList.remove("hidden");
    reminderModal.classList.add("is-open");
    reminderOverlay.classList.remove("hidden");
  };

  const closeReminder = () => {
    if (!reminderModal || !reminderOverlay) {
      return;
    }
    reminderModal.classList.remove("is-open");
    reminderModal.classList.add("hidden");
    reminderOverlay.classList.add("hidden");
  };

  menuToggle && menuToggle.addEventListener("click", openMenu);
  quickProfile && quickProfile.addEventListener("click", openMenu);
  menuClose && menuClose.addEventListener("click", closeMenu);
  menuOverlay && menuOverlay.addEventListener("click", closeMenu);
  quickReminder && quickReminder.addEventListener("click", openReminder);
  reminderClose && reminderClose.addEventListener("click", closeReminder);
  reminderOverlay && reminderOverlay.addEventListener("click", closeReminder);

  if (menuOpenReminder) {
    menuOpenReminder.addEventListener("click", () => {
      closeMenu();
      openReminder();
    });
  }

  if (menu) {
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closeReminder();
    }
  });
}

function setupProfileForm() {
  const form = document.getElementById("profile-form");
  if (!form) {
    return;
  }

  const nameInput = document.getElementById("profile-form-name");
  const photoInput = document.getElementById("profile-form-photo");
  const preview = document.getElementById("profile-form-preview");
  const status = document.getElementById("profile-form-status");
  const removePhoto = document.getElementById("profile-form-remove-photo");
  let pendingPhotoData = "";

  function resizeImageToDataUrl(file, maxEdge = 320) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
          const width = Math.max(1, Math.round(image.width * scale));
          const height = Math.max(1, Math.round(image.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Image processing failed."));
            return;
          }
          ctx.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.84));
        };
        image.onerror = () => reject(new Error("Invalid image file."));
        image.src = String(reader.result || "");
      };
      reader.onerror = () => reject(new Error("Unable to read image."));
      reader.readAsDataURL(file);
    });
  }

  const profile = readProfile();
  nameInput.value = profile.name || "";
  if (profile.photoDataUrl) {
    preview.src = profile.photoDataUrl;
    preview.classList.remove("hidden");
    pendingPhotoData = profile.photoDataUrl;
  }

  photoInput.addEventListener("change", async () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) {
      return;
    }
    try {
      pendingPhotoData = await resizeImageToDataUrl(file);
      preview.src = pendingPhotoData;
      preview.classList.remove("hidden");
      status.textContent = "Photo selected. Save profile to apply.";
    } catch (error) {
      status.textContent = "Could not process this image.";
    }
  });

  removePhoto.addEventListener("click", () => {
    pendingPhotoData = "";
    photoInput.value = "";
    preview.removeAttribute("src");
    preview.classList.add("hidden");
    status.textContent = "Photo removed. Save profile to confirm.";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextProfile = {
      name: normalizeText(nameInput.value).slice(0, 40),
      photoDataUrl: pendingPhotoData
    };
    saveProfile(nextProfile);
    applyProfileToPage();
    status.textContent = "Profile saved successfully. It will appear across all pages.";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyStoredAppearance();
  applyProfileToPage();
  setupMenuAndModals();
  setupProfileForm();
});
