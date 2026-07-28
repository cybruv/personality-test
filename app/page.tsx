import TestApp from "./TestApp";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="max-w-5xl mx-auto px-4">
        <TestApp />
      </div>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-4 pt-20 pb-6 text-center slide-in">
      <p className="text-[var(--color-accent)] font-semibold tracking-widest text-sm uppercase">
        Find your type &middot; deep-dive report available
      </p>
      <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extralight mt-3 leading-[1.05]">
        Know yourself a little <span className="font-semibold italic">better.</span>
      </h1>
      <p className="text-[var(--color-text-dim)] mt-5 text-lg max-w-2xl mx-auto">
        A 3-minute personality inventory that pinpoints your 4-letter type and the
        patterns behind how you think, decide, and connect with the world.
      </p>

      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
        {[
          { n: "60", l: "short questions" },
          { n: "~3", l: "minutes" },
          { n: "4", l: "dimensions" },
          { n: "16", l: "distinct types" },
        ].map((c) => (
          <div
            key={c.l}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5"
          >
            <span className="text-2xl sm:text-3xl font-semibold text-[var(--color-accent)]">
              {c.n}
            </span>
            <span className="block text-sm text-[var(--color-text-dim)] mt-1">{c.l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="max-w-5xl mx-auto px-4 pb-14 text-center text-sm text-[var(--color-text-dim)]">
      <p>
        This is a personality inventory for self-reflection — not a medical,
        psychological, or clinical assessment.
      </p>
      <p className="mt-4 opacity-60">Built with care · 16 types</p>
    </footer>
  );
}
