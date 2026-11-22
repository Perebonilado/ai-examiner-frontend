import AppHead from "@/@shared/components/AppHead";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import cn from "classnames";
import { accessToken } from "@/constants";
import { useRouter } from "next/router";
import { quicksand } from "@/@shared/components/site/fonts";
import { siteFontClass, sitePalette } from "@/@shared/components/site/siteTheme";
import SiteHeader from "@/@shared/components/site/SiteHeader";
import HomeHero from "@/@modules/home/redesign/HomeHero";
import SmartTests from "@/@modules/home/redesign/SmartTests";
import StudyTools from "@/@modules/home/redesign/StudyTools";
import HomeReviews from "@/@modules/home/redesign/HomeReviews";
import HomeFaq from "@/@modules/home/redesign/HomeFaq";
import HomeClose from "@/@modules/home/redesign/HomeClose";

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
    <>
      <AppHead />
      <div
        style={sitePalette}
        className={cn(
          siteFontClass,
          quicksand.variable,
          "min-h-screen bg-white text-[var(--hk)] [&_::selection]:bg-[var(--hcream)]"
        )}
      >
        <SiteHeader />
        <main>
          <HomeHero />
          <SmartTests />
          <StudyTools />
          <HomeReviews />
          <HomeFaq />
        </main>
        <HomeClose />
      </div>
    </>
  );
}
