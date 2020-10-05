const CACHE_NAME = "pixel-art-ipfs-content";
const config = {
  ENV: "carthagenet", // dev | carthagenet | mainnet
  LEDGER_ID: 17140
};

const fetchResponse = async event => {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(event.request);
  if (response) {
    return response;
  }
  return await fetch(event.request);
};

const installServiceWork = async () => {
  // gets length of big map
  const lengthQuery = await fetch(
    `https://api.better-call.dev/v1/bigmap/${config.ENV}/${config.LEDGER_ID}`
  );
  const length = await lengthQuery.json();
  // fetches IPFS hashes from big map
  const response = await fetch(
    `https://api.better-call.dev/v1/bigmap/${config.ENV}/${config.LEDGER_ID}/keys?size=${length.total_keys}`
  );
  const cache = await caches.open(CACHE_NAME);
  const urlRequests = (await response.json())
    .filter(entry => entry.data.value !== null)
    .map(entry => {
      const url = `https://gateway.pinata.cloud/ipfs/${entry.data.key_string}`;
      if (!caches.has(url)) {
        return url;
      } else {
        return;
      }
    })
    .filter(el => el)
    .slice(0, 30);
  if (urlRequests.length > 0) {
    // only caches new URLs
    await cache.addAll(urlRequests);
    // removes obsolete requests from cache
    const requests = await cache.keys();
    requests.forEach(req => {
      if (!urlRequests.includes(req)) {
        cache.delete(req);
      }
    });
  }
  self.skipWaiting();
};

self.addEventListener("install", event => {
  // Perform install steps
  console.log("Install service worker...");
  event.waitUntil(installServiceWork());
});

self.addEventListener("fetch", async event => {
  event.respondWith(fetchResponse(event));
});
