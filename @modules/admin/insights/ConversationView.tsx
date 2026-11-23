import React, { CSSProperties, FC } from "react";
import Link from "next/link";
import cn from "classnames";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useGetConversationQuery } from "@/api-services/admin.service";
import { ConversationDetail } from "@/models/insights.model";
import { formatDayAndTime, formatNumber } from "../format";
import { Avatar, Breadcrumb, ErrorState, LoadingBlock, buttonClass } from "../ui";
import { LabelCard } from "./insightsUi";
import { Thread } from "./Thread";
import { TranslateBar, useConversationTranslation } from "./useTranslation";

const facts = (d: ConversationDetail) =>
  `${formatDayAndTime(d.startedOn)} · ${formatNumber(d.messages.length)} messages · chatted about this document on ${formatNumber(d.daysChatted)} ${
    d.daysChatted === 1 ? "day" : "days"
  }`;

const iconButton =
  "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-body transition-colors hover:border-control hover:text-ink disabled:opacity-35";

/**
 * The reading pane beside the conversation list: who and what, Claude's read, then the whole
 * thread. On very wide screens Claude's read sits in its own column beside the thread.
 */
export const ConversationPane: FC<{
  conversationKey: string;
  position: { index: number; total: number };
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
  style?: CSSProperties;
}> = ({ conversationKey, position, onPrev, onNext, onClose, style }) => {
  const { data, isLoading, isError, refetch } = useGetConversationQuery(conversationKey);
  const t = useConversationTranslation(data);

  return (
    <article
      aria-label="Conversation"
      style={style}
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface xl:sticky"
    >
      <header className="flex items-start gap-3 border-b border-line px-5 py-4">
        {data ? (
          <>
            <Avatar initials={data.student.initials} seed={data.student.userId ?? data.key} size={38} className="mt-0.5" />
            <div className="mr-auto flex min-w-0 flex-col gap-0.5">
              {data.student.userId ? (
                <Link href={`/admin/users/${data.student.userId}`} className="w-fit text-[16px] font-bold leading-snug text-ink hover:text-accent">
                  {data.student.name}
                </Link>
              ) : (
                <b className="text-[16px] font-bold leading-snug text-ink">{data.student.name}</b>
              )}
              <Link href={`/admin/documents/${data.documentId}`} className="truncate text-[13.5px] font-semibold text-accent hover:text-accent-900" title={data.documentTitle}>
                {data.documentTitle}
              </Link>
              <p className="text-[12.5px] text-muted">{facts(data)}</p>
            </div>
          </>
        ) : (
          <p className="mr-auto py-2 text-[13px] text-subtle">Loading the conversation…</p>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {position.total > 1 && (
            <>
              <span className="mr-1 hidden font-mono text-[12px] text-muted tabular-nums 2xl:inline">
                {position.index + 1} of {position.total}
              </span>
              <button type="button" onClick={onPrev} disabled={!onPrev} aria-label="Previous conversation (K)" title="Previous (K)" className={iconButton}>
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button type="button" onClick={onNext} disabled={!onNext} aria-label="Next conversation (J)" title="Next (J)" className={iconButton}>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </>
          )}
          <Link href={`/admin/conversations/${conversationKey}`} aria-label="Open on its own page" title="Open on its own page" className={iconButton}>
            <Maximize2 size={14} aria-hidden="true" />
          </Link>
          <button type="button" onClick={onClose} aria-label="Close" title="Close" className={iconButton}>
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      </header>

      {isLoading ? (
        <LoadingBlock label="Loading the conversation" className="py-16" />
      ) : !data ? (
        isError ? <ErrorState title="We couldn't load this conversation." onRetry={refetch} /> : null
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-h-0 overflow-y-auto overscroll-contain">
            <div className="border-b border-line px-5 py-4 2xl:hidden">
              <LabelCard label={data.label} kind="chat" bare quoteInEnglish={t.quote} />
            </div>
            <TranslateBar t={t} className="sticky top-0 z-10" />
            <div className="px-5 py-6">
              <Thread messages={data.messages} studentName={data.student.name} translated={t.messageText} />
            </div>
          </div>
          <aside aria-label="Claude’s read" className="hidden min-h-0 overflow-y-auto overscroll-contain border-l border-line px-5 py-5 2xl:block">
            <LabelCard label={data.label} kind="chat" bare quoteInEnglish={t.quote} />
          </aside>
        </div>
      )}
    </article>
  );
};

/** One conversation on its own page: the thread, with Claude's read beside it. */
const ConversationView: FC<{ conversationKey: string }> = ({ conversationKey }) => {
  const { data, isLoading, isError, refetch } = useGetConversationQuery(conversationKey, { refetchOnMountOrArgChange: true });
  const t = useConversationTranslation(data);

  if (isLoading) return <LoadingBlock label="Loading the conversation" />;
  if (!data) return isError ? <ErrorState title="We couldn't load this conversation." onRetry={refetch} /> : null;

  return (
    <>
      <Breadcrumb parent={{ label: "Conversations", href: "/admin/conversations" }} current={data.student.name} />
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Avatar initials={data.student.initials} seed={data.student.userId ?? data.key} size={44} />
        <div className="mr-auto flex min-w-0 flex-col gap-1">
          <h1 className="text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink">{data.student.name}</h1>
          <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-[13.5px] text-subtle">
            Chatting about
            <Link href={`/admin/documents/${data.documentId}`} className="min-w-0 truncate font-semibold text-accent hover:text-accent-900">
              {data.documentTitle}
            </Link>
          </p>
          <p className="text-[12.5px] text-muted">{facts(data)}</p>
        </div>
        {data.student.userId && (
          <Link href={`/admin/users/${data.student.userId}`} className={buttonClass.small}>
            Student profile
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="The conversation" className="min-w-0 rounded-2xl border border-line bg-surface">
          <TranslateBar t={t} className="sticky top-0 z-10 rounded-t-2xl md:px-8" />
          <div className="mx-auto max-w-[760px] px-5 py-6 md:px-0 md:py-8">
            <Thread messages={data.messages} studentName={data.student.name} translated={t.messageText} />
          </div>
        </section>
        <div className="flex flex-col gap-3 lg:sticky lg:top-6">
          <LabelCard label={data.label} kind="chat" quoteInEnglish={t.quote} />
          <p className={cn("px-1 text-[12px] leading-relaxed text-muted")}>
            Only admins can open conversations, and each opening is noted on the Admins page.
          </p>
        </div>
      </div>
    </>
  );
};

export default ConversationView;
