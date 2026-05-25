const base = "http://localhost:3000";

async function post(path, body) {
  const start = Date.now();
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(`\n=== ${path} ${res.status} (${Date.now() - start}ms) ===`);
  console.log(text.slice(0, 500));
}

await post("/api/analyze-lyrics", {
  lyrics: "町田の街で\nみんなで炊いたガンジャ",
  inputWords: ["町田", "みんなで炊いたガンジャ"],
  bpm: 90,
  beatsPerBar: 4,
  withCritique: false,
});

await post("/api/generate-lyrics", {
  inputWords: ["町田"],
  mood: "street",
  format: "punchline",
  rhymeCandidates: { 町田: [{ word: "真田", source: "mock", score: 0.9 }] },
  bpm: 90,
  beatsPerBar: 4,
  punchlineStyle: "default",
});
