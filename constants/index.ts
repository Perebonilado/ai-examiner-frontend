export const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}`;

export const accessToken = "access_token";

export const milliSecondToSecondConversionRate = 1000;

export const alphabets = ["a", "b"];

export const mobileScreenSizePx = 768;

export const typeBasedRoutes: {
  route: string;
  type: "web" | "web_and_app";
}[] = [
  { route: "/", type: "web" },
  { route: "/questions/shared/multiple-choice/[id]", type: "web_and_app" },
  { route: "/questions/shared/flash-cards/[id]", type: "web_and_app" },
  { route: "/questions/shared/multiple-true-false/[id]", type: "web_and_app" },
  { route: "/pricing", type: "web_and_app" },
];

export const navLinks = [
  {
    title: "Home",
    link: "/",
  },
  // {
  //   title: "About Us",
  //   link: "/about-us",
  // },
  {
    title: "Pricing",
    link: "/pricing",
  },
];
