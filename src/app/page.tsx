
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Briefcase, Code, GraduationCap, Building, User } from 'lucide-react';
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
  name: z.string().min(2, { message: 'Please enter your name.' }),
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
      name: '',
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
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Alex Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Role</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Software Engineer" {...field} />
                </FormControl>
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
        </div>

        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technical Specialty</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your specialty" />
                  </SelectTrigger>
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
                <FormControl>
                  <Input placeholder="e.g., Data Structures" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input placeholder="e.g., Google" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Starting...' : 'Start Your Mock Interview'}
        </Button>
      </form>
    </Form>
  );
}

export default function Home() {
  const [showForm, setShowForm] = React.useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 md:p-8 bg-gray-50">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-10 animate-fade-in-up">
          <motion.h1 
            className="font-headline text-4xl md:text-5xl font-bold text-gray-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Mockview AI
          </motion.h1>
          <motion.p 
            className="mt-3 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Ace your next tech interview with our AI-powered real-time simulation platform.
          </motion.p>
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
              <Button size="lg" className="text-lg px-8 py-6" onClick={() => setShowForm(true)}>
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
              <Card>
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
