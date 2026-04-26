export type Question = {
  question: string;
  options: string[];
  answer: string;
  difficulty: "easy" | "moderate" | "hard";
};

export const questions: Question[] = [
  // ================= EASY =================
  {
    question: "What does AMR stand for?",
    options: [
      "Antimicrobial Reduction",
      "Antimicrobial Resistance",
      "Antibiotic Molecular Reaction",
      "Anti-Metabolic Response",
    ],
    answer: "Antimicrobial Resistance",
    difficulty: "easy",
  },
  {
    question: "Which organism can develop antimicrobial resistance?",
    options: [
      "Bacteria",
      "Viruses",
      "Fungi",
      "All of the above",
    ],
    answer: "All of the above",
    difficulty: "easy",
  },
  {
    question: "Antibiotics are used to treat:",
    options: [
      "Bacterial infections",
      "Viral infections",
      "Genetic diseases",
      "Allergies",
    ],
    answer: "Bacterial infections",
    difficulty: "easy",
  },
  {
    question: "Misusing antibiotics can cause antibiotic resistance.",
    options: ["True", "False"],
    answer: "True",
    difficulty: "easy",
  },
  {
    question: "You should stop taking antibiotics once you feel better.",
    options: ["True", "False"],
    answer: "False",
    difficulty: "easy",
  },

  // ================= MODERATE =================
  {
    question: "Which of the following accelerates AMR the most?",
    options: [
      "Good hand hygiene",
      "Overuse of antibiotics in humans",
      "Drinking clean water",
      "Eating vegetables",
    ],
    answer: "Overuse of antibiotics in humans",
    difficulty: "moderate",
  },
  {
    question: "What is a superbug?",
    options: [
      "A very large bacterium",
      "A bacteria resistant to multiple antibiotics",
      "A genetically engineered medicine",
      "A type of beneficial microbe",
    ],
    answer: "A bacteria resistant to multiple antibiotics",
    difficulty: "moderate",
  },
  {
    question: "AMR can spread between animals, humans and the environment.",
    options: ["True", "False"],
    answer: "True",
    difficulty: "moderate",
  },
  {
    question: "Which sector contributes significantly to AMR besides human medicine?",
    options: [
      "Agriculture and livestock",
      "Astronomy",
      "Engineering",
      "Tourism",
    ],
    answer: "Agriculture and livestock",
    difficulty: "moderate",
  },
  {
    question: "Which is an example of an antibiotic-resistant bacteria?",
    options: [
      "Salmonella",
      "MRSA",
      "Lactobacillus",
      "E. coli K-12",
    ],
    answer: "MRSA",
    difficulty: "moderate",
  },

  // ================= HARD =================
  {
    question: "AMR gene exchange can happen in wastewater treatment plants.",
    options: ["True", "False"],
    answer: "True",
    difficulty: "hard",
  },
  {
    question: "Which global organisation leads AMR surveillance?",
    options: [
      "UNESCO",
      "WHO",
      "NASA",
      "IMF",
    ],
    answer: "WHO",
    difficulty: "hard",
  },
  {
    question: 'The "One Health" approach focuses on:',
    options: [
      "Human health only",
      "Animal health only",
      "Human–animal–environment connection",
      "Plant genetics",
    ],
    answer: "Human–animal–environment connection",
    difficulty: "hard",
  },
  {
    question: "Which is NOT an AMR prevention measure?",
    options: [
      "Completing prescribed antibiotics",
      "Avoiding unnecessary antibiotic use",
      "Using antibiotics for viral infections",
      "Practicing infection control measures",
    ],
    answer: "Using antibiotics for viral infections",
    difficulty: "hard",
  },
  {
    question: "New antibiotics are being developed rapidly to keep up with resistance.",
    options: ["True", "False"],
    answer: "False",
    difficulty: "hard",
  },
  {
    question: 'The following are examples of the "One Health" approach EXCEPT:',
    options: [
      "Improving antibiotic stewardship",
      "Enhancing surveillance",
      "Implementing policies across healthcare, agriculture, and environmental sectors",
      "Promoting loss of infection control",
    ],
    answer: "Promoting loss of infection control",
    difficulty: "hard",
  },

  // ================= SITUATIONAL (HARD) =================
  {
    question:
      "A farmer uses antibiotics daily to reduce disease rate in chickens. What is the best recommendation?",
    options: [
      "Continue, because animals grow healthier",
      "Stop and adopt proper vaccination with proper hygiene",
      "Increase doses for better growth",
      "Sell resistant animals quickly",
    ],
    answer: "Stop and adopt proper vaccination with proper hygiene",
    difficulty: "hard",
  },
  {
    question:
      "You are prescribed 5 days of antibiotics for a UTI. After 2 days, symptoms improve. What should you do?",
    options: [
      "Stop immediately",
      "Save leftovers for next time",
      "Continue and finish the antibiotics",
      "Share with a friend who feels sick",
    ],
    answer: "Continue and finish the antibiotics",
    difficulty: "hard",
  },
  {
    question:
      "You throw unused antibiotics into the sink or flush it into the toilet. What could happen?",
    options: [
      "Nothing",
      "Water contamination leading to AMR spread",
      "Water becomes cleaner",
      "Helps reduce bacteria",
    ],
    answer: "Water contamination leading to AMR spread",
    difficulty: "hard",
  },
  {
    question:
      "A doctor notices that a patient’s infection does not respond to multiple antibiotics. What is the most likely issue?",
    options: [
      "Viral infection",
      "AMR infection",
      "Patient is immune",
      "Wrong food consumption",
    ],
    answer: "AMR infection",
    difficulty: "hard",
  },
  {
    question:
      "You have a mild cold and runny nose. Your friend suggests taking leftover antibiotics. What should you do?",
    options: [
      "Take the antibiotics",
      "Wait and see a doctor if needed",
      "Double the dose to recover faster",
      "Share the antibiotics with friends",
    ],
    answer: "Wait and see a doctor if needed",
    difficulty: "hard",
  },
];