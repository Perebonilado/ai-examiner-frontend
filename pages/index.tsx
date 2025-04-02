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

    const selectElement = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    console.log(selectElement)
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
    <WebLayout>
      
      {/* <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 1000,
          background: "white",
          padding: "8px 12px",
          borderRadius: "8px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        {languages.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => changeLanguage(code)}
            disabled={!isGoogleLoaded}
            style={{
              margin: "5px",
              padding: "5px 10px",
              borderRadius: "5px",
              border: "none",
              background: isGoogleLoaded ? "#f5f5f5" : "#ddd",
              cursor: isGoogleLoaded ? "pointer" : "not-allowed",
              fontSize: "14px",
            }}
          >
            {label}
          </button>
        ))}
      </div> */}
      <AppHead />
      <Jumbotron />
      <HowItWorksItemContainer data={howItWorksData} />
      <SupportLeaningContainer data={supportLearningData} />
      <ContactTeamMemberContainer />
      <FAQContainer />
    </WebLayout>
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
