// public/sw.js
const CACHE_NAME = "hourlog-pwa-cache-v1";

const ASSETS_TO_CACHE = [
    "/",
    "/manifest.json",
    "/icon-192.png",
    "/icon-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    // Only handle HTTP/HTTPS requests
    if (!event.request.url.startsWith("http")) return;

    // Don't cache Supabase API calls or Auth
    if (
        event.request.url.includes("supabase.co") ||
        event.request.url.includes("/auth/")
    ) {
        return;
    }

    // Network First strategy for all requests to ensure fresh data
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
