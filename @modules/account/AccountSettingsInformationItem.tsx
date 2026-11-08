import React, { FC, ReactNode } from "react";
import { CreditCard } from "lucide-react";

interface Props {
  data: [string, string];
}

const toSentenceCase = (text: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : text;

const badge = (label: string, tone: "success" | "warning" | "neutral") => {
  const tones = {
    success: "bg-success-bg text-success-strong",
    warning: "bg-warning-bg text-warning",
    neutral: "bg-sunken text-subtle",
  };
  return (
    <span
      className={`inline-flex h-[22px] items-center whitespace-nowrap rounded-full px-2 text-[11.5px] font-semibold ${tones[tone]}`}
    >
      {label}
    </span>
  );
};

const renderValue = (key: string, value: string): ReactNode => {
  const k = key.toLowerCase();

  if (k === "last 4 digits" && value.startsWith("*")) {
    const last4 = value.replace(/[^0-9]/g, "").slice(-4);
    return (
      <span className="inline-flex items-center gap-2.5 tracking-[0.04em] max-md:justify-end">
        <CreditCard size={16} strokeWidth={1.75} className="text-muted" aria-hidden="true" />
        <span aria-hidden="true" className="relative top-[0.22em] tracking-[0.08em] text-subtle">
          **** **** ****
        </span>
        <span className="sr-only">Card ending in</span>
        {last4}
      </span>
    );
  }

  if (k === "automatic billing" && (value === "Yes" || value === "No")) {
    const on = value === "Yes";
    return (
      <span className="inline-flex items-center gap-[7px]">
        <span
          aria-hidden="true"
          className={`h-[7px] w-[7px] rounded-full ${on ? "bg-success" : "bg-control"}`}
        />
        {on ? "On" : "Off"}
      </span>
    );
  }

  if (k === "status" && value && value !== "N/A") {
    const v = value.toLowerCase();
    if (v === "active") return badge(value, "success");
    if (v === "attention") return badge(value, "warning");
    return badge(value, "neutral");
  }

  if (k === "amount") {
    return value.replace(/\d{4,}/g, (n) => Number(n).toLocaleString("en-US"));
  }

  return value;
};

// One key / value row of a bordered settings box
const AccountSettingsInformationItem: FC<Props> = ({
  data: [title, value],
}) => {
  return (
    <div className="grid min-h-[50px] grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t border-line px-4 py-3 first:border-t-0 md:min-h-[52px] md:grid-cols-[200px_minmax(0,1fr)] md:gap-4 md:px-5">
      <dt className="text-sm text-subtle">{toSentenceCase(title)}</dt>
      <dd className="m-0 min-w-0 text-right text-sm font-medium text-ink tabular-nums md:text-left">
        {renderValue(title, value)}
      </dd>
    </div>
  );
};

export default AccountSettingsInformationItem;
