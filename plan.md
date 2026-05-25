# Rapper Tool — 開発ロードマップ

> 詳細要件: [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)

---

## Phase 1 — 完了 ✅

- [x] 韻API統合（nwnwn, azrhymes, in-note）
- [x] DeepSeek 歌詞生成
- [x] 分析（韻密度・フロー・母音）
- [x] ダークUI + 日本語化
- [x] メモ帳 + 設定保持
- [x] 無限ループバグ修正（parseInputPhrases）
- [x] 韻断片フィルタ（カジャ等）
- [x] 歌詞手動編集 + 分析更新
- [x] ローカルプロジェクト保存
- [x] メモ帳 `--hook` / `--verse` タグ
- [x] メモ帳反映 → 自動分析
- [x] 論文ベース韻品質スコア（P9-3 参考）
- [x] LLMプロンプト改善（5モーラ脚韻・行長・反復禁止）

---

## Phase 2 — 次のスプリント 🔜

### UX 改善
- [ ] 韻候補ピルクリック → メモ帳/歌詞に挿入
- [ ] Setup に「韻だけ取得」ボタン（Generate なし）
- [ ] 歌詞編集後の自動デバウンス分析（任意ON/OFF）
- [ ] メモ帳タグのプレビュー（サビ/バース色分け）

### 品質
- [ ] MeCab 連携でモーラ精度UP（オプション依存）
- [ ] 分析: セクション別スコア（--hook ブロック単位）
- [ ] LLM にメモ帳構造（notepadStructureHint）を渡す

### 保存
- [ ] Supabase 設定ガイド（README）
- [ ] プロジェクトのエクスポート JSON / TXT

---

## Phase 3 — アカウント連携 📅

- [ ] Google OAuth（NextAuth or Supabase Auth）
- [ ] プロジェクトのクラウド同期
- [ ] 複数デバイス間での履歴共有
- [ ] ユーザーごとの韻候補キャッシュ

---

## Phase 4 — プロ機能 💡

- [ ] BPM ビート再生（Web Audio）
- [ ] フロー可視化（タイムライン）
- [ ] バトルモード（相手ワードへの返し生成）
- [ ] 韻候補の「意外性」スコア（論文の人手評価軸）
- [ ] PDF / 画像エクスポート

---

## 技術メモ

| 項目 | 現状 |
|------|------|
| フレームワーク | Next.js 16 + TypeScript |
| LLM | DeepSeek V4 Pro |
| 韻API | nwnwn, azrhymes, in-note |
| 保存 | localStorage + Supabase（任意） |
| 分析 | 自前 + nwnwn 読み |

---

## 参考

- [GRPO日本語ラップ歌詞生成 P9-3 (ANLP 2026)](https://www.anlp.jp/proceedings/annual_meeting/2026/pdf_dir/P9-3.pdf)
