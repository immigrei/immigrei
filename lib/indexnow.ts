/**
 * IndexNow (Bing, Yandex, Seznam, Naver — Bing's index also feeds ChatGPT
 * search and Copilot): announce new/updated URLs instead of waiting for a
 * recrawl. The key is public by protocol design — ownership is proven by
 * serving it at /<key>.txt (public/<key>.txt, allow-listed in proxy.ts).
 * Ping with `npx tsx scripts/indexnow.ts` after a deploy.
 */
export const INDEXNOW_KEY = "605acf43cf24a97e68e504dd45d7264f";
export const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;
