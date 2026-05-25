# Vercel で完結する機能一覧

> VPS / MeCab 不要で本番運用できる範囲

## ✅ 実装済み（Vercel 本番）

| 機能 | 説明 |
|------|------|
| 歌詞 AI 生成 | DeepSeek API（サーバー側 env） |
| 韻候補取得 | nwnwn + azrhymes + in-note |
| **韻だけ取得** | 歌詞生成なしで `/api/rhymes` |
| 韻分析 | 行末韻・内部韻・モーラ・密度 |
| 古典語ハックフィルタ | デフォルト OFF、Setup で ON 可 |
| 読み仮名表示 | nwnwn ベース（kuromoji は Phase 2） |
| iPhone UI | 下部タブ・safe area |
| ローカルプロジェクト保存 | localStorage |
| **完了トースト** | 生成・韻取得・分析・保存 |
| **TXT エクスポート** | 歌詞・韻候補 |
| GitHub 連携デプロイ | push → 自動反映 |

## 🔜 Vercel で可能（未実装）

| 機能 | 手段 |
|------|------|
| kuromoji 読み精度 | npm パッケージ（辞書サイズに注意） |
| 韻候補クリック→挿入 | フロントのみ |
| Supabase クラウド保存 | env 設定のみ |
| PWA（ホーム画面追加） | manifest + icons |

## ❌ VPS が必要 / 向かない

| 機能 | 理由 |
|------|------|
| MeCab 本家 | ネイティブバイナリ + 辞書 |
| Google OAuth 自前 | 可能だが Supabase Auth 推奨 |
| 常時起動ワーカー | serverless 向きでない |

## 環境変数（Vercel）

```
DEEPSEEK_API_KEY=必須
DEEPSEEK_MODEL=deepseek-v4-pro
DEEPSEEK_THINKING=false
RHYME_PROVIDERS=nwnwn,azrhymes,in-note
RHYME_USE_MOCK=false
```

任意: `RHYME_ALLOW_ARCHAIC=true`（全員古典韻デフォルト ON）
