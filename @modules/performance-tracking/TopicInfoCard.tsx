import React, { FC, useMemo, useState } from "react";
import cn from "classnames";
import Button from "@/@shared/ui/Button";
import { PerformanceTrackingParsingData } from "@/dto/performane-tracking.dto";
import TopicInfoCardItem, { CHART_GRID, PLOT_GRID_BG } from "./TopicInfoCardItem";
import TopicPerformancePieChart from "./TopicPerformancePieChart";

/* Performance overview card: passed / needs-work donut beside the takeaway, then the per-topic
   bar chart (weakest first, weak topics pre-checked) and a footer that stays in view with the
   one action. On phones the action moves to a full-width bar pinned to the bottom of the page. */

interface Props {
  score: number;
  groupedQuestions: Record<
    string,
    Record<"correct" | "wrong", PerformanceTrackingParsingData[]>
  >;
  handleGenerateQuestions: (selectedTopics: string[]) => void;
}

interface TopicRow {
  name: string;
  correct: number;
  total: number;
  share: number;
  index: number;
  passed: boolean;
}

const TopicInfoCard: FC<Props> = ({
  score,
  groupedQuestions,
  handleGenerateQuestions,
}) => {
  const rows = useMemo<TopicRow[]>(
    () =>
      Object.entries(groupedQuestions || {}).map(([name, info], index) => {
        const correct = info.correct.length;
        const total = info.correct.length + info.wrong.length;
        return {
          name,
          correct,
          total,
          share: total ? correct / total : 0,
          index,
          // a topic passes when every question on it was answered correctly
          passed: info.wrong.length === 0,
        };
      }),
    [groupedQuestions]
  );

  const weak = useMemo(
    () =>
      rows
        .filter((r) => !r.passed)
        .sort((a, b) => a.share - b.share || a.index - b.index),
    [rows]
  );
  const passed = useMemo(() => rows.filter((r) => r.passed), [rows]);

  // weak topics are pre-checked for the next test
  const [selectedTopics, setSelectedTopics] = useState<string[]>(() =>
    weak.map((r) => r.name)
  );

  const toggleTopicSelection = (topic: string) => {
    setSelectedTopics((current) =>
      current.includes(topic)
        ? current.filter((t) => t !== topic)
        : [...current, topic]
    );
  };

  const totalQuestions = rows.reduce((acc, r) => acc + r.total, 0);
  const correctQuestions = rows.reduce((acc, r) => acc + r.correct, 0);
  const passShare = rows.length
    ? Math.round((passed.length / rows.length) * 100)
    : 0;
  const scorePct = Math.round(score || 0);

  const takeaway = weak.length
    ? `You scored ${scorePct}% and passed ${passed.length} of ${rows.length} topics. ${weak.length} ${
        weak.length === 1 ? "needs" : "need"
      } more work.`
    : `You scored ${scorePct}% and passed all ${rows.length} topics.`;

  const selectedCount = selectedTopics.length;
  const selectedLine = (
    <span className="whitespace-nowrap text-[13px] text-subtle">
      <b className="font-bold text-ink tabular-nums">{selectedCount}</b>{" "}
      {selectedCount === 1 ? "topic" : "topics"} selected
    </span>
  );

  const renderGroup = (
    label: string,
    list: TopicRow[],
    tone: "weak" | "pass"
  ) =>
    list.length ? (
      <>
        <div className={cn(CHART_GRID, "md:min-h-[38px]")} aria-hidden="true">
          <span className="col-start-1" />
          <span className="col-start-2 flex items-center gap-2 self-end pb-0.5 pt-3.5 text-xs font-semibold text-subtle md:pb-1.5">
            <i
              className={cn(
                "h-2 w-2 rounded-[2px]",
                tone === "weak" ? "bg-[#e2665b]" : "bg-accent-300"
              )}
            />
            {label}
            <span className="font-medium text-faint tabular-nums">{list.length}</span>
          </span>
          <span
            className="col-start-3 self-stretch max-md:hidden"
            style={{ background: PLOT_GRID_BG }}
          />
        </div>
        {list.map((r) => (
          <TopicInfoCardItem
            key={r.name}
            topicTitle={r.name}
            correctQuestionsCount={r.correct}
            totalQuestionsCount={r.total}
            isSelected={selectedTopics.includes(r.name)}
            toggleTopicSelection={toggleTopicSelection}
          />
        ))}
      </>
    ) : null;

  return (
    <>
      <section
        aria-labelledby="perf-takeaway"
        className="rounded-2xl border border-edge bg-surface"
      >
        {/* Summary: donut on the left, takeaway + legend beside it (phone: takeaway first) */}
        <header className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-5 border-b border-line p-4 md:grid-cols-[132px_minmax(0,1fr)] md:grid-rows-[1fr_auto_auto_auto_1fr] md:gap-x-7 md:px-6 md:py-5">
          <div className="col-start-1 row-start-3 mt-3.5 md:row-span-5 md:row-start-1 md:mt-0">
            <TopicPerformancePieChart
              passed={passed.length}
              needsWork={weak.length}
            />
          </div>
          <h2
            id="perf-takeaway"
            className="col-span-2 row-start-1 text-balance text-lg font-bold leading-[1.35] tracking-[-0.02em] text-ink md:col-span-1 md:col-start-2 md:row-start-2 md:text-xl"
          >
            {takeaway}
          </h2>
          <p className="col-span-2 row-start-2 mt-1 text-[13px] text-subtle tabular-nums md:col-span-1 md:col-start-2 md:row-start-3 md:text-sm">
            {correctQuestions} of {totalQuestions} questions correct
          </p>
          <ul className="col-start-2 row-start-3 mt-3.5 flex flex-col gap-2 self-center text-sm font-medium text-ink md:row-start-4 md:gap-1.5 md:self-auto md:text-[13px]">
            <li className="flex items-center gap-2">
              <i aria-hidden="true" className="h-2 w-2 rounded-[2px] bg-accent-300" />
              Passed
              <span className="font-normal text-subtle tabular-nums">
                {passed.length} · {passShare}%
              </span>
            </li>
            <li className="flex items-center gap-2">
              <i aria-hidden="true" className="h-2 w-2 rounded-[2px] bg-[#e2665b]" />
              Needs work
              <span className="font-normal text-subtle tabular-nums">
                {weak.length} · {rows.length ? 100 - passShare : 0}%
              </span>
            </li>
          </ul>
        </header>

        <p className="px-4 pt-3.5 text-[13px] text-subtle md:px-6 md:pt-4 md:text-sm">
          Select topics you would like to generate questions
        </p>

        {rows.length ? (
          <div
            role="group"
            aria-label="Score by topic, weakest first"
            className="px-1 pb-1.5 md:px-3"
          >
            {renderGroup("Needs work", weak, "weak")}
            {renderGroup("Passed", passed, "pass")}

            {/* axis */}
            <div className={cn(CHART_GRID, "h-[30px] max-md:hidden")} aria-hidden="true">
              <span className="relative col-start-3 tabular-nums">
                {[0, 25, 50, 75, 100].map((v) => (
                  <span
                    key={v}
                    className={cn(
                      "absolute top-[7px] text-xs text-muted",
                      v === 0 ? "" : v === 100 ? "-translate-x-full" : "-translate-x-1/2"
                    )}
                    style={{ left: `${v}%` }}
                  >
                    {v}%
                  </span>
                ))}
              </span>
            </div>
          </div>
        ) : (
          <p className="px-6 py-8 text-center text-sm text-subtle">
            No performance data
          </p>
        )}

        {/* Desktop: the footer sticks to the bottom of the scroll area while the chart scrolls */}
        <footer className="sticky bottom-0 z-[3] flex items-center justify-between gap-3 rounded-b-2xl border-t border-line bg-canvas px-6 py-3.5 max-md:hidden">
          {selectedLine}
          <Button
            title="Generate test"
            className="min-w-[150px]"
            onClick={() => handleGenerateQuestions(selectedTopics)}
          />
        </footer>
      </section>

      {/* Phone: a full-width action bar pinned to the bottom of the page */}
      <div data-phone-bottom-bar="" className="sticky bottom-0 z-[15] -mx-4 -mb-12 mt-5 flex items-center gap-3 border-t border-line bg-surface-glass px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-[8px] md:hidden">
        {selectedLine}
        <Button
          title="Generate test"
          size="large"
          className="flex-1"
          onClick={() => handleGenerateQuestions(selectedTopics)}
        />
      </div>
    </>
  );
};

export default TopicInfoCard;
