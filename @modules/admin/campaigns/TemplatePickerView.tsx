import React, { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import cn from "classnames";
import {
  useCreateCampaignMutation,
  useGetCampaignQuery,
  useGetCampaignTemplatesQuery,
  useUpdateCampaignMutation,
} from "@/api-services/admin.service";
import { CampaignContent, CampaignTemplate, TemplateKey } from "@/models/admin.model";
import { toast } from "react-toastify";
import { ErrorState, LoadingBlock, buttonClass } from "../ui";
import TemplateMiniature from "./TemplateMiniature";
import WizardHeader from "./WizardHeader";

/**
 * The message, photo, button and sign-off carry over when the admin switches template; the rest
 * (headlines mean different things in different templates) starts from the new defaults.
 */
const CARRY_OVER: (keyof CampaignContent)[] = ["body", "imageUrl", "imageAlt", "button", "signoff"];

const switchContent = (template: CampaignTemplate, current: CampaignContent): CampaignContent => {
  const next: CampaignContent = { ...template.defaults };
  for (const field of CARRY_OVER) {
    const value = current[field];
    if (template.fields.includes(field) && value !== undefined && value !== "") {
      (next as unknown as Record<string, unknown>)[field] = value;
    }
  }
  return next;
};

/** Step 1: pick one of the AI Examiner templates. A draft is made when you choose. */
const TemplatePickerView: FC = () => {
  const router = useRouter();
  const campaignId = typeof router.query.campaign === "string" ? router.query.campaign : "";
  const { data: templates, isLoading, isError, refetch } = useGetCampaignTemplatesQuery();
  const { data: campaign } = useGetCampaignQuery(campaignId, { skip: !campaignId });
  const [createCampaign, { isLoading: creating }] = useCreateCampaignMutation();
  const [updateCampaign, { isLoading: switching }] = useUpdateCampaignMutation();
  const [selected, setSelected] = useState<TemplateKey | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (selected) return;
    if (campaign) setSelected(campaign.templateKey);
    else if (templates?.length && !campaignId) setSelected(templates[0].key);
  }, [campaign, templates, campaignId, selected]);

  const chosen = templates?.find((t) => t.key === selected) ?? null;
  const canSwitch = !campaign || campaign.status === "draft";
  const busy = creating || switching;

  const handleUse = async () => {
    if (!chosen || busy) return;
    try {
      if (campaign) {
        if (chosen.key !== campaign.templateKey) {
          const updated = await updateCampaign({
            id: campaign.id,
            body: { templateKey: chosen.key, content: switchContent(chosen, campaign.content) },
          }).unwrap();
          if (updated.templateKey !== chosen.key) throw new Error("not switched");
        }
        router.push(`/admin/campaigns/${campaign.id}/edit`);
      } else {
        const created = await createCampaign({ templateKey: chosen.key }).unwrap();
        router.push(`/admin/campaigns/${created.id}/edit`);
      }
    } catch {
      // Creating shows its own error toast; the quiet template switch needs one.
      if (campaign) toast.error("We couldn't change the template. Try again.");
    }
  };

  const onCardKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!templates) return;
    const cols = e.key === "ArrowDown" || e.key === "ArrowUp" ? columns() : 1;
    const step =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? cols : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -cols : 0;
    if (!step) return;
    e.preventDefault();
    const to = Math.min(templates.length - 1, Math.max(0, index + step));
    setSelected(templates[to].key);
    cardRefs.current[to]?.focus();
  };

  /** How many cards sit on one row now (for up and down arrows). */
  const columns = () => {
    const tops = cardRefs.current.filter(Boolean).map((el) => el!.offsetTop);
    return Math.max(1, tops.filter((top) => top === tops[0]).length);
  };

  const selectedIndex = templates?.findIndex((t) => t.key === selected) ?? -1;

  return (
    <>
      <WizardHeader
        current={1}
        actions={
          <button
            type="button"
            onClick={handleUse}
            disabled={!chosen || busy || !canSwitch}
            className={buttonClass.primary}
          >
            {chosen ? `Use ${chosen.title}` : "Use this template"}
          </button>
        }
      />
      <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-[22px] px-4 pb-12 pt-6 md:px-7 md:pt-8">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink">
            {campaign ? "Change the template" : "Pick a template"}
          </h1>
          <p className="text-[15px] text-subtle">
            {campaign && !canSwitch
              ? "This campaign has started, so its template can't change."
              : "Every template is in the AI Examiner style. You change the words, photos and button in the next step."}
          </p>
        </div>

        {isLoading ? (
          <LoadingBlock label="Loading templates" />
        ) : !templates ? (
          isError ? <ErrorState onRetry={refetch} /> : null
        ) : (
          <div
            role="radiogroup"
            aria-label="Templates"
            className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[22px]"
          >
            {templates.map((t, i) => {
              const on = t.key === selected;
              return (
                <button
                  key={t.key}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on || (selectedIndex < 0 && i === 0) ? 0 : -1}
                  onClick={() => setSelected(t.key)}
                  onKeyDown={(e) => onCardKey(e, i)}
                  className={cn(
                    "flex flex-col gap-3 rounded-[18px] border-2 bg-surface p-2.5 pb-3.5 text-left transition-colors",
                    on ? "border-accent" : "border-line hover:border-control"
                  )}
                >
                  <span className="block h-[330px] w-full">
                    <TemplateMiniature templateKey={t.key} content={t.defaults} />
                  </span>
                  <span className="flex flex-col gap-0.5 px-1">
                    <span className="text-[15px] font-bold text-ink">{t.title}</span>
                    <span className="text-[13px] text-subtle">{t.use}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
};

export default TemplatePickerView;
