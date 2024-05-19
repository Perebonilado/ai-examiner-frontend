import { accessToken, milliSecondToSecondConversionRate } from "@/constants";
import Cookie from "js-cookie";

export const secondsToMilliSeconds = (seconds: number): number => {
  return seconds * milliSecondToSecondConversionRate;
};

export const logout = (callback?: () => any) => {
  Cookie.remove(accessToken);
  if (callback) callback();
};

export const generateAlphabets = (startChar: string, endChar: string) => {
  const alphabets = [];

  for (let i = startChar.charCodeAt(0); i <= endChar.charCodeAt(0); i++) {
    alphabets.push(String.fromCharCode(i));
  }

  return alphabets;
};

export const generateScoreColor = (percentage: number) => {
  switch (true) {
    case percentage >= 80:
      return {
        scoreColor: "green-600",
      } as const;
    case percentage >= 50 && percentage <= 79:
      return {
        scoreColor: "yellow-500",
      } as const;
    default:
      return {
        scoreColor: "red-500",
      } as const;
  }
};

export const capitalizeFirstLetterOfEachWord = (input: string): string => {
  const words = input.split(" ");

  const capitalizedWords = words.map((word) => {
    if (word.length > 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word;
  });

  return capitalizedWords.join(" ");
};
