const endpoints = [
  {
    name: "in-note jsonp backend",
    url: "http://133.242.179.106/in-note?word=" + encodeURIComponent("町田") + "&type=2",
  },
  {
    name: "in-note jsonp type1",
    url: "http://133.242.179.106/in-note?word=" + encodeURIComponent("町田") + "&type=1",
  },
];

for (const e of endpoints) {
  try {
    const r = await fetch(e.url);
    const text = await r.text();
    console.log(`\n=== ${e.name} (${r.status}) ===`);
    console.log(text.slice(0, 800));
  } catch (err) {
    console.log(`\n=== ${e.name} ERR ===`, err.message);
  }
}

// azrhymes: look for fetch URLs in main bundle
const js = await fetch(
  "https://static1.azrhymes.com/static/main-76a5311165e6dfe281d5.js",
).then((r) => r.text());
const fetchCalls = [...js.matchAll(/fetch\(`([^`]+)`/g)].map((m) => m[1]);
console.log("\n=== azrhymes fetch templates ===");
console.log([...new Set(fetchCalls)]);
