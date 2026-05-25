# Rapper Tool — 要件定義

> **進捗・iPhone開発:** [STATUS.md](./STATUS.md) / [MOBILE_DEV.md](./MOBILE_DEV.md)  
> **古典韻フィルタ:** [RHYME_FILTER.md](./RHYME_FILTER.md)

## プロダクト概要

日本語ラップ向けの作詞支援ツール。韻候補の取得、AI歌詞生成、韻/フロー分析、メモ帳での手書き、プロジェクト保存を1画面で行う。

**本番:** https://rappertool.vercel.app  
**リポジトリ:** https://github.com/Kosei0128/rapper-tool

---

## 現在の実装状況（2026-05）

### ✅ 完了

| 機能 | 内容 |
|------|------|
| 韻候補取得 | nwnwn / azrhymes / in-note 複合、断片語フィルタ |
| 古典語ハックフィルタ | 白々しきゃ等をデフォルト除外（任意ON）→ [RHYME_FILTER.md](./RHYME_FILTER.md) |
| AI歌詞生成 | DeepSeek V4 Pro、生成量（約4/8/16行） |
| 文章入力 | フレーズをそのまま歌詞に |
| 分析エンジン | 行末韻・内部韻・母音・モーラ・韻密度 |
| 歌詞読み仮名 | 分析結果を歌詞横に表示 |
| UI | ダークテーマ、**iPhone 下部タブ**、日本語 |
| メモ帳 | `--hook` / `--verse`、反映→自動分析 |
| 歌詞手動編集 | 編集 + 分析更新 |
| プロジェクト保存 | ローカル（歌詞+韻+Setup+分析+メモ） |
| デプロイ | GitHub + Vercel 自動デプロイ |

### 🔄 部分実装

| 機能 | 状態 |
|------|------|
| クラウド保存 | Supabase API あり（未設定） |
| MeCab / kuromoji | **kuromoji 実装済**（Vercel サーバー側） |
| 古典韻フィルタ本番 | コード済み、push 待ちの可能性あり |

### ❌ 未実装

| 機能 | 優先度 |
|------|--------|
| Google OAuth + クラウド同期 | 高 |
| 韻候補クリック→挿入 | 中 |
| 韻だけ取得ボタン | 中 |

---

## 画面構成（iPhone）

```
[ヘッダ] Rapper Tool | プロジェクト
[メイン] 入力 OR 歌詞/韻/分析（1画面表示）
[下部]   入力 | 歌詞 | 韻 | 分析
```

---

## API

| エンドポイント | 用途 |
|----------------|------|
| POST /api/rhymes | 韻候補のみ |
| POST /api/generate-lyrics | 韻+生成+分析 |
| POST /api/analyze-lyrics | 再分析+添削 |

---

## 次にやること

→ [plan.md](../plan.md) / [STATUS.md](./STATUS.md)
