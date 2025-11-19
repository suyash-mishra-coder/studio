'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';

export const GenerateInterviewAnswerInputSchema = z.object({
  jobDescription: z.string().describe('The full job description for the role.'),
  interviewQuestion: z.string().describe('The specific interview question to answer.'),
  experienceLevel: z.string().describe('The candidate\'s experience level (e.g., Junior, Senior).'),
});

export type GenerateInterviewAnswerInput = z.infer<typeof GenerateInterviewAnswerInputSchema>;

export const GenerateInterviewAnswerOutputSchema = z.object({
  answer: z.string().describe('A well-structured, detailed answer to the interview question, tailored to the job description. Use the STAR (Situation, Task, Action, Result) method for behavioral questions.'),
  keyPoints: z.array(z.string()).describe('A bulleted list of the most important talking points or concepts to include in the answer.'),
  deliveryTips: z.string().describe('Constructive tips on how to effectively deliver this answer, focusing on tone, confidence, and clarity.'),
});

export type GenerateInterviewAnswerOutput = z.infer<typeof GenerateInterviewAnswerOutputSchema>;

const interviewAnswerPrompt = ai.definePrompt({
  name: 'interviewAnswerPrompt',
  input: { schema: GenerateInterviewAnswerInputSchema },
  output: { schema: GenerateInterviewAnswerOutputSchema },
  prompt: `You are an expert interview coach for a {{experienceLevel}} candidate. Your task is to help them craft an exceptional answer for a specific interview question, using the provided job description for context.

Job Description:
---
{{jobDescription}}
---

Interview Question:
"{{interviewQuestion}}"

Based on the job description and question, generate the following:

1.  **Tailored Answer:** Write a strong, detailed answer. For behavioral questions, structure it using the STAR method (Situation, Task, Action, Result) and connect the experience directly to the skills and requirements mentioned in the job description. For technical questions, provide a clear, accurate, and comprehensive explanation.

2.  **Key Talking Points:** Create a bulleted list of the essential points the candidate must cover in their answer. This should be a concise summary.

3.  **Delivery Tips:** Provide actionable advice on how to deliver the answer with confidence and clarity. Mention tone of voice, body language, and how to engage the interviewer.

Your response must be professional, supportive, and highly tailored to the provided context.`,
});

export const generateInterviewAnswerFlow = ai.defineFlow(
  {
    name: 'generateInterviewAnswerFlow',
    inputSchema: GenerateInterviewAnswerInputSchema,
    outputSchema: GenerateInterviewAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await interviewAnswerPrompt(input);
    
    if (!output) {
      throw new Error('AI failed to generate an answer.');
    }
    return output;
  }
);
