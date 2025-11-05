export type InterviewTranscriptItem = {
  type: 'question' | 'answer';
  content: string;
  timestamp: number;
};

export interface InterviewSession {
  id: string;
  role: string;
  specialty: string;
  date: string; // ISO 8601 format
  score?: number;
}

export interface InterviewFeedback {
  id: string;
  sessionId: string;
  score: number;
  strengths: string;
  weaknesses: string;
  improvementTips: string;
  transcript: InterviewTranscriptItem[];
}
