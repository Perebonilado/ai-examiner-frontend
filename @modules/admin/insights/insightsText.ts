import { Mood } from "@/models/insights.model";
import { Tone } from "../activityTypes";

/** Plain words for Claude's label values. */

export const MOODS: Record<Mood, { label: string; tone: Tone; color: string }> = {
  satisfied: { label: "Satisfied", tone: "green", color: "var(--mood-satisfied)" },
  neutral: { label: "Neutral", tone: "grey", color: "var(--mood-neutral)" },
  frustrated: { label: "Frustrated", tone: "coral", color: "var(--mood-frustrated)" },
  unclear: { label: "Unclear", tone: "amber", color: "var(--mood-unclear)" },
};
export const MOOD_ORDER: Mood[] = ["satisfied", "neutral", "frustrated", "unclear"];

export const CHAT_ISSUES: Record<string, string> = {
  wrong_or_made_up: "Wrong or made-up answer",
  contradicted_document: "Contradicted the document",
  ignored_document: "Didn’t use the document",
  too_long: "Answer too long",
  too_short_or_vague: "Too short or vague",
  misunderstood_question: "Misunderstood the question",
  had_to_repeat: "Had to ask again",
  formatting: "Formatting problems",
  app_error_or_slow: "App error or slow",
  language: "Language problem",
};

export const TEST_ISSUES: Record<string, string> = {
  too_hard: "Too hard",
  too_easy: "Too easy",
  poor_question_quality: "Poorly written questions",
  answer_key_looks_wrong: "Answer key looks wrong",
  repetitive: "Repeated questions",
  too_long: "Test too long",
};

export const issueLabel = (key: string) => CHAT_ISSUES[key] ?? TEST_ISSUES[key] ?? key.replace(/_/g, " ");

export const INTENTS: Record<string, string> = {
  explain_concept: "Explain a concept",
  summarise: "Summarise",
  quiz_me: "Quiz me",
  find_in_document: "Find something in the document",
  exam_prep: "Exam preparation",
  clarify_previous_answer: "Clarify an answer",
  translate_or_simplify: "Translate or simplify",
  off_topic: "Off-topic",
  other: "Something else",
};

export const OUTCOMES: Record<string, string> = {
  resolved: "Got what they wanted",
  partly: "Partly helped",
  unresolved: "Didn’t get it",
  abandoned: "Gave up",
  completed: "Finished",
};

export const STOP_REASONS: Record<string, string> = {
  too_hard: "Too hard",
  poor_questions: "Poor questions",
  lost_interest: "Lost interest",
  ran_out_of_time: "Ran out of time",
  unknown: "Reason unclear",
};

export const FIELDS: Record<string, string> = {
  medicine_and_surgery: "Medicine & surgery",
  basic_medical_sciences: "Basic medical sciences",
  pharmacy: "Pharmacy",
  nursing: "Nursing",
  dentistry: "Dentistry",
  other_health_sciences: "Other health sciences",
  law: "Law",
  engineering: "Engineering",
  computing: "Computing",
  business_and_economics: "Business & economics",
  sciences: "Sciences",
  arts_and_humanities: "Arts & humanities",
  social_sciences: "Social sciences",
  education: "Education",
  other: "Other",
};

export const DOC_KINDS: Record<string, string> = {
  lecture_slides: "Lecture slides",
  lecture_notes: "Lecture notes",
  textbook_chapter: "Textbook chapter",
  past_questions: "Past questions",
  research_or_article: "Research or article",
  assignment_or_handout: "Assignment or handout",
  personal_notes: "Personal notes",
  other: "Other",
};

export const LEVELS: Record<string, string> = {
  secondary_or_entrance_exam: "Secondary / entrance exam",
  early_university: "Early university",
  later_university: "Later university",
  postgraduate_or_professional: "Postgraduate / professional",
  unknown: "Level unclear",
};

export const QUALITY: Record<string, string> = {
  clear: "Read clearly",
  partial: "Partly readable",
  unreadable: "Couldn’t be read",
};

/** "+42" style share of satisfied minus frustrated, out of everything labelled. */
export const netMood = (m: Partial<Record<Mood, number>>) => {
  const total = (m.satisfied ?? 0) + (m.neutral ?? 0) + (m.frustrated ?? 0) + (m.unclear ?? 0);
  if (!total) return null;
  return Math.round((((m.satisfied ?? 0) - (m.frustrated ?? 0)) / total) * 100);
};

export const share = (n: number, of: number) => (of ? Math.round((n / of) * 1000) / 10 : 0);
