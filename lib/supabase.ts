// Server-side Supabase client — uses the service_role key so it can write.
// This runs only inside Next.js API routes (never shipped to the browser),
// so the service_role key is safe here.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars in Vercel"
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type SessionRecord = {
  id: string;
  type: string;
  dimensions: Record<string, Record<string, number>>;
  consistency: { ok: boolean; score: number };
  per_question: {
    index: number;
    text: string;
    dimension: string;
    pole: string;
    answer: number;
    contribution: number;
  }[];
  answers: number[];
  purchased: boolean;
  created_at: string;
};

// Upsert a full record (used when a user finishes the quiz).
export async function saveSession(rec: SessionRecord) {
  const { data, error } = await supabase
    .from("sessions")
    .upsert({
      id: rec.id,
      type: rec.type,
      dimensions: rec.dimensions,
      consistency: rec.consistency,
      per_question: rec.per_question,
      answers: rec.answers,
      purchased: rec.purchased,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SessionRecord;
}

// Insert a new record (id + created_at default via DB, so omit them).
export async function insertSession(
  rec: Omit<SessionRecord, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("sessions")
    .insert(rec)
    .select()
    .single();
  if (error) throw error;
  return data as SessionRecord;
}

// Load a record by id.
export async function getSession(id: string): Promise<SessionRecord | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return data as unknown as SessionRecord;
}

// Mark a session purchased.
export async function markPurchased(id: string): Promise<SessionRecord | null> {
  const { data, error } = await supabase
    .from("sessions")
    .update({ purchased: true })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  if (!data) return null;
  return data as SessionRecord;
}

// Check purchased flag (lightweight — fetch only the flag column).
export async function getPurchased(id: string): Promise<boolean | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("purchased")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return (data as any).purchased ?? false;
}
