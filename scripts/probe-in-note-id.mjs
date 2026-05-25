const q = "町田";
const ac = await fetch(`https://in-note.com/words/autocomplete?q=${encodeURIComponent(q)}`);
const items = await ac.json();
console.log("autocomplete exact match:", items.find((x) => x.name === q));
console.log("first item ids:", items[0] && { id: items[0].id, word_id: items[0].word_id, name: items[0].name });

const newRes = await fetch(`https://in-note.com/words/new?query=${encodeURIComponent(q)}`);
const html = await newRes.text();
const idMatch = html.match(/data-word-id="(\d+)"/) ?? html.match(/word_id['":\s]+(\d+)/);
console.log("new page id hint:", idMatch?.[1]);

for (const id of [items[0]?.id, items[0]?.word_id, idMatch?.[1], 1656095]) {
  if (!id) continue;
  const r = await fetch("https://in-note.com/words/new_ajax", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}`,
  });
  const h = await r.text();
  const count = (h.match(/word-main/g) ?? []).length;
  console.log(`new_ajax id=${id} -> ${count} rhymes, len=${h.length}`);
}
