import Link from "next/link";
import React, { FC } from "react";
import { ArrowUpRight } from "lucide-react";
import EasyReadDemo from "./EasyReadDemo";

/** How many documents students have read in Easy Read. Update this when the figure moves. */
const EASY_READ_DOCS = "15,000+";

/** "Students love Easy Read": a working Easy Read reader on two tilted sheets of colour,
 *  on the white page. */
const StudyTools: FC = () => (
  <section aria-labelledby="study-tools-h" className="mt-[88px] px-2 lg:mt-[120px] lg:px-3">
    <div className="overflow-hidden px-4 pb-2 pt-2 lg:px-10 min-[1132px]:px-0">
      <div className="mx-auto max-w-[1052px]">
        <h2 id="study-tools-h" className="isolate text-center text-[31px] font-semibold leading-[1.25] text-[var(--hk)] lg:text-[44px] lg:leading-[1.2]">
          Students love <span className="home-hl home-hl-1 home-hl-ink">Easy Read</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[360px] text-center text-[16px] leading-[24px] text-[#55555c] lg:mt-[22px] lg:max-w-[505px] lg:text-[17px] lg:leading-[26px]">
          They’ve read <strong className="font-semibold text-[var(--hk)]">{EASY_READ_DOCS} documents</strong> with it so far. <span className="whitespace-nowrap">Easy Read</span> turns dense lecture notes into plain, friendly language, page by page, so the tricky bits finally click. Try it below.
        </p>

        {/* the reader on two tilted sheets of colour */}
        <div className="relative mx-1 mt-12 sm:mx-4 lg:mx-auto lg:mt-[64px] lg:max-w-[860px]">
          <span aria-hidden="true" className="absolute -left-3 -top-4 h-[58%] w-[62%] -rotate-[2.5deg] rounded-[24px] bg-[var(--hy)] sm:-left-6 sm:-top-6 lg:-left-9 lg:-top-8 lg:rounded-[32px]" />
          <span aria-hidden="true" className="absolute -bottom-4 -right-3 h-[52%] w-[48%] rotate-[2deg] rounded-[24px] bg-[var(--hp)] sm:-bottom-6 sm:-right-6 lg:-bottom-8 lg:-right-9 lg:rounded-[32px]" />
          <div className="relative [&>div]:shadow-[0_30px_60px_-30px_rgba(14,14,16,0.45)]">
            <EasyReadDemo />
          </div>
        </div>

        <div className="mt-14 flex justify-center lg:mt-[72px]">
          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--hp)] px-[22px] text-[14px] font-medium text-white transition-colors hover:bg-[var(--hp-hover)]"
          >
            Get started for free
            <ArrowUpRight size={16} strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default StudyTools;
