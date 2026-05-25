/** 4サイトの韻API候補を手動プローブするスクリプト */
const tests = [
  {
    name: "azrhymes rhyme page",
    url: "https://ja.azrhymes.com/?rhymes=" + encodeURIComponent("愛"),
    opts: { method: "GET" },
    parse: (html) => ({
      length: html.length,
      resultLinks: [...html.matchAll(/class=\"result[^\"]*\"[^>]*>([^<]+)/g)]
        .map((m) => m[1])
        .slice(0, 10),
    }),
  },
  {
    name: "kujirahand boin-search",
    url:
      "https://kujirahand.com/web-tools/Words.php?key=" +
      encodeURIComponent("まちだ") +
      "&m=boin-search",
    opts: { method: "GET" },
    parse: (html) => ({
      length: html.length,
      links: [...html.matchAll(/m=boin-search'>[^<]*<\/a>/g)]
        .map((m) => m[0])
        .slice(0, 8),
    }),
  },
];

for (const t of tests) {
  try {
    const res = await fetch(t.url, t.opts);
    const text = await res.text();
    console.log(`\n=== ${t.name} (${res.status}) ===`);
    console.log(JSON.stringify(t.parse(text), null, 2));
  } catch (e) {
    console.log(`\n=== ${t.name} ERR ===`, e.message);
  }
}
