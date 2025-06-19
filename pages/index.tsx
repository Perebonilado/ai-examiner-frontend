import AppHead from "@/@shared/components/AppHead";
import FAQContainer from "@/@modules/home/FAQContainer";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  accessToken,
  guestAccessToken,
  hasUpgradedAccountInThePastToken,
} from "@/constants";
import { useRouter } from "next/router";
import SupportLeaningContainer from "@/@modules/home/SupportLeaningContainer";
import ContactTeamMemberContainer from "@/@modules/home/ContactTeamMemberContainer";
import NavbarV2 from "@/@shared/components/Navbar/NavbarV2";
import JumbotronV2 from "@/@modules/home/JumbotronV2";
import FeatureDisplaySection from "@/@modules/home/FeatureDisplay/FeatureDisplaySection";
import EasyReadIcon from "@/icons/EasyReadIcon";
import SummarizeIcon from "@/icons/SummarizeIcon";
import RelatedVideosIcon from "@/icons/RelatedVideosIcon";
import ExplainDefineIcon from "@/icons/ExplainDefineIcon";
import TwitterReviewContainer from "@/@modules/home/TwitterReviews/TwitterReviewContainer";
import Footer from "@/@shared/components/Footer";
import { useCreateGuestAccountMutation } from "@/api-services/auth.service";

export default function Home() {
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);

  const router = useRouter();

  useEffect(() => {
    handleRouteUserOnAuthenticated();
  }, []);

  useEffect(() => {
    if (userIsLoggedIn) {
      router.push("/new-document");
    }
  }, [userIsLoggedIn]);

  const handleRouteUserOnAuthenticated = () => {
    const token = Cookies.get(accessToken);

    if (token) {
      setUserIsLoggedIn(true);
    } else {
      setUserIsLoggedIn(false);
    }
  };

  const [isGoogleLoaded, setIsGoogleLoaded] = useState(true);

  const changeLanguage = (lang: string) => {
    if (!isGoogleLoaded) {
      console.warn("Google Translate is not ready yet.");
      return;
    }

    const selectElement =
      document.querySelector<HTMLSelectElement>(".goog-te-combo");
    console.log(selectElement);
    if (selectElement) {
      selectElement.value = lang;
      selectElement.dispatchEvent(new Event("change"));
    }
  };

  const languages = [
    { code: "en", label: "🇬🇧 English" },
    { code: "fr", label: "🇫🇷 French" },
    { code: "es", label: "🇪🇸 Spanish" },
    { code: "de", label: "🇩🇪 German" },
  ];

  const [createGuestAccount, { data }] = useCreateGuestAccountMutation();

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

  return (
    <>
      <AppHead />
      <section>
        <div
          style={{
            background:
              "linear-gradient(to bottom, #DFCBFA 34%, #F7F5F9 79%, #FFFFFF 95%)",
          }}
          className="sm:min-h-[100vh] flex flex-col"
        >
          <NavbarV2 />
          <div className="flex-1 flex flex-col items-center justify-center">
            <JumbotronV2 handleTryForFree={handleTryForFree} />
          </div>
        </div>
        <FeatureDisplaySection handleTryForFree={handleTryForFree} />
        <SupportLeaningContainer
          data={supportLearningData}
          handleTryForFree={handleTryForFree}
        />
        <TwitterReviewContainer handleTryForFree={handleTryForFree} />
        <ContactTeamMemberContainer />
        <FAQContainer />
      </section>
      <Footer />
    </>
  );
}

const supportLearningData = [
  {
    title: "Easy Read",
    body: "Simplify each page of your material into easier-to-understand language.",
    icon: <EasyReadIcon width={50} height={50} />,
  },
  {
    title: "Summaries",
    body: "Get a brief summary of key points from your material.",
    icon: <SummarizeIcon width={50} height={50} />,
  },
  {
    title: "Related videos",
    body: "Explore relevant online videos linked to your uploaded content for extra clarity and context.",
    icon: <RelatedVideosIcon />,
  },
  {
    title: "Explain, Simplify, Define.",
    body: "Highlight text in your material to simplify it, define key terms, and clarify confusing concepts.",
    icon: <ExplainDefineIcon />,
  },
];
