import Link from "next/link";
import React, { FC } from "react";
import SiteFooter from "@/@shared/components/site/SiteFooter";

/** The yellow "Master any subject." panel with the black footer tucked under it. */
const HomeClose: FC = () => (
  <div className="mt-20 lg:mt-[110px]">
    <section aria-labelledby="close-h" className="relative z-[1] mx-2 rounded-[28px] bg-[var(--hy)] px-6 pb-[92px] pt-[100px] text-center lg:mx-3 lg:rounded-[40px] lg:pb-[100px] lg:pt-[97px]">
      <h2 id="close-h" className="mx-auto max-w-[360px] text-[42px] font-semibold leading-[1.14] text-[var(--hk)] lg:max-w-[400px] lg:pt-[2px] lg:text-[62px] lg:leading-[70px]">
        Master any subject.
      </h2>
      <Link
        href="/auth/login"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-[var(--hp)] px-[22px] text-[14px] font-medium text-white transition-colors hover:bg-[var(--hp-hover)] lg:mt-[34px]"
      >
        Start my Journey
      </Link>
    </section>

    <SiteFooter />
  </div>
);

export default HomeClose;
