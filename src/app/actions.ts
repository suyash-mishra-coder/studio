'use server';

import { generateInterviewQuestionsFlow, GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import { providePersonalizedFeedbackFlow, ProvidePersonalizedFeedbackInput } from '@/ai/flows/provide-personalized-feedback';
import { generateInterviewAnswerFlow, GenerateInterviewAnswerInput } from '@/ai/flows/generate-interview-answer';

export async function getInterviewQuestions(input: GenerateInterviewQuestionsInput) {
  try {
    const result = await generateInterviewQuestionsFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating interview questions:', error);
    // Return a fallback or throw a more specific error
    return { questions: [
        'Tell me about a challenging project you worked on.',
        'Explain a complex technical concept to a non-technical person.',
        'How do you handle disagreements with your team members?',
        'Where do you see yourself in 5 years?',
        'What are your salary expectations?',
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
      score: 5,
      strengths: 'Good effort on the interview. You showed a willingness to tackle tough questions.',
      weaknesses: 'Some answers could have been more structured. It seems there are some gaps in foundational knowledge in certain areas.',
      communicationAnalysis: 'Communication was generally clear, but sometimes you seemed unsure. Try to project more confidence in your answers.',
      improvementTips: '1. Review the fundamentals of your specialty. 2. Practice explaining your thought process out loud. 3. Use the STAR method for behavioral questions.',
    };
  }
}

export async function getInterviewAnswer(input: GenerateInterviewAnswerInput) {
  const result = await generateInterviewAnswerFlow(input);
  return result;
}
