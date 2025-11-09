'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { ThumbsUp, ThumbsDown, Sparkles, Star, Loader, BookOpen, Clock, Bot, User, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPersonalizedFeedback } from '@/app/actions';
import { getFeedback, getSession } from '@/lib/data';
import type { InterviewFeedback, InterviewSession } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function ScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const [offset, setOffset] = React.useState(circumference);

  React.useEffect(() => {
    // Animate the circle drawing
    const timer = setTimeout(() => setOffset(circumference - (score / 10) * circumference), 100);
    return () => clearTimeout(timer);
  }, [score, circumference]);


  let colorClass = 'text-primary';
  if (score < 5) colorClass = 'text-yellow-500';
  if (score < 3) colorClass = 'text-destructive';

  return (
    <div className="relative h-40 w-40">
      <svg className="h-full w-full" viewBox="0 0 100 100">
        <circle
          className="stroke-current text-muted"
          strokeWidth="10"
          cx="50"
          cy="50"
          r="45"
          fill="transparent"
        />
        <circle
          className={`stroke-current ${colorClass} transition-all duration-1000 ease-in-out`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          cx="50"
          cy="50"
          r="45"
          fill="transparent"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${colorClass}`}>{score.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">/ 10</span>
      </div>
    </div>
  );
}


export default function FeedbackPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [feedback, setFeedback] = React.useState<InterviewFeedback | null>(null);
  const [session, setSession] = React.useState<InterviewSession | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [generatingFeedback, setGeneratingFeedback] = React.useState(false);

  const aiAvatar = PlaceHolderImages.find(p => p.id === 'ai-avatar');
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

  React.useEffect(() => {
    async function loadData() {
      if (!sessionId) return;
      setLoading(true);
      
      const sessionData = await getSession(sessionId);
      const feedbackData = await getFeedback(sessionId);

      if (feedbackData && sessionData) {
        setSession(sessionData);
        // If feedback is not generated yet, call the AI
        if (!feedbackData.strengths && feedbackData.transcript.length > 0) {
          setGeneratingFeedback(true);
          const aiFeedback = await getPersonalizedFeedback({
            interviewTranscript: feedbackData.transcript.map(t => `${t.type === 'question' ? 'Interviewer:' : 'You:'} ${t.content}`).join('\n'),
            userRole: sessionData.role,
            experienceLevel: "Mid-level", // This can be dynamic in a real app
            technicalSpecialty: sessionData.specialty,
            targetCompany: "A top tech company" // This can be dynamic
          });
          setFeedback({...feedbackData, ...aiFeedback});
          setGeneratingFeedback(false);
        } else {
          setFeedback(feedbackData);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [sessionId]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  if (generatingFeedback) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-2xl font-semibold">Analyzing Your Failures...</h2>
                <p className="text-muted-foreground max-w-md">Our AI is picking apart your performance to provide brutally honest feedback. This might sting.</p>
            </div>
        </div>
    );
  }

  if (!feedback || !session) {
    return <div className="flex h-screen items-center justify-center"><p>Feedback not found. Or you don't deserve it.</p></div>;
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <header className="mb-8 animate-fade-in-up">
        <h1 className="font-headline text-4xl font-bold text-foreground">Performance Autopsy</h1>
        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
          <Badge variant="secondary">{session.role}</Badge>
          <Separator orientation="vertical" className="h-4"/>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4"/><span>{format(new Date(session.date), 'MMMM d, yyyy')}</span></div>
        </div>
      </header>
      
      <div className="grid md:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="md:col-span-1 flex flex-col items-center justify-center text-center p-6">
                <CardHeader>
                    <CardTitle>Your Score</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScoreCircle score={feedback.score} />
                </CardContent>
            </Card>
        </motion.div>

        <div className="md:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card>
                <CardHeader>
                <div className="flex items-center gap-3">
                    <ThumbsDown className="h-6 w-6 text-destructive" />
                    <CardTitle className="text-destructive">What You Got Wrong</CardTitle>
                </div>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{feedback.weaknesses}</p>
                </CardContent>
            </Card>
          </motion.div>
          
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card>
                <CardHeader>
                <div className="flex items-center gap-3">
                    <ThumbsUp className="h-6 w-6 text-green-500" />
                    <CardTitle className="text-green-500">What You Didn't Mess Up</CardTitle>
                </div>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{feedback.strengths}</p>
                </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card>
                <CardHeader>
                <div className="flex items-center gap-3">
                    <MessageCircle className="h-6 w-6 text-blue-500" />
                    <CardTitle className="text-blue-500">How You Sounded</CardTitle>
                </div>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{feedback.communicationAnalysis}</p>
                </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <Card>
                <CardHeader>
                <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <CardTitle className="text-primary">How to Be Less Bad</CardTitle>
                </div>
                </CardHeader>
                <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    {feedback.improvementTips.split(/\d+\./).filter(tip => tip.trim() !== '').map((tip, index) => (
                        <li key={index}>{tip.trim()}</li>
                    ))}
                </ul>
                </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      <motion.div className="mt-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle>Interview Transcript</CardTitle>
            </div>
            <CardDescription>The full record of your conversation. Read it and learn.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-96 overflow-y-auto p-4 border rounded-md bg-muted/50">
              {feedback.transcript.map((item, index) => (
                <div key={index} className={`flex gap-3 ${item.type === 'answer' ? 'justify-end' : 'justify-start'}`}>
                  {item.type === 'question' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage data-ai-hint={aiAvatar?.imageHint} src={aiAvatar?.imageUrl} />
                      <AvatarFallback><Bot size={16} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-xl p-3 rounded-lg ${item.type === 'question' ? 'bg-secondary' : 'bg-primary/10'}`}>
                    <p>{item.content}</p>
                  </div>
                  {item.type === 'answer' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage data-ai-hint={userAvatar?.imageHint} src={userAvatar?.imageUrl} />
                      <AvatarFallback>{(session.name || 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
