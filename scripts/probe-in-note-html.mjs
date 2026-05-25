const html = await fetch("https://in-note.com/words/new?query=" + encodeURIComponent("町田")).then((r) => r.text());
const patterns = [
  /1656095/,
  /word_id[^0-9]{0,10}(\d+)/g,
  /new_ajax[^\\n]{0,80}/g,
  /"id":(\d+)/g,
];
for (const p of patterns) {
  const m = html.match(p);
  if (m) console.log(String(p), m.slice(0, 5));
}
