const CACHE_NAME = "gitapath-v11";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./about-gita.html",
  "./read-gita-daily.html",
  "./benefits-of-gita.html",
  "./404.html",
  "./robots.txt",
  "./sitemap.xml",
  "./tailwind.css",
  "./styles.css",
  "./manifest.json",
  "./js/app.js",
  "./js/verse.js",
  "./js/streak.js",
  "./js/share.js",
  "./js/pwa.js",
  "./data/verses.json",
  "./assets/images/krishna-aura-bg.png",
  "./assets/images/kurukshetra-sunrise-bg.png",
  "./assets/images/parchment-texture.png",
  "./assets/images/golden-celebration-glow.png",
  "./assets/images/app-icon.jpeg",
  "./assets/images/splash-gradient.jpeg",
  "./assets/images/share-card-light.jpeg",
  "./assets/images/share-card-dark.jpeg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))
      )
    )
  );
  self.clients.claim();
});

function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) {
      return cached;
    }

    return fetch(request).then((response) => {
      if (!response || response.status !== 200) {
        return response;
      }
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      return response;
    });
  });
}

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (
        response &&
        response.status === 200 &&
        new URL(request.url).origin === self.location.origin
      ) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")));
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  const isImage = event.request.destination === "image" || url.pathname.includes("/assets/images/");

  if (isImage) {
    // Images are immutable assets in this app, so cache-first minimizes load time.
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});
