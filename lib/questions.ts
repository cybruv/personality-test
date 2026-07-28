// 60-question personality inventory.
// Four dimensions (E/I, S/N, T/F, J/P), 15 items each.
//
// Each item has:
//   text         - the statement shown to the user
//   dimension    - one of "EI" | "SN" | "TF" | "JP"
//   pole         - which letter the item measures toward ("E","I","S","N","T","F","J","P")
//   reverse      - whether the statement is reverse-worded (disagreement = score toward the pole)
//   consistencyWith - optional index of another item it should track with (used for the consistency gate)
//
// Response scale (what /api/score receives): 1=Strongly Disagree ... 5=Strongly Agree
// Scoring: agreement adds to the item's pole (raw); reverse items subtract (so disagreement scores toward pole).
// See /api/score route for the normalization math.

export interface Question {
  text: string;
  dimension: "EI" | "SN" | "TF" | "JP";
  pole: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
  reverse: boolean;
}

export const questions: Question[] = [
  // ---- E vs I (Extraversion / Introversion) ----
  { text: "I feel energized after spending time with a big group of people.", dimension: "EI", pole: "E", reverse: false },
  { text: "I would rather work on a project alone than in a team.", dimension: "EI", pole: "I", reverse: false },
  { text: "I enjoy being the center of attention.", dimension: "EI", pole: "E", reverse: false },
  { text: "I find it draining to be around people for long stretches of time.", dimension: "EI", pole: "I", reverse: false },
  { text: "I have a wide circle of acquaintances, not just a few close friends.", dimension: "EI", pole: "E", reverse: false },
  { text: "I prefer a quiet evening at home to a lively social gathering.", dimension: "EI", pole: "I", reverse: false },
  { text: "I start conversations easily with strangers.", dimension: "EI", pole: "E", reverse: false },
  { text: "I think of myself as fairly reserved.", dimension: "EI", pole: "I", reverse: false },
  { text: "I often take on leadership roles in group settings.", dimension: "EI", pole: "E", reverse: false },
  { text: "I recharge best when I get some time to myself.", dimension: "EI", pole: "I", reverse: false },
  { text: "I prefer to communicate by talking rather than by writing.", dimension: "EI", pole: "E", reverse: false },
  { text: "I find large crowds tiring rather than exciting.", dimension: "EI", pole: "I", reverse: false },
  { text: "I tend to work with many people at the same time and bounce ideas around out loud.", dimension: "EI", pole: "E", reverse: false },
  { text: "I am more comfortable listening than I am speaking up.", dimension: "EI", pole: "I", reverse: false },
  { text: "I feel most myself when I am busy with other people.", dimension: "EI", pole: "E", reverse: false },

  // ---- S vs N (Sensing / Intuition) ----
  { text: "I pay close attention to details and facts.", dimension: "SN", pole: "S", reverse: false },
  { text: "I often think about the bigger picture and possibilities rather than concrete details.", dimension: "SN", pole: "N", reverse: false },
  { text: "I prefer step-by-step instructions over a general overview.", dimension: "SN", pole: "S", reverse: false },
  { text: "I enjoy thinking about abstract ideas and theories.", dimension: "SN", pole: "N", reverse: false },
  { text: "I am more interested in what is real than in what is possible.", dimension: "SN", pole: "S", reverse: false },
  { text: "I frequently make connections between things that others do not notice.", dimension: "SN", pole: "N", reverse: false },
  { text: "I trust experience and proven methods.", dimension: "SN", pole: "S", reverse: false },
  { text: "I like to come up with new and creative ways to do things.", dimension: "SN", pole: "N", reverse: false },
  { text: "I focus on what is happening right now.", dimension: "SN", pole: "S", reverse: false },
  { text: "I often imagine how things could be different in the future.", dimension: "SN", pole: "N", reverse: false },
  { text: "I am practical and down-to-earth.", dimension: "SN", pole: "S", reverse: false },
  { text: "I get excited by novel ideas even if they are hard to put into practice.", dimension: "SN", pole: "N", reverse: false },
  { text: "I describe things in literal, precise terms.", dimension: "SN", pole: "S", reverse: false },
  { text: "I am drawn to symbolism, meaning, and patterns.", dimension: "SN", pole: "N", reverse: false },
  { text: "I prefer clear, concrete evidence over a hunch.", dimension: "SN", pole: "S", reverse: false },

  // ---- T vs F (Thinking / Feeling) ----
  { text: "When making decisions, I rely more on logic than on how I feel.", dimension: "TF", pole: "T", reverse: false },
  { text: "I try to understand and value other people's feelings.", dimension: "TF", pole: "F", reverse: false },
  { text: "I would give someone honest criticism even if it hurts their feelings.", dimension: "TF", pole: "T", reverse: false },
  { text: "I often put other people's well-being before my own objectives.", dimension: "TF", pole: "F", reverse: false },
  { text: "I prefer a fair outcome over a comfortable one.", dimension: "TF", pole: "T", reverse: false },
  { text: "I find it easy to imagine what it would be like to be someone else.", dimension: "TF", pole: "F", reverse: false },
  { text: "I analyze situations before I react to them.", dimension: "TF", pole: "T", reverse: false },
  { text: "I make decisions based on what is right for the people involved.", dimension: "TF", pole: "F", reverse: false },
  { text: "I value truth more than tact.", dimension: "TF", pole: "T", reverse: false },
  { text: "I try to keep harmony in the groups I belong to.", dimension: "TF", pole: "F", reverse: false },
  { text: "I am more convinced by a good argument than by an emotional appeal.", dimension: "TF", pole: "T", reverse: false },
  { text: "I prefer to be liked over being respected.", dimension: "TF", pole: "F", reverse: false },
  { text: "I separate my feelings from my decisions.", dimension: "TF", pole: "T", reverse: false },
  { text: "I am sensitive to the emotional climate in a room.", dimension: "TF", pole: "F", reverse: false },
  { text: "I make judgments by applying consistent standards.", dimension: "TF", pole: "T", reverse: false },

  // ---- J vs P (Judging / Perceiving) ----
  { text: "I like to plan things in advance.", dimension: "JP", pole: "J", reverse: false },
  { text: "I am comfortable with last-minute changes to plans.", dimension: "JP", pole: "P", reverse: false },
  { text: "I prefer a structured and organized way of doing things.", dimension: "JP", pole: "J", reverse: false },
  { text: "I enjoy keeping my options open as long as possible.", dimension: "JP", pole: "P", reverse: false },
  { text: "I feel good when I have checked items off my to-do list.", dimension: "JP", pole: "J", reverse: false },
  { text: "I often start new projects before finishing the old ones.", dimension: "JP", pole: "P", reverse: false },
  { text: "I like to know the rules and expectations clearly.", dimension: "JP", pole: "J", reverse: false },
  { text: "I adapt easily as new information comes in.", dimension: "JP", pole: "P", reverse: false },
  { text: "I prefer to make decisions quickly and move on.", dimension: "JP", pole: "J", reverse: false },
  { text: "I like to let projects develop spontaneously.", dimension: "JP", pole: "P", reverse: false },
  { text: "I keep my workspace tidy and ordered.", dimension: "JP", pole: "J", reverse: false },
  { text: "I find strict schedules limiting.", dimension: "JP", pole: "P", reverse: false },
  { text: "I like to have things settled and decided.", dimension: "JP", pole: "J", reverse: false },
  { text: "I enjoy exploring as many paths as possible before committing.", dimension: "JP", pole: "P", reverse: false },
  { text: "I feel anxious when plans are unclear.", dimension: "JP", pole: "J", reverse: false },
];

export const DIMENSION_META: Record<
  "EI" | "SN" | "TF" | "JP",
  { label: string; short: string; poles: [string, string] }
> = {
  EI: { label: "Energy", short: "E / I", poles: ["Extraverted", "Introverted"] },
  SN: { label: "Focus", short: "S / N", poles: ["Sensing", "Intuitive"] },
  TF: { label: "Decisions", short: "T / F", poles: ["Thinking", "Feeling"] },
  JP: { label: "Lifestyle", short: "J / P", poles: ["Judging", "Perceiving"] },
};

// Letter -> color and short name (used in the type card)
export const TYPE_COLORS: Record<string, string> = {
  I: "#9D75FF",
  N: "#9D75FF",
  E: "#A2E24B",
  S: "#A2E24B",
  T: "#FFCD6B",
  F: "#FFB23E",
  J: "#5FA8D3",
  P: "#5FA8D3",
};
// Fallback tagline computed from a small built-in map below.
export const TAGLINES: Record<string, string> = {
  ISTJ: "The Logistician", ISFJ: "The Defender", INFJ: "The Advocate", INTJ: "The Architect",
  ISTP: "The Virtuoso", ISFP: "The Adventurer", INFP: "The Mediator", INTP: "The Thinker",
  ESTP: "The Entrepreneur", ESFP: "The Entertainer", ENFP: "The Campaigner", ENTP: "The Debater",
  ESTJ: "The Executive", ESFJ: "The Consul", ENFJ: "The Protagonist", ENTJ: "The Commander",
};
