// Store answers, compute type, and persist for the user to come back.
// CRITICAL: the client NEVER receives the type, dimensions, or any result
// content until the result has been purchased. The POST response carries only
// a session id + purchased flag so network traffic cannot leak the answer.
import { NextRequest, NextResponse } from "next/server";
import { questions } from "../../../lib/questions";
import { score } from "../../../lib/scoring";
import { insertSession, getSession } from "../../../lib/supabase";

// POST: submit answers, score server-side, persist to DB.
// Response is deliberately blank of results — no type, no dimensions.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const answers: number[] = body.answers ?? [];
    if (!answers.length || answers.length !== questions.length) {
      return NextResponse.json(
        { error: "answer count mismatch" },
        { status: 400 }
      );
    }
    const result = score(answers);
    const record = await insertSession({
      type: result.type,
      dimensions: result.dimensions,
      consistency: result.consistency,
      per_question: result.perQuestion,
      answers,
      purchased: false,
    });

    // Placeholder type returned ONLY to keep the client flow moving.
    // Real content is gated behind purchase. Do not expose result.*.
    const res = NextResponse.json({ id: record.id, purchased: false });
    res.cookies.set("test_session_id", record.id, {
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
    return res;
  } catch (e: any) {
    console.error("session POST failed", e?.message || e);
    return NextResponse.json(
      { error: e?.message || "scoring failed" },
      { status: 500 }
    );
  }
}

// GET: return only the purchased flag for this session.
// The type and all result content remain hidden unless purchased = true.
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id") ?? null;
    const cookie = req.cookies.get("test_session_id")?.value ?? null;
    const session = id ?? cookie;
    if (!session)
      return NextResponse.json({ error: "no session" }, { status: 400 });
    const rec = await getSession(session);
    if (!rec)
      return NextResponse.json({ error: "not found" }, { status: 404 });

    if (rec.purchased) {
      // Only after payment do we return the full result (answers stripped).
      const { answers, purchased: _p, ...publicRec } = rec;
      return NextResponse.json({ purchased: _p, ...publicRec });
    }
    // Unpaid: give nothing away.
    return NextResponse.json({ purchased: false });
  } catch (e: any) {
    console.error("session GET failed", e?.message || e);
    return NextResponse.json(
      { error: e?.message || "scoring failed" },
      { status: 500 }
    );
  }
}
