"use client";

import { useState, useEffect } from "react";
import { DIMENSION_META, TAGLINES } from "../../lib/questions";
import { fullProfile } from "../../lib/profiles";

interface Props {
  result: {
    id: string;
    type: string;
    dimensions: Record<string, Record<string, number>>;
    consistency: { ok: boolean; score: number };
  };
}

const DIM_ORDER = ["EI", "SN", "TF", "JP"] as const;
const POLES: Record<string, Record<string, string>> = {
  EI: { E: "Extraverted", I: "Introverted" },
  SN: { S: "Sensing", N: "Intuitive" },
  TF: { T: "Thinking", F: "Feeling" },
  JP: { J: "Judging", P: "Perceiving" },
};
const LETTER_COLOR: Record<string, string> = {
  E: "#3c9a73", I: "#5f5bd6", S: "#3c9a73", N: "#8269e5",
  T: "#c8922a", F: "#9a6d8a", J: "#3f6fb0", P: "#5b7fba",
};

export default function Results({ result }: Props) {
  const { id, type, dimensions, consistency } = result;
  const tag = TAGLINES[type] || "The Explorer";
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If the page was opened via /results with ?paid=true, query the server.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "true" || params.get("session") === id) {
      checkPaid();
    }
  }, [id]);

  async function checkPaid() {
    try {
      const r = await fetch(`/api/purchase/status?session=${id}`);
      const j = await r.json();
      setPaid(Boolean(j.purchased));
    } catch { setPaid(false); }
  }

  async function startCheckout() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = await r.json();
      if (r.status === 501) {
        // No Stripe key — fall back to test unlock
        await unlockDirect();
        return;
      }
      if (!r.ok) throw new Error(j.error);
      window.location.href = j.url;
    } catch (e: any) {
      setError(e?.message || "Payment could not start.");
    } finally {
      setLoading(false);
    }
  }

  async function unlockDirect() {
    setLoading(true);
    try {
      const r = await fetch("/api/purchase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setPaid(true);
    } catch (e: any) {
      setError(e?.message || "Could not unlock report.");
    } finally {
      setLoading(false);
    }
  }

  if (!consistency.ok) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-24 text-center slide-in">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 glow">
          <p className="text-[var(--color-warn)] font-semibold uppercase tracking-widest text-sm">
            Inconsistent answers
          </p>
          <h2 className="text-3xl sm:text-4xl font-light mt-3">
            We couldn&rsquo;t read a clear picture
          </h2>
          <p className="text-[var(--color-text-dim)] mt-4 text-lg">
            Your answers didn&rsquo;t line up consistently. This usually means answers
            were guessed or answered quickly. Take your time and we&rsquo;ll get it right.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 bg-[var(--color-accent)] text-white font-semibold px-10 py-4 rounded-2xl"
          >
            Take it again
          </button>
        </div>
      </section>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 pb-20">
      {/* BIG TYPE CARD */}
      <section className="mt-6 text-center slide-in">
        <p className="text-[var(--color-accent)] font-semibold tracking-widest text-sm uppercase">
          Your type
        </p>
        <h1 className="text-7xl sm:text-9xl font-extralight mt-2 tracking-tight">
          <span className="font-semibold">{type[0]}</span>
          {type.slice(1)}
        </h1>
        <p className="text-2xl text-[var(--color-text-dim)] mt-1 font-light">
          {tag}
        </p>

        {/* Quick free summary */}
        <p className="text-[var(--color-text)] max-w-2xl mx-auto mt-6 text-lg leading-relaxed">
          {quickSummary(type)}
        </p>

        {/* Dimension dials */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
          {DIM_ORDER.map((d) => (
            <DimPill key={d} dim={d} values={dimensions[d]} />
          ))}
        </div>
      </section>

      {/* PAYWALL */}
      <section className="mt-14 rounded-3xl border border-[var(--color-border)] bg-gradient-180 from-[var(--color-surface)] to-[var(--color-bg-1)] p-8 sm:p-10 text-center slide-in glow">
        {!paid ? (
          <>
            <p className="text-[var(--color-accent)] font-semibold uppercase tracking-widest text-sm">
              Unlock your full profile
            </p>
            <h2 className="text-3xl sm:text-4xl font-light mt-3">
              Go deeper into what makes you, you
            </h2>
            <ul className="mt-6 flex flex-col items-center gap-3 text-[var(--color-text-dim)]">
              {["All four dimension scores with explanations",
                "Strengths & growth areas",
                "How you show up at work and in relationships",
                "How your type handles stress",
                "Compatible types",
                "A downloadable PDF"].map((t, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-[var(--color-success)]">✓</span> {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={startCheckout}
                disabled={loading}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-2)] text-white font-semibold px-10 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 disabled:opacity-50"
              >
                {loading ? "Starting payment…" : "Unlock for $12"}
              </button>
              <button
                onClick={unlockDirect}
                className="text-[var(--color-text-dim)] hover:text-[var(--color-text)] underline underline-offset-4"
              >
                or demo-unlock (no payment)
              </button>
            </div>
            {error && <p className="text-[var(--color-warn)] mt-4">{error}</p>}
          </>
        ) : (
          <>
            <p className="text-[var(--color-success)] font-semibold uppercase tracking-widest text-sm">
              Unlocked
            </p>
            <h2 className="text-3xl sm:text-4xl font-light mt-3">Your full profile</h2>
            <PremiumReport type={type} />
            <p className="text-[var(--color-text-dim)] text-sm mt-8">
              Want a shareable copy? Contact support for your downloadable PDF.
            </p>
          </>
        )}
      </section>

      <p className="text-center text-xs text-[var(--color-text-dim)] mt-14 opacity-60">
        Session {id.slice(0, 12)} · A personality inventory for self-reflection
      </p>
    </main>
  );
}

function DimPill({ dim, values }: { dim: (typeof DIM_ORDER)[number]; values: Record<string, number> }) {
  const [a, b] = DIM_ORDER.includes(dim as any)
    ? (dim === "EI" ? ["E", "I"] :
       dim === "SN" ? ["S", "N"] :
       dim === "TF" ? ["T", "F"] : ["J", "P"])
    : ["", ""];
  const av = values[a] ?? 0;
  const bv = values[b] ?? 0;
  const total = av + bv || 1;
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--color-text)]">{POLES[dim]?.[a]}</span>
        <span className="text-[var(--color-text-dim)]">{DIMENSION_META[dim].label}</span>
        <span className="text-[var(--color-text)]">{POLES[dim]?.[b]}</span>
      </div>
      <div className="h-3 mt-2 rounded-full bg-[var(--color-bg-0)] overflow-hidden flex">
        <div className="bg-[var(--color-accent)]" style={{ width: `${(av / total) * 100}%` }} />
        <div className="bg-[var(--color-accent-2)]" style={{ width: `${(bv / total) * 100}%` }} />
      </div>
      <div className="flex justify-between text-xs text-[var(--color-text-dim)] font-mono mt-1">
        <span>{av}%</span><span>{bv}%</span>
      </div>
    </div>
  );
}

function quickSummary(type: string): string {
  const [e, s, t, j] = type.split("");
  return (
    `As a ${TAGLINES[type] || "Explorer"} (${type}), you draw energy ${e === "E" ? "from the world around you" : "from your inner world"}, ` +
    `focus on what is ${s === "S" ? "real and concrete" : "possible and connected"}, ` +
    `decide with ${t === "T" ? "clear logic" : "personal values"}, and live ` +
    `${j === "J" ? "with structure and a plan" : "with flexibility and an open horizon"}.`
  );
}

function PremiumReport({ type }: { type: string }) {
  const profile = fullProfile(type);
  return (
    <div className="mt-8 max-w-3xl mx-auto text-left space-y-6">
      {profile.sections.map((s, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-5 py-4 slide-in"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <h3 className="font-semibold text-[var(--color-accent)]">{s.heading}</h3>
          <p className="text-[var(--color-text)] mt-2 leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  );
}
