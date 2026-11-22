import Link from "next/link";
import React, { FC } from "react";
import cn from "classnames";
import { Instagram } from "lucide-react";
import AppMark from "@/@shared/components/AppLayout/AppMark";
import { siteFontClass, sitePalette } from "./siteTheme";

const col = "flex flex-col gap-2 text-[13px] leading-[20px] text-[#c3c3cb]";
const head = "mb-[4px] text-[13px] font-semibold text-[#f4f4f6]";
const link = "transition-colors hover:text-[var(--hy)]";

interface Props {
  /** Space above the footer (the wrapper's margin). */
  className?: string;
}

/** The black site footer with rounded top corners, inset from the page edge. Used on the home page
 *  (under the yellow "Master any subject." panel) and every page that uses WebLayout. */
const SiteFooter: FC<Props> = ({ className }) => (
  <div style={sitePalette} className={cn(siteFontClass, "px-2 lg:px-3", className)}>
    <footer className="relative rounded-t-[28px] bg-[var(--hk)] lg:rounded-t-[40px]">
      <div className="mx-auto max-w-[1052px] px-4 pb-8 pt-[43px] lg:px-10 lg:pb-[30px] lg:pt-[44px] min-[1132px]:px-0">
        <div className="grid grid-cols-[205px_1fr] gap-y-8 lg:grid-cols-[minmax(0,393fr)_minmax(0,212fr)_minmax(0,212fr)_minmax(215px,235fr)] lg:gap-0">
          <div className="col-span-2 lg:col-span-1">
            <AppMark tone="white" size={16} />
            <p className="mt-[10px] flex items-center gap-3 text-[12px] font-semibold text-white lg:mt-2">
              Follow us on:
              <a
                href="https://www.instagram.com/aiexaminerapp/"
                aria-label="AI Examiner on Instagram"
                className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#232327] text-white transition-colors hover:bg-[#34343a]"
              >
                <Instagram size={15} strokeWidth={1.9} aria-hidden />
              </a>
            </p>
          </div>
          <nav aria-label="Product" className={col}>
            <p className={head}>Product</p>
            <Link href="/pricing" className={link}>Pricing</Link>
            <Link href="/#how-it-works" className={link}>How it works</Link>
          </nav>
          <nav aria-label="Company" className={col}>
            <p className={head}>Company</p>
            <Link href="/privacy-policy" className={link}>Privacy Policy</Link>
          </nav>
          <div className={col}>
            <p className={head}>Support</p>
            <a href="mailto:aiexaminerapp@gmail.com" className={link}>Email: aiexaminerapp@gmail.com</a>
            <a href="tel:+2348106879478" className={link}>Call: +2348106879478</a>
            <a href="https://wa.me/2347081271903" className={link}>Whatsapp: +2347081271903</a>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-[#26262b] pt-6 text-[12px] text-[#9999a1] lg:mt-[40px] lg:flex-row lg:justify-between lg:pt-[24px]">
          <span>© {new Date().getFullYear()} AI Examiner. All rights reserved.</span>
          <span>Built by Medical students</span>
        </div>
      </div>
    </footer>
  </div>
);

export default SiteFooter;
