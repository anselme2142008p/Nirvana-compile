const V='nc-v8',CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
const SK='https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/',EXT=[SK+'skulpt.min.js',SK+'skulpt-stdlib.js'];
self.addEventListener('install',e=>e.waitUntil((async()=>{
  const c=await caches.open(V);await c.addAll(CORE);
  const r=await Promise.allSettled(EXT.map(u=>c.add(new Request(u,{mode:'cors'}))));
  const full=r.every(x=>x.status==='fulfilled');
  (await self.clients.matchAll({includeUncontrolled:true})).forEach(k=>k.postMessage({ready:true,full}));
  self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const q=e.request;if(q.method!=='GET')return;
  const same=new URL(q.url).origin===location.origin;
  e.respondWith(caches.match(q,{ignoreSearch:same}).then(hit=>{
    const net=fetch(q).then(r=>{if(r.ok){const cp=r.clone();caches.open(V).then(c=>c.put(q,cp))}return r}).catch(()=>hit);
    return hit&&same?(net.catch(()=>{}),hit):(hit||net);
  }));
});
