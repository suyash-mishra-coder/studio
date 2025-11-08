
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Bot, Briefcase, Code, GraduationCap, Building, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EXPERIENCE_LEVELS, SPECIALTIES } from '@/lib/constants';

const formSchema = z.object({
  role: z.string().min(2, { message: 'Role must be at least 2 characters.' }),
  experienceLevel: z.string({ required_error: 'Please select an experience level.' }),
  specialty: z.string({ required_error: 'Please select a specialty.' }),
  topic: z.string().min(2, { message: 'Topic must be at least 2 characters.' }),
  targetCompany: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function PreInterviewForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: '',
      topic: '',
      targetCompany: '',
    },
  });

  const { formState } = form;

  function onSubmit(values: FormValues) {
    const params = new URLSearchParams(values as Record<string, string>).toString();
    router.push(`/interview/new-interview-123?${params}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Role</FormLabel>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="e.g., Software Engineer" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select your experience" />
                      </SelectTrigger>
                    </div>
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
        </div>

        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technical Specialty</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                  </div>
                </FormControl>
                <SelectContent>
                  {SPECIALTIES.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interview Topic</FormLabel>
                <div className="relative">
                   <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="e.g., Data Structures" {...field} className="pl-10"/>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetCompany"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Company (Optional)</FormLabel>
                 <div className="relative">
                   <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="e.g., Google" {...field} className="pl-10"/>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" size="lg" className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Starting...' : 'Start Your Mock Interview'}
        </Button>
      </form>
    </Form>
  );
}

export default function Home() {
  const [showForm, setShowForm] = React.useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-10 animate-fade-in-up">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
            Mockview AI
          </h1>
          <p className="mt-3 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Ace your next tech interview with our AI-powered real-time simulation platform.
          </p>
        </header>

        <AnimatePresence>
          {!showForm ? (
            <motion.div
              key="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <Button size="lg" className="transition-transform hover:scale-[1.02] active:scale-[0.98]" onClick={() => setShowForm(true)}>
                Get Started
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Card className="shadow-2xl bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline">Prepare Your Interview</CardTitle>
                  <CardDescription>
                    Configure your mock interview to match the role you're applying for.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PreInterviewForm />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
