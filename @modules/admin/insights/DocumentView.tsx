import React, { FC, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import cn from "classnames";
import { ExternalLink } from "lucide-react";
import { useGetDocumentQuery } from "@/api-services/admin.service";
import { formatDayAndTime, formatNumber, formatReading, relativeTime } from "../format";
import { Segmented } from "../kit/Menus";
import { Avatar, Breadcrumb, Chip, ErrorState, LoadingBlock } from "../ui";
import { LabelCard } from "./insightsUi";
import { FileBadge } from "./DocumentsView";

/** One upload: the file itself, what the app extracted from it, Claude's read, and how it was used. */
const DocumentView: FC<{ documentId: string }> = ({ documentId }) => {
  const { data, isLoading, isError, refetch } = useGetDocumentQuery(documentId, { refetchOnMountOrArgChange: true });
  const [tab, setTab] = useState<"file" | "topics" | "summary">("file");

  if (isLoading) return <LoadingBlock label="Loading the document" />;
  if (!data) return isError ? <ErrorState title="We couldn't load this document." onRetry={refetch} /> : null;
  const ext = /\.([a-z0-9]{1,5})$/i.exec(data.title)?.[1] ?? null;

  return (
    <>
      <Breadcrumb parent={{ label: "Documents", href: "/admin/documents" }} current={data.title} />
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <FileBadge type={ext} className="h-12 w-10" />
        <div className="mr-auto flex min-w-0 flex-col gap-1">
          <h1 className="break-words text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">{data.title}</h1>
          <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-subtle">
            <Avatar initials={data.owner.initials} seed={data.owner.userId ?? data.id} size={20} />
            {data.owner.userId ? (
              <Link href={`/admin/users/${data.owner.userId}`} className="font-semibold text-ink hover:text-accent">
                {data.owner.name}
              </Link>
            ) : (
              data.owner.name
            )}
            <span>· uploaded {formatDayAndTime(data.uploadedOn)}</span>
            {data.deleted && <Chip tone="grey">Deleted by the student</Chip>}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="The document" className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              label="Show"
              value={tab}
              size="md"
              options={[
                { value: "file", label: "File", disabled: !data.file },
                { value: "topics", label: `Topics · ${formatNumber(data.topics.length)}` },
                { value: "summary", label: "Summary", disabled: !data.summary },
              ]}
              onChange={setTab}
            />
            {data.file && (
              <a
                href={data.file.openUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:text-accent-900"
              >
                Open in Google Drive <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
          </div>
          {tab === "file" &&
            (data.file ? (
              <iframe
                title={`Preview of ${data.title}`}
                src={data.file.previewUrl}
                className="h-[72vh] min-h-[420px] w-full rounded-xl border border-line bg-well"
                allow="autoplay"
              />
            ) : (
              <p className="py-10 text-center text-[13px] text-muted">The original file isn’t stored for this document.</p>
            ))}
          {tab === "topics" && (
            <ol className="flex flex-col divide-y divide-line">
              {data.topics.length === 0 && <li className="py-6 text-[13px] text-muted">The app found no topics in this document.</li>}
              {data.topics.map((t, i) => (
                <li key={i} className="flex gap-3 py-2.5">
                  <span className="w-12 shrink-0 font-mono text-[11.5px] text-muted">{t.pages ? `p.${t.pages}` : ""}</span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="text-[13.5px] font-semibold text-ink">{t.title}</p>
                    {t.description && <p className="text-[12.5px] leading-snug text-subtle">{t.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {tab === "summary" && data.summary && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.summary}</ReactMarkdown>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <LabelCard label={data.label} kind="document" />
          <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
            <h2 className="text-[13px] font-bold text-ink">How it was used</h2>
            <dl className="grid grid-cols-2 gap-2">
              {[
                ["Tests made", formatNumber(data.tests.length)],
                ["Chat questions", formatNumber(data.chat.questions)],
                ["Easy Read time", data.easyRead.seconds ? formatReading(data.easyRead.seconds) : "–"],
                ["Pages simplified", data.easyRead.pages ? `${formatNumber(data.easyRead.pagesSimplified)} of ${formatNumber(data.easyRead.pages)}` : "–"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 rounded-xl bg-well px-3 py-2">
                  <dt className="text-[11.5px] font-semibold text-subtle">{k}</dt>
                  <dd className="text-[16px] font-bold text-ink tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            {data.easyRead.lastReadAt && (
              <p className="text-[12px] text-muted">Last read in Easy Read {relativeTime(data.easyRead.lastReadAt).toLowerCase()}.</p>
            )}
            {data.chat.questions > 0 && (
              <Link href={`/admin/conversations?range=all&document=${data.id}`} className="text-[13px] font-semibold text-accent hover:text-accent-900">
                Read the chat conversations
              </Link>
            )}
            {data.tests.length > 0 && (
              <ul className="flex flex-col divide-y divide-line border-t border-line">
                {data.tests.slice(0, 8).map((t) => {
                  const row = (
                    <>
                      <span className="flex min-w-0 flex-col">
                        <span className="text-[13px] font-semibold text-ink">{t.type}</span>
                        <span className="text-[11.5px] text-muted">
                          {formatNumber(t.questions)} questions · {formatDayAndTime(t.madeOn)}
                        </span>
                      </span>
                      <span className={cn("ml-auto text-[13px] font-bold tabular-nums", t.best === null ? "text-faint" : "text-ink")}>
                        {t.best === null ? "not finished" : `${Math.round(t.best)}%`}
                      </span>
                    </>
                  );
                  return (
                    <li key={t.testId}>
                      {t.attempt ? (
                        <Link href={`/admin/tests/${t.attempt}`} className="flex items-center gap-3 py-2 hover:text-accent">
                          {row}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 py-2">{row}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default DocumentView;
