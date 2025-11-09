'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
import Footer from '@/components/layout/footer';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your name.' }),
  role: z.string().min(2, { message: 'Role must be at least 2 characters.' }),
  experienceLevel: z.string({ required_error: 'Please select an experience level.' }),
  specialty: z.string({ required_error: 'Please select a specialty.' }),
  topic: z.string().min(2, { message: 'Topic must be at least 2 characters.' }),
  targetCompany: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const MAX_FREE_TRIALS = 3;

function PreInterviewForm({ name, onStart }: { name: string; onStart: (values: FormValues) => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name,
      role: '',
      topic: '',
      targetCompany: '',
    },
  });

  const { formState } = form;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onStart)} className="space-y-6">
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
                  </Trigger>
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
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState('');
  const [trialsUsed, setTrialsUsed] = React.useState(0);
  const [showTrialEnded, setShowTrialEnded] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTrials = localStorage.getItem('mockview-trials-used');
      setTrialsUsed(storedTrials ? parseInt(storedTrials, 10) : 0);
    }
  }, []);
  
  React.useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleStart = () => {
    if (trialsUsed >= MAX_FREE_TRIALS) {
      setShowTrialEnded(true);
    } else {
      setStep(1);
    }
  };
  
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
        setStep(2);
    }
  }

  const handleStartInterview = (values: FormValues) => {
    if (trialsUsed < MAX_FREE_TRIALS) {
      const newTrialCount = trialsUsed + 1;
      localStorage.setItem('mockview-trials-used', newTrialCount.toString());
      setTrialsUsed(newTrialCount);

      const params = new URLSearchParams(values as Record<string, string>).toString();
      router.push(`/interview/new-interview-123?${params}`);
    } else {
      setShowTrialEnded(true);
    }
  }
  
  if (isUserLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
       <header className="absolute top-0 right-0 p-6 z-10">
          <nav className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                  <Link href="/signup">Sign Up <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
          </nav>
      </header>

      <div className="flex flex-col flex-1 items-center justify-center p-4 md:p-8 bg-background">
        <div className="w-full max-w-lg">
          <header className="text-center mb-10 animate-fade-in-up">
            <motion.h1 
              className="font-headline text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"
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

          <AnimatePresence mode="wait">
             {showTrialEnded && (
              <motion.div
                key="trialEnded"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Alert>
                  <AlertTitle className="font-bold">Free Trial Ended</AlertTitle>
                  <AlertDescription>
                    You've used all your free interviews. Please sign up to continue practicing and unlock unlimited sessions.
                  </AlertDescription>
                  <div className="flex gap-4 mt-4">
                    <Button className="w-full" asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                  </div>
                </Alert>
              </motion.div>
            )}

            {step === 0 && !showTrialEnded && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <Button size="lg" className="text-lg px-8 py-6" onClick={handleStart}>
                  Get Started ({MAX_FREE_TRIALS - trialsUsed} trials left)
                </Button>
              </motion.div>
            )}

            {step === 1 && !showTrialEnded && (
              <motion.div
                  key="step1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
              >
                  <h2 className="text-2xl font-semibold mb-4">Welcome! What should we call you?</h2>
                  <form onSubmit={handleNameSubmit} className="flex gap-2">
                      <Input 
                          type="text"
                          placeholder="Enter your name..."
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="text-center text-lg h-12"
                          autoFocus
                      />
                      <Button type="submit" size="lg" className="h-12">Continue</Button>
                  </form>
              </motion.div>
            )}
            
            {step === 2 && !showTrialEnded && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-headline">Prepare Your Interview, {name}</CardTitle>
                    <CardDescription>
                      Configure your mock interview to match the role you're applying for.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PreInterviewForm name={name} onStart={handleStartInterview}/>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}
