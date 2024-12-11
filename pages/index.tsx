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
  return (
    <WebLayout>
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
