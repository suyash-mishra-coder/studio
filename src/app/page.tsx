'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Bot, BookCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/footer';
import { useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PreInterviewForm, type FormValues } from '@/components/PreInterviewForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnswerBuddyForm } from '@/components/AnswerBuddyForm';

const MAX_FREE_TRIALS = 3;

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  
  const [trialsUsed, setTrialsUsed] = React.useState(0);
  const [showTrialEnded, setShowTrialEnded] = React.useState(false);
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTrials = localStorage.getItem('mockview-trials-used');
      setTrialsUsed(storedTrials ? parseInt(storedTrials, 10) : 0);
    }
    if (user?.displayName) {
        setName(user.displayName);
    }
  }, [user]);

  const handleStartInterview = (values: FormValues) => {
    if (trialsUsed >= MAX_FREE_TRIALS && !user) {
      setShowTrialEnded(true);
      return;
    }

    if (!user) {
      const newTrialCount = trialsUsed + 1;
      localStorage.setItem('mockview-trials-used', newTrialCount.toString());
      setTrialsUsed(newTrialCount);
    }

    const params = new URLSearchParams({
      ...values,
      name: user?.displayName || 'Candidate',
    });
    router.push(`/interview/new-interview-123?${params.toString()}`);
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
            { user ? (
                 <Button variant="outline" asChild>
                  <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
                <>
                    <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Sign Up <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </>
            )}
          </nav>
      </header>

      <main className="flex flex-col flex-1 items-center justify-center p-4 md:p-8 bg-background">
        <div className="w-full max-w-2xl">
          <header className="text-center mb-10">
            <motion.h1 
              className="font-headline text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400"
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
              Hone your interview skills with an AI that's seen it all. Get ready for the real world.
            </motion.p>
          </header>

          <AnimatePresence mode="wait">
             {showTrialEnded ? (
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
                    You've used all your free interviews. Please sign up to continue practicing.
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
            ) : (
                 <motion.div
                    key="tools"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                 >
                    <Tabs defaultValue="interview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="interview">
                                <Bot className="mr-2 h-4 w-4" />
                                Mock Interview
                            </TabsTrigger>
                            <TabsTrigger value="buddy">
                                <BookCheck className="mr-2 h-4 w-4" />
                                Answer Buddy
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="interview">
                            <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl font-headline">AI Mock Interview</CardTitle>
                                <CardDescription>
                                  Practice a full interview session with an AI interviewer.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PreInterviewForm 
                                    onStart={handleStartInterview} 
                                    trialsLeft={user ? undefined : MAX_FREE_TRIALS - trialsUsed}
                                />
                            </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="buddy">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl font-headline">Interview Answer Buddy</CardTitle>
                                    <CardDescription>
                                       Get AI-powered help to craft the perfect answer for a specific question.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AnswerBuddyForm 
                                      trialsLeft={user ? undefined : MAX_FREE_TRIALS - trialsUsed}
                                      onTrialEnd={() => setShowTrialEnded(true)}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
