// Server-side scoring engine. Import this from the app-route handlers.
//
// Responses are a 1..5 scale (1 = Strongly Disagree, 5 = Strongly Agree).
// For a normal item, agreement adds to the item's declared pole.
// For a reverse item, disagreement adds to the pole (so high agreement subtracts).
//
// Per dimension we sum the raw scores for each of the two poles, then
// normalize to a 0..100 percentage so the two poles add to 100.

import { questions, DIMENSION_META } from "./questions";

interface RawScore {
  // total for this pole (raw, unnormalized)
  [letter: string]: number;
}

const DIM_LETTERS: Record<string, [string, string]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

// Consistency gate: check whether the two halves of each dimension
// (normal vs reverse-worded items) broadly agree. Returns { ok, score } where
// score is 0..1 (higher = more internally consistent).
export function computeConsistency(r: number[]): { ok: boolean; score: number } {
  // Simple approach: per dimension, compare the mean agreement on its "pole-side"
  // items vs the "opposite-side" items. We approximate by checking the variance
  // across all answers isn't implausibly low (straight-lining) and isn't near-random.
  const mean = r.reduce((a, b) => a + b, 0) / r.length;
  const variance = r.reduce((a, v) => a + (v - mean) ** 2, 0) / r.length;
  const stddev = Math.sqrt(variance);

  // Almost all the same answer = likely straight-lining (low variance).
  if (stddev < 0.25) {
    return { ok: false, score: 0.2 };
  }

  // Score maps standard deviation to a consistency number.
  // std ~= 1.1 is roughly a uniform answer; ~1.5+ is a strong real signal.
  const signalScore = Math.min(1, stddev / 1.5);

  // Also check the distribution across the four dimensions isn't dominated
  // by near-tie results (a sign of random answering).
  let tieCount = 0;
  let totalDims = 0;
  for (const [dim, [a, b]] of Object.entries(DIM_LETTERS)) {
    const poleMap = questions.map((q) => ({ q, r: r[questions.indexOf(q)] }));
    const idx = questions.findIndex((_, i) => i === -1); // never - just build by question order
    // Build by question index for speed:
    const totalA = questions.reduce((acc, q, i) => {
      if (q.dimension !== dim) return acc;
      if (q.pole !== a) return acc;
      const contribution = q.reverse ? 6 - r[i] : r[i];
      return acc + contribution;
    }, 0);
    const totalB = questions.reduce((acc, q, i) => {
      if (q.dimension !== dim) return acc;
      if (q.pole !== b) return acc;
      const contribution = q.reverse ? 6 - r[i] : r[i];
      return acc + contribution;
    }, 0);
    totalDims++;
    if (Math.abs(totalA - totalB) < 2) tieCount++;
  }

  const balanceScore = 1 - tieCount / totalDims; // penalty if many near-ties
  const finalScore = 0.7 * signalScore + 0.3 * balanceScore;

  return {
    ok: finalScore >= 0.45,
    score: Math.round(finalScore * 100) / 100,
  };
}

export function score(results: number[]) {
  if (results.length !== questions.length) {
    throw new Error("answer count mismatch");
  }

  const dim: Record<string, RawScore> = { EI: {}, SN: {}, TF: {}, JP: {} };
  for (const d in DIM_LETTERS) {
    for (const l of DIM_LETTERS[d]) dim[d][l] = 0;
  }

  // Sum raw per pole
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const val = q.reverse ? 6 - results[i] : results[i]; // reverse: disagree -> score
    dim[q.dimension][q.pole] += val;
  }

  // Normalize per dimension to percentages (0..100, poles sum to 100)
  const dimensions: Record<string, Record<string, number>> = {};
  const letters: string[] = [];
  for (const [d, [a, b]] of Object.entries(DIM_LETTERS)) {
    const total = dim[d][a] + dim[d][b];
    const pct = (v: number) => Math.round((v / total) * 100);
    dimensions[d] = { [a]: pct(dim[d][a]), [b]: pct(dim[d][b]) };
    letters.push(dim[d][a] >= dim[d][b] ? a : b);
  }

  const type = letters.join("");
  const consistency = computeConsistency(results);

  // Per-question contribution (premium content)
  const perQuestion = questions.map((q, i) => ({
    index: i,
    text: q.text,
    dimension: q.dimension,
    pole: q.pole,
    answer: results[i],
    contribution: q.reverse ? 6 - results[i] : results[i],
  }));

  return { type, dimensions, consistency, perQuestion };
}

