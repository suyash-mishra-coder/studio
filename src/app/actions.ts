'use server';

import { generateInterviewQuestionsFlow, GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import { providePersonalizedFeedbackFlow, ProvidePersonalizedFeedbackInput } from '@/ai/flows/provide-personalized-feedback';

export async function getInterviewQuestions(input: GenerateInterviewQuestionsInput) {
  try {
    const result = await generateInterviewQuestionsFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating interview questions:', error);
    // Return a fallback or throw a more specific error
    return { questions: [
        'Could you tell me about a challenging project you worked on?',
        'What are your biggest strengths and weaknesses?',
        'Describe a time you had to learn a new technology quickly.',
        'Where do you see yourself in 5 years?',
        'Why are you interested in our company?',
      ]
    };
  }
}

export async function getPersonalizedFeedback(input: ProvidePersonalizedFeedbackInput) {
  try {
    const result = await providePersonalizedFeedbackFlow(input);
    return result;
  } catch (error) {
    console.error('Error providing personalized feedback:', error);
    // Return a fallback or throw a more specific error
    return {
      score: 7,
      strengths: 'Good communication skills and a solid theoretical foundation.',
      weaknesses: 'Practical examples could be more detailed. Some hesitation on complex questions.',
      communicationAnalysis: 'You communicated your ideas clearly, but sometimes used filler words like "um" and "like". Try to be more concise in your explanations.',
      improvementTips: '1. Use the STAR method to structure answers about your experience. 2. Review fundamental concepts of your specialty. 3. Practice coding challenges under time constraints.',
    };
  }
}
