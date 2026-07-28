// Mark a result as purchased so the full report unlocks.
// Production: real Stripe Checkout session + webhook verification.
// Development: when ENABLE_TEST_UNLOCK=true, a direct /unlock endpoint
// marks the result purchased without requiring a real payment.
import { NextRequest, NextResponse } from "next/server";
import { getSession, markPurchased, getPurchased } from "../../../lib/supabase";

// GET /api/purchase/status?session=... -> is it purchased?
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("session");
    if (!id) return NextResponse.json({ purchased: false }, { status: 400 });
    const purchased = await getPurchased(id);
    if (purchased === null)
      return NextResponse.json({ purchased: false }, { status: 404 });
    return NextResponse.json({ purchased });
  } catch (e: any) {
    console.error("purchase GET failed", e?.message || e);
    return NextResponse.json(
      { error: e?.message || "lookup failed" },
      { status: 500 }
    );
  }
}

// POST /api/purchase/create-checkout-session -> redirect to Stripe Checkout
export async function POST(req: NextRequest) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json(
        {
          error:
            "STRIPE_SECRET_KEY not configured. Set it, or set ENABLE_TEST_UNLOCK=true for a dev unlock flow.",
        },
        { status: 501 }
      );
    }
    const { id } = await req.json();
    const rec = await getSession(id);
    if (!rec)
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    if (rec.purchased) {
      return NextResponse.json({ alreadyPurchased: true });
    }

    const s = (await import("stripe")) as any;
    const client = new (s.default || s)(stripeSecret);

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const session = await client.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: 99, // £0.99
            product_data: {
              name: "Full Personality Profile Report",
              description:
                "Reveal your 4-letter type and deep-dive personality report",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/results?session=${id}&paid=true`,
      cancel_url: `${baseUrl}/results?session=${id}&canceled=true`,
      metadata: { session_id: id },
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("purchase POST failed", e?.message || e);
    return NextResponse.json(
      { error: e?.message || "checkout failed" },
      { status: 500 }
    );
  }
}

// PUT /api/purchase/unlock -> mark purchased (test / no-Stripe path).
// Only enabled when ENABLE_TEST_UNLOCK=true to avoid accidental free unlocks in prod.
export async function PUT(req: NextRequest) {
  if (!process.env.ENABLE_TEST_UNLOCK) {
    return NextResponse.json({ error: "test unlock is disabled" }, { status: 403 });
  }
  try {
    const { id } = await req.json();
    if (!(await getSession(id)))
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    await markPurchased(id);
    return NextResponse.json({ ok: true, purchased: true });
  } catch (e: any) {
    console.error("purchase PUT failed", e?.message || e);
    return NextResponse.json(
      { error: e?.message || "unlock failed" },
      { status: 500 }
    );
  }
}
