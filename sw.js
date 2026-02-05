// FILE: sw.js
// Service Worker minimal (cache offline)
const CACHE = "psy-writer-cache-v02";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async ()=>{
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE) ? caches.delete(k) : Promise.resolve()));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  event.respondWith((async ()=>{
    const cached = await caches.match(event.request);
    if(cached) return cached;

    try{
      const fresh = await fetch(event.request);
      if(event.request.method === "GET"){
        const cache = await caches.open(CACHE);
        cache.put(event.request, fresh.clone());
      }
      return fresh;
    }catch(e){
      const fallback = await caches.match("./index.html");
      return fallback || new Response("Offline", {status:503});
    }
  })());
});
