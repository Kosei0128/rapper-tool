const r = await fetch("https://in-note.com/words/9265054");
const h = await r.text();
console.log("status", r.status, "len", h.length);
const rhymes = [...h.matchAll(/class="rhyme[^"]*"[^>]*>([^<]+)/g)].map((m) => m[1]).slice(0, 15);
console.log("rhymes", rhymes);

// search endpoint hints from JS
const js = await fetch(
  "https://in-note.com/assets/application-fb36abc652e8ae1509861ff4780bbe67e9ea6a6f84f19d68047d7456c0cc2ac6.js",
).then((x) => x.text());
for (const term of ["update_query", "word=", "/words/", "location.href", "submit"]) {
  const idx = js.indexOf(term);
  if (idx >= 0) {
    console.log("\n---", term, "---");
    console.log(js.slice(Math.max(0, idx - 100), idx + 150));
  }
}
