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
  score: z.number().describe('A brutally honest numerical score from 1 to 10, where 1 is abysmal and 10 is barely competent. Do not give high scores easily.'),
  strengths: z.string().describe('A very brief, direct summary of the few things the candidate did not completely fail at. Do not use positive, encouraging language. Get to the point.'),
  weaknesses: z'string'().describe('A detailed, brutally honest, and critical analysis of every area the candidate was weak in. Be blunt. Quote their mistakes from the transcript. Do not sugar-coat anything. This is the most important section. Format as a paragraph.'),
  communicationAnalysis: z'string'().describe('A critical analysis of the candidate\'s communication. Point out every filler word, rambling sentence, and moment of hesitation. Was it clear? Was it concise? Probably not. State it. Format as a paragraph.'),
  improvementTips: z.string().describe('A numbered list of 3-5 blunt, actionable directives for improvement. These should directly address the identified weaknesses. Don\'t suggest, command. Example: "1. Stop using the word \'like\'. 2. You clearly don\'t understand X, study it."'),
});

export type ProvidePersonalizedFeedbackOutput = z.infer<typeof ProvidePersonalizedFeedbackOutputSchema>;

const feedbackPrompt = ai.definePrompt({
  name: 'feedbackPrompt',
  input: { schema: ProvidePersonalizedFeedbackInputSchema },
  output: { schema: ProvidePersonalizedFeedbackOutputSchema },
  prompt: `You are a brutally honest and hyper-critical technical interviewer. Your job is to dismantle a candidate's performance to expose every flaw. Do not offer encouragement or praise. Your feedback must be direct, cutting, and focused solely on identifying weaknesses to force improvement. Analyze the following interview for a {{experienceLevel}} {{userRole}} specializing in {{technicalSpecialty}}{{#if targetCompany}} trying to get into {{targetCompany}}{{/if}}.

Transcript:
---
{{interviewTranscript}}
---

Your task is to provide a ruthlessly honest evaluation.

1.  **Overall Score:** A score from 1 to 10. Don't be generous. A 5 should be average. A 10 is a mythical unicorn.
2.  **Strengths:** Briefly list what wasn't a complete disaster. Be concise.
3.  **Areas for Improvement:** This is the core of your feedback. Be merciless. Detail every technical mistake, every weak explanation. Quote the transcript to show them exactly where they failed.
4.  **Communication Analysis:** Tear apart their communication style. Point out every "um," every moment of rambling, every convoluted sentence.
5.  **Actionable Improvement Tips:** Provide a numbered list of 3-5 direct commands on what to fix. No "You could try..."; use "Do this:..."

Return the result as a JSON object. Be brutally honest.`,
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
      throw new Error('AI failed to generate feedback. It probably gave up.');
    }
    return ProvidePersonalizedFeedbackOutputSchema.parse(output);
  }
);
