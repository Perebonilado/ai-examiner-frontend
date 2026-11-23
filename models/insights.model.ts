/**
 * The feedback loop in the admin: Claude's labels on chats, tests and documents, the raw items,
 * the themes report, labelling coverage, follow-ups and Ask Claude.
 */

export type Mood = "satisfied" | "neutral" | "frustrated" | "unclear";
export type LabelKind = "chat" | "test" | "document";

export interface AiLabel {
  id: string;
  status: "pending" | "done" | "skipped" | "failed";
  /** The admin's correction when there is one, else Claude's. */
  mood: Mood | null;
  originalMood: Mood | null;
  corrected: boolean;
  markedWrong: boolean;
  confidence: "low" | "medium" | "high" | null;
  intent: string | null;
  outcome: string | null;
  issues: string[];
  summary: string | null;
  quote: string | null;
  fixIdea: string | null;
  details: {
    // Tests
    testId?: string;
    testType?: string;
    status?: "finished" | "stopped";
    score?: number | null;
    answered?: number;
    total?: number;
    right?: number;
    stopReason?: string;
    struggles?: string[];
    strengths?: string[];
    // Documents
    field?: string;
    subject?: string;
    kind?: string;
    level?: string;
    language?: string;
    quality?: string;
    topics?: number;
    messages?: number;
  };
  labelledOn: string | null;
}

export interface StudentRef {
  userId: string | null;
  name: string;
  initials: string;
  email: string | null;
}

export interface Paged<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

/* ---------- Conversations ---------- */

export interface ConversationItem {
  key: string;
  student: StudentRef;
  documentId: string;
  documentTitle: string;
  startedOn: string;
  endedOn: string;
  messages: number;
  questions: number;
  preview: string;
  label: AiLabel | null;
}

export interface ConversationList extends Paged<ConversationItem> {
  range: { from: string; to: string };
  counts: Record<Mood | "all" | "unlabelled", number>;
}

export interface ConversationDetail {
  key: string;
  student: StudentRef;
  documentId: string;
  documentTitle: string;
  startedOn: string;
  endedOn: string;
  daysChatted: number;
  messages: {
    id: string;
    from: "student" | "assistant";
    text: string;
    cut: boolean;
    image: string | null;
    at: string;
    rating: { value: number; comment: string | null } | null;
  }[];
  label: AiLabel | null;
}

export interface Translation {
  /** The language it was written in, as Claude named it ("Hindi"). */
  language: string;
  text: string;
}

export interface ConversationTranslation {
  /** Message id → its English, for messages that weren't in English. */
  messages: Record<string, Translation>;
  /** Claude's quote of the student, in English, when it wasn't. */
  quote: Translation | null;
  /** The languages found besides English. */
  languages: string[];
}

export interface ConversationQuery {
  from: string;
  to: string;
  mood?: string;
  issue?: string;
  search?: string;
  userId?: string;
  documentId?: string;
  page?: number;
  pageSize?: number;
}

/* ---------- Tests ---------- */

export interface TestsSummary {
  range: { from: string; to: string };
  byType: { type: string; typeId: number; made: number; started: number; finished: number }[];
  attempts: { finished: number; stopped: number };
  /** Unfinished attempts by how far they got: 0–10%, 10–20% … 90–100%. */
  stops: number[];
  moods: Partial<Record<Mood, number>>;
  issues: { key: string; count: number }[];
  stopReasons: { key: string; count: number }[];
  struggles: { key: string; count: number }[];
  labelled: number;
  flagged: {
    testId: string;
    question: string;
    number: number;
    topic: string;
    student: StudentRef;
    documentTitle: string;
    at: string;
  }[];
}

export interface TestAttemptItem {
  key: string;
  testId: string;
  type: string;
  student: StudentRef;
  documentId: string;
  documentTitle: string;
  status: "finished" | "stopped";
  answered: number;
  total: number;
  score: number | null;
  at: string;
  label: AiLabel | null;
}

export interface TestAttemptDetail {
  key: string;
  testId: string;
  type: string;
  difficulty: string | null;
  student: StudentRef;
  documentId: string;
  documentTitle: string;
  madeOn: string;
  lastAnswerOn: string;
  status: "finished" | "stopped";
  scores: { score: number; at: string }[];
  rating: { value: number; comment: string | null } | null;
  questions: {
    number: number;
    question: string;
    topic: string;
    answered: boolean;
    chosen: string | null;
    correct: string | null;
    right: boolean | null;
    flagged: boolean;
    explanation: string | null;
  }[];
  label: AiLabel | null;
}

export interface TestQuery {
  from: string;
  to: string;
  type?: string;
  status?: string;
  mood?: string;
  search?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
}

/* ---------- Documents ---------- */

export interface DocumentUsage {
  tests: number;
  chats: number;
  readingSeconds: number;
  topics: number;
  hasSummary: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  fileType: string | null;
  owner: StudentRef;
  uploadedOn: string;
  deleted: boolean;
  usage: DocumentUsage;
  label: AiLabel | null;
}

export interface DocumentList extends Paged<DocumentItem> {
  range: { from: string; to: string };
  facets: {
    fields: { key: string; count: number }[];
    kinds: { key: string; count: number }[];
    fileTypes: { key: string; count: number }[];
  };
}

export interface DocumentDetail {
  id: string;
  title: string;
  owner: StudentRef;
  uploadedOn: string;
  deleted: boolean;
  file: { previewUrl: string; thumbnailUrl: string; openUrl: string; format: string } | null;
  topics: { title: string; description: string; pages: string | null }[];
  summary: string | null;
  label: AiLabel | null;
  usage: DocumentUsage;
  tests: { testId: string; attempt: string | null; type: string; madeOn: string; questions: number; best: number | null }[];
  chat: { questions: number; days: number };
  easyRead: {
    seconds: number;
    readers: number;
    sessions: number;
    lastReadAt: string | null;
    pagesSimplified: number;
    pages: number;
  };
}

export interface DocumentQuery {
  from: string;
  to: string;
  search?: string;
  field?: string;
  kind?: string;
  fileType?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
}

/* ---------- Insights ---------- */

export interface MoodWeek {
  start: string;
  satisfied: number;
  neutral: number;
  frustrated: number;
  unclear: number;
}

export interface FeatureInsight {
  labelled: number;
  moods: Record<Mood, number>;
  weeks: MoodWeek[];
  issues: { key: string; count: number }[];
  intents: { key: string; count: number }[];
  outcomes: { key: string; count: number }[];
}

export interface InsightsOverview {
  range: { from: string; to: string; days: number };
  chat: FeatureInsight;
  test: FeatureInsight;
  documents: {
    labelled: number;
    fields: { key: string; count: number }[];
    kinds: { key: string; count: number }[];
    levels: { key: string; count: number }[];
    quality: { key: string; count: number }[];
    subjects: { key: string; count: number }[];
  };
  feedback: Record<"chat" | "test" | "easyRead", { up: number; down: number }>;
  accuracy: { reviewed: number; wrong: number };
  pending: number;
}

export interface LabelListItem {
  kind: LabelKind;
  key: string;
  occurredOn: string;
  student: StudentRef;
  documentId: string | null;
  documentTitle: string | null;
  label: AiLabel;
}

export interface CoverageCell {
  total: number;
  done: number;
  pending: number;
  failed: number;
}

export interface Coverage {
  generatedAt: string;
  costPerItem: Record<LabelKind, number>;
  spent: number;
  months: ({ month: string } & Record<LabelKind, CoverageCell>)[];
}

export interface LabelBatch {
  id: string;
  purpose: "labels" | "drafts";
  status: "submitted" | "importing" | "imported" | "failed";
  items: number;
  done: number;
  failed: number;
  note: string | null;
  submittedOn: string;
  endedOn: string | null;
  cost: number;
}

export interface Digest {
  id: string;
  from: string;
  to: string;
  labelCount: number;
  createdOn: string;
  stale: boolean;
  headline: string;
  sections: { kind: LabelKind; themes: { title: string; count: number; quote: string; fix: string }[] }[];
  brightSpots: string[];
}

export interface DigestResponse {
  range: { from: string; to: string };
  running: boolean;
  digest: Digest | null;
}

export interface AdminViewEntry {
  admin: string;
  kind: "conversation" | "test" | "document";
  key: string;
  student: StudentRef;
  at: string;
}

/* ---------- Follow-ups ---------- */

export type FollowUpStatus = "drafting" | "suggested" | "sent" | "snoozed" | "dismissed" | "failed";

export interface FollowUp {
  id: string;
  rule: string;
  ruleTitle: string;
  status: FollowUpStatus;
  reason: string | null;
  evidence: Record<string, any>;
  student: { id: string; name: string; initials: string; email: string | null };
  subject: string | null;
  headline: string | null;
  body: string | null;
  buttonLabel: string | null;
  buttonUrl: string | null;
  auto: boolean;
  createdOn: string;
  sentOn: string | null;
  sentBy: string | null;
  returnedOn: string | null;
  /** When the student clicked the email's button, if they did. */
  clickedOn?: string | null;
  snoozedUntil: string | null;
  error: string | null;
}

export interface FollowUpRule {
  key: string;
  title: string;
  when: string;
  aim: string;
  enabled: boolean;
  autoSend: boolean;
  sent?: number;
  returned?: number;
  clicked?: number;
}

export interface FollowUpList {
  counts: { suggested: number; drafting: number; sent: number; snoozed: number; dismissed: number };
  busy: boolean;
  dailyLimit: number;
  sentToday: number;
  rules: FollowUpRule[];
  items: FollowUp[];
}

/* ---------- Ask Claude ---------- */

export type AskCard = { kind: "email"; followUp: FollowUp; unsubscribed?: boolean };

export type AskEvent =
  | { type: "step"; label: string }
  | { type: "card"; card: AskCard }
  | { type: "text"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

/* ---------- Product ideas ---------- */

export type IdeaStatus = "new" | "planned" | "done" | "dismissed";

export interface Idea {
  id: string;
  title: string;
  area: string;
  problem: string;
  proposal: string;
  firstStep: string;
  impact: "high" | "medium" | "low";
  effort: "small" | "medium" | "large";
  studentsAffected: number;
  evidence: string[];
  examples: { kind: "chat" | "test"; key: string; quote: string; summary: string }[];
  status: IdeaStatus;
  note: string | null;
  statusBy: string | null;
  createdOn: string;
  updatedOn: string;
}

export interface IdeaList {
  running: boolean;
  error: string | null;
  generatedOn: string | null;
  counts: Record<IdeaStatus, number>;
  items: Idea[];
}

/* ---------- Live tracking from the app ---------- */

export interface WaitStat {
  count: number;
  p50: number | null;
  p90: number | null;
}

export interface BehaviourReport {
  range: { from: string; to: string };
  since: string | null;
  totals: { sessions: number; students: number; visitors: number; events: number };
  steps: { key: string; label: string; count: number }[];
  waits: { upload: WaitStat; testGeneration: WaitStat; chatFirstWords: WaitStat; chatWholeReply: WaitStat };
  failures: Record<
    | "uploads"
    | "testGeneration"
    | "chat"
    | "chatStopped"
    | "upgradeShown"
    | "checkoutStarted"
    | "checkoutFinished"
    | "checkoutNotConfirmed"
    | "blankEssays",
    { count: number; people: number }
  > & { testsLeft: { count: number; people: number; averageShareAnswered: number | null } };
  /** Students per test type who opened, finished or left part-way (and blank essays). */
  tests: { type: string; opened: number; finished: number; left: number; blank: number }[];
  accounts: { signUps: { method: string; count: number }[]; signIns: number };
  activity: Record<"chatQuestions" | "chatRetries" | "easyReadOpens" | "testsRequested", { count: number; people: number }>;
  upgradePrompts: { prompt: string; count: number; people: number }[];
  limits: { which: string; count: number; people: number }[];
  apiErrors: { endpoint: string; status: string; count: number }[];
  jsErrors: { message: string; count: number }[];
  exitPages: { path: string; sessions: number }[];
  topPages: { path: string; views: number; people: number; medianMs: number | null }[];
}

export interface TimelineEvent {
  name: string;
  path: string | null;
  ms: number | null;
  props: Record<string, string | number | boolean> | null;
  at: string;
}

export interface TimelineSession {
  sessionId: string;
  start: string;
  end: string;
  events: TimelineEvent[];
}
