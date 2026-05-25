const html = await fetch(
  "https://in-note.com/words/new?hiragana=" +
    encodeURIComponent("まちだ") +
    "&query=" +
    encodeURIComponent("町田"),
).then((r) => r.text());

console.log("data-id matches:", html.match(/data-id="\d+"/g));
console.log("ajax block:", html.match(/class="ajax[\s\S]{0,120}/));
