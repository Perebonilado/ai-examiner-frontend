import React, { FC } from "react";
import TwitterReviewCard from "./TwitterReviewCard";
import s from "./styles.module.css";
import Container from "@/@shared/ui/Container";
import Link from "next/link";
import Button from "@/@shared/ui/Button";
import ArrowDiagonalRightIcon from "@/icons/ArrowDiagonalRightIcon";

const TwitterReviewContainer: FC = () => {
  const images = [1, 2, 3, 4, 5].map(
    (img) => `/home/twitter reviews/${img}.png`
  );

  return (
    <div
      style={{
        background:
          "linear-gradient(to bottom, #FFFFFF 0%, #B692EA66 60%, #B692EA66 40%, #FFFFFF 100%)",
      }}
      className="min-h-[500px]"
    >
      <Container>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-center text-[#2F004F] mb-10">
          What our users say
        </h2>
      </Container>
      <div className="relative w-full overflow-hidden py-6">
        <div className={`flex gap-8 ${s["animate-infinite-scroll"]}`}>
          {/* First set of images */}
          {images.map((img, idx) => (
            <TwitterReviewCard img={img} key={`first-${idx}`} />
          ))}
          {/* Second set for seamless loop */}
          {images.map((img, idx) => (
            <TwitterReviewCard img={img} key={`second-${idx}`} />
          ))}
        </div>
      </div>

      <div className="py-24 flex justify-center">
        <Link href={"/auth/login"}>
          <Button
            title="Try it now"
            size="large"
            endicon={<ArrowDiagonalRightIcon fill="#FFFFFF" />}
            className="!py-3 !px-8  !text-sm  !text-white !rounded-[50px] border border-[#2F004F] bg-[#2F004F] font-[600] "
          />
        </Link>
      </div>
    </div>
  );
};

export default TwitterReviewContainer;
