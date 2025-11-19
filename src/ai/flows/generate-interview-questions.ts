
'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';

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
  prompt: `Generate 5 specific and detailed interview questions for a {{experienceLevel}} {{role}} specializing in {{specialty}} on the topic of {{topic}}{{#if targetCompany}} targeting a position at {{targetCompany}}{{/if}}.

The questions should cover a range of complexities and include:
1. One foundational conceptual question.
2. Two practical, problem-solving or coding-related questions.
3. One behavioral question related to the specialty and topic.
4. One system design or architectural question appropriate for the experience level.

Ensure the questions are distinct and require in-depth answers.`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await interviewQuestionsPrompt(input);
    
    if (!output) {
      throw new Error('No output from AI');
    }
    return output;
  }
);


export async function getInterviewQuestions(input: GenerateInterviewQuestionsInput): Promise<GenerateInterviewQuestionsOutput> {
    return await generateInterviewQuestionsFlow(input);
}
