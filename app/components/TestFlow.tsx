"use client";

import { useState, useEffect } from "react";
import { questions } from "../../lib/questions";
import { DIMENSION_META, TAGLINES } from "../../lib/questions";

const SCALE = [
  { v: 1, label: "Strongly\nDisagree" },
  { v: 2, label: "Disagree" },
  { v: 3, label: "Neutral" },
  { v: 4, label: "Agree" },
  { v: 5, label: "Strongly\nAgree" },
];

export default function TestFlow({
  onStart,
}: {
  onStart: (answers: number[]) => void;
}) {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(0));
  const [batch, setBatch] = useState(0);
  const BATCH = 6;
  const total = questions.length;
  const shown = Math.min(total, (batch + 1) * BATCH);
  const progress = total > 0 ? (shown / total) * 100 : 0;
  const finished = shown >= total;
  const [submitted, setSubmitted] = useState(false);

  function pick(i: number, v: number) {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
  }

  function advance() {
    if (submitted) return;
    if (finished) {
      // All questions in the last batch must be answered
      const unanswered = answers.slice((total - BATCH) >>> 0).some((a) => a === 0);
      if (unanswered) return;
      setSubmitted(true);
      onStart(answers);
    } else {
      setBatch((b) => b + 1);
    }
  }

  useEffect(() => {
    const el = document.getElementById("q" + batch * BATCH);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [batch]);

  if (!started) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-2xl mx-auto px-4">
        <div className="glow rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-14 sm:px-14 slide-in">
          <p className="text-[var(--color-accent)] font-semibold tracking-widest text-sm uppercase">
            Free personality test
          </p>
          <h1 className="text-3xl sm:text-5xl font-extralight mt-4 leading-tight">
            Discover your <span className="font-semibold">4-letter type</span>
          </h1>
          <p className="text-[var(--color-text-dim)] mt-4 text-lg">
            60 short questions. About 3 minutes. Honest answers give the clearest picture.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setStarted(true)}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-2)] text-white font-semibold px-10 py-4 rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              Start the test
            </button>
          </div>
          <p className="text-xs text-[var(--color-text-dim)] mt-6">
            A personality inventory for self-reflection, not a clinical assessment.
          </p>
        </div>
      </section>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Header / progress */}
      <header className="flex items-center justify-between mb-6 text-sm text-[var(--color-text-dim)]">
        <span>Question {shown} of {total}</span>
        <span className="font-mono">{Math.round(progress)}%</span>
      </header>
      <div className="h-2 rounded-full bg-[var(--color-surface-2)] overflow-hidden mb-10">
        <div
          className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); advance(); }}>
        {questions.slice(batch * BATCH, shown).map((q, bi) => {
          const idx = batch * BATCH + bi;
          const selected = answers[idx];
          return (
            <div
              id={"q" + idx}
              key={idx}
              className="slide-in rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 sm:px-7 py-5"
              style={{ animationDelay: `${bi * 0.04}s` }}
            >
              <div className="flex items-start gap-4">
                <span className="shrink-0 font-mono text-[var(--color-accent)] text-xs mt-1">
                  Q{idx + 1}
                </span>
                <p className="text-[var(--color-text)] text-base sm:text-lg flex-1">{q.text}</p>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
                {SCALE.map((s) => (
                  <label
                    key={s.v}
                    className={`cursor-pointer rounded-xl border-2 p-3 sm:p-4 text-center transition-all flex flex-col items-center justify-center min-h-[60px] ${
                      selected === s.v
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-text)]"
                        : "border-transparent bg-[var(--color-surface-2)] text-[var(--color-text-dim)] hover:border-[var(--color-border)]"
                    }]`}
                  >
                    <input
                      type="radio"
                      name={`q${idx}`}
                      value={s.v}
                      checked={selected === s.v}
                      onChange={() => pick(idx, s.v)}
                      className="sr-only"
                    />
                    <span className="text-lg font-bold">{s.v}</span>
                    <span className="text-[10px] leading-tight mt-1 hidden sm:block">{s.label.replace("\n", " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        {finished && (
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={submitted}
              className={`${
                submitted ? "opacity-50" : ""
              } bg-[var(--color-accent)] hover:bg-[var(--color-accent-2)] text-white font-semibold px-14 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 glow`}
            >
              {submitted ? "Loading results..." : "Get my type"}
            </button>
          </div>
        )}
        {!finished && (
          <div className="flex justify-center mt-2">
            <button
              type="submit"
              className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text)] font-semibold px-10 py-3 rounded-2xl transition-all"
            >
              Continue
            </button>
          </div>
        )}
      </form>
    </main>
  );
}
