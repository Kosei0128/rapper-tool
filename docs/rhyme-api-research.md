# 外部韻サイト API 調査（キャプチャ済み）

Playwright で4サイトの検索操作を実行し、ネットワークをキャプチャ。
`browser-to-api` で OpenAPI 生成済み。

## キャプチャの実行方法

```bash
# 4サイトを検索操作しながらネットワークキャプチャ
npm run capture:rhyme-sites

# キャプチャ結果を解析
node scripts/analyze-capture.mjs
node scripts/extract-rhyme-samples.mjs

# OpenAPI 生成（browser-to-api）
npm run api-spec:rhyme-sites
```

成果物:

- `.o11y/rhyme-sites-capture/` — 生キャプチャ（requests/responses/bodies）
- `.o11y/rhyme-sites-capture/api-spec/` — OpenAPI + report.md + client.mjs
- `.o11y/rhyme-sites-capture/screenshots/` — 各サイトの操作後スクショ

---

## 発見された韻API（4サイト）

### 1. in.nwnwn.com — JSON API（最優先）

```
POST https://in.nwnwn.com/api/rhyme
Content-Type: application/json

{"text":"町田"}
```

```json
{
  "yomi": "マチダ",
  "vowels": "aia",
  "results": {
    "3": [
      { "surface": "まな板", "yomi": "マナイタ", "vowels": "aaia" }
    ]
  }
}
```

追加: `POST /api/alliteration`（頭韻、同形式）

---

### 2. ja.azrhymes.com — JSON + SSR

| エンドポイント | 用途 |
|----------------|------|
| `GET /?rhymes={word}` | メイン韻検索（SSR HTML） |
| `GET /rhyme-game/next-word/?query={word}&exclude=` | 韻候補 JSON（hints 配列） |
| `GET /api/examples?text={word}&dialect=` | 歌詞例（韻候補ではない） |

`/rhyme-game/next-word/` レスポンス例:

```json
{
  "word": "なく",
  "hints": ["悪", "あく", "学", "..."],
  "min_rhymes": 3
}
```

---

### 3. kujirahand.com — HTML API

| エンドポイント | 用途 |
|----------------|------|
| `GET /web-tools/words/api.php?m=random` | ランダム単語（HTML断片） |
| `GET /web-tools/Words.php?key={word}&m=boin-search` | 母音検索（HTML ページ） |

---

### 4. in-note.com — HTML AJAX（2段階）

検索フロー（キャプチャで確認）:

```
1. GET /words/autocomplete?q=町田     → 候補一覧
2. GET /words?q=町田&exact=true       → 302 リダイレクト
3. GET /words/new?hiragana=まちだ&query=町田  → 単語 ID 解決
4. POST /words/new_ajax  body: id=1656095     → 韻候補 HTML
```

`POST /words/new_ajax` レスポンスに韻候補が HTML で返る:

```html
<div class="comment">「町田（まちだ）」の母音は「あいあ」です。</div>
<ul class="word-list">
  <li class="rhymed_word">アラビア語のエジプト方言（あーんみーや）</li>
  ...
</ul>
```

---

## 統合優先度

| 優先 | サイト | adapter 方式 |
|------|--------|-------------|
| 1 | in.nwnwn.com | JSON fetch |
| 2 | ja.azrhymes.com | `/rhyme-game/next-word/` JSON |
| 3 | in-note.com | autocomplete → new_ajax HTML parse |
| 4 | kujirahand.com | Words.php HTML parse |

---

## 前回 vs 今回

| | 前回 | 今回 |
|---|------|------|
| キャプチャ | browse daemon 失敗、手動プローブのみ | Playwright で170リクエストキャプチャ |
| 4サイト検索操作 | 未実行 | 全サイト検索成功（nwnwn は addon で補完） |
| OpenAPI | 広告ノイズ93件 | origins フィルタで16件（韻関連のみ） |
| in-note API | 未特定 | `/words/autocomplete` + `/words/new_ajax` 確認 |
