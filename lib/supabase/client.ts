import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Supabaseクライアント（サーバー側用）。
 * 環境変数未設定の場合は null を返す（保存機能をスキップ可能にする）。
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("[supabase] 環境変数未設定 → 保存機能は無効");
    return null;
  }

  supabaseInstance = createClient(url, key);
  return supabaseInstance;
}

/** Supabaseが利用可能かどうか */
export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}
