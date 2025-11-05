'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import {model} from '@genkit-ai/google-genai';

const GenerateInterviewQuestionsInputSchema = z.object({
  role: z.string(),
  experienceLevel: z.string(),
  specialty: z.string(),
  topic: z.string(),
  targetCompany: z.string().optional(),
});

export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(z.string()),
});

export type GenerateInterviewQuestionsOutput = z.infer<typeof GenerateInterviewQuestionsOutputSchema>;

const interviewQuestionsPrompt = ai.definePrompt({
  name: 'interviewQuestionsPrompt',
  input: { schema: GenerateInterviewQuestionsInputSchema },
  output: { schema: GenerateInterviewQuestionsOutputSchema },
  prompt: `Generate 5 interview questions for a {{experienceLevel}} {{role}} specializing in {{specialty}} on the topic of {{topic}}{{#if targetCompany}} targeting a position at {{targetCompany}}{{/if}}.`,
});

export const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      model: model('gemini-pro'),
      prompt: (await interviewQuestionsPrompt.render({input})).prompt,
      output: {
        format: 'json',
        schema: GenerateInterviewQuestionsOutputSchema
      },
    });

    const output = llmResponse.output();
    if (!output) {
      throw new Error('No output from AI');
    }
    return output;
  }
);
