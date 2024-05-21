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

export const generateScoreColor = (percentage: number | null) => {
  if (percentage !== null) {
    switch (true) {
      case percentage >= 80:
        return {
          scoreColor: "#16A34A",
        } as const;
      case percentage >= 50 && percentage <= 79:
        return {
          scoreColor: "#EAB308",
        } as const;
      default:
        return {
          scoreColor: "#EF4444",
        } as const;
    }
  } else return { scoreColor: "#F1F1F1" } as const;
};

export const generateDocumentCardColorFromScore = (
  percentage: number | null
) => {
  if (percentage !== null) {
    switch (true) {
      case percentage >= 80:
        return {
          background: "#BBF7D0",
          fill: "#16a34a",
          message: "Excellent Work",
          subMessage: "You scored an excellent grade in this test ⭐"
        } as const;
      case percentage >= 50 && percentage <= 79:
        return {
          background: "#FEF08A",
          fill: "#ca8a04",
          message: "Needs Improvement",
          subMessage: "You're very close to becoming a pro 🚀"
        } as const;
      default:
        return {
          background: "#FECDD3",
          fill: "#EF4444",
          message: "Try Again",
          subMessage: "Let's give this another try 👏"
        } as const;
    }
  } else return { background: "#F3F4F6", fill: "#BCBCBD" } as const;
};

export const replaceHyphensWithSpaces = (inputString: string): string => {
  return inputString.replace(/-/g, " ");
};

export const capitalizeFirstLetterOfEachWordInString = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
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

export const getRandomNumberInRange = (
  startRange: number,
  endRange: number
): number => {
  if (startRange > endRange) {
    throw new Error("startRange should be less than or equal to endRange");
  }
  const randomDecimal = Math.random();
  const randomNumber =
    Math.floor(randomDecimal * (endRange - startRange + 1)) + startRange;
  return randomNumber;
};

export const convertMegaBytesToBytes = (byte: number): number => {
  const conversationRate = 1024;
  return byte * Math.pow(conversationRate, 2)
};
