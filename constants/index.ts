export const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}`;

export const accessToken = "access_token";

export const milliSecondToSecondConversionRate = 1000;

export const alphabets = ["a", "b"];

export const difficultyOptions = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium", defaultSelected: true },
  { label: "Hard", value: "hard" },
];

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
  { route: "/privacy-policy", type: "web_and_app" },
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

const allowedLanguages = [
  { name: "Afrikaans", code: "ZA" },
  { name: "Arabic", code: "SA" },
  { name: "Armenian", code: "AM" },
  { name: "Azerbaijani", code: "AZ" },
  { name: "Belarusian", code: "BY" },
  { name: "Bosnian", code: "BA" },
  { name: "Bulgarian", code: "BG" },
  { name: "Catalan", code: "ES" },
  { name: "Chinese", code: "CN" },
  { name: "Croatian", code: "HR" },
  { name: "Czech", code: "CZ" },
  { name: "Danish", code: "DK" },
  { name: "Dutch", code: "NL" },
  { name: "English", code: "GB" },
  { name: "Estonian", code: "EE" },
  { name: "Finnish", code: "FI" },
  { name: "French", code: "FR" },
  { name: "Galician", code: "ES" },
  { name: "German", code: "DE" },
  { name: "Greek", code: "GR" },
  { name: "Hebrew", code: "IL" },
  { name: "Hindi", code: "IN" },
  { name: "Hungarian", code: "HU" },
  { name: "Icelandic", code: "IS" },
  { name: "Indonesian", code: "ID" },
  { name: "Italian", code: "IT" },
  { name: "Japanese", code: "JP" },
  { name: "Kannada", code: "IN" },
  { name: "Kazakh", code: "KZ" },
  { name: "Korean", code: "KR" },
  { name: "Latvian", code: "LV" },
  { name: "Lithuanian", code: "LT" },
  { name: "Macedonian", code: "MK" },
  { name: "Malay", code: "MY" },
  { name: "Marathi", code: "IN" },
  { name: "Maori", code: "NZ" },
  { name: "Nepali", code: "NP" },
  { name: "Norwegian", code: "NO" },
  { name: "Persian", code: "IR" },
  { name: "Polish", code: "PL" },
  { name: "Portuguese", code: "PT" },
  { name: "Romanian", code: "RO" },
  { name: "Russian", code: "RU" },
  { name: "Serbian", code: "RS" },
  { name: "Slovak", code: "SK" },
  { name: "Slovenian", code: "SI" },
  { name: "Spanish", code: "ES" },
  { name: "Swahili", code: "KE" },
  { name: "Swedish", code: "SE" },
  { name: "Tagalog", code: "PH" },
  { name: "Tamil", code: "IN" },
  { name: "Thai", code: "TH" },
  { name: "Turkish", code: "TR" },
  { name: "Ukrainian", code: "UA" },
  { name: "Urdu", code: "PK" },
  { name: "Vietnamese", code: "VN" },
  { name: "Welsh", code: "GB" },
] as const;

type AllowedLanguageName = (typeof allowedLanguages)[number]["name"];

// const supportedLanguages: AllowedLanguageName[] = [
//   "Afrikaans",
//   "Tagalog",
//   "French",
//   "German",
//   "Spanish",
//   "Chinese",
//   "Hindi",
//   "Russian",
//   "Vietnamese",
//   "Italian",
//   "Hungarian",
//   "Swedish",
//   "Norwegian",
//   "Polish",
//   "Ukrainian",
//   "Danish",
//   "English",,
//   "Indonesian",
//   "Finnish"
// ];

export const getSupportedLanguages = () => {
  return allowedLanguages.filter(
    (lang) => true
    // supportedLanguages.includes(lang.name)
  );
};
