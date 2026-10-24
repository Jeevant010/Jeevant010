// Jeevant service worker v2.
// Rules: cache only public, immutable assets. Never cache API, auth, or any
// private route. Shell assets expire after 7 days. Navigation falls back to a
// static offline page that contains no personal data.

const VERSION = "v2";
const SHELL_CACHE = `jeevant-shell-${VERSION}`;
const ASSET_CACHE = `jeevant-assets-${VERSION}`;
const SHELL = ["/offline.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];
const SHELL_TTL = 7 * 24 * 60 * 60 * 1000;
const IMMUTABLE_PREFIX = "/_next/static/";

const PRIVATE_PREFIXES = [
  "/api/",
  "/login",
  "/dashboard",
  "/cms",
  "/planner",
  "/brain",
  "/career",
  "/learning",
  "/arsenal",
  "/voice",
  "/studio",
  "/integrations",
  "/agent",
  "/assistant",
  "/approvals",
  "/automations",
  "/messages",
  "/accounts",
  "/guardrails",
  "/contacts",
  "/media",
  "/style",
  "/templates",
  "/tracker",
];

function isPrivate(pathname) {
  return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

async function stamp(response) {
  const headers = new Headers(response.headers);
  headers.set("x-sw-cached-at", String(Date.now()));
  const body = await response.blob();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isFresh(response, ttl) {
  const stored = Number(response.headers.get("x-sw-cached-at") || 0);
  return stored > 0 && Date.now() - stored < ttl;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAR_CACHES") {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
    );
  }
});

async function handle(request, url) {
  if (url.pathname.startsWith(IMMUTABLE_PREFIX)) {
    const cache = await caches.open(ASSET_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  }

  if (SHELL.includes(url.pathname)) {
    const cache = await caches.open(SHELL_CACHE);
    const cached = await cache.match(request);
    if (cached && isFresh(cached, SHELL_TTL)) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, await stamp(response.clone()));
      return response;
    } catch {
      if (cached) return cached;
      throw new Error("offline");
    }
  }

  if (request.mode === "navigate") {
    try {
      return await fetch(request);
    } catch {
      const offline = await caches.match("/offline.html");
      return offline || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
    }
  }

  return fetch(request);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isPrivate(url.pathname)) return;

  event.respondWith(
    handle(request, url).catch(() => {
      if (request.mode === "navigate") {
        return caches.match("/offline.html").then(
          (offline) => offline || new Response("Offline", { status: 503 })
        );
      }
      return new Response("", { status: 504 });
    })
  );
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Jeevant OS", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Jeevant OS";
  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag || undefined,
    data: { url: payload.url || "/assistant" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/assistant";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ("focus" in client) {
          if ("navigate" in client) client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
