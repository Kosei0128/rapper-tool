const words = ["夜明け", "いけない太陽", "バーテン", "ポリス"];
for (const w of words) {
  const html = await fetch(
    "https://ja.azrhymes.com/?rhymes=" + encodeURIComponent(w),
  ).then((r) => r.text());
  const results = [...html.matchAll(/class="result[^"]*"[^>]*>([^<]+)/g)].map((m) =>
    m[1].trim().replace(/、$/, ""),
  );
  console.log("\n===", w, "===", results.slice(0, 12));
}

// broken endpoint (game)
const game = await fetch(
  "https://ja.azrhymes.com/rhyme-game/next-word/?query=" + encodeURIComponent("夜明け"),
).then((r) => r.json());
console.log("\n=== game endpoint ===", game.word, (game.hints ?? []).slice(0, 8));
