import React, { FC, useMemo, useState } from "react";
import cn from "classnames";
import { Languages } from "lucide-react";
import { useTranslateConversationMutation } from "@/api-services/admin.service";
import { ConversationDetail, ConversationTranslation } from "@/models/insights.model";
import Spinner from "@/@shared/components/Spinner";
import { Segmented } from "../kit/Menus";
import { buttonClass } from "../ui";

/** Hindi written in Latin letters: common words that aren't English words. */
const HINGLISH = new Set(
  (
    "hai hain nahi nahin nhi kya kyu kyun kyon mein mai mujhe mujhko mera meri mere aap aapka aapke apko tum tumhe hum hume humko " +
    "ko ka ki ke kuch kuchh samajh samjha samjhao kaise kese kaisa bhai yaar karo karna krna kro batao bataiye bata accha acha achha " +
    "theek thik wala wali wale sab aur bhi toh ye yeh wo woh abhi jaldi chahiye chaiye dijiye kijiye banao banaye banaya aaya aayi " +
    "gaya gayi raha rahi rahe liye sath saath bahut bohot hota hoti hote sakte sakta sakti matlab sahi galat prashn uttar adhyay " +
    "kripya dhanyavad shukriya ji haan"
  ).split(" ")
);

/**
 * Whether a conversation looks like it isn't in English: other scripts or heavy accents (Hindi,
 * Arabic, Yoruba tone marks), or Hindi typed in Latin letters.
 */
export const looksNotEnglish = (texts: string[]) =>
  texts.some((t) => {
    // Latin letters, accented Latin, and letters of other scripts (Devanagari, Arabic, Yoruba marks…).
    const letters = t.match(/[A-Za-z\u00C0-\u024F\u0370-\u1FFF\u3040-\uD7FF\uF900-\uFAFF]/g) ?? [];
    if (letters.length < 8) return false;
    const latin = letters.filter((c) => /[A-Za-z]/.test(c)).length;
    if (latin / letters.length < 0.9) return true;
    const words = t.toLowerCase().match(/[a-z]+/g) ?? [];
    if (words.length < 4) return false;
    return words.filter((w) => HINGLISH.has(w)).length / words.length >= 0.2;
  });

export type TranslationState = ReturnType<typeof useConversationTranslation>;

/** Offers an English version of a conversation, made by Claude on request and kept. */
export const useConversationTranslation = (data: ConversationDetail | undefined) => {
  const [translate, { isLoading, isError, reset }] = useTranslateConversationMutation();
  const [result, setResult] = useState<ConversationTranslation | null>(null);
  const [english, setEnglish] = useState(false);

  const foreign = useMemo(
    () => !!data && looksNotEnglish([...data.messages.map((m) => m.text), data.label?.quote ?? ""]),
    [data]
  );

  const run = async () => {
    if (!data) return;
    reset();
    try {
      const r = await translate(data.key).unwrap();
      setResult(r);
      setEnglish(true);
    } catch {
      // The error toast says so; the bar offers to try again.
    }
  };

  const on = english && !!result;
  return {
    foreign,
    busy: isLoading,
    failed: isError,
    result,
    english: on,
    setEnglish,
    run,
    /** The English for a message when it's showing. */
    messageText: (id: string) => (on ? result?.messages[id] ?? null : null),
    quote: on ? result?.quote?.text ?? null : null,
  };
};

/** The bar above a non-English thread: translate, then switch between English and the original. */
export const TranslateBar: FC<{ t: TranslationState; className?: string }> = ({ t, className }) => {
  if (!t.foreign && !t.result) return null;
  const languages = t.result?.languages.length ? t.result.languages.join(" and ") : null;
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-surface px-5 py-3", className)}>
      <Languages size={16} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-subtle" />
      {t.busy ? (
        <p role="status" className="mr-auto flex items-center gap-2 text-[13px] text-body">
          <Spinner size="xs" />
          Claude is translating this conversation. Long ones take a minute or so.
        </p>
      ) : t.result ? (
        <>
          <p className="mr-auto text-[13px] text-body">
            {languages ? (
              <>
                Written in <b className="font-semibold text-ink">{languages}</b>. Translated by Claude.
              </>
            ) : (
              "Claude found nothing to translate: it’s all in English."
            )}
          </p>
          {languages && (
            <Segmented
              label="Language shown"
              value={t.english ? "english" : "original"}
              options={[
                { value: "english", label: "English" },
                { value: "original", label: "Original" },
              ]}
              onChange={(v) => t.setEnglish(v === "english")}
            />
          )}
        </>
      ) : (
        <>
          <p className="mr-auto text-[13px] text-body">{t.failed ? "The translation didn’t work." : "This conversation isn’t in English."}</p>
          <button type="button" onClick={t.run} className={cn(buttonClass.small, "h-8")}>
            {t.failed ? "Try again" : "Translate to English"}
          </button>
        </>
      )}
    </div>
  );
};
