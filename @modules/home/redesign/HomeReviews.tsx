import Link from "next/link";
import Image from "next/image";
import React, { FC } from "react";

/** Every review from the original home page, in the words people tweeted. */
const REVIEWS = [
  { quote: "This is literally the most helpful tool for any medical student period! I don’t think there’s anyone who doesn’t get addicted to using it.", name: "IOTA | Instant Response", handle: "@iotateams", avatar: "/home/redesign/review-iota.jpg" },
  { quote: "Tried it and just subscribed to premium. This is a lifesaver. Thank you!", name: "Omotola", handle: "@LadyTeelenah", avatar: "/home/redesign/review-omotola.jpg" },
  { quote: "Beautiful stuff. And for that price?? Quizlet is shakinggg.", name: "Further.", handle: "@Bibi_Njoku", avatar: "/home/redesign/review-further.jpg" },
  { quote: "Absolutely brilliant app! Really impressive. Good for both students and lecturers alike!", name: "Osahon", handle: "@osahon01", avatar: "/home/redesign/review-osahon.jpg" },
  { quote: "I can attest to this tool, it’s really amazing!", name: "Success Akpeli", handle: "@SuccessC10", avatar: "/home/redesign/review-success.jpg" },
];

/** One copy of the reviews. The row holds two copies and slides left by exactly one, so it loops
 *  without a seam; each copy ends with the same space that sits between reviews. */
const ReviewList: FC<{ copy?: boolean }> = ({ copy }) => (
  <ul aria-hidden={copy || undefined} className={`flex shrink-0 gap-6 py-2 pr-6 md:gap-8 md:pr-8 lg:gap-10 lg:pr-10 ${copy ? "reviews-marquee-copy" : ""}`}>
    {REVIEWS.map((r) => (
      <li key={r.handle} className="w-[290px] shrink-0 md:w-[300px] lg:w-[324px]">
        <figure className="m-0">
          <span aria-hidden="true" className="block font-[family-name:Georgia,serif] text-[40px] font-bold leading-[24px] text-[var(--hp)] lg:text-[44px]">
            &ldquo;
          </span>
          <blockquote className="mt-5 text-[18px] font-medium leading-[26px] text-[var(--hk)] lg:mt-[23px]">
            {r.quote}
          </blockquote>
          <figcaption className="mt-[14px] flex items-center gap-[10px]">
            <Image src={r.avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
            <span className="text-[12px] leading-[19px]">
              <b className="block font-semibold text-[var(--hk)]">{r.name}</b>
              <span className="text-[#6b6b73]">{r.handle}</span>
            </span>
          </figcaption>
        </figure>
      </li>
    ))}
  </ul>
);

/** "What our users say": the reviews drift past in an endless row across the full page width.
 *  Hovering pauses it so a quote can be finished; with reduced motion it stands still and can be
 *  swiped instead (see .reviews-marquee in globals.css). */
const HomeReviews: FC = () => (
  <section aria-labelledby="reviews-h" className="pt-[88px] lg:pt-[112px]">
    <h2 id="reviews-h" className="px-4 text-center text-[31px] font-semibold leading-[1.1] text-[var(--hk)] lg:text-[44px]">
      What our <span className="text-[var(--hp)]">users</span> say
    </h2>

    {/* Focusable so keyboard users can pause it (and, with reduced motion, scroll it with the arrow keys). */}
    <div
      role="region"
      aria-label="Reviews"
      tabIndex={0}
      className="reviews-marquee mt-12 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--hp)] lg:mt-[56px]"
    >
      <div className="reviews-marquee-track flex w-max">
        <ReviewList />
        <ReviewList copy />
      </div>
    </div>

    <div className="mt-11 flex justify-center lg:mt-[45px]">
      <Link
        href="/auth/login"
        className="inline-flex h-[46px] items-center rounded-full bg-[var(--hp)] px-[22px] text-[14px] font-medium text-white transition-colors hover:bg-[var(--hp-hover)]"
      >
        Try it now
      </Link>
    </div>
  </section>
);

export default HomeReviews;
