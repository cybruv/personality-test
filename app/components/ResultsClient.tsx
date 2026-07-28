"use client";

import { useEffect, useState } from "react";
import { TAGLINES } from "../../lib/questions";
import { fullProfile } from "../../lib/profiles";

interface ResultsPageProps {
  searchParams: Promise<{
    session?: string;
    paid?: string;
    canceled?: string;
    checkout_session_id?: string;
  }>;
}

export default function ResultsClient({ searchParams }: ResultsPageProps) {
  const [id, setId] = useState<string | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sp = await searchParams;
        const session = sp?.session;
        const checkoutSessionId = sp?.checkout_session_id;
        const wasPaidRedirect = sp?.paid === "true";
        setCanceled(!!sp?.canceled);

        const myId =
          session ||
          (typeof document !== "undefined"
            ? localStorage.getItem("test_session_id") ||
              document.cookie.match(/test_session_id=([^;]+)/)?.[1]
            : null);

        if (!myId) {
          setMissing(true);
          return;
        }
        setId(myId);

        // Load the session. If purchased, /api/session returns the full result;
        // if not, it returns only { purchased: false } and leaks nothing.
        const r = await fetch(`/api/session?id=${myId}`);
        const j = await r.json();
        if (cancelled) return;
        // Only a real HTTP error / 404 means the session is missing.
        // { purchased: false } is a valid (unpaid) session and should show
        // the paywall — it intentionally omits id/type to keep results hidden.
        if (!r.ok) {
          setMissing(true);
          return;
        }
        if (j.purchased) {
          setPurchased(true);
          setResult(j);
          return;
        }

        // If Stripe redirected back with ?paid=true, verify the payment
        // server-side before unlocking the result.
        if (wasPaidRedirect && checkoutSessionId) {
          setLoading(true);
          try {
            const c = await fetch("/api/purchase/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                checkoutSessionId,
                sessionId: myId,
              }),
            });
            if (cancelled) return;
            const cj = await c.json();
            if (c.ok && cj.purchased) {
              setPurchased(true);
              const r = await fetch(`/api/session?id=${myId}`);
              if (r.ok) setResult(await r.json());
            } else {
              setError(cj.error || "Payment confirmation failed. Try again or contact support.");
            }
          } catch {
            if (!cancelled) setError("Payment confirmation failed. Try again or contact support.");
          }
        }
      } catch {
        if (!cancelled) setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function startCheckout() {
    if (!id) return;
    setCheckoutLoading(true);
    setError("");
    try {
      const r = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = await r.json();
      if (r.status === 501) {
        // No Stripe key configured — fall back to the test unlock flow.
        await unlockDirect();
        return;
      }
      if (!r.ok) throw new Error(j.error);
      if (j.alreadyPurchased) {
        setPurchased(true);
        await fetchResult();
        return;
      }
      window.location.href = j.url;
    } catch (e: any) {
      setError(e?.message || "Payment could not start.");
      setCheckoutLoading(false);
    }
  }

  async function unlockDirect() {
    if (!id) return;
    setCheckoutLoading(true);
    try {
      const r = await fetch("/api/purchase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setPurchased(true);
      await fetchResult();
    } catch (e: any) {
      setError(e?.message || "Could not unlock report.");
      setCheckoutLoading(false);
    }
  }

  async function fetchResult() {
    if (!id) return;
    const r = await fetch(`/api/session?id=${id}`);
    const j = await r.json();
    if (r.ok) setResult(j);
  }

  if (missing) {
    return (
      <section className="py-24 text-center slide-in">
        <p className="text-[var(--color-accent)] uppercase tracking-widest text-sm">
          No results found
        </p>
        <h2 className="text-3xl font-light mt-3">We couldn&rsquo;t find a saved test.</h2>
        <a
          href="/"
          className="mt-8 inline-block bg-[var(--color-accent)] text-white font-semibold px-10 py-4 rounded-2xl"
        >
          Take the test
        </a>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-24 text-center">
        <p className="text-[var(--color-text-dim)] animate-pulse">
          Preparing your results&hellip;
        </p>
      </section>
    );
  }

  if (canceled && !purchased) {
    return (
      <PaywallTeaser
        onPay={startCheckout}
        loading={checkoutLoading}
        error={error}
        cancelMessage="You left the payment before finishing. No worries — your answers are still saved. Click below when you&rsquo;re ready to see your type."
      />
    );
  }

  if (purchased && result) {
    return <UnlockedReport result={result} />;
  }

  return (
    <PaywallTeaser
      onPay={startCheckout}
      loading={checkoutLoading}
      error={error}
    />
  );
}

/* ------------------------------------------------------------------ */
/* The teaser shown to anyone who hasn't paid. ZERO type information.  */
/* ------------------------------------------------------------------ */
function PaywallTeaser({
  onPay,
  loading,
  error,
  cancelMessage,
}: {
  onPay: () => void;
  loading: boolean;
  error: string;
  cancelMessage?: string;
}) {
  return (
    <section className="py-12 text-center slide-in">
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-14 glow max-w-2xl mx-auto">
        <p className="text-[var(--color-accent)] font-semibold uppercase tracking-widest text-sm">
          Test complete
        </p>
        <h2 className="text-3xl sm:text-5xl font-extralight mt-4 leading-tight">
          Your type has been calculated.
        </h2>
        <p className="text-[var(--color-text-dim)] mt-5 text-lg">
          We&rsquo;ve matched your answers to one of the 16 personality types.
          Unlock now to reveal it and see your full profile.
        </p>

        {cancelMessage && (
          <p className="text-[var(--color-text)] mt-5 text-sm italic">{cancelMessage}</p>
        )}

        <ul className="mt-8 flex flex-col items-center gap-3 text-[var(--color-text-dim)]">
          {[
            "Your 4-letter personality type",
            "A one-line profile summary",
            "All four dimension scores",
            "Strengths &amp; growth areas",
            "How you show up at work &amp; in relationships",
            "How your type handles stress",
            "Compatible types",
          ].map((t, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-[var(--color-success)]">✓</span> {t}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={onPay}
            disabled={loading}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-2)] text-white font-semibold px-12 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 disabled:opacity-50"
          >
            {loading
              ? "Starting payment…"
              : "See my type — £0.99"}
          </button>
          <span className="text-xs text-[var(--color-text-dim)]">
            Secure payment · instant access
          </span>
        </div>

        {error && <p className="text-[var(--color-warn)] mt-5">{error}</p>}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- */
/* Full report shown only after payment.                            */
/* --------------------------------------------------------------- */
function UnlockedReport({ result }: { result: any }) {
  const { type, dimensions, consistency } = result;
  const tag = TAGLINES[type] || "The Explorer";
  const profile = fullProfile(type);

  const DIM_ORDER = ["EI", "SN", "TF", "JP"] as const;
  const POLES: Record<string, Record<string, string>> = {
    EI: { E: "Extraverted", I: "Introverted" },
    SN: { S: "Sensing", N: "Intuitive" },
    TF: { T: "Thinking", F: "Feeling" },
    JP: { J: "Judging", P: "Perceiving" },
  };

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20">
      <section className="mt-6 text-center slide-in">
        <p className="text-[var(--color-success)] font-semibold uppercase tracking-widest text-sm">
          Unlocked
        </p>
        <p className="text-[var(--color-accent)] font-semibold uppercase tracking-widest text-sm mt-2">
          Your type
        </p>
        <h1 className="text-7xl sm:text-9xl font-extralight mt-2 tracking-tight">
          <span className="font-semibold">{type[0]}</span>
          {type.slice(1)}
        </h1>
        <p className="text-2xl text-[var(--color-text-dim)] mt-1 font-light">{tag}</p>

        <p className="text-[var(--color-text)] max-w-2xl mx-auto mt-6 text-lg leading-relaxed">
          {quickSummary(type)}
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
          {DIM_ORDER.map((d) => (
            <DimPill key={d} dim={d} values={dimensions[d]} poles={POLES[d]} />
          ))}
        </div>
      </section>

      <section className="mt-14 max-w-3xl mx-auto text-left space-y-6">
        {profile.sections.map((s, i) => (
          <div
            key={i}
            className="slide-in rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-5 py-4"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <h3 className="font-semibold text-[var(--color-accent)]">{s.heading}</h3>
            <p className="text-[var(--color-text)] mt-2 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

function DimPill({
  dim,
  values,
  poles,
}: {
  dim: string;
  values: Record<string, number>;
  poles: Record<string, string>;
}) {
  const [a, b] = (
    { EI: ["E", "I"], SN: ["S", "N"], TF: ["T", "F"], JP: ["J", "P"] } as const
  )[dim] || ["", ""];
  const av = values[a] ?? 0;
  const bv = values[b] ?? 0;
  const total = av + bv || 1;
  return (
    <div className="slide-in rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--color-text)]">{poles[a]}</span>
        <span className="text-[var(--color-text)]">{poles[b]}</span>
      </div>
      <div className="h-3 mt-2 rounded-full bg-[var(--color-bg-0)] overflow-hidden flex">
        <div
          className="bg-[var(--color-accent)]"
          style={{ width: `${(av / total) * 100}%` }}
        />
        <div
          className="bg-[var(--color-accent-2)]"
          style={{ width: `${(bv / total) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-[var(--color-text-dim)] font-mono mt-1">
        <span>{av}%</span>
        <span>{bv}%</span>
      </div>
    </div>
  );
}

function quickSummary(type: string): string {
  const [e, s, t, j] = type.split("");
  return (
    `As a ${TAGLINES[type] || "Explorer"} (${type}), you draw energy ` +
    `${e === "E" ? "from the world around you" : "from your inner world"}, ` +
    `focus on what is ` +
    `${s === "S" ? "real and concrete" : "possible and connected"}, ` +
    `decide with ${t === "T" ? "clear logic" : "personal values"}, and live ` +
    `${j === "J" ? "with structure and a plan" : "with flexibility and an open horizon"}.`
  );
}
