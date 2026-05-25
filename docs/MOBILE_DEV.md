# iPhone から開発を進める方法

PC の Cursor を開かずに Rapper Tool を開発・運用するためのガイド。

---

## おすすめ構成（現実的）

```
iPhone Safari
  ├─ GitHub（コード・docs 閲覧）
  ├─ rappertool.vercel.app（動作確認）
  └─ AI チャット（Cursor Cloud / ChatGPT / Codex 等）
         ↓ 指示・パッチ
    GitHub リポジトリ
         ↓ push
    Vercel 自動デプロイ
```

**コードの正本 = GitHub**  
**docs/STATUS.md = 進捗の正本**

---

## 方法 A: GitHub + Vercel だけ（いちばん簡単）

PC 不要。コード編集はできないが **運用・確認・要件共有** は完結する。

1. **進捗確認** — Safari で  
   https://github.com/Kosei0128/rapper-tool/blob/master/docs/STATUS.md
2. **アプリ確認** — https://rappertool.vercel.app
3. **バグ報告** — GitHub Issues（スマホから作成可）
4. **デプロイ** — PC / クラウド IDE から push すれば Vercel が自動更新

---

## 方法 B: Cursor Cloud Agents（Cursor 契約がある場合）

1. https://cursor.com を iPhone Safari で開く
2. **Cloud Agents** でリポジトリ `Kosei0128/rapper-tool` を指定
3. チャットで `@docs/STATUS.md` を参照させてタスク指示
4. エージェントが PR または push → Vercel デプロイ

※ Cursor の Cloud 機能はプラン・地域により異なります。Desktop 不要の方向性。

---

## 方法 C: GitHub Codespaces（ブラウザ IDE）

1. GitHub リポジトリ → **Code** → **Codespaces** → Create
2. iPhone Safari でも VS Code 風 UI（狭いが可能）
3. ターミナルで `npm run dev` は Codespace 内 URL で確認
4. コミット → push → Vercel

---

## 方法 D: Remodex + Codex（リモート PC）

**最悪プラン** — 自宅 PC をサーバーとして使う。

1. PC で Cursor / Codex / SSH サーバーを起動
2. iPhone の Remodex 等から SSH / リモートデスクトップ接続
3. PC 上の Cursor で開発

**注意:** PC がスリープすると切れる。Tailscale + 常時起動が必要。

---

## 方法 E: Working Copy（iPhone ネイティブ git）

App Store の **Working Copy** で clone → 軽い編集 → commit → push。  
大規模リファクタ向きではないが、docs 修正や hotfix には使える。

---

## AI に作業させるときのテンプレ

```
リポジトリ: github.com/Kosei0128/rapper-tool
読むファイル:
- docs/STATUS.md（進捗）
- docs/REQUIREMENTS.md（要件）
- docs/RHYME_FILTER.md（古典韻フィルタ）
- plan.md（ロードマップ）

タスク: [ここに書く]

制約:
- Vercel デプロイ前提（MeCab ネイティブは使わない）
- 古典韻はデフォルト非表示、Setup チェックで ON 可能
- iPhone UI（下部タブ）を壊さない
```

---

## 環境変数（Vercel）

| 変数 | 用途 |
|------|------|
| `DEEPSEEK_API_KEY` | 歌詞生成（必須） |
| `RHYME_PROVIDERS` | 韻 API 一覧 |
| `RHYME_ALLOW_ARCHAIC` | `true` = 全ユーザー古典韻デフォルト ON（通常は不要） |

Setup の「古典韻候補も含める」は **ユーザーごと（localStorage）** で上書き。

---

## 関連リンク

- [STATUS.md](./STATUS.md)
- [RHYME_FILTER.md](./RHYME_FILTER.md)
- [REQUIREMENTS.md](./REQUIREMENTS.md)
