/**
 * Announces immigrei.app URLs to IndexNow after a production deploy.
 *
 *   npx tsx scripts/indexnow.ts                  # every URL in the live sitemap
 *   npx tsx scripts/indexnow.ts <url> [<url>...] # only these
 *
 * Run it against the live site, not a preview — IndexNow verifies the key at
 * https://immigrei.app/<key>.txt.
 */
import { INDEXNOW_KEY, INDEXNOW_KEY_PATH } from "../lib/indexnow";

const HOST = "immigrei.app";

async function sitemapUrls(): Promise<string[]> {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const args = process.argv.slice(2);
  const urls = args.length > 0 ? args : await sitemapUrls();

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}${INDEXNOW_KEY_PATH}`,
      urlList: urls,
    }),
  });

  // 200 = accepted, 202 = accepted pending key validation.
  console.log(`IndexNow: ${res.status} ${res.statusText} — ${urls.length} URL(s)`);
  if (res.status !== 200 && res.status !== 202) {
    console.error(await res.text());
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
