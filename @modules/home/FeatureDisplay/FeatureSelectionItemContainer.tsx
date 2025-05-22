import React, { FC, useEffect, useRef, useState } from "react";
import FeatureSelectionItem from "./FeatureSelectionItem";
import Container from "@/@shared/ui/Container";
import ChevronLeft from "@/icons/ChevronLeft";
import ChevronRightAlt from "@/icons/ChevronRightAlt";

const FeatureSelectionItemContainer: FC = () => {
  const [features, setFeatures] = useState(featuresArr);
  const [activeFeature, setActiveFeature] = useState(
    features.find((f) => f.isActive) || features[0]
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const active = features.find((f) => f.isActive) || features[0];
    setActiveFeature(active);
  }, [JSON.stringify(features)]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scrollByAmount = 300;

  return (
    <>
      <div className="relative w-full max-w-[1400px] mx-auto my-10">
        {/* Fade left */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 h-full w-10 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent rounded-l-[60px]" />
        )}

        {/* Left Chevron */}
        {canScrollLeft && (
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({
                left: -scrollByAmount,
                behavior: "smooth",
              })
            }
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-white rounded-full shadow-md p-2"
          >
            <ChevronLeft />
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="overflow-x-auto w-full gap-10 no-scrollbar shadow-md bg-white rounded-[60px] h-[74px] flex items-center px-4"
        >
          {features.map((item, idx) => {
            const { image, copy, ...rest } = item;
            return (
              <FeatureSelectionItem
                {...rest}
                key={idx}
                onActive={(title) => {
                  setFeatures(
                    features.map((f) =>
                      f.title === title
                        ? { ...f, isActive: true }
                        : { ...f, isActive: false }
                    )
                  );
                }}
              />
            );
          })}
        </div>

        {/* Right Chevron */}
        {canScrollRight && (
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({
                left: scrollByAmount,
                behavior: "smooth",
              })
            }
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-white rounded-full shadow-md p-2"
          >
            <ChevronRightAlt />
          </button>
        )}

        {/* Fade right */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 h-full w-10 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent rounded-r-[60px]" />
        )}
      </div>

      {/* Active Feature Section */}
      <div
        className="min-h-[50vh]"
        style={{
          background:
            "linear-gradient(to bottom, #FFFFFF 0%, #B692EA66 60%, #B692EA66 40%, #FFFFFF 100%)",
        }}
      >
        <Container>
          <div className="w-full flex  flex-col md:flex-row">
            <div className="flex-1">
              <h2 className="text-xl text-[#2F004F] sm:text-2xl md:text-3xl lg:text-4xl font-semibold">
                {activeFeature.title}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mt-10 font-light text-[#737373]">
                {activeFeature.copy}
              </p>
            </div>
            <div className="flex-1 mt-10 md:mt-0">
              <div className="w-full max-w-[500px] mx-auto px-4">
                <img
                  src={activeFeature.image}
                  alt={activeFeature.title}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};

export default FeatureSelectionItemContainer;

const featuresArr = [
  {
    title: "MCQ's",
    isActive: true,
    copy: `Instantly generated from your uploaded files, these questions challenge learners to think critically while reinforcing key concepts.`,
    image: "/home/features/mcq.png",
  },
  {
    title: "Flashcards",
    isActive: false,
    copy: `Perfect for on-the-go reviews or quick study sessions, flashcards provide a proven way to enhance retention.`,
    image: "/home/features/flashcards.png",
  },
  {
    title: "Case studies",
    isActive: false,
    copy: `These question formats go beyond rote memorization; they encourage learners to apply theoretical knowledge to practical scenarios.`,
    image: "/home/features/case study.png",
  },
  {
    title: "Essay",
    isActive: false,
    copy: `Perfect for developing critical thinking and deeper analysis, essay questions let you demonstrate your understanding and express ideas in a clear, structured, and comprehensive way.`,
    image: "/home/features/essay.png",
  },
  {
    title: "Oral (Viva)",
    isActive: false,
    copy: `Oral viva assessments offer a dynamic evaluation method where learners verbally present their knowledge and understanding of a subject. Learners are able to playback their test conversations and evaluate their performance with valuable AI-driven insights.`,
    image: "/home/features/viva.png",
  },
  {
    title: "Performance overview",
    isActive: false,
    copy: `Get a clear picture of where you stand. Performance Overview analyzes your test results to highlight your strengths and pinpoint areas for improvement. With AI-driven insights, you’ll know exactly what to focus on to boost your scores and master challenging topics.`,
    image: "/home/features/performance overview.png",
  },
  {
    title: "AI discussions",
    isActive: false,
    copy: `Struggling to understand a concept? Smart discussions let you ask anything to help clarify concepts and break down complex topics —all in a way that makes sense.`,
    image: "/home/features/AI discussions.png",
  },
  {
    title: "Instant feedback",
    isActive: false,
    copy: `Get more than just a score! Instant feedback breaks down your test results with clear, insightful explanations on why each answer is right or wrong.`,
    image: "/home/features/instant feedback.png",
  },
];
