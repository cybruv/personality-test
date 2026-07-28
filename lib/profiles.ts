// Generates rich, type-specific report content from a 4-letter type.
// Each dimension contributes a trait bundle; we compose per-type copy.
// This keeps the codebase small while producing genuinely specific-feeling reports.

interface Block {
  heading: string;
  body: string;
}

interface DimensionProfile {
  // what to say when this letter is dominant in the person
  dominant: {
    strengths: string[];
    growth: string;
    in_work: string;
    in_relationships: string;
    under_stress: string;
  };
}

// ---- Trait bundles per pole ----
const TR: Record<string, DimensionProfile> = {
  E: {
    dominant: {
      strengths: ["High energy in group settings", "Quick to connect with new people", "Comfortable in leadership roles"],
      growth: "Schedule regular solo downtime so your energy actually recharges instead of just being busy.",
      in_work: "You thrive on collaboration, fast feedback loops, and teams where ideas flow out loud.",
      in_relationships: "You light up around people and often act as the social glue in your friend group.",
      under_stress: "You may over-commit socially or fill silence with noise to avoid being alone with your thoughts.",
    },
  },
  I: {
    dominant: {
      strengths: ["Deep focus and self-sufficiency", "Thoughtful before speaking", "Rich inner world"],
      growth: "Don't mistake quiet for conflict — lean in when something matters, even when it feels costly.",
      in_work: "You do your best work independently, with clear goals and minimal unplanned interruption.",
      in_relationships: "A small circle of deep, meaningful connections matters far more to you than popularity.",
      under_stress: "You tend to withdraw and may take longer to signal that you need help or support.",
    },
  },
  S: {
    dominant: {
      strengths: ["Reliable and detail-oriented", "Strong sense of reality", "Excellent follow-through"],
      growth: "Practice sitting with ambiguity once in a while — not everything needs a manual to be worthwhile.",
      in_work: "You excel where precision, consistency, and tangible results matter most.",
      in_relationships: "You show up in concrete, practical ways — acts of service are your love language.",
      under_stress: "You can become fixated on what's going wrong in front of you and miss the broader picture.",
    },
  },
  N: {
    dominant: {
      strengths: ["Creative and imaginative", "Sees patterns others miss", "Enjoys exploring possibilities"],
      growth: "Ground your ideas in at least one real-world action, or they'll forever stay interesting but unfinished.",
      in_work: "You're at your best when you can design, invent, and work toward a vision rather than a routine.",
      in_relationships: "You bond over ideas, meaning, and the future you're building together.",
      under_stress: "You may daydream your way out of the present and leave unfinished things piling up.",
    },
  },
  T: {
    dominant: {
      strengths: ["Clear, logical decision-making", "Fair and consistent", "Calm under pressure"],
      growth: "Sometimes an acknowledgement of feeling — before the analysis — moves a situation further than the analysis alone.",
      in_work: "You make great decisions by weighing evidence and are trusted to cut through emotion to the truth.",
      in_relationships: "You show care through problem-solving; your friends come to you to think things through.",
      under_stress: "You can come across as cold or blunt when you're actually just trying to be helpful.",
    },
  },
  F: {
    dominant: {
      strengths: ["Empathetic and supportive", "Harmony-driven", "Values-conscious"],
      growth: "A firm, kind 'no' is a form of care — your own needs count too.",
      in_work: "You bring team morale and ethical consideration to decisions that others would miss.",
      in_relationships: "You're the person people confide in; you remember details and make them feel seen.",
      under_stress: "You may absorb others' emotions and lose sight of your own boundaries.",
    },
  },
  J: {
    dominant: {
      strengths: ["Organized and decisive", "Reliable on deadlines", "Comfort from closure"],
      growth: "Leave a little room in the schedule for the unexpected — spontaneity isn't always a threat.",
      in_work: "You build systems, set milestones, and keep things on track without being asked.",
      in_relationships: "Planning trips, setting dates, and organizing life together feels good to you.",
      under_stress: "You can become controlling or rigid when uncertainty rises.",
    },
  },
  P: {
    dominant: {
      strengths: ["Flexible and adaptable", "Curious and open-minded", "Thrives on novelty"],
      growth: "Picking a deadline and hitting it once in a while builds trust that your ideas are worth more than they look.",
      in_work: "You excel in open-ended, creative, or crisis-response roles where flexibility beats the plan.",
      in_relationships: "You keep things interesting and are up for almost anything in the moment.",
      under_stress: "You may procrastinate or pivot constantly to avoid making a hard choice.",
    },
  },
};

export function summary(type: string): string {
  const [e, s, t, j] = type.split("");
  const tag = TAGLINES[type] || "The Explorer";
  return (
    `As a ${tag} (${type}), you draw energy ${e === "E" ? "from the world around you" : "from your inner world"}, ` +
    `focus on what is ${s === "S" ? "real, concrete, and present" : "possible, connected, and future-shaped"}, ` +
    `decide with ${t === "T" ? "clear logic" : "personal values"}, and live your days ` +
    `${j === "J" ? "with structure and a plan" : "with flexibility and an open horizon"}.`
  );
}

export function fullProfile(type: string) {
  const [e, s, t, j] = type.split("");
  const letters = [e, s, t, j] as (keyof typeof TR)[];
  const tr = letters.map((l) => TR[l]);

  const sections: Block[] = [
    {
      heading: `Your personality is ${TAGLINES[type] || "The Explorer"}`,
      body: summary(type),
    },
    {
      heading: "Your strengths",
      body: tr.flatMap((d) => d.dominant.strengths).slice(0, 6).join(" · "),
    },
    {
      heading: "How you show up at work",
      body: tr.slice(0, 2).map((d) => d.dominant.in_work).join(" "),
    },
    {
      heading: "How you show up in relationships",
      body: tr.slice(2, 4).map((d) => d.dominant.in_relationships).join(" "),
    },
    {
      heading: "How your type handles stress",
      body: tr.map((d) => d.dominant.under_stress).join(" "),
    },
    {
      heading: "Where to grow",
      body: tr.map((d) => d.dominant.growth).join(" "),
    },
    {
      heading: "Compatible types",
      body: compatible(TYPES, type),
    },
  ];
  return { type, tag: TAGLINES[type] || "The Explorer", sections };
}

export function compatible(all: string[], mine: string): string {
  // Simple compatibility heuristic: share 2-3 letters, mirror on E/I.
  const scored = all
    .map((t) => {
      let score = 0;
      for (let i = 0; i < 4; i++) score += t[i] === mine[i] ? 1 : 0;
      const mirror = t[0] !== mine[0] && (t[2] !== mine[2]);
      if (t === mine) return { t, score: 0 };
      return { t, score: score + (mirror ? 1 : 0) };
    })
    .filter((x) => x.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => TAGLINES[x.t] + " (" + x.t + ")")
    .join(", ");
  return scored || "Everyone is worth getting to know — but the types above share your rhythm most closely.";
}

export const TAGLINES: Record<string, string> = {
  ISTJ: "The Logistician", ISFJ: "The Defender", INFJ: "The Advocate", INTJ: "The Architect",
  ISTP: "The Virtuoso", ISFP: "The Adventurer", INFP: "The Mediator", INTP: "The Thinker",
  ESTP: "The Entrepreneur", ESFP: "The Entertainer", ENFP: "The Campaigner", ENTP: "The Debater",
  ESTJ: "The Executive", ESFJ: "The Consul", ENFJ: "The Protagonist", ENTJ: "The Commander",
};

export const TYPES = Object.keys(TAGLINES);

export function taglineFor(type: string): string {
  return TAGLINES[type] || "The Explorer";
}
