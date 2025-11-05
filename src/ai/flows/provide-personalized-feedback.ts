'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { model } from '@genkit-ai/google-genai';

const ProvidePersonalizedFeedbackInputSchema = z.object({
  interviewTranscript: z.string(),
  userRole: z.string(),
  experienceLevel: z.string(),
  technicalSpecialty: z.string(),
  targetCompany: z.string().optional(),
});

export type ProvidePersonalizedFeedbackInput = z.infer<typeof ProvidePersonalizedFeedbackInputSchema>;

const ProvidePersonalizedFeedbackOutputSchema = z.object({
  score: z.number(),
  strengths: z.string(),
  weaknesses: z.string(),
  improvementTips: z.string(),
});

export type ProvidePersonalizedFeedbackOutput = z.infer<typeof ProvidePersonalizedFeedbackOutputSchema>;

const feedbackPrompt = ai.definePrompt({
  name: 'feedbackPrompt',
  input: { schema: ProvidePersonalizedFeedbackInputSchema },
  output: { schema: ProvidePersonalizedFeedbackOutputSchema },
  prompt: `Given the following interview transcript for a {{experienceLevel}} {{userRole}} specializing in {{technicalSpecialty}}{{#if targetCompany}} targeting a position at {{targetCompany}}{{/if}}:

{{interviewTranscript}}

Provide a score out of 10, list strengths and weaknesses, and provide personalized improvement tips.

Return the result as a JSON object with the following keys: score, strengths, weaknesses, improvementTips.`,
});

export const providePersonalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'providePersonalizedFeedbackFlow',
    inputSchema: ProvidePersonalizedFeedbackInputSchema,
    outputSchema: ProvidePersonalizedFeedbackOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      model: model('gemini-pro'),
      prompt: await feedbackPrompt.render({ input }),
      output: {
        format: 'json',
      },
      config: {
        temperature: 0.3,
      },
    });

    const output = llmResponse.output();
    if (!output) {
      throw new Error('Failed to get feedback from AI');
    }
    return ProvidePersonalizedFeedbackOutputSchema.parse(output);
  }
);
