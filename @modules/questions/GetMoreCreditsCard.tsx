import { Clock3 } from "lucide-react";
import Link from "next/link";
import React, { FC } from "react";
import cn from "classnames";

interface Props {
  minuteLeft?: string;
  className?: string;
}

/* Quiet call-minutes line: "25:30 mins left · Get more". */
const GetMoreCreditsCard: FC<Props> = ({ minuteLeft = "--", className }) => {
  return (
    <p
      className={cn(
        "flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] text-muted",
        className
      )}
    >
      <Clock3 size={14} strokeWidth={1.75} className="text-faint" aria-hidden />
      <span>
        <b className="font-semibold text-body tabular-nums">{minuteLeft}</b>{" "}
        mins left
      </span>
      <span aria-hidden className="mx-1 h-[3px] w-[3px] rounded-full bg-control" />
      <Link
        href="/account/call-credits"
        className="font-semibold text-accent underline-offset-[3px] hover:underline focus-visible:underline max-md:-my-2.5 max-md:py-2.5"
      >
        Get more
      </Link>
    </p>
  );
};

export default GetMoreCreditsCard;
