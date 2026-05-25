-- Supabase SQL Editor で実行してください
-- lyrics_generations テーブル: 生成履歴の保存

create table if not exists public.lyrics_generations (
  id uuid primary key default gen_random_uuid(),
  input_words text[] not null default '{}',
  mood text not null check (mood in ('street', 'emotional', 'battle', 'mellow', 'business')),
  format text not null check (format in ('4bars', '8bars', '16bars', 'hook', 'punchline')),
  rhyme_candidates jsonb not null default '{}',
  generated_lyrics text not null,
  created_at timestamptz not null default now()
);

-- 開発用: anon から insert 可能にする（本番では RLS で制限推奨）
alter table public.lyrics_generations enable row level security;

create policy "Allow anonymous insert"
  on public.lyrics_generations
  for insert
  to anon
  with check (true);

create policy "Allow anonymous select"
  on public.lyrics_generations
  for select
  to anon
  using (true);

-- インデックス（履歴一覧表示用）
create index if not exists lyrics_generations_created_at_idx
  on public.lyrics_generations (created_at desc);
