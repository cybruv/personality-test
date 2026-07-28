import Link from "next/link";
import TestApp from "./TestApp";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                name: "WhichPersonality",
                url: "https://whichpersonality.com",
                description:
                  "Free 60-question personality test to discover your 4-letter personality type.",
              },
              {
                "@type": "PersonalityTest",
                name: "WhichPersonality Type Finder",
                url: "https://whichpersonality.com",
                description:
                  "A 3-minute personality inventory of 60 questions across 4 dimensions, producing one of 16 four-letter personality types.",
                numberOfQuestions: 60,
                estimatedDuration: "PT3M",
              },
              {
                "@type": "FAQPage",
                mainEntity: FAQ_ITEMS.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
            ],
          }),
        }}
      />
      <Hero />
      <div className="max-w-5xl mx-auto px-4">
        <TestApp />
      </div>
      <HowItWorks />
      <WhatYoullDiscover />
      <FAQSection />
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <header className="max-w-5xl mx-auto px-4 pt-18 pb-8 text-center slide-in">
      <p className="text-[var(--color-accent)] font-semibold tracking-widest text-sm uppercase">
        Free personality test &middot; deep-dive report available
      </p>
      <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extralight mt-3 leading-[1.05]">
        Discover your{" "}
        <span className="font-semibold italic text-[var(--color-accent)]">
          4-letter type
        </span>
      </h1>
      <p className="text-[var(--color-text-dim)] mt-5 text-lg max-w-2xl mx-auto leading-relaxed">
        A quick, research-informed personality inventory that pinpoints where you sit
        on four key dimensions and turns it into a full profile of how you think,
        decide, work, and connect with the world.
      </p>

      <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
        {[
          { n: "60", l: "short questions" },
          { n: "~3", l: "minutes" },
          { n: "4", l: "dimensions" },
          { n: "16", l: "distinct types" },
        ].map((c) => (
          <div
            key={c.l}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5 shadow-sm"
          >
            <span className="text-2xl sm:text-3xl font-semibold text-[var(--color-accent)]">
              {c.n}
            </span>
            <span className="block text-sm text-[var(--color-text-dim)] mt-1">
              {c.l}
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* 3-step "How it works" section (mirrors the 16Personalities style)  */
/* ------------------------------------------------------------------ */
function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="max-w-5xl mx-auto px-4 py-14"
      aria-labelledby="how-title"
    >
      <h2
        id="how-title"
        className="text-3xl sm:text-4xl font-extralight text-center"
      >
        How it works
      </h2>
      <p className="text-[var(--color-text-dim)] mt-3 text-center max-w-xl mx-auto">
        Three simple steps from your first answer to your full personality profile.
      </p>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            step: "STEP 1",
            title: "Complete the test",
            body: "Answer 60 short, honest questions in about 3 minutes. There are no right or wrong answers.",
          },
          {
            step: "STEP 2",
            title: "View your results",
            body: "We match your answers to one of 16 four-letter personality types and build your profile.",
          },
          {
            step: "STEP 3",
            title: "Explore your type",
            body: "See your strengths, growth areas, how you work, relate, handle stress, and who you click with.",
          },
        ].map((s) => (
          <div
            key={s.step}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-6 shadow-sm slide-in"
          >
            <span className="text-[var(--color-accent)] font-bold text-xs tracking-widest">
              {s.step}
            </span>
            <h3 className="text-xl font-semibold mt-2">{s.title}</h3>
            <p className="text-[var(--color-text-dim)] mt-3 leading-relaxed text-sm">
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* "What you'll discover" section                                     */
/* ------------------------------------------------------------------ */
function WhatYoullDiscover() {
  return (
    <section
      id="what-youll-discover"
      className="max-w-5xl mx-auto px-4 py-10"
      aria-labelledby="discover-title"
    >
      <h2
        id="discover-title"
        className="text-3xl sm:text-4xl font-extralight text-center"
      >
        What you'll discover
      </h2>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {[
          "Your unique 4-letter personality type",
          "Where you sit on the four key dimensions",
          "Your natural strengths &amp; growth areas",
          "How you show up at work &amp; in relationships",
          "How your type handles stress",
          "Which types you're most compatible with",
        ].map((t) => (
          <div
            key={t}
            className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-sm"
          >
            <span className="text-[var(--color-success)] font-bold shrink-0">✓</span>
            <span className="text-[var(--color-text)] text-sm leading-relaxed">{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ — answers the questions Google shows as sitelinks             */
/* ------------------------------------------------------------------ */
const FAQ_ITEMS = [
  {
    q: "Is this the same as the Myers-Briggs MBTI?",
    a: "It draws on the same four-dimensional framework used by the MBTI (Extraversion / Introversion, Sensing / Intuition, Thinking / Feeling, Judging / Perceiving) to produce a familiar 4-letter result. This is a free, independent personality inventory and is not affiliated with the official MBTI assessment.",
  },
  {
    q: "How long does the test take?",
    a: "About 3 minutes. The test has 60 short statements. Read each one, pick how much you agree, and move on. Be as honest as you can for the clearest result.",
  },
  {
    q: "Is the test really free?",
    a: "Yes — taking the test is completely free. Your full profile (the 4-letter type and deep-dive report) is available for £0.99. You can always just take the test and see your dimension breakdown for free.",
  },
  {
    q: "How accurate is it?",
    a: "Results reflect your own self-reported responses, so accuracy depends on how honestly you answer. We include a consistency check to flag unusually mixed answers. Treat the report as a useful self-reflection tool, not a clinical diagnosis.",
  },
  {
    q: "Can I retake the test?",
    a: "Absolutely. Personality is a snapshot of how you see yourself now — retaking the test later can be interesting if you feel your habits or priorities have shifted.",
  },
  {
    q: "How is my data used?",
    a: "Your answers are used only to calculate and show you your own results. We don't sell your responses to third parties. Results are linked to a session ID so you can return and unlock your full report later.",
  },
];

function FAQSection() {
  return (
    <section
      id="faq"
      className="max-w-3xl mx-auto px-4 py-14"
      aria-labelledby="faq-title"
    >
      <h2 id="faq-title" className="text-3xl sm:text-4xl font-extralight text-center">
        Frequently asked questions
      </h2>
      <dl className="mt-8 divide-y divide-[var(--color-border)]">
        {FAQ_ITEMS.map((f, i) => (
          <details
            key={i}
            className="group py-4"
          >
            <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-[var(--color-text)]">
              <span>{f.q}</span>
              <span className="ml-4 shrink-0 text-[var(--color-accent)] text-lg group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="text-[var(--color-text-dim)] mt-3 leading-relaxed text-sm">
              {f.a}
            </p>
          </details>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                             */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="max-w-5xl mx-auto px-4 pb-16 text-center text-sm text-[var(--color-text-dim)]">
      <Link
        href="/#faq"
        className="text-[var(--color-accent)] hover:underline"
      >
        FAQ
      </Link>
      <p className="mt-4 leading-relaxed">
        This is a personality inventory for self-reflection — not a medical,
        psychological, or clinical assessment.
      </p>
      <p className="mt-4 opacity-70">
        Built with care &middot; 60 questions &middot; 16 types
      </p>
    </footer>
  );
}
