# Rapper Tool — 現在の進捗（共有用）

> **iPhone からこのファイルを開けば、PC なしで「今どこまで？」が分かります。**  
> GitHub: `docs/STATUS.md` / 本番: https://rappertool.vercel.app

**最終更新:** 2026-05

---

## 本番環境

| 項目 | URL / 状態 |
|------|------------|
| アプリ（友人共有用） | https://rappertool.vercel.app |
| GitHub | https://github.com/Kosei0128/rapper-tool |
| ホスティング | Vercel（`master` push で自動デプロイ） |
| 歌詞生成 API | DeepSeek V4 Pro（Vercel 環境変数） |
| 韻 API | nwnwn + azrhymes + in-note |

---

## できていること ✅

- 韻候補取得・AI 歌詞生成・韻密度分析
- メモ帳（`--hook` / `--verse`）、手動編集、読み仮名表示
- ローカルプロジェクト保存（ブラウザ内）
- **iPhone 向け UI**（下部タブ・safe area）
- **古典語ハックフィルタ**（デフォルト OFF = 自然な語優先）→ [RHYME_FILTER.md](./RHYME_FILTER.md)
- Setup「古典韻候補も含める」チェック（必要なときだけ ON）
- **完了トースト通知**（生成・韻・分析・保存）
- **韻だけ取得**ボタン
- **TXT エクスポート**（歌詞・韻候補）
- **韻候補タップ → メモ帳/歌詞に挿入**
- **PWA**（ホーム画面に追加可能）
- **kuromoji 読み仮名**（漢字歌詞の読み精度向上）

---

## 次にやること（Vercel 内）

1. Supabase クラウド保存（env 設定）
2. 友人フィードバック（iPhone Safari）

詳細 → [VERCEL_SCOPE.md](./VERCEL_SCOPE.md) / [plan.md](../plan.md)

---

## ドキュメント一覧

| ファイル | 内容 |
|----------|------|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | 要件定義 |
| [STATUS.md](./STATUS.md) | **このファイル（進捗）** |
| [MOBILE_DEV.md](./MOBILE_DEV.md) | iPhone から開発を進める方法 |
| [RHYME_FILTER.md](./RHYME_FILTER.md) | 古典語ハックフィルタの意味 |
| [VERCEL_SCOPE.md](./VERCEL_SCOPE.md) | Vercel でできること一覧 |

---

## Cursor / AI に引き継ぐとき

チャットでこう書くと早い:

```
@docs/STATUS.md @docs/REQUIREMENTS.md @plan.md を読んで、
[やりたいこと] を実装して。古典韻はデフォルトOFF、必要ならSetupのチェックON。
```
