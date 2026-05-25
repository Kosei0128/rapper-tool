# Supabase セットアップ（Rapper Tool）

> プロジェクト: `rapper_tool`  
> ダッシュボード: https://supabase.com/dashboard/project/eqcguqrfpljalusvtfkl

アプリ側の保存 API（`POST /api/save-lyrics`）は **すでに実装済み**。  
DB と env を設定すれば、歌詞タブの「保存」からクラウドに書き込めます。

---

## 1. テーブルを作る

Supabase → **SQL Editor** → New query → 以下を貼って **Run**:

```sql
-- supabase/migrations/001_lyrics_generations.sql と同じ内容
create table if not exists public.lyrics_generations (
  id uuid primary key default gen_random_uuid(),
  input_words text[] not null default '{}',
  mood text not null check (mood in ('street', 'emotional', 'battle', 'mellow', 'business')),
  format text not null check (format in ('4bars', '8bars', '16bars', 'hook', 'punchline')),
  rhyme_candidates jsonb not null default '{}',
  generated_lyrics text not null,
  created_at timestamptz not null default now()
);

alter table public.lyrics_generations enable row level security;

create policy "Allow anonymous insert"
  on public.lyrics_generations for insert to anon with check (true);

create policy "Allow anonymous select"
  on public.lyrics_generations for select to anon using (true);

create index if not exists lyrics_generations_created_at_idx
  on public.lyrics_generations (created_at desc);
```

**Table Editor** で `lyrics_generations` が見えれば OK。

---

## 2. API キーをコピー

Supabase → **Project Settings** → **API**

| 項目 | env 名 |
|------|--------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role（秘密） | `SUPABASE_SERVICE_ROLE_KEY`（推奨・サーバー専用） |

**Vercel では `service_role` を使うのがおすすめ**（クライアントに出さない。API Route だけが使う）。

---

## 3. 環境変数

### ローカル（`.env.local`）

```env
NEXT_PUBLIC_SUPABASE_URL=https://eqcguqrfpljalusvtfkl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...（Settings → API → service_role）
```

### Vercel

1. https://vercel.com → `rapper-tool` プロジェクト  
2. **Settings** → **Environment Variables**  
3. 上記 2 つを **Production / Preview / Development** 全部に追加  
4. **Redeploy**（env 追加後は再デプロイが必要）

---

## 4. 動作確認

1. https://rappertool.vercel.app で歌詞を生成  
2. **歌詞タブ** → **保存** ボタン  
3. 上部トースト: `クラウドに保存しました！`  
4. Supabase → **Table Editor** → `lyrics_generations` に行が増える

失敗時:

| 症状 | 対処 |
|------|------|
| `Supabase が未設定` | Vercel env 未設定 → 追加して redeploy |
| `relation "lyrics_generations" does not exist` | SQL Editor でテーブル作成 |
| RLS / permission | service_role を使うか、上記 policy を再実行 |

---

## 5. ローカル保存との違い

| 方式 | 場所 | 用途 |
|------|------|------|
| **プロジェクト**（左上パネル） | ブラウザ localStorage | 下書き・複数プロジェクト |
| **保存**（歌詞タブ） | Supabase | 生成履歴のクラウドバックアップ |

Phase 3 で Google ログイン + ユーザー別履歴を追加予定。

---

## 参考ファイル

- `supabase/migrations/001_lyrics_generations.sql`
- `app/api/save-lyrics/route.ts`
- `lib/supabase/client.ts`
