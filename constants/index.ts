export const API_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}`;

export const milliSecondToSecondConversionRate = 1000;

export const alphabets = [
    'a',
    'b'
]

export const mockQuestions = [
  {
    id: "1",
    question: "What is the major mechanism of local anesthetics?",
    options: [
      {
        value: "Blocking gamma-aminobutyric acid (GABA) receptors",
        id: "a",
      },
      {
        value: "Blocking calcium ion channels",
        id: "b",
      },
      {
        value: "Interacting with specific binding sites within the Na+ channel",
        id: "c",
      },
      {
        value: "Modulating potassium ion efflux",
        id: "d",
      },
    ],
    correctAnswerId: "c",
    explanation:
      "Local anesthetics interact with specific binding sites within the Na+ channel, which is their primary mechanism of action【4:6†source】.",
  },
  {
    id: "2",
    question:
      "What determines the duration of action of a local anesthetic like Bupivacaine?",
    options: [
      {
        value: "The pH of the solution",
        id: "a",
      },
      {
        value: "Protein binding percentage",
        id: "b",
      },
      {
        value: "Rate of renal filtration",
        id: "c",
      },
      {
        value: "The size of the administered dose",
        id: "d",
      },
    ],
    correctAnswerId: "b",
    explanation:
      "The duration of action is determined by the protein binding percentage, with Bupivacaine having a high binding rate of 95%【4:6†source】.",
  },
  {
    id: "3",
    question:
      "What is a unique side effect associated with Bupivacaine compared to other local anesthetics?",
    options: [
      {
        value: "Liver toxicity",
        id: "a",
      },
      {
        value: "Cardiotoxicity",
        id: "b",
      },
      {
        value: "Renal impairment",
        id: "c",
      },
      {
        value: "Neurotoxicity",
        id: "d",
      },
    ],
    correctAnswerId: "b",
    explanation:
      "Bupivacaine is more cardiotoxic than equieffective doses of other local anesthetics like lidocaine【4:7†source】.",
  },
  {
    id: "4",
    question: "How is cocaine used clinically?",
    options: [
      {
        value: "As a systemic anesthetic for surgeries",
        id: "a",
      },
      {
        value:
          "Primarily for topical anesthesia of the upper respiratory tract",
        id: "b",
      },
      {
        value: "For epidural anesthesia in obstetrics",
        id: "c",
      },
      {
        value: "As a central nervous system stimulant in critical care",
        id: "d",
      },
    ],
    correctAnswerId: "b",
    explanation:
      "Cocaine is used clinically primarily for topical anesthesia of the upper respiratory tract【4:2†source】.",
  },
  {
    id: "5",
    question:
      "What property of local anesthetics allows them to block nerve conduction?",
    options: [
      {
        value: "Ability to dissolve in lipids",
        id: "a",
      },
      {
        value: "Ability to act as a weak base",
        id: "b",
      },
      {
        value: "Ability to bind calcium ions",
        id: "c",
      },
      {
        value: "Inhibition of protein synthesis",
        id: "d",
      },
    ],
    correctAnswerId: "a",
    explanation:
      "Local anesthetics block nerve conduction by their ability to dissolve in lipids, enabling them to enter the nerve cell membrane【4:0†source】.",
  },
  {
    id: "6",
    question:
      "What effect does adding epinephrine to a local anesthetic solution have?",
    options: [
      {
        value: "Decreases the rate of absorption, reducing toxicity",
        id: "a",
      },
      {
        value: "Increases the rate of absorption, increasing potency",
        id: "b",
      },
      {
        value: "Reduces the protein binding of the anesthetic",
        id: "c",
      },
      {
        value: "Enhances renal clearance of the anesthetic",
        id: "d",
      },
    ],
    correctAnswerId: "a",
    explanation:
      "Adding epinephrine to a local anesthetic solution decreases the rate of absorption, thereby decreasing the probability of toxicity【4:2†source】.",
  },
  {
    id: "7",
    question:
      "What demographic condition enhances the cardiotoxic effects of Bupivacaine?",
    options: [
      {
        value: "Obesity",
        id: "a",
      },
      {
        value: "Coexisting acidosis, hypercarbia, and hypoxemia",
        id: "b",
      },
      {
        value: "Pediatric age group",
        id: "c",
      },
      {
        value: "Elderly patients",
        id: "d",
      },
    ],
    correctAnswerId: "b",
    explanation:
      "The severity of Bupivacaine-induced cardiac toxicity is enhanced by coexisting conditions such as acidosis, hypercarbia, and hypoxemia【4:3†source】.",
  },
  {
    id: "8",
    question:
      "Which local anesthetic has a rapid onset and is primarily used topically due to its potential for neurotoxicity in certain forms?",
    options: [
      {
        value: "Lidocaine",
        id: "a",
      },
      {
        value: "Bupivacaine",
        id: "b",
      },
      {
        value: "Chloroprocaine",
        id: "c",
      },
      {
        value: "Tetracaine",
        id: "d",
      },
    ],
    correctAnswerId: "c",
    explanation:
      "Chloroprocaine has a rapid onset and is used primarily topically; earlier forms had potential for neurotoxicity, corrected in newer formulations【4:7†source】.",
  },
  {
    id: "9",
    question:
      "What is the molecular structure feature common to local anesthetics that influences their potency?",
    options: [
      {
        value: "Presence of a carboxylic acid group",
        id: "a",
      },
      {
        value: "Presence of a butyl piperidine group in amides",
        id: "b",
      },
      {
        value: "Presence of a lipophilic aromatic group",
        id: "c",
      },
      {
        value: "Attachment of a glucose moiety",
        id: "d",
      },
    ],
    correctAnswerId: "c",
    explanation:
      "The presence of a lipophilic aromatic group in local anesthetics contributes to their potency by facilitating their interaction with the lipid membrane of nerve cells【4:0†source】.",
  },
  {
    id: "10",
    question:
      "What is the main advantage of using Bupivacaine over Lidocaine in certain clinical situations?",
    options: [
      {
        value: "Lower cardiotoxicity",
        id: "a",
      },
      {
        value: "Shorter duration of action",
        id: "b",
      },
      {
        value: "Greater sensory than motor block",
        id: "c",
      },
      {
        value: "Faster onset of action",
        id: "d",
      },
    ],
    correctAnswerId: "c",
    explanation:
      "Bupivacaine is often preferred over Lidocaine in certain clinical situations for its greater sensory than motor block, making it suitable for prolonged analgesia, such as during labor【4:7†source】.",
  },
];
