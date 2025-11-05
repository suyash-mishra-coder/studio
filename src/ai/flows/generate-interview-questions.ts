import { z } from 'zod';
import { defineFlow } from '@genkit-ai/core';
import { googleVertexAi } from '@genkit-ai/vertexai';

const GenerateInterviewQuestionsInputSchema = z.object({
  role: z.string(),
  experienceLevel: z.string(),
  specialty: z.string(),
  topic: z.string(),
  targetCompany: z.string().optional(),
});

export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

export const generateInterviewQuestions = defineFlow({
  name: 'generateInterviewQuestions',
  inputSchema: GenerateInterviewQuestionsInputSchema,
  outputSchema: z.object({ questions: z.string().array() }),
  plugins: [googleVertexAi()],
  transformInput: (input) => {
    return `Generate 5 interview questions for a ${input.experienceLevel} ${input.role} specializing in ${input.specialty} on the topic of ${input.topic}${input.targetCompany ? ` targeting a position at ${input.targetCompany}` : ''}.`;
  },
  run: async (prompt, { plugins }) => {
    const { content } = await plugins.googleVertexAi.generateText({
      model: 'gemini-pro',
      prompt: {
        text: `${prompt}

        Return the questions as a numbered list.`,
      },
    });

    const questions = content
      .split('\n')
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);

    return { questions };
  },
});
