// Global interfaces for resume data used across the app

declare interface FeedbackTip {
  type: "good" | "improve";
  tip: string;
  explanation?: string;
}

declare interface FeedbackCategory {
  score: number; // 0-100
  tips: FeedbackTip[];
}

declare interface Feedback {
  overallScore: number; // 0-100
  ATS: FeedbackCategory;
  toneAndStyle: FeedbackCategory;
  content: FeedbackCategory;
  structure: FeedbackCategory;
  skills: FeedbackCategory;
}

declare interface Resume {
  id: string;
  companyName: string;
  jobTitle: string;
  imagePath: string;
  resumePath: string;
  feedback: Feedback;
}
