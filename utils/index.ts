import { accessToken, milliSecondToSecondConversionRate } from "@/constants";
import { LookUpModel } from "@/models/look-up.model";
import { PermissionModel } from "@/models/permission.model";
import Cookie from "js-cookie";
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { setLoading, setLoadingMessage } from "@/features/loaderSlice";
import { toast } from "react-toastify";
import { parse } from "ppt-parser";

export const baseQueryWithLogoutOnTokenExpiration = (
  baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
) => {
  return async (
    args: string | FetchArgs,
    api: any,
    extraOptions: {
      loadingMessage?: string;
      triggerLoading?: boolean;
    } = { loadingMessage: "", triggerLoading: true }
  ): Promise<any> => {
    if (extraOptions.loadingMessage) {
      api.dispatch(
        setLoadingMessage({ loadingMessage: extraOptions.loadingMessage })
      );
    }

    if (extraOptions.triggerLoading) {
      api.dispatch(setLoading({ loading: true }));
    }

    let result = await baseQuery(args, api, extraOptions);

    if (extraOptions.triggerLoading) {
      api.dispatch(setLoading({ loading: false }));
    }

    if (result.error) {
      if (result.error.status === 401) {
        logout(() => {
          window.location.pathname = "/auth/login";
        });
      } else if ("status" in result.error) {
        const { message } = result.error.data as { message: string };
        toast.error(message);
      } else {
        toast.error("Oops! Something went wrong");
      }
    }

    return result;
  };
};

export const getFileNameWithoutExtension = (name: string) => {
  return name.substring(0, name.lastIndexOf(".")) || name;
};

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
          scoreColor: "#89D152",
        } as const;
      case percentage >= 50 && percentage <= 79:
        return {
          scoreColor: "#EAB308",
        } as const;
      default:
        return {
          scoreColor: "#EE6161",
        } as const;
    }
  } else return { scoreColor: "#000000" } as const;
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
          subMessage: "You scored an excellent grade in this test ⭐",
        } as const;
      case percentage >= 50 && percentage <= 79:
        return {
          background: "#FEF08A",
          fill: "#ca8a04",
          message: "Needs Improvement",
          subMessage: "You're very close to becoming a pro 🚀",
        } as const;
      default:
        return {
          background: "#FECDD3",
          fill: "#EF4444",
          message: "Try Again",
          subMessage: "Let's give this another try 👏",
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

export const hyphenateString = (val: string) => {
  return val.replace(/ /g, "-");
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
  return byte * Math.pow(conversationRate, 2);
};

export const generateQustionCountOptions = (maxCount: number) => {
  if (maxCount <= 5) {
    return [
      { label: `${maxCount}`, value: `${maxCount}`, defaultSelected: true },
    ];
  }

  const countsArr: number[] = [5];
  const incrementVal = 5;

  while (countsArr[countsArr.length - 1] + incrementVal < maxCount) {
    countsArr.push(countsArr[countsArr.length - 1] + incrementVal);
  }

  countsArr.push(maxCount);

  const options = countsArr.map((item, idx) => {
    if (idx === 0) {
      return { label: `${item}`, value: `${item}`, defaultSelected: true };
    }

    return { label: `${item}`, value: `${item}` };
  });

  return options;
};

export const getQuestionTypeBasedOnPermission = (
  permissions: PermissionModel,
  questionTypes?: LookUpModel[]
) => {
  if (questionTypes) {
    const multipleChoiceOption = questionTypes.find(
      (q) => q.label === "Multiple Choice"
    )?.label as string;
    const flashCardsOption = questionTypes.find(
      (q) => q.label === "Flash Cards"
    )?.label as string;

    return questionTypes.filter((q) => {
      if (q.label === multipleChoiceOption) {
        if (permissions.canGenerateMultipleChoice && multipleChoiceOption) {
          return multipleChoiceOption;
        }
      } else {
        if (permissions.canGenerateFlashcards && flashCardsOption) {
          return flashCardsOption;
        }
      }
    });
  }

  return [];
};

export const removeHyphens = (input: string): string =>
  input.replace(/-/g, " ");

export const capitalizeWords = (input: string): string =>
  input.replace(/\b\w/g, (char) => char.toUpperCase());

export const convertPPTFilesToText = async (file: File) => {
  try {
    const reader = new FileReader();
    const  options  =  { 
      slideFactor : 75  /  914400 ,  // Slide size conversion factor, default 96 / 914400 
      fontsizeFactor : 100  /  96 ,  // Font size conversion factor, default 100 / 75 
    }
    console.log('called')
    reader.onload = async () => {
      const json = await parse(file, options);
      console.log(json);
    };
    reader.readAsArrayBuffer(file)
  } catch (error) {
    console.log(error)
    toast.error("Error converting file");
  }
};
