import Jumbotron from "@/@modules/home/Jumbotron";
import AppHead from "@/@shared/components/AppHead";
import TestKnowledge from "@/@modules/home/TestKnowledge";
import FAQContainer from "@/@modules/home/FAQContainer";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { accessToken } from "@/constants";
import { useRouter } from "next/router";
import WebLayout from "@/layouts/WebLayout";
import HowItWorksItemContainer from "@/@modules/home/HowItWorksItemContainer";
import howItWorksData from "../json-data/how-it-works.json";
import SupportLeaningContainer from "@/@modules/home/SupportLeaningContainer";
import FlashcardsIcon from "@/icons/FlashcardsIcon";
import MCQIcon from "@/icons/MCQIcon";
import TopicsIcon from "@/icons/TopicsIcon";
import ContactTeamMemberContainer from "@/@modules/home/ContactTeamMemberContainer";
import CaseStudyIcon from "@/icons/CaseStudyIcon";
import NavbarV2 from "@/@shared/components/Navbar/NavbarV2";
import JumbotronV2 from "@/@modules/home/JumbotronV2";
import FeatureDisplaySection from "@/@modules/home/FeatureDisplay/FeatureDisplaySection";

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
          <NavbarV2  />
          <div className="flex-1 flex flex-col items-center justify-center">
            <JumbotronV2 />
          </div>
        </div>
        <HowItWorksItemContainer data={howItWorksData} />
        <FeatureDisplaySection />
        {/* <SupportLeaningContainer data={supportLearningData} /> */}
        <ContactTeamMemberContainer />
        <FAQContainer />
      </section>
    </>
  );
}

const supportLearningData = [
  {
    title: "Flashcards",
    body: "Perfect for on-the-go reviews or quick study sessions, they provide a proven way to enhance retention.",
    icon: <FlashcardsIcon />,
  },
  {
    title: "Multiple Choice Questions",
    body: "Instantly generated from your uploaded files, these questions challenge learners to think critically while reinforcing key concepts.",
    icon: <MCQIcon />,
  },
  {
    title: "AI Generated Topics",
    body: "Our AI generates personalized topic suggestions, making it easy for you to quiz yourself on areas that matter most.",
    icon: <TopicsIcon />,
  },
  {
    title: "Case Study Questions",
    body: "These questions go beyond rote memorization, encouraging critical thinking and problem-solving by presenting complex, practical cases.",
    icon: <CaseStudyIcon />,
  },
];
