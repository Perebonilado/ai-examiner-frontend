import React, { FC, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import cn from "classnames";
import { Send } from "lucide-react";
import { toast } from "react-toastify";
import {
  useDeleteCampaignMutation,
  useGetCampaignQuery,
  useGetCampaignTemplatesQuery,
  usePreviewCampaignMutation,
  useSendTestCampaignMutation,
  useUpdateCampaignMutation,
} from "@/api-services/admin.service";
import { CampaignContent } from "@/models/admin.model";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import Spinner from "@/@shared/components/Spinner";
import { ConfirmDialog } from "../AdminDialog";
import { ErrorState, LoadingBlock, buttonClass, inputClass } from "../ui";
import EditorFields from "./EditorFields";
import EmailFrame from "./EmailFrame";
import SaveStatusNote from "./SaveStatusNote";
import { useAutosave } from "./useAutosave";
import WizardHeader from "./WizardHeader";

interface Draft {
  name: string;
  content: CampaignContent;
}

const EDITABLE = ["draft", "scheduled", "paused"];

/** Step 2: write the email, with a live preview from the server. Changes save as you type. */
const CampaignEditorView: FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const { data: campaign, isLoading, isError, refetch } = useGetCampaignQuery(id, { refetchOnMountOrArgChange: true });
  const { data: templates } = useGetCampaignTemplatesQuery();
  const [updateCampaign] = useUpdateCampaignMutation();
  const [previewCampaign] = usePreviewCampaignMutation();
  const [sendTest, { isLoading: sendingTest }] = useSendTestCampaignMutation();
  const [deleteCampaign, { isLoading: deleting }] = useDeleteCampaignMutation();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [width, setWidth] = useState<600 | 375>(600);
  const [preview, setPreview] = useState<{ html: string } | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // On a phone, preview the phone width first.
  useEffect(() => {
    if (window.innerWidth < 640) setWidth(375);
  }, []);

  // Start from the saved campaign, once.
  useEffect(() => {
    if (campaign && !draft) setDraft({ name: campaign.name, content: campaign.content });
  }, [campaign, draft]);

  // Sending and sent campaigns can't change: show their report instead.
  useEffect(() => {
    if (campaign && !EDITABLE.includes(campaign.status)) router.replace(`/admin/campaigns/${id}`);
  }, [campaign, id, router]);

  const baseline = useMemo(
    () => (campaign ? { name: campaign.name, content: campaign.content } : null),
    // Only the first load: later saves must not reset what is being typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [!!campaign]
  );
  const { status, flush } = useAutosave<Draft>(draft, baseline, (value) =>
    updateCampaign({ id, body: { name: value.name.trim() || campaign?.name, content: value.content } }).unwrap()
  );

  // Live preview, ~400 ms after typing stops.
  const previewContent = useDebouncedValue(draft?.content ?? null, 400);
  useEffect(() => {
    if (!previewContent || !campaign) return;
    let cancelled = false;
    previewCampaign({
      id,
      body: {
        subject: campaign.subject,
        preheader: campaign.preheader,
        templateKey: campaign.templateKey,
        content: previewContent,
      },
    })
      .unwrap()
      .then((result) => {
        if (cancelled) return;
        setPreview({ html: result.html });
        setPreviewFailed(false);
      })
      .catch(() => !cancelled && setPreviewFailed(true));
    return () => {
      cancelled = true;
    };
    // The subject and template only change on other steps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewContent, id, !!campaign]);

  const template = templates?.find((t) => t.key === campaign?.templateKey);

  const handleTest = async () => {
    await flush();
    try {
      const { sentTo } = await sendTest({ id }).unwrap();
      toast.success(`Test sent to ${sentTo}`);
    } catch {
      // The request's error toast says what went wrong.
    }
  };

  const handleNext = async () => {
    const ok = await flush();
    if (ok) router.push(`/admin/campaigns/${id}/review`);
    else toast.error("We couldn't save your changes. Check your connection and try again.");
  };

  const handleDelete = async () => {
    try {
      await deleteCampaign(id).unwrap();
      setConfirmDelete(false);
      router.push("/admin/campaigns");
    } catch {
      setConfirmDelete(false);
    }
  };

  const header = (
    <WizardHeader
      current={2}
      campaignId={id}
      canChangeTemplate={campaign?.status === "draft"}
      actions={
        <>
          <SaveStatusNote status={status} onRetry={flush} />
          <button type="button" onClick={handleNext} disabled={!draft} className={buttonClass.primary}>
            Next: review
          </button>
        </>
      }
    />
  );

  if (isLoading || (campaign && !draft))
    return (
      <>
        {header}
        <LoadingBlock label="Loading the campaign" />
      </>
    );
  if (!campaign || !draft)
    return (
      <>
        {header}
        {isError ? <ErrorState title="We couldn't load this campaign." onRetry={refetch} /> : null}
      </>
    );

  return (
    <>
      {header}
      <div className="flex flex-col bg-[#ededf0] dark:bg-sunken lg:min-h-[calc(100dvh-71px)] lg:flex-row lg:items-start">
        <aside
          aria-label="Content"
          className="flex flex-col gap-[18px] border-line bg-surface px-4 pb-8 pt-[22px] md:px-[22px] lg:min-h-[calc(100dvh-71px)] lg:w-[420px] lg:shrink-0 lg:border-r"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold tracking-[-0.015em] text-ink">{template?.title ?? "Your email"}</h1>
            <p className="text-[13.5px] text-subtle">Change any part. The preview updates as you type.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex flex-col gap-1.5 text-[13px] font-bold text-ink">
              Campaign name
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                aria-describedby="campaign-name-hint"
                className={cn(inputClass, "font-normal")}
              />
            </label>
            <p id="campaign-name-hint" className="text-[12.5px] text-muted">
              Only you see this, in the list of campaigns.
            </p>
          </div>

          <EditorFields
            template={template}
            templateKey={campaign.templateKey}
            content={draft.content}
            onChange={(content) => setDraft({ ...draft, content })}
          />

          {campaign.status === "draft" && (
            <div className="mt-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-[13px] font-semibold text-danger hover:underline"
              >
                Delete this draft
              </button>
            </div>
          )}
        </aside>

        <section
          aria-label="Preview"
          className="flex min-w-0 flex-1 flex-col lg:sticky lg:top-[71px] lg:h-[calc(100dvh-71px)]"
        >
          <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 md:px-6">
            <div role="group" aria-label="Preview size" className="inline-flex rounded-[10px] bg-surface p-[3px]">
              {([600, 375] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  aria-pressed={width === w}
                  onClick={() => setWidth(w)}
                  className={cn(
                    "h-[34px] rounded-lg px-3.5 text-[13px] transition-colors",
                    width === w ? "bg-ink font-semibold text-surface" : "font-medium text-subtle hover:text-ink"
                  )}
                >
                  {w === 600 ? "Desktop" : "Phone"}
                </button>
              ))}
            </div>
            <p className="mr-auto min-w-0 text-[13px] text-subtle">
              Inbox line: <b className="font-semibold text-ink">AI Examiner</b> · {campaign.subject || "No subject yet"}
            </p>
            <button type="button" onClick={handleTest} disabled={sendingTest} className={cn(buttonClass.small, "h-[38px]")}>
              {sendingTest ? <Spinner size="xs" tone="current" /> : <Send size={15} strokeWidth={1.8} aria-hidden="true" />}
              {sendingTest ? "Sending…" : "Send me a test"}
            </button>
          </div>
          <div
            // Scrolls on its own on wide screens: focusable so it can be scrolled from the keyboard.
            tabIndex={0}
            role="region"
            aria-label="Email preview"
            className="min-h-0 min-w-0 flex-1 overflow-auto pb-8 pt-2 sm:px-4 md:px-6"
          >
            {preview ? (
              <div
                className="mx-auto w-fit overflow-hidden rounded-md shadow-pop"
                aria-busy={previewContent !== draft.content}
              >
                <EmailFrame html={preview.html} width={width} title="Email preview" />
              </div>
            ) : previewFailed ? (
              <p className="py-16 text-center text-sm text-subtle">
                We couldn&apos;t draw the preview. Your words are still saved; keep typing to try again.
              </p>
            ) : (
              <LoadingBlock label="Drawing the preview" />
            )}
            {preview && previewFailed && (
              <p role="status" className="mt-3 text-center text-[13px] text-subtle">
                The preview is out of date: we couldn&apos;t refresh it.
              </p>
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this draft?"
        message={`"${draft.name || campaign.name}" will be deleted. This can't be undone.`}
        confirmLabel="Delete draft"
        danger
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
};

export default CampaignEditorView;
