import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { API_BASE_URL, accessToken } from "../constants";
import {
  baseQueryWithLogoutOnTokenExpiration,
  secondsToMilliSeconds,
} from "@/utils";
import {
  AdminActivityQuery,
  AdminActivityResponse,
  AdminActivitySummary,
  AdminAnalytics,
  AdminLive,
  AdminMe,
  AdminTeam,
  AdminUserDetail,
  AdminUsersQuery,
  AdminUsersResponse,
  Audience,
  AudienceOption,
  Campaign,
  CampaignEstimate,
  CampaignPreview,
  CampaignPreviewPayload,
  CampaignReport,
  CampaignsResponse,
  CampaignStatus,
  CampaignTemplate,
  EmailPreferences,
  HeartbeatPayload,
  TemplateKey,
  UnsubscribeReason,
  Granularity,
  UpdateCampaignPayload,
} from "@/models/admin.model";
import {
  AdminViewEntry,
  AiLabel,
  ConversationDetail,
  ConversationTranslation,
  Idea,
  IdeaList,
  BehaviourReport,
  TimelineSession,
  ConversationList,
  ConversationQuery,
  Coverage,
  DigestResponse,
  DocumentDetail,
  DocumentList,
  DocumentQuery,
  FollowUp,
  FollowUpList,
  FollowUpRule,
  InsightsOverview,
  LabelBatch,
  LabelKind,
  LabelListItem,
  Paged,
  TestAttemptDetail,
  TestAttemptItem,
  TestQuery,
  TestsSummary,
} from "@/models/insights.model";

const authHeaders = (headers: Headers) => {
  const token = Cookies.get(accessToken);
  if (token) headers.set("authorization", `Bearer ${token}`);
  return headers;
};

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: secondsToMilliSeconds(30),
  prepareHeaders: authHeaders,
});

/** Lists and pages show their own loading state: no full-screen loader, but errors still toast. */
const inline = { triggerLoading: false } as const;
/** Background work (polling, autosave, live preview, heartbeat): no loader and no toast. */
const background = { triggerLoading: false, silentErrors: true } as const;

/** Drops empty values so the query string only carries what is set. */
const params = (values: Record<string, string | number | undefined | null>) =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

const usersParams = (q: AdminUsersQuery) =>
  params({
    search: q.search,
    segment: q.segment === "all" ? undefined : q.segment,
    plan: q.plan,
    joinedFrom: q.joinedFrom,
    joinedTo: q.joinedTo,
    sort: q.sort,
    dir: q.dir,
    page: q.page,
    pageSize: q.pageSize,
  });

const activityParams = (q: Partial<AdminActivityQuery>) =>
  params({
    from: q.from,
    to: q.to,
    types: q.types?.length ? q.types.join(",") : undefined,
    search: q.search,
    userId: q.userId,
    page: q.page,
    pageSize: q.pageSize,
    sort: q.sort === "oldest" ? "oldest" : undefined,
  });

/** Admin dashboard, activity heartbeat and marketing campaigns (redesign/admin/API.md). */
export const AdminService = createApi({
  reducerPath: "admin",
  baseQuery: baseQueryWithLogoutOnTokenExpiration(baseQuery),
  tagTypes: [
    "insights",
    "coverage",
    "followups",
    "ideas",
    "me", "team", "overview", "users", "user", "activity", "campaigns", "campaign", "audiences", "report"],
  endpoints: (build) => ({
    /* ----- Anyone signed in ----- */

    /** Shows the Admin link and guards /admin pages. Kept for the session. */
    getAdminMe: build.query<AdminMe, void>({
      query: () => ({ url: "/admin/me" }),
      providesTags: ["me"],
      keepUnusedDataFor: 60 * 30,
      extraOptions: background,
    }),
    sendHeartbeat: build.mutation<void, HeartbeatPayload>({
      query: (body) => ({ url: "/activity/heartbeat", method: "POST", body }),
      extraOptions: background,
    }),

    /* ----- Dashboard ----- */

    /** Everything on the overview for one date range. Holds the last answer while a new one loads. */
    getAdminAnalytics: build.query<AdminAnalytics, { from: string; to: string; granularity?: Granularity }>({
      query: ({ from, to, granularity }) => ({ url: "/admin/analytics", params: params({ from, to, granularity }) }),
      providesTags: ["overview"],
      keepUnusedDataFor: 120,
      extraOptions: inline,
    }),
    /** Polled: who is online, today so far, the latest actions. A failed refresh keeps the last. */
    getAdminLive: build.query<AdminLive, void>({
      query: () => ({ url: "/admin/live" }),
      providesTags: ["overview"],
      extraOptions: background,
    }),
    getAdminUsers: build.query<AdminUsersResponse, AdminUsersQuery>({
      query: (q) => ({ url: "/admin/users", params: usersParams(q) }),
      providesTags: ["users"],
      extraOptions: inline,
    }),
    getAdminUser: build.query<AdminUserDetail, string>({
      query: (id) => ({ url: `/admin/users/${encodeURIComponent(id)}` }),
      providesTags: (_r, _e, id) => [{ type: "user", id }],
      extraOptions: inline,
    }),
    getAdminActivity: build.query<AdminActivityResponse, AdminActivityQuery>({
      query: (q) => ({ url: "/admin/activity", params: activityParams(q) }),
      providesTags: ["activity"],
      extraOptions: inline,
    }),
    getAdminActivitySummary: build.query<AdminActivitySummary, AdminActivityQuery>({
      query: (q) => ({
        url: "/admin/activity/summary",
        params: activityParams({ ...q, types: undefined, page: undefined, pageSize: undefined, sort: undefined }),
      }),
      providesTags: ["activity"],
      extraOptions: inline,
    }),

    /* ----- Students' chats, tests and documents ----- */

    getConversations: build.query<ConversationList, ConversationQuery>({
      query: (q) => ({ url: "/admin/conversations", params: params({ ...q }) }),
      providesTags: ["insights"],
      extraOptions: inline,
    }),
    getConversation: build.query<ConversationDetail, string>({
      query: (key) => ({ url: `/admin/conversations/${encodeURIComponent(key)}` }),
      providesTags: ["insights"],
      extraOptions: inline,
    }),
    getBehaviour: build.query<BehaviourReport, { from: string; to: string }>({
      query: (q) => ({ url: "/admin/behaviour", params: params({ ...q }) }),
      providesTags: ["insights"],
      extraOptions: inline,
    }),
    getStudentTimeline: build.query<TimelineSession[], string>({
      query: (id) => ({ url: `/admin/users/${encodeURIComponent(id)}/timeline` }),
      extraOptions: inline,
    }),
    getIdeas: build.query<IdeaList, { status?: string }>({
      query: ({ status }) => ({ url: "/admin/ideas", params: params({ status }) }),
      providesTags: ["ideas"],
      extraOptions: inline,
    }),
    generateIdeas: build.mutation<IdeaList, void>({
      query: () => ({ url: "/admin/ideas/generate", method: "POST" }),
      invalidatesTags: ["ideas"],
      extraOptions: inline,
    }),
    updateIdea: build.mutation<Idea, { id: string; status?: string; note?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/ideas/${encodeURIComponent(id)}`, method: "PATCH", body }),
      invalidatesTags: ["ideas"],
      extraOptions: inline,
    }),
    translateConversation: build.mutation<ConversationTranslation, string>({
      // A long conversation takes Claude a minute or two.
      query: (key) => ({ url: `/admin/conversations/${encodeURIComponent(key)}/translate`, method: "POST", timeout: 300_000 }),
      extraOptions: inline,
    }),
    getTestsSummary: build.query<TestsSummary, { from: string; to: string }>({
      query: (q) => ({ url: "/admin/tests/summary", params: params({ ...q }) }),
      providesTags: ["insights"],
      extraOptions: inline,
    }),
    getTests: build.query<Paged<TestAttemptItem> & { range: { from: string; to: string } }, TestQuery>({
      query: (q) => ({ url: "/admin/tests", params: params({ ...q }) }),
      providesTags: ["insights"],
      extraOptions: inline,
    }),
    getTestAttempt: build.query<TestAttemptDetail, string>({
      query: (key) => ({ url: `/admin/tests/${encodeURIComponent(key)}` }),
      providesTags: ["insights"],
      extraOptions: inline,
    }),
    getDocuments: build.query<DocumentList, DocumentQuery>({
      query: (q) => ({ url: "/admin/documents", params: params({ ...q }) }),
      providesTags: ["insights"],
      extraOptions: inline,
    }),
    getDocument: build.query<DocumentDetail, string>({
      query: (id) => ({ url: `/admin/documents/${encodeURIComponent(id)}` }),
      providesTags: ["insights"],
      extraOptions: inline,
    }),

    /* ----- Insights ----- */

    getInsightsOverview: build.query<InsightsOverview, { from: string; to: string }>({
      query: (q) => ({ url: "/admin/insights/overview", params: params({ ...q }) }),
      providesTags: ["insights"],
      extraOptions: inline,
    }),
    getLabels: build.query<
      Paged<LabelListItem>,
      { kind?: LabelKind; mood?: string; issue?: string; field?: string; from: string; to: string; userId?: string; page?: number; pageSize?: number }
    >({
      query: (q) => ({ url: "/admin/insights/labels", params: params({ ...q }) }),
      providesTags: ["insights"],
      extraOptions: inline,
    }),
    correctLabel: build.mutation<AiLabel, { id: string; mood?: string | null; wrong?: boolean }>({
      query: ({ id, ...body }) => ({ url: `/admin/insights/labels/${encodeURIComponent(id)}/correct`, method: "POST", body }),
      invalidatesTags: ["insights"],
      extraOptions: inline,
    }),
    getCoverage: build.query<Coverage, void>({
      query: () => ({ url: "/admin/insights/coverage" }),
      providesTags: ["coverage"],
      extraOptions: background,
    }),
    getLabelBatches: build.query<LabelBatch[], void>({
      query: () => ({ url: "/admin/insights/batches" }),
      providesTags: ["coverage"],
      extraOptions: background,
    }),
    estimateLabelling: build.mutation<
      { items: number; byKind: Record<string, number>; dollars: number },
      { kinds: LabelKind[]; from: string; to: string }
    >({
      query: (body) => ({ url: "/admin/insights/label/estimate", method: "POST", body }),
      extraOptions: background,
    }),
    startLabelling: build.mutation<{ batches: string[]; items: number }, { kinds: LabelKind[]; from: string; to: string }>({
      query: (body) => ({ url: "/admin/insights/label", method: "POST", body }),
      invalidatesTags: ["coverage"],
      extraOptions: { triggerLoading: false },
    }),
    getDigest: build.query<DigestResponse, { from: string; to: string }>({
      query: (q) => ({ url: "/admin/insights/digest", params: params({ ...q }) }),
      providesTags: ["insights"],
      extraOptions: background,
    }),
    writeDigest: build.mutation<DigestResponse, { from: string; to: string }>({
      query: (body) => ({ url: "/admin/insights/digest", method: "POST", body }),
      extraOptions: inline,
    }),
    getAdminViews: build.query<AdminViewEntry[], void>({
      query: () => ({ url: "/admin/insights/views" }),
      extraOptions: inline,
    }),

    /* ----- Follow-ups ----- */

    getFollowUps: build.query<FollowUpList, { status?: string }>({
      query: ({ status }) => ({ url: "/admin/follow-ups", params: params({ status }) }),
      providesTags: ["followups"],
      extraOptions: inline,
    }),
    getStudentFollowUps: build.query<FollowUp[], string>({
      query: (userId) => ({ url: `/admin/follow-ups/student/${encodeURIComponent(userId)}` }),
      providesTags: ["followups"],
      extraOptions: inline,
    }),
    runFollowUps: build.mutation<{ created: number; busy: boolean }, void>({
      query: () => ({ url: "/admin/follow-ups/run", method: "POST", timeout: 180_000 }),
      invalidatesTags: ["followups"],
      extraOptions: inline,
    }),
    updateFollowUpRule: build.mutation<FollowUpRule[], { rule: string; enabled?: boolean; autoSend?: boolean }>({
      query: ({ rule, ...body }) => ({ url: `/admin/follow-ups/rules/${encodeURIComponent(rule)}`, method: "PUT", body }),
      invalidatesTags: ["followups"],
      extraOptions: inline,
    }),
    editFollowUp: build.mutation<FollowUp, { id: string; subject?: string; headline?: string; body?: string; buttonLabel?: string }>({
      query: ({ id, ...body }) => ({ url: `/admin/follow-ups/${encodeURIComponent(id)}`, method: "PATCH", body }),
      extraOptions: background,
    }),
    followUpAction: build.mutation<
      FollowUp | { sentTo: string },
      { id: string; action: "send" | "test" | "snooze" | "dismiss" | "restore" | "redraft"; days?: number; instruction?: string }
    >({
      query: ({ id, action, ...body }) => ({ url: `/admin/follow-ups/${encodeURIComponent(id)}/${action}`, method: "POST", body, timeout: 120_000 }),
      invalidatesTags: (_r, _e, { action }) => (action === "test" ? [] : ["followups"]),
      extraOptions: { triggerLoading: false, silentErrors: true },
    }),

    /* ----- Admin team ----- */

    getAdminTeam: build.query<AdminTeam, void>({
      query: () => ({ url: "/admin/admins" }),
      providesTags: ["team"],
      extraOptions: inline,
    }),
    addAdmin: build.mutation<AdminTeam, string>({
      query: (email) => ({ url: "/admin/admins", method: "POST", body: { email } }),
      // The form shows the problem itself; no toast.
      extraOptions: { triggerLoading: false, silentErrors: true },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(AdminService.util.updateQueryData("getAdminTeam", undefined, () => data));
        } catch {
          // The form says what went wrong.
        }
      },
    }),
    removeAdmin: build.mutation<AdminTeam, string>({
      query: (email) => ({ url: `/admin/admins/${encodeURIComponent(email)}`, method: "DELETE" }),
      extraOptions: inline,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(AdminService.util.updateQueryData("getAdminTeam", undefined, () => data));
        } catch {
          // The error toast has said so; the list stays as it was.
        }
      },
    }),

    /* ----- Campaigns ----- */

    getCampaignTemplates: build.query<CampaignTemplate[], void>({
      query: () => ({ url: "/admin/campaigns/templates" }),
      keepUnusedDataFor: 60 * 30,
      extraOptions: inline,
    }),
    getCampaigns: build.query<CampaignsResponse, { status?: CampaignStatus | "" }>({
      query: ({ status }) => ({ url: "/admin/campaigns", params: params({ status }) }),
      providesTags: ["campaigns"],
      extraOptions: inline,
    }),
    getCampaignAudiences: build.query<AudienceOption[], void>({
      query: () => ({ url: "/admin/campaigns/audiences" }),
      providesTags: ["audiences"],
      extraOptions: inline,
    }),
    createCampaign: build.mutation<Campaign, { templateKey: TemplateKey }>({
      query: (body) => ({ url: "/admin/campaigns", method: "POST", body }),
      invalidatesTags: ["campaigns"],
      extraOptions: { triggerLoading: true },
    }),
    getCampaign: build.query<Campaign, string>({
      query: (id) => ({ url: `/admin/campaigns/${encodeURIComponent(id)}` }),
      providesTags: (_r, _e, id) => [{ type: "campaign", id }],
      extraOptions: inline,
    }),
    /** Autosave: quiet, the editor shows "Saved" or "Couldn't save". */
    updateCampaign: build.mutation<Campaign, { id: string; body: UpdateCampaignPayload }>({
      query: ({ id, body }) => ({ url: `/admin/campaigns/${encodeURIComponent(id)}`, method: "PUT", body }),
      invalidatesTags: ["campaigns"],
      extraOptions: background,
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(AdminService.util.updateQueryData("getCampaign", id, () => data));
        } catch {
          // The editor keeps the unsaved text and tries again on the next change.
        }
      },
    }),
    deleteCampaign: build.mutation<void, string>({
      query: (id) => ({ url: `/admin/campaigns/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: ["campaigns"],
      extraOptions: { triggerLoading: true },
    }),
    /** Live preview while typing: quiet, the last good preview stays on screen. */
    previewCampaign: build.mutation<CampaignPreview, { id: string; body: CampaignPreviewPayload }>({
      query: ({ id, body }) => ({
        url: `/admin/campaigns/${encodeURIComponent(id)}/preview`,
        method: "POST",
        body,
      }),
      extraOptions: background,
    }),
    sendTestCampaign: build.mutation<{ sentTo: string }, { id: string; to?: string }>({
      query: ({ id, to }) => ({
        url: `/admin/campaigns/${encodeURIComponent(id)}/test`,
        method: "POST",
        body: to ? { to } : {},
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "campaign", id }],
      extraOptions: inline,
    }),
    getCampaignEstimate: build.query<CampaignEstimate, { id: string; audience: Audience; sendAt?: string | null }>({
      query: ({ id, audience, sendAt }) => ({
        url: `/admin/campaigns/${encodeURIComponent(id)}/estimate`,
        params: params({ audience, sendAt }),
      }),
      extraOptions: background,
    }),
    /** `sendAt: null` starts now. */
    scheduleCampaign: build.mutation<Campaign, { id: string; sendAt: string | null }>({
      query: ({ id, sendAt }) => ({
        url: `/admin/campaigns/${encodeURIComponent(id)}/schedule`,
        method: "POST",
        body: { sendAt },
      }),
      invalidatesTags: (_r, _e, { id }) => ["campaigns", { type: "campaign", id }, { type: "report", id }],
      extraOptions: { triggerLoading: true },
    }),
    pauseCampaign: build.mutation<Campaign, string>({
      query: (id) => ({ url: `/admin/campaigns/${encodeURIComponent(id)}/pause`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => ["campaigns", { type: "campaign", id }, { type: "report", id }],
      extraOptions: inline,
    }),
    resumeCampaign: build.mutation<Campaign, string>({
      query: (id) => ({ url: `/admin/campaigns/${encodeURIComponent(id)}/resume`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => ["campaigns", { type: "campaign", id }, { type: "report", id }],
      extraOptions: inline,
    }),
    unscheduleCampaign: build.mutation<Campaign, string>({
      query: (id) => ({ url: `/admin/campaigns/${encodeURIComponent(id)}/unschedule`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => ["campaigns", { type: "campaign", id }, { type: "report", id }],
      extraOptions: inline,
    }),
    getCampaignReport: build.query<CampaignReport, string>({
      query: (id) => ({ url: `/admin/campaigns/${encodeURIComponent(id)}/report` }),
      providesTags: (_r, _e, id) => [{ type: "report", id }],
      extraOptions: inline,
    }),
  }),
});

/** Downloads a CSV with the signed-in admin's token and saves it. Throws when it fails. */
const downloadCsv = async (path: string, query: Record<string, unknown>, name: string) => {
  const search = new URLSearchParams(query as Record<string, string>).toString();
  const token = Cookies.get(accessToken);
  const response = await fetch(`${API_BASE_URL}${path}${search ? `?${search}` : ""}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(`Export failed (${response.status})`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Every user matching the filters (all pages), as CSV. */
export const downloadUsersCsv = (q: AdminUsersQuery) =>
  downloadCsv("/admin/users/export", usersParams({ ...q, page: undefined, pageSize: undefined }), "ai-examiner-users");

/** The filtered activity (up to 10,000 rows), as CSV. */
export const downloadActivityCsv = (q: AdminActivityQuery) =>
  downloadCsv(
    "/admin/activity/export",
    activityParams({ ...q, page: undefined, pageSize: undefined }),
    "ai-examiner-activity"
  );

/* ---------- Public email links (no sign-in) ---------- */

/** Unsubscribe page. No auth header and no log-out on 401: the token in the link is the key. */
export const EmailPreferencesService = createApi({
  reducerPath: "email-preferences",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/email`, timeout: secondsToMilliSeconds(30) }),
  endpoints: (build) => ({
    getEmailPreferences: build.query<EmailPreferences, string>({
      query: (token) => ({ url: "/preferences", params: { token } }),
    }),
    unsubscribe: build.mutation<EmailPreferences, { token: string; reason?: UnsubscribeReason }>({
      query: (body) => ({ url: "/unsubscribe", method: "POST", body }),
    }),
    resubscribe: build.mutation<EmailPreferences, { token: string }>({
      query: (body) => ({ url: "/resubscribe", method: "POST", body }),
    }),
  }),
});

export const {
  useGetAdminMeQuery,
  useSendHeartbeatMutation,
  useGetAdminAnalyticsQuery,
  useGetAdminLiveQuery,
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useGetAdminActivityQuery,
  useGetAdminActivitySummaryQuery,
  useGetAdminTeamQuery,
  useGetConversationsQuery,
  useGetConversationQuery,
  useTranslateConversationMutation,
  useGetIdeasQuery,
  useGetBehaviourQuery,
  useGetStudentTimelineQuery,
  useGenerateIdeasMutation,
  useUpdateIdeaMutation,
  useGetTestsSummaryQuery,
  useGetTestsQuery,
  useGetTestAttemptQuery,
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useGetInsightsOverviewQuery,
  useGetLabelsQuery,
  useCorrectLabelMutation,
  useGetCoverageQuery,
  useGetLabelBatchesQuery,
  useEstimateLabellingMutation,
  useStartLabellingMutation,
  useGetDigestQuery,
  useWriteDigestMutation,
  useGetAdminViewsQuery,
  useGetFollowUpsQuery,
  useGetStudentFollowUpsQuery,
  useRunFollowUpsMutation,
  useUpdateFollowUpRuleMutation,
  useEditFollowUpMutation,
  useFollowUpActionMutation,
  useAddAdminMutation,
  useRemoveAdminMutation,
  useGetCampaignTemplatesQuery,
  useGetCampaignsQuery,
  useGetCampaignAudiencesQuery,
  useCreateCampaignMutation,
  useGetCampaignQuery,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  usePreviewCampaignMutation,
  useSendTestCampaignMutation,
  useGetCampaignEstimateQuery,
  useScheduleCampaignMutation,
  usePauseCampaignMutation,
  useResumeCampaignMutation,
  useUnscheduleCampaignMutation,
  useGetCampaignReportQuery,
} = AdminService;

export const {
  useGetEmailPreferencesQuery,
  useUnsubscribeMutation,
  useResubscribeMutation,
} = EmailPreferencesService;
