import { milliSecondToSecondConversionRate } from "@/constants";

export const secondsToMilliSeconds = (seconds: number): number => {
  return seconds * milliSecondToSecondConversionRate;
};
