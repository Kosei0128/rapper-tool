/** in-note.com のフォーム構造を調査 */
const html = await fetch("https://in-note.com/").then((r) => r.text());
const forms = [...html.matchAll(/<form[\s\S]*?<\/form>/gi)].map((m) => m[0].slice(0, 400));
console.log("forms count:", forms.length);
forms.forEach((f, i) => console.log(`\n--- form ${i} ---\n`, f));
console.log("\nword paths:", [...html.matchAll(/\/words\/[^"'\\s]+/g)].slice(0, 15).map((m) => m[0]));
