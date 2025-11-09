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
        'What makes you think you are qualified for this role?',
        'Explain a complex topic as if I have no patience.',
        'Describe a failure and why it was your fault.',
        'Justify your salary expectations.',
        'Why shouldn\'t we hire you?',
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
      score: 2,
      strengths: 'You showed up. That\'s about it.',
      weaknesses: 'Your answers were vague and lacked any real substance. It\'s clear you haven\'t prepared.',
      communicationAnalysis: 'You ramble. You use "um" and "like" as a crutch. It was painful to listen to.',
      improvementTips: '1. Study the basics. You lack them. 2. Record yourself and notice how many filler words you use. 3. Don\'t book another interview until you\'ve done the first two things.',
    };
  }
}
