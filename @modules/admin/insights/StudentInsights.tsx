import React, { FC, useState } from "react";
import Link from "next/link";
import cn from "classnames";
import { ArrowRight, FileText, ListChecks, MessagesSquare } from "lucide-react";
import { useGetLabelsQuery, useGetStudentFollowUpsQuery } from "@/api-services/admin.service";
import { FollowUpStatus, LabelKind, LabelListItem } from "@/models/insights.model";
import { formatDayAndTime, todayKey } from "../format";
import { FIRST_DAY } from "../range";
import { Segmented } from "../kit/Menus";
import { Card, Chip } from "../ui";
import { DOC_KINDS, FIELDS, MOOD_ORDER } from "./insightsText";
import { MoodBar, MoodChip, MoodLegend } from "./insightsUi";

const KIND_ICON = { chat: MessagesSquare, test: ListChecks, document: FileText } as const;

const hrefOf = (x: LabelListItem) =>
  x.kind === "chat" ? `/admin/conversations/${x.key}` : x.kind === "test" ? `/admin/tests/${x.key}` : `/admin/documents/${x.documentId ?? x.key}`;

/** Everything Claude noticed about one student: moods across chats and tests, and what they upload. */
export const StudentLabels: FC<{ userId: string; name: string }> = ({ userId, name }) => {
  const [kind, setKind] = useState<"" | LabelKind>("");
  const [all, setAll] = useState(false);
  const { data, isLoading } = useGetLabelsQuery({ userId, from: FIRST_DAY, to: todayKey(), kind: kind || undefined, pageSize: 50 });
  const items = (data?.items ?? []).filter((x) => x.label.status === "done");
  const moods = MOOD_ORDER.reduce<Record<string, number>>((a, m) => ({ ...a, [m]: items.filter((x) => x.kind !== "document" && x.label.mood === m).length }), {});
  const scored = Object.values(moods).reduce((a, n) => a + n, 0);
  const shown = all ? items : items.slice(0, 6);
  const q = { person: userId, personName: name, range: "all" };

  return (
    <Card labelledBy="claude-h" className="flex flex-col gap-4 px-[22px] py-5">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <div className="mr-auto flex flex-col gap-0.5">
          <h2 id="claude-h" className="text-base font-bold text-ink">
            What Claude noticed
          </h2>
          <p className="text-[13px] text-subtle">Claude’s read of their chats, tests and uploads. Open any one to see the real thing.</p>
        </div>
        <Segmented
          label="Show"
          value={kind}
          options={[
            { value: "", label: "All" },
            { value: "chat", label: "Chats" },
            { value: "test", label: "Tests" },
            { value: "document", label: "Uploads" },
          ]}
          onChange={(v) => {
            setKind(v);
            setAll(false);
          }}
        />
      </div>

      {scored > 0 && kind !== "document" && (
        <div className="flex flex-col gap-2">
          <MoodBar moods={moods} height={8} />
          <MoodLegend moods={moods} />
        </div>
      )}

      {isLoading ? (
        <p className="py-3 text-sm text-subtle">Loading…</p>
      ) : items.length === 0 ? (
        <p className="py-3 text-sm text-subtle">Nothing labelled for this student yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {shown.map((x) => {
            const Icon = KIND_ICON[x.kind];
            const doc = x.kind === "document";
            return (
              <li key={`${x.kind}-${x.key}`}>
                <Link href={hrefOf(x)} className="group flex gap-3 py-3 transition-colors">
                  <Icon size={16} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0 text-subtle" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-[13.5px] font-semibold leading-snug text-ink group-hover:text-accent">
                      {x.label.summary || x.documentTitle || "Open"}
                    </p>
                    {x.label.quote && !doc && <p className="truncate text-[12.5px] italic text-subtle">“{x.label.quote}”</p>}
                    <p className="flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-muted">
                      <span>{formatDayAndTime(x.occurredOn)}</span>
                      {x.documentTitle && !doc && <span className="truncate">· {x.documentTitle}</span>}
                      {doc && x.label.details.field && <span>· {FIELDS[x.label.details.field] ?? x.label.details.field}</span>}
                      {doc && x.label.details.kind && <span>· {DOC_KINDS[x.label.details.kind] ?? x.label.details.kind}</span>}
                    </p>
                  </div>
                  {!doc && <MoodChip mood={x.label.mood} className="shrink-0 self-start" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-[13px]">
        {items.length > 6 && (
          <button type="button" onClick={() => setAll((a) => !a)} className="font-semibold text-accent hover:text-accent-900">
            {all ? "Show fewer" : `Show all ${items.length}`}
          </button>
        )}
        {[
          ["Their conversations", "/admin/conversations"],
          ["Their tests", "/admin/tests"],
          ["Their uploads", "/admin/documents"],
        ].map(([label, path]) => (
          <Link key={path} href={{ pathname: path, query: q }} className="inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-900">
            {label} <ArrowRight size={13} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </Card>
  );
};

const STATUS: Record<FollowUpStatus, { label: string; tone: "violet" | "green" | "grey" | "coral" | "amber" }> = {
  drafting: { label: "Drafting", tone: "grey" },
  suggested: { label: "To review", tone: "violet" },
  sent: { label: "Sent", tone: "green" },
  snoozed: { label: "Snoozed", tone: "amber" },
  dismissed: { label: "Dismissed", tone: "grey" },
  failed: { label: "Failed", tone: "coral" },
};

/** Follow-up emails suggested for or sent to one student. */
export const StudentFollowUps: FC<{ userId: string }> = ({ userId }) => {
  const { data } = useGetStudentFollowUpsQuery(userId);
  if (!data?.length) return null;
  return (
    <Card labelledBy="fu-h" className="flex flex-col gap-2.5 px-[22px] py-5">
      <h2 id="fu-h" className="text-base font-bold text-ink">
        Follow-ups
      </h2>
      <ul className="flex flex-col divide-y divide-line">
        {data.slice(0, 6).map((f) => {
          const s = STATUS[f.status];
          const tab = f.status === "drafting" || f.status === "failed" ? "suggested" : f.status;
          return (
            <li key={f.id}>
              <Link href={{ pathname: "/admin/follow-ups", query: { tab, id: f.id } }} className="group flex flex-col gap-1 py-2.5">
                <span className="flex items-center gap-2">
                  <span className="mr-auto truncate text-[13.5px] font-semibold text-ink group-hover:text-accent">{f.subject || f.ruleTitle}</span>
                  <Chip tone={s.tone}>{s.label}</Chip>
                </span>
                <span className={cn("text-[11.5px] text-muted")}>
                  {f.ruleTitle} · {formatDayAndTime(f.sentOn ?? f.createdOn)}
                  {f.returnedOn && <b className="font-semibold text-success"> · came back</b>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
