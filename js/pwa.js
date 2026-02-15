export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        console.error("Service worker registration failed:", error);
      });
    });
  }
}

export function setupInstallPrompt(installButton) {
  let deferredPrompt = null;

  installButton.classList.remove("hidden");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.textContent = "Install App";
  });

  installButton.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installButton.textContent = "Installed";
      return;
    }

    // Fallback when install prompt is unavailable in current browser state.
    if (window.matchMedia("(display-mode: standalone)").matches) {
      installButton.textContent = "Installed";
      return;
    }

    installButton.textContent = "Use browser menu to install";
  });

  window.addEventListener("appinstalled", () => {
    installButton.textContent = "Installed";
  });
}
