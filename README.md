# Rapper Tool

韻候補 × DeepSeek AI × 韻密度分析で日本語ラップ歌詞を作る Web アプリ。  
**iPhone 向け UI**（下部タブ・safe area 対応）で友人と共有しやすい構成。

## 機能

- 韻候補取得（nwnwn / azrhymes / in-note）
- DeepSeek による歌詞生成
- 韻密度・フロー・母音分析
- メモ帳（`--hook` / `--verse` タグ）
- 歌詞手動編集 + 読み仮名表示（**kuromoji** 形態素解析）
- ローカルプロジェクト保存

## ドキュメント

- [docs/STATUS.md](docs/STATUS.md) — **進捗（iPhone から見る用）**
- [docs/MOBILE_DEV.md](docs/MOBILE_DEV.md) — iPhone から開発する方法
- [docs/RHYME_FILTER.md](docs/RHYME_FILTER.md) — 古典語ハックフィルタの説明
- [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) — **Supabase クラウド保存の設定**
- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) — 要件定義
- [plan.md](plan.md) — ロードマップ

## ローカル開発

```bash
npm install
cp .env.example .env.local
# .env.local を編集
npm run dev
```

http://localhost:3000

## 環境変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `DEEPSEEK_API_KEY` | ✅ | DeepSeek API キー |
| `DEEPSEEK_BASE_URL` | - | デフォルト `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | - | デフォルト `deepseek-v4-pro` |
| `DEEPSEEK_THINKING` | - | `false` 推奨（歌詞生成） |
| `RHYME_PROVIDERS` | - | 例: `nwnwn,azrhymes,in-note` |
| `RHYME_USE_MOCK` | - | `true` でモックのみ |
| `RHYME_MAX_CANDIDATES` | - | デフォルト 24 |
| `READING_USE_KUROMOJI` | - | デフォルト ON。`false` で nwnwn のみ |
| Supabase 系 | - | クラウド保存を使う場合のみ |

## Vercel へのデプロイ

### 1. GitHub に push

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create rapper-tool --public --source=. --remote=origin --push
```

### 2. Vercel でインポート

1. [vercel.com](https://vercel.com) → **Add New Project**
2. GitHub リポジトリ `rapper-tool` を選択
3. **Environment Variables** に `.env.example` を参考に追加（最低限 `DEEPSEEK_API_KEY`）
4. Deploy

### CLI からデプロイする場合

```bash
npx vercel login
npx vercel link
npx vercel env add DEEPSEEK_API_KEY production
# 他の変数も同様に追加
npx vercel --prod
```

### 友人に渡す

デプロイ後の URL（例: `https://rapper-tool.vercel.app`）を共有するだけで OK。  
API キーは Vercel 側にのみ置き、リポジトリには含めない。

## ドキュメント

- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) — 要件・現状
- [plan.md](plan.md) — ロードマップ

## 技術構成

- Next.js 16 (App Router) + TypeScript + Tailwind
- DeepSeek API（歌詞生成）
- 外部韻 API（adapter 設計）
- Supabase（任意・履歴保存）
