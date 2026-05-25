const q = "町田";
const r = await fetch(`https://in-note.com/words?q=${encodeURIComponent(q)}&exact=true`, {
  redirect: "follow",
});
console.log("final url:", r.url);
const html = await r.text();
const wordId = html.match(/word_id['":\s]+(\d+)/)?.[1]
  ?? html.match(/new_ajax[\s\S]{0,200}?(\d{5,})/)?.[1];
console.log("word_id hint:", wordId);

if (wordId) {
  const ajax = await fetch("https://in-note.com/words/new_ajax", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${wordId}`,
  });
  const h = await ajax.text();
  console.log("rhymes:", (h.match(/word-main/g) ?? []).length);
}
