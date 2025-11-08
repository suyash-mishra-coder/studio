'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';

const ProvidePersonalizedFeedbackInputSchema = z.object({
  interviewTranscript: z.string(),
  userRole: z.string(),
  experienceLevel: z.string(),
  technicalSpecialty: z.string(),
  targetCompany: z.string().optional(),
});

export type ProvidePersonalizedFeedbackInput = z.infer<typeof ProvidePersonalizedFeedbackInputSchema>;

const ProvidePersonalizedFeedbackOutputSchema = z.object({
  score: z.number().describe('A numerical score from 1 to 10, where 1 is poor and 10 is excellent.'),
  strengths: z.string().describe('A detailed analysis of what the candidate did well. Provide specific examples from the transcript. Format as a paragraph.'),
  weaknesses: z.string().describe('A detailed analysis of areas where the candidate can improve. Be constructive and provide specific examples from the transcript. Format as a paragraph.'),
  communicationAnalysis: z.string().describe('An analysis of the candidate\'s communication style, focusing on clarity, conciseness, and structure. Comment on the use of filler words or rambling if applicable. Format as a paragraph.'),
  improvementTips: z.string().describe('A list of 3-5 concrete, actionable tips for improvement. These should be specific to the weaknesses identified. Format as a numbered list.'),
});

export type ProvidePersonalizedFeedbackOutput = z.infer<typeof ProvidePersonalizedFeedbackOutputSchema>;

const feedbackPrompt = ai.definePrompt({
  name: 'feedbackPrompt',
  input: { schema: ProvidePersonalizedFeedbackInputSchema },
  output: { schema: ProvidePersonalizedFeedbackOutputSchema },
  prompt: `You are an expert technical interviewer providing detailed, constructive feedback. Analyze the following interview transcript for a {{experienceLevel}} {{userRole}} specializing in {{technicalSpecialty}}{{#if targetCompany}} targeting a position at {{targetCompany}}{{/if}}.

Transcript:
---
{{interviewTranscript}}
---

Your task is to provide a comprehensive evaluation of the candidate's performance. Base your feedback entirely on the provided transcript.

Provide the following:
1.  **Overall Score:** A score from 1 to 10, reflecting their overall performance based on technical accuracy, problem-solving, and communication.
2.  **Strengths:** A detailed paragraph identifying specific technical strengths. Quote or reference parts of their answers to support your points. Mention clarity, accuracy, and depth of knowledge.
3.  **Areas for Improvement:** A detailed paragraph on their technical weaknesses. Be constructive. Point out specific areas from the transcript where the explanation was weak, incorrect, or could have been more detailed.
4.  **Communication Analysis:** A paragraph analyzing the candidate's communication style. Assess clarity, conciseness, and confidence. Note any excessive use of filler words or rambling.
5.  **Actionable Improvement Tips:** A numbered list of 3 to 5 specific, actionable tips. Each tip should directly relate to a weakness you identified and suggest concrete next steps (e.g., "Review concept X," "Practice problem type Y on LeetCode," "Structure system design answers using the A-B-C framework.").

Return the result as a JSON object.`,
});

export const providePersonalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'providePersonalizedFeedbackFlow',
    inputSchema: ProvidePersonalizedFeedbackInputSchema,
    outputSchema: ProvidePersonalizedFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await feedbackPrompt(input);
    if (!output) {
      throw new Error('Failed to get feedback from AI');
    }
    return ProvidePersonalizedFeedbackOutputSchema.parse(output);
  }
);
