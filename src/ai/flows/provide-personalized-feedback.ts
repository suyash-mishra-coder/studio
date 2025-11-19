
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
  score: z.number().describe('A fair numerical score from 1 to 10, where 5 is average and 10 is exceptional. Be objective.'),
  strengths: z.string().describe('A brief, encouraging summary of what the candidate did well. Highlight their strong points clearly.'),
  weaknesses: z.string().describe('A constructive analysis of areas where the candidate can improve. Be specific and provide clear examples from the transcript. The tone should be helpful, not overly critical.'),
  communicationAnalysis: z.string().describe('An analysis of the candidate\'s communication skills. Note clarity, conciseness, and confidence. Offer tips for improvement in a supportive manner.'),
  improvementTips: z.string().describe('A numbered list of 3-5 actionable, constructive tips for improvement. These should directly address the identified weaknesses in a helpful way. Example: "1. Try to use the STAR method to structure behavioral answers. 2. Consider reviewing concepts related to X to deepen your understanding."'),
});

export type ProvidePersonalizedFeedbackOutput = z.infer<typeof ProvidePersonalizedFeedbackOutputSchema>;

const feedbackPrompt = ai.definePrompt({
  name: 'feedbackPrompt',
  input: { schema: ProvidePersonalizedFeedbackInputSchema },
  output: { schema: ProvidePersonalizedFeedbackOutputSchema },
  prompt: `You are a helpful and experienced technical interviewer. Your goal is to provide constructive, balanced feedback to help a candidate improve their interview skills. Analyze the following interview for a {{experienceLevel}} {{userRole}} specializing in {{technicalSpecialty}}{{#if targetCompany}} targeting a position at {{targetCompany}}{{/if}}.

Transcript:
---
{{interviewTranscript}}
---

Your task is to provide a fair and constructive evaluation.

1.  **Overall Score:** A score from 1 to 10. Be fair. An average performance should be around a 5-6. An exceptional one is 9-10.
2.  **Strengths:** Start with positive reinforcement. List what they did well. Be specific.
3.  **Areas for Improvement:** Constructively point out technical mistakes or weak explanations. Quote the transcript to provide context, and explain *why* it's an area for improvement.
4.  **Communication Analysis:** Analyze their communication style. Was it clear, structured, and confident? Did they seem rushed or nervous?
5.  **Actionable Improvement Tips:** Provide a numbered list of 3-5 encouraging and actionable tips.

Return the result as a JSON object. Your tone should be supportive and professional.`,
});

const providePersonalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'providePersonalizedFeedbackFlow',
    inputSchema: ProvidePersonalizedFeedbackInputSchema,
    outputSchema: ProvidePersonalizedFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await feedbackPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate feedback.');
    }
    return ProvidePersonalizedFeedbackOutputSchema.parse(output);
  }
);


export async function getPersonalizedFeedback(input: ProvidePersonalizedFeedbackInput): Promise<ProvidePersonalizedFeedbackOutput> {
    return await providePersonalizedFeedbackFlow(input);
}
