import Image from "next/image";
import Link from "next/link";
import React, { FC } from "react";
import cn from "classnames";
import { ArrowUp, Stethoscope } from "lucide-react";
import FileTypeTile from "@/@shared/components/FileTypeTile";

const FAN = [
  { ext: "PPTX", cls: "z-0 rotate-[-13deg] translate-x-[6px] translate-y-[10px]" },
  { ext: "DOCX", cls: "z-[1] rotate-[-4.5deg] translate-x-[2px] translate-y-[1px]" },
  { ext: "PDF", cls: "z-[2] rotate-[3deg] -translate-x-[2px]" },
  { ext: "JPG", cls: "z-[1] rotate-[9deg] -translate-x-[6px] translate-y-[6px]" },
] as const;

/** The upload card from the app, tilted over the photo. */
const UploadCard: FC<{ className?: string }> = ({ className }) => (
  <div
    aria-hidden="true"
    className={cn(
      "flex flex-col items-center rounded-[22px] bg-white shadow-[0_22px_44px_-20px_rgba(14,14,16,0.45)]",
      className
    )}
  >
    <span className="relative z-[5] grid h-10 w-10 place-items-center rounded-full bg-[var(--hp)] text-white shadow-[0_0_0_4px_#fff] max-[1099px]:h-8 max-[1099px]:w-8">
      <ArrowUp size={18} strokeWidth={2.4} />
    </span>
    <span className="-mt-[13px] flex items-end justify-center max-[1099px]:-mt-[9px]">
      {FAN.map(({ ext, cls }) => (
        <span
          key={ext}
          className={cn(
            "relative -mx-[1px] [filter:drop-shadow(0_1px_0_rgba(16,12,40,0.06))_drop-shadow(0_10px_16px_rgba(16,12,40,0.14))]",
            cls
          )}
        >
          <FileTypeTile
            ext={ext}
            size="hero"
            labelClassName="font-[family-name:var(--font-home-round)] font-bold tracking-[0.08em]"
          />
        </span>
      ))}
    </span>
    <span className="mt-[14px] font-[family-name:var(--font-home-round)] text-[19px] font-bold leading-none text-[var(--hp)] max-[1099px]:mt-3 max-[1099px]:text-[16px]">
      Upload any file
    </span>
  </div>
);

const HomeHero: FC = () => (
  <section aria-label="Introduction" className="px-2 lg:px-3">
    <div className="relative rounded-[28px] bg-[var(--hy)] min-[1100px]:h-[759px] min-[1100px]:rounded-[36px]">
      <div className="relative mx-auto h-full max-w-[1052px] px-4 pb-0 pt-10 min-[1100px]:px-0 min-[1100px]:pb-0 min-[1100px]:pt-[129px] max-[1131px]:min-[1100px]:px-6">
        <div className="relative z-[2] max-w-[420px]">
          <h1 className="isolate text-[38.5px] font-semibold leading-[1.09] text-[var(--hk)] min-[1100px]:text-[52px] min-[1100px]:leading-[1.1]">
            Turn your study materials into{" "}
            <span className="home-hl home-hl-1 mt-[2px] min-[1100px]:mt-[3px]">practice tests</span>{" "}
            <span className="home-hl home-hl-2 -mt-[2px] min-[1100px]:-mt-[1px]">&amp; easy reads</span>
          </h1>
          <p className="mt-5 max-w-[318px] text-[17px] leading-[26px] text-[#26221a] min-[1100px]:mt-[25px]">
            Upload, read, and generate customizable practice tests to master any subject.
          </p>
          <Link
            href="/auth/login"
            className="mt-7 inline-flex h-[46px] items-center rounded-full bg-[var(--hp)] px-[22px] text-[14px] font-medium text-white transition-colors hover:bg-[var(--hp-hover)] min-[1100px]:mt-[31px]"
          >
            Get Started
          </Link>
          <p className="mt-[41px] flex items-center gap-2.5 text-[12px] font-medium text-[var(--hk)] max-[1099px]:mt-11">
            <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[var(--hk)] text-[var(--hy)]">
              <Stethoscope size={12} strokeWidth={2.2} aria-hidden />
            </span>
            Built by Medical students
          </p>
        </div>

        {/* photo + upload card */}
        <div className="relative mx-auto mt-[42px] h-[494px] max-w-[358px] min-[1100px]:absolute min-[1100px]:right-0 min-[1100px]:top-0 min-[1100px]:mt-0 min-[1100px]:h-full min-[1100px]:w-[520px] min-[1100px]:max-w-none max-[1131px]:min-[1100px]:right-6">
          <div className="absolute inset-x-0 top-0 h-[372px] rotate-[3deg] overflow-hidden rounded-[22px] min-[1100px]:inset-x-auto min-[1100px]:right-[1.5px] min-[1100px]:top-[56px] min-[1100px]:h-[555px] min-[1100px]:w-[503px] min-[1100px]:rotate-[2.3deg] min-[1100px]:rounded-[24px]">
            <Image
              src="/home/redesign/hero-student.jpg"
              alt="A smiling student in a yellow shirt holding her open notes"
              fill
              priority
              sizes="(min-width: 1100px) 503px, 360px"
              className="object-cover"
            />
          </div>
          <UploadCard className="absolute left-[54px] top-[311px] h-[152px] w-[226px] -rotate-[4deg] pt-[10px] min-[1100px]:left-auto min-[1100px]:right-[104px] min-[1100px]:top-[526px] min-[1100px]:h-[176px] min-[1100px]:w-[296px] min-[1100px]:pt-[14px]" />
        </div>
      </div>
    </div>
  </section>
);

export default HomeHero;
