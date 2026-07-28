// Store answers, compute type, and persist for the user to come back.
// CRITICAL: the client NEVER receives the type, dimensions, or any result
// content until the result has been purchased. The POST response carries only
// a session id + purchased flag so network traffic cannot leak the answer.
import { NextRequest, NextResponse } from "next/server";
import { questions } from "../../../lib/questions";
import { score } from "../../../lib/scoring";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const STORE_DIR = process.env.HOME + "/personality-test/.store";

function ensure() {
  if (!existsSync(STORE_DIR)) mkdirSync(STORE_DIR, { recursive: true });
}
function getSessionId(req: NextRequest): string | null {
  return req.cookies.get("test_session_id")?.value || null;
}
function load(id: string): any | null {
  try {
    return JSON.parse(readFileSync(join(STORE_DIR, `${id}.json`), "utf8"));
  } catch {
    return null;
  }
}

// POST: submit answers, score server-side, persist.
// Response is deliberately blank of results — no type, no dimensions.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const answers: number[] = body.answers ?? [];
    const id =getSessionId(req) || crypto.randomUUID();

    if (!answers.length || answers.length !== questions.length) {
      return NextResponse.json(
        { error: "answer count mismatch" },
        { status: 400 },
      );
    }

    const result = score(answers);
    const record = {
      id,
      type: result.type,
      dimensions: result.dimensions,
      consistency: result.consistency,
      perQuestion: result.perQuestion,
      answers,
      createdAt: new Date().toISOString(),
      purchased: false,
    };

    ensure();
    writeFileSync(join(STORE_DIR, `${id}.json`), JSON.stringify(record));

    // Placeholder type returned ONLY to keep the client flow moving.
    // Real content is gated behind purchase. Do not expose result.*.
    const res = NextResponse.json({ id, purchased: false });
    res.cookies.set("test_session_id", id, {
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "scoring failed" },
      { status: 500 },
    );
  }
}

// GET: return only the purchased flag for this session.
// The type and all result content remain hidden unless purchased = true.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || getSessionId(req);
  if (!id) return NextResponse.json({ error: "no session" }, { status: 400 });
  const rec = load(id);
  if (!rec) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (rec.purchased) {
    // Only after payment do we return the full result (answers still stripped).
    const { answers, ...publicRec } = rec;
    return NextResponse.json({ purchased: true, ...publicRec });
  }

  // Unpaid: give nothing away.
  return NextResponse.json({ purchased: false });
}
