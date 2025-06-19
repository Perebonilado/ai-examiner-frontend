import Container from "@/@shared/ui/Container";
import React, { FC, useEffect } from "react";
import ReviewItem from "./ReviewItem";
import StatisticsContainer from "./StatisticsContainer";
import Cookies from "js-cookie";
import {
  accessToken,
  guestAccessToken,
  hasUpgradedAccountInThePastToken,
} from "@/constants";
import { useCreateGuestAccountMutation } from "@/api-services/auth.service";
import { useRouter } from "next/router";

const ReviewsContainer: FC = () => {
  const [createGuestAccount, { data }] = useCreateGuestAccountMutation();
  const router = useRouter();
  const handleTryForFree = () => {
    const guestToken = Cookies.get(guestAccessToken);
    const userHasUsedGuestAccountAndUpgradedBefore = Cookies.get(
      hasUpgradedAccountInThePastToken
    );
    if (userHasUsedGuestAccountAndUpgradedBefore) {
      router.push("/auth/login");
      return;
    }

    if (guestToken) {
      Cookies.set(accessToken, guestToken, {
        expires: 365,
        secure: !`${process.env.NEXT_PUBLIC_BASE_URL}`.includes("localhost"),
      });
      router.push("/new-document");
    } else {
      createGuestAccount(undefined);
    }
  };
  useEffect(() => {
    if (data) {
      Cookies.set(guestAccessToken, data.data.token, {
        expires: 365,
        secure: !`${process.env.NEXT_PUBLIC_BASE_URL}`.includes("localhost"),
      });
      Cookies.set(accessToken, data.data.token, {
        expires: 365,
        secure: !`${process.env.NEXT_PUBLIC_BASE_URL}`.includes("localhost"),
      });
      router.push("/new-document");
    }
  }, [data]);
  return (
    <div className="bg-[#FAFAFA]">
      <Container>
        <section className="pb-28">
          <h3 className="text-4xl font-bold text-[#2F004F] text-center">
            Trusted by students all over the world
          </h3>
          <p className="mt-6 text-center w-full max-w-[600px] mx-auto">
            Thousands of students and professionals are beginning to rethink how
            they learn and prepare for their tests, exams, interviews, dream
            jobs and so much more!
          </p>

          <div className="mt-10">
            <StatisticsContainer />
          </div>

          <div className="mt-20 flex items-center justify-between w-full max-w-[1100px] max-md:justify-center gap-8 flex-wrap mx-auto">
            <ReviewItem
              review="Tried it and just subscribed to premium. This is a lifesaver. Thank you"
              fullname="Omotola"
            />
            <ReviewItem
              review="This is innovation at its finest. Medical students know how valuable this site is. Thank you!"
              fullname="Aikhenomian Paul"
            />
            <ReviewItem
              review="I just uploaded an ECG textbook and asked it to generate flash cards and it did perfectly. It can even read the questions for you."
              fullname="Orobo, MD"
            />
          </div>

          <div className="mt-24 flex flex-col items-center justify-center gap-6">
            <h3 className="text-[#2F004F] text-3xl font-bold text-center">
              Start free, upgrade anytime
            </h3>

            <div className="inline-block mt-20 mb-40 rounded-[50px] bg-gradient-to-r from-[#9333EA] to-[#F89AEE] p-[4px]">
              <button
                className="py-5 px-12 text-sm bg-[#2F004F] text-white rounded-[50px]"
                onClick={handleTryForFree}
              >
                Get started
              </button>
            </div>

            {/* <Link href={"/new-document"}>
              <Button
                title="Get started"
                size="large"
                endicon={<ArrowDiagonalRightIcon fill="#FFFFFF" />}
              />
            </Link> */}
          </div>
        </section>
      </Container>
    </div>
  );
};

export default ReviewsContainer;
