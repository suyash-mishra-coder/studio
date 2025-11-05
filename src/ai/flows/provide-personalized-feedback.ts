import { z } from 'zod';
import { defineFlow } from '@genkit-ai/core';
import { googleVertexAi } from '@genkit-ai/vertexai';

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

export const providePersonalizedFeedback = defineFlow({
  name: 'providePersonalizedFeedback',
  inputSchema: ProvidePersonalizedFeedbackInputSchema,
  outputSchema: ProvidePersonalizedFeedbackOutputSchema,
  plugins: [googleVertexAi()],
  transformInput: (input) => {
    return `Given the following interview transcript for a ${input.experienceLevel} ${input.userRole} specializing in ${input.technicalSpecialty}${input.targetCompany ? ` targeting a position at ${input.targetCompany}` : ''}:\n\n${input.interviewTranscript}\n\nProvide a score out of 10, list strengths and weaknesses, and provide personalized improvement tips.`;
  },
  run: async (prompt, { plugins }) => {
    const { content } = await plugins.googleVertexAi.generateText({
      model: 'gemini-pro',
      prompt: {
        text: `${prompt}

        Return the result as a JSON object with the following keys: score, strengths, weaknesses, improvementTips.`,
      },
      maxOutputTokens: 1024,
    });

    try {
      const result = JSON.parse(content);
      const parsedResult = ProvidePersonalizedFeedbackOutputSchema.parse({
        score: Number(result.score),
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        improvementTips: result.improvementTips,
      });
      return parsedResult;
    } catch (error) {
      console.error('Error parsing feedback:', error);
      throw new Error('Failed to parse feedback from the AI.');
    }
  },
});
