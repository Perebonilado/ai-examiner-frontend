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

export const DEFAULT_LANGUAGE_ENGLISH_KEY = "default_lang_english";

export const GOOGLE_TRANSLATE_KEY = "googtrans";

export const getSupportedLanguages = () => {
  return allowedLanguages.filter(
    (lang) => true
    // supportedLanguages.includes(lang.name)
  );
};

export const allLanguages = [
  { name: "Afrikaans", flag: "ZA", code: "af" },
  { name: "Arabic", flag: "SA", code: "ar" },
  { name: "Armenian", flag: "AM", code: "hy" },
  { name: "Azerbaijani", flag: "AZ", code: "az" },
  { name: "Belarusian", flag: "BY", code: "be" },
  { name: "Bosnian", flag: "BA", code: "bs" },
  { name: "Bulgarian", flag: "BG", code: "bg" },
  { name: "Catalan", flag: "ES", code: "ca" },
  { name: "Chinese (Mandarin)", flag: "CN", code: "zh-CN" },
  { name: "Croatian", flag: "HR", code: "hr" },
  { name: "Czech", flag: "CZ", code: "cs" },
  { name: "Danish", flag: "DK", code: "da" },
  { name: "Dutch", flag: "NL", code: "nl" },
  { name: "English", flag: "GB", code: "en" },
  { name: "Estonian", flag: "EE", code: "et" },
  { name: "Finnish", flag: "FI", code: "fi" },
  { name: "French", flag: "FR", code: "fr" },
  { name: "Galician", flag: "ES", code: "gl" },
  { name: "German", flag: "DE", code: "de" },
  { name: "Greek", flag: "GR", code: "el" },
  { name: "Hebrew", flag: "IL", code: "he" },
  { name: "Hindi", flag: "IN", code: "hi" },
  { name: "Hungarian", flag: "HU", code: "hu" },
  { name: "Icelandic", flag: "IS", code: "is" },
  { name: "Indonesian", flag: "ID", code: "id" },
  { name: "Italian", flag: "IT", code: "it" },
  { name: "Japanese", flag: "JP", code: "ja" },
  { name: "Kannada", flag: "IN", code: "kn" },
  { name: "Kazakh", flag: "KZ", code: "kk" },
  { name: "Korean", flag: "KR", code: "ko" },
  { name: "Latvian", flag: "LV", code: "lv" },
  { name: "Lithuanian", flag: "LT", code: "lt" },
  { name: "Macedonian", flag: "MK", code: "mk" },
  { name: "Malay", flag: "MY", code: "ms" },
  { name: "Malayalam", flag: "IN", code: "ml" },
  { name: "Marathi", flag: "IN", code: "mr" },
  { name: "Nepali", flag: "NP", code: "ne" },
  { name: "Norwegian", flag: "NO", code: "no" },
  { name: "Persian", flag: "IR", code: "fa" },
  { name: "Polish", flag: "PL", code: "pl" },
  { name: "Portuguese", flag: "PT", code: "pt" },
  { name: "Punjabi", flag: "IN", code: "pa" },
  { name: "Romanian", flag: "RO", code: "ro" },
  { name: "Russian", flag: "RU", code: "ru" },
  { name: "Serbian", flag: "RS", code: "sr" },
  { name: "Sinhala", flag: "LK", code: "si" },
  { name: "Slovak", flag: "SK", code: "sk" },
  { name: "Slovenian", flag: "SI", code: "sl" },
  { name: "Spanish", flag: "ES", code: "es" },
  { name: "Swahili", flag: "KE", code: "sw" },
  { name: "Swedish", flag: "SE", code: "sv" },
  { name: "Tamil", flag: "IN", code: "ta" },
  { name: "Telugu", flag: "IN", code: "te" },
  { name: "Thai", flag: "TH", code: "th" },
  { name: "Turkish", flag: "TR", code: "tr" },
  { name: "Ukrainian", flag: "UA", code: "uk" },
  { name: "Urdu", flag: "PK", code: "ur" },
  { name: "Vietnamese", flag: "VN", code: "vi" },
] as const;
