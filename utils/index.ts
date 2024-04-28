import { milliSecondToSecondConversionRate } from "@/constants";

export const secondsToMilliSeconds = (seconds: number): number => {
  return seconds * milliSecondToSecondConversionRate;
};

export const generateAlphabets = (startChar: string, endChar: string) => {
  const alphabets = [];

  for (let i = startChar.charCodeAt(0); i <= endChar.charCodeAt(0); i++) {
    alphabets.push(String.fromCharCode(i));
  }

  return alphabets;
};

export const generateScoreDescription = (percentage: number) => {
  switch (true) {
    case percentage > 90:
      return {
        image: "/90up.jpeg",
        message:
          "The emperor, the conqueror, the champion, the lion is here !!!",
        scoreColor: 'green'
      };
    case percentage >= 80 && percentage < 90:
      return {
        image: "/80-90.jpeg",
        message: "Clear road for who sabi !!!",
        scoreColor: 'green'
      };
    case percentage >= 70 && percentage < 80:
      return {
        image: "/70-80.jpeg",
        message: `Repeat after me, "I am doing well!"`,
        scoreColor: 'blue'
      };
    case percentage >= 50 && percentage < 70:
      return {
        image: "/50-69.jpeg",
        message: "I no go gree for anybody !!!",
        scoreColor: 'blue'
      };
    case percentage >= 30 && percentage < 50:
      return {
        image: "/30-49.jpeg",
        message: "Boss, sit up o!",
        scoreColor: 'red'
      };
    default:
      return {
        image: "/30 below.jpeg",
        message: "Problem no dey finish!",
        scoreColor: 'red'
      };
  }
};
