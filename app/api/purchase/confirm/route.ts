// Confirm that a Stripe Checkout payment actually succeeded, then mark the
// personality-test session as purchased. Called on the success redirect so
// users can't unlock results by typing ?paid=true into the URL.
//
// Security: verification happens server-side using the Stripe secret key.
// The client only sends the Checkout Session ID, which is useless on its own.
import { NextRequest, NextResponse } from "next/server";
import { markPurchased,getSession } from "../../../../lib/supabase";

export async function POST(req: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY not configured" },
      { status: 501 }
    );
  }
  try {
    const { checkoutSessionId, sessionId } = await req.json();
    if (!checkoutSessionId || !sessionId) {
      return NextResponse.json(
        { error: "checkoutSessionId and sessionId required" },
        { status: 400 }
      );
    }
    // Ensure the test session exists in our DB
    const rec = await getSession(sessionId);
    if (!rec) {
      return NextResponse.json(
        { error: "session not found" },
        { status: 404 }
      );
    }
    if (rec.purchased) {
      return NextResponse.json({ alreadyPurchased: true });
    }
    const s = (await import("stripe")) as any;
    const client = new (s.default || s)(stripeSecret);
    // Server-side verification: ask Stripe whether this Checkout Session
    // actually completed. Only Stripe's API can confirm this.
    const session = await client.checkout.sessions.retrieve(checkoutSessionId);
    if (session.payment_status !== "paid" || session.status !== "complete") {
      return NextResponse.json(
        { error: "payment not confirmed" },
        { status: 402 }
      );
    }
    await markPurchased(sessionId);
    return NextResponse.json({ purchased: true });
  } catch (e: any) {
    console.error("confirm POST failed", e?.message || e);
    return NextResponse.json(
      { error: e?.message || "confirmation failed" },
      { status: 500 }
    );
  }
}
