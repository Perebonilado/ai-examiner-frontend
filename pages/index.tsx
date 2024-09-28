import Jumbotron from "@/@modules/home/Jumbotron";
import AppHead from "@/@shared/components/AppHead";
import descriptionData from "../json-data/description.json";
import DescriptionItemContainer from "@/@modules/home/DescriptionItemContainer";
import TestKnowledge from "@/@modules/home/TestKnowledge";
import FAQContainer from "@/@modules/home/FAQContainer";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { accessToken } from "@/constants";
import { useRouter } from "next/router";
import WebLayout from "@/layouts/WebLayout";

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
      <DescriptionItemContainer data={descriptionData} />
      <TestKnowledge />
      <FAQContainer />
    </WebLayout>
  );
}
