import type { InterviewSession, InterviewFeedback, InterviewTranscriptItem } from './types';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);


export const mockSessions: InterviewSession[] = [
  { id: 'session-1', role: 'Frontend Engineer', specialty: 'React', date: today.toISOString(), score: 8 },
  { id: 'session-2', role: 'Backend Engineer', specialty: 'Node.js', date: yesterday.toISOString(), score: 6 },
  { id: 'session-3', role: 'Data Scientist', specialty: 'Python', date: twoDaysAgo.toISOString(), score: 9 },
];

export const mockFeedbacks: Record<string, InterviewFeedback> = {
  'session-1': {
    id: 'feedback-1',
    sessionId: 'session-1',
    score: 8,
    strengths: 'Excellent problem-solving skills and clear communication. Your explanation of the React component lifecycle was thorough and accurate.',
    weaknesses: 'Could provide more depth on state management solutions for large-scale applications. The answer on testing strategies was a bit generic.',
    improvementTips: '1. Deep dive into advanced state management libraries like Redux Toolkit or Zustand. 2. Practice writing unit and integration tests for React components. 3. Try to articulate trade-offs when discussing technical choices.',
    transcript: [
      { type: 'question', content: 'Can you explain the virtual DOM in React?', timestamp: Date.now() - 100000 },
      { type: 'answer', content: 'The virtual DOM is a programming concept where a virtual representation of a UI is kept in memory and synced with the "real" DOM. This reconciliation process is what makes React efficient.', timestamp: Date.now() - 80000 },
      { type: 'question', content: 'What are React Hooks?', timestamp: Date.now() - 60000 },
      { type: 'answer', content: 'Hooks are functions that let you "hook into" React state and lifecycle features from function components. They allow you to use state and other React features without writing a class.', timestamp: Date.now() - 30000 },
    ],
  },
  'session-2': {
    id: 'feedback-2',
    sessionId: 'session-2',
    score: 6,
    strengths: 'Good understanding of RESTful API principles. Showed ability to write clean, asynchronous code using async/await.',
    weaknesses: 'Struggled with database schema design for a complex scenario. The system design question revealed gaps in understanding scalability.',
    improvementTips: '1. Review database normalization forms. 2. Study common system design patterns for scaling web services. 3. Practice explaining architectural decisions with clear diagrams and reasoning.',
    transcript: [
      { type: 'question', content: 'How would you handle authentication in a Node.js application?', timestamp: Date.now() - 100000 },
      { type: 'answer', content: 'I would use JWTs. After a user logs in, the server would generate a token and send it to the client. The client then sends this token in the Authorization header for subsequent requests.', timestamp: Date.now() - 80000 },
    ],
  },
  'session-3': {
    id: 'feedback-3',
    sessionId: 'session-3',
    score: 9,
    strengths: 'Deep knowledge of machine learning algorithms and statistical concepts. The code written for the data processing task was efficient and well-documented.',
    weaknesses: 'Could be more concise when explaining complex models. A bit of hesitation when discussing deployment and MLOps.',
    improvementTips: '1. Practice the STAR method to structure your answers. 2. Research common MLOps tools and workflows. 3. Prepare a 1-minute and a 5-minute explanation for your key projects.',
    transcript: [
      { type: 'question', content: 'What is the difference between classification and regression?', timestamp: Date.now() - 100000 },
      { type: 'answer', content: 'Classification is for predicting a discrete class label, like "spam" or "not spam". Regression is for predicting a continuous quantity, like the price of a house.', timestamp: Date.now() - 80000 },
    ],
  }
};

export const getSessions = async (): Promise<InterviewSession[]> => {
  // In a real app, this would check local storage or make a fetch request
  const savedSessions = localStorage.getItem('mockview-sessions');
  const allSessions = savedSessions ? [...mockSessions, ...JSON.parse(savedSessions)] : mockSessions;
  return Promise.resolve(allSessions);
};

export const getSession = async (id: string): Promise<InterviewSession | undefined> => {
  const allSessions = await getSessions();
  return Promise.resolve(allSessions.find(s => s.id === id));
};

export const getFeedback = async (sessionId: string): Promise<InterviewFeedback | undefined> => {
  // Check mock feedbacks first
  const feedbackId = Object.keys(mockFeedbacks).find(key => mockFeedbacks[key].sessionId === sessionId);
  if (feedbackId) {
    return Promise.resolve(mockFeedbacks[feedbackId]);
  }
  
  // Check local storage for dynamic feedbacks
  const savedFeedbacks = localStorage.getItem('mockview-feedbacks');
  if (savedFeedbacks) {
    const feedbacks = JSON.parse(savedFeedbacks) as Record<string, InterviewFeedback>;
    return Promise.resolve(feedbacks[sessionId]);
  }
  
  return Promise.resolve(undefined);
};

export const saveSession = async (session: Omit<InterviewSession, 'id'>, transcript: InterviewTranscriptItem[]): Promise<string> => {
  const sessionId = `session-${Date.now()}`;
  
  const newSession: InterviewSession = {
    ...session,
    id: sessionId,
  };

  const newFeedback: InterviewFeedback = {
    id: `feedback-${Date.now()}`,
    sessionId: sessionId,
    score: 0, // This will be updated by the AI feedback later
    strengths: '',
    weaknesses: '',
    improvementTips: '',
    transcript: transcript,
  };

  // Save session to local storage
  const savedSessions = localStorage.getItem('mockview-sessions');
  const sessions = savedSessions ? JSON.parse(savedSessions) : [];
  sessions.push(newSession);
  localStorage.setItem('mockview-sessions', JSON.stringify(sessions));

  // Save feedback transcript to local storage
  const savedFeedbacks = localStorage.getItem('mockview-feedbacks');
  const feedbacks = savedFeedbacks ? JSON.parse(savedFeedbacks) : {};
  feedbacks[sessionId] = newFeedback;
  localStorage.setItem('mockview-feedbacks', JSON.stringify(feedbacks));

  return Promise.resolve(sessionId);
};
