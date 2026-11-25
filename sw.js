/* Offline-onderdeel van de Voedingsstoffengids.
   Wijzig het versienummer hieronder als je index.html vernieuwt; dan wordt de oude kopie vervangen. */
const VERSIE = "voedingsgids-v1";
const BESTANDEN = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSIE).then(cache => cache.addAll(BESTANDEN)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen.filter(n => n !== VERSIE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

/* Eerst uit het geheugen (snel en offline), op de achtergrond vernieuwen zodra er internet is. */
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(VERSIE).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(gevonden => {
        const netwerk = fetch(req).then(res => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => gevonden);
        return gevonden || netwerk;
      })
    )
  );
});
