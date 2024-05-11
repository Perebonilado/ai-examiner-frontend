import GenerateMCQFormContainer from "@/@modules/home/GenerateMCQFormContainer";
import MCQContainer from "@/@modules/home/MCQContainer";
import AppLayout from "@/layouts/AppLayout";
import { NextPage } from "next";
import React, { useState } from "react";

const Practice: NextPage = () => {
  const [isFormView, setIsFormView] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const handleFile = (file: File | null) => {
    setFile(file);
  };
  return (
    <AppLayout>
      <h1 className="text-center mb-6 text-xl font-semibold">
        Zoo 101 Multiple Choice Questions
      </h1>
      <div>
        <MCQContainer
          data={questions}
          handeGenerateNewQuestions={() => setIsFormView(true)}
        />
      </div>
    </AppLayout>
  );
};

export default Practice;

const questions = [
  {
    id: "1",
    question:
      "Which local anesthetic is primarily metabolized in the liver by CYP3A4 to pipecolylxylidine?",
    options: [
      {
        value: "Lidocaine",
        id: "1",
      },
      {
        value: "Bupivacaine",
        id: "2",
      },
      {
        value: "Chloroprocaine",
        id: "3",
      },
      {
        value: "Procaine",
        id: "4",
      },
    ],
    correctAnswerId: "2",
    answerId: "2",
    explanation:
      "Bupivacaine is primarily metabolized in the liver by CYP3A4 to pipecolylxylidine, which is then glucuronidated and excreted【4:1†source】.",
  },
  {
    id: "2",
    question:
      "Which local anesthetic has been reported to exhibit increased systemic toxicity due to its slow metabolism compared to other commonly used ester local anesthetics?",
    options: [
      {
        value: "Bupivacaine",
        id: "1",
      },
      {
        value: "Chloroprocaine",
        id: "2",
      },
      {
        value: "Procaine",
        id: "3",
      },
      {
        value: "Tetracaine",
        id: "4",
      },
    ],
    correctAnswerId: "4",
    answerId: "4",
    explanation:
      "Tetracaine is reported to exhibit increased systemic toxicity because it is more slowly metabolized than other commonly used ester local anesthetics【4:2†source】.",
  },
  {
    id: "3",
    question:
      "Which local anesthetic is known for its long duration of action and greater tendency to provide sensory rather than motor block?",
    options: [
      {
        value: "Lidocaine",
        id: "1",
      },
      {
        value: "Bupivacaine",
        id: "2",
      },
      {
        value: "Chloroprocaine",
        id: "3",
      },
      {
        value: "Ropivacaine",
        id: "4",
      },
    ],
    correctAnswerId: "2",
    answerId: "2",
    explanation:
      "Bupivacaine is known for its long duration of action and tendency to provide more sensory than motor block, making it popular for prolonged analgesia during labor【4:1†source】.",
  },
  {
    id: "4",
    question:
      "Which local anesthetic structure is similar to that of lidocaine but with an amine-containing group that is a butyl piperidine?",
    options: [
      {
        value: "Lidocaine",
        id: "1",
      },
      {
        value: "Bupivacaine",
        id: "2",
      },
      {
        value: "Chloroprocaine",
        id: "3",
      },
      {
        value: "Ropivacaine",
        id: "4",
      },
    ],
    correctAnswerId: "4",
    answerId: "4",
    explanation:
      "The local anesthetic structure similar to that of lidocaine but with an amine-containing group that is a butyl piperidine is Ropivacaine【4:2†source】.",
  },
  {
    id: "5",
    question:
      "Which local anesthetic has been developed as a less-toxic alternative to bupivacaine and is known for being even more motor-sparing than bupivacaine?",
    options: [
      {
        value: "Lidocaine",
        id: "1",
      },
      {
        value: "Chloroprocaine",
        id: "2",
      },
      {
        value: "Procaine",
        id: "3",
      },
      {
        value: "Ropivacaine",
        id: "4",
      },
    ],
    correctAnswerId: "4",
    answerId: "4",
    explanation:
      "Ropivacaine has been developed as a less-toxic alternative to bupivacaine and is suitable for both epidural and regional anesthesia with a duration of action similar to bupivacaine, and it seems to be even more motor-sparing than bupivacaine【4:2†source】.",
  },
];
