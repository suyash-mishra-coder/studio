
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Sparkles, Loader, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { EXPERIENCE_LEVELS } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getInterviewAnswerAction } from '@/app/actions';
import type { GenerateInterviewAnswerOutput, GenerateInterviewAnswerInput } from '@/ai/flows/generate-interview-answer';
import { useUser } from '@/firebase';

const formSchema = z.object({
  jobDescription: z.string().min(50, { message: 'Job description must be at least 50 characters.' }),
  interviewQuestion: z.string().min(10, { message: 'Interview question must be at least 10 characters.' }),
  experienceLevel: z.string({ required_error: 'Please select an experience level.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function AnswerBuddyForm({ trialsLeft, onTrialEnd }: { trialsLeft?: number; onTrialEnd: () => void; }) {
  const [result, setResult] = React.useState<GenerateInterviewAnswerOutput | null>(null);
  const { user } = useUser();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: '',
      interviewQuestion: '',
    },
  });

  const { formState, handleSubmit } = form;

  const onSubmit = async (values: FormValues) => {
    if (trialsLeft !== undefined && trialsLeft <= 0) {
        onTrialEnd();
        return;
    }

    setResult(null); // Clear previous results
    const response = await getInterviewAnswerAction(values as GenerateInterviewAnswerInput);
    setResult(response);

     if (trialsLeft !== undefined && !user) {
        const newTrialCount = (trialsLeft - 1);
        localStorage.setItem('mockview-trials-used', (3 - newTrialCount).toString());
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Your Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select your experience" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                            {level}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
          <FormField
            control={form.control}
            name="jobDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Paste the job description here..." {...field} rows={6} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interviewQuestion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interview Question</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., 'Tell me about a time you handled a conflict with a coworker.'" {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? (
                <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Generating Answer...
                </>
            ) : (
                 <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {trialsLeft !== undefined ? `Generate Answer (${trialsLeft} left)` : 'Generate Answer'}
                 </>
            )}
          </Button>
        </form>
      </Form>

        {formState.isSubmitting && (
             <div className="text-center p-8">
                <Loader className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">The AI is crafting your answer...</p>
            </div>
        )}

        {result && (
            <motion.div 
                className="mt-8 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h3 className="text-2xl font-bold text-center">Your AI-Generated Answer</h3>
                
                <div>
                    <h4 className="font-semibold text-lg mb-2">Suggested Answer:</h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md bg-muted/50 whitespace-pre-wrap">
                        {result.answer}
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-lg mb-2">Key Talking Points:</h4>
                    <ul className="list-disc list-inside space-y-2 p-4 border rounded-md bg-muted/50">
                        {result.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-lg mb-2">Delivery Tips:</h4>
                     <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md bg-muted/50 whitespace-pre-wrap">
                        {result.deliveryTips}
                    </div>
                </div>
            </motion.div>
        )}

    </div>
  );
}
