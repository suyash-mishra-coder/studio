'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/footer';
import { useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PreInterviewForm, type FormValues } from '@/components/PreInterviewForm';

const MAX_FREE_TRIALS = 3;

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  
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

      const params = new URLSearchParams({
        ...values,
        name,
      });
      router.push(`/interview/new-interview-123?${params.toString()}`);
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
              className="font-headline text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-400"
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
              Stop failing interviews. Get brutally honest feedback and fix your flaws.
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
                  <AlertTitle className="font-bold">Free Rides Are Over</AlertTitle>
                  <AlertDescription>
                    You've used your 3 free interviews. No more practice until you sign up.
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
                  Start Interview ({MAX_FREE_TRIALS - trialsUsed} free attempts left)
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
                  <h2 className="text-2xl font-semibold mb-4">What's your name?</h2>
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
                    <CardTitle className="text-2xl font-headline">Interview Setup, {name}</CardTitle>
                    <CardDescription>
                      Configure the interview. Try to pick something you're good at.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PreInterviewForm onStart={handleStartInterview}/>
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
