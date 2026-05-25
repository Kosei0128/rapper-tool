const js = await fetch(
  "https://in-note.com/assets/application-fb36abc652e8ae1509861ff4780bbe67e9ea6a6f84f19d68047d7456c0cc2ac6.js",
).then((r) => r.text());

for (const term of ["new_ajax", "words?q", "exact=true", "word_id", "1656095"]) {
  const idx = js.indexOf(term);
  if (idx >= 0) {
    console.log("\n---", term, "---");
    console.log(js.slice(Math.max(0, idx - 80), idx + 200));
  }
}
