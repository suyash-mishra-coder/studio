'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { ThumbsUp, ThumbsDown, Sparkles, Star, Loader, BookOpen, Clock, Bot } from 'lucide-react';
import { format } from 'date-fns';

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


  let colorClass = 'text-accent';
  if (score < 7) colorClass = 'text-yellow-500';
  if (score < 4) colorClass = 'text-destructive';

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

  const aiAvatar = PlaceHolderImages.find(p => p.id === 'ai-avatar');

  React.useEffect(() => {
    async function loadFeedback() {
      if (!sessionId) return;
      
      const sessionData = await getSession(sessionId);
      const feedbackData = await getFeedback(sessionId);

      if (feedbackData && sessionData) {
        // Mock calling the GenAI flow with the transcript from mock data
        const aiFeedback = await getPersonalizedFeedback({
          interviewTranscript: feedbackData.transcript.map(t => `${t.type === 'question' ? 'Q:' : 'A:'} ${t.content}`).join('\n'),
          userRole: sessionData.role,
          experienceLevel: "Mid-level", // Mocked for now
          technicalSpecialty: sessionData.specialty,
          targetCompany: "Google" // Mocked
        });
        
        setSession(sessionData);
        setFeedback({...feedbackData, ...aiFeedback});
      }
      setLoading(false);
    }
    loadFeedback();
  }, [sessionId]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!feedback || !session) {
    return <div className="flex h-screen items-center justify-center"><p>Feedback not found.</p></div>;
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <header className="mb-8 animate-fade-in-up">
        <h1 className="font-headline text-4xl font-bold text-primary">Interview Feedback</h1>
        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
          <Badge variant="secondary">{session.role}</Badge>
          <Separator orientation="vertical" className="h-4"/>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4"/><span>{format(new Date(session.date), 'MMMM d, yyyy')}</span></div>
        </div>
      </header>
      
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 flex flex-col items-center justify-center text-center p-6 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="font-headline">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreCircle score={feedback.score} />
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-8">
          <Card className="shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ThumbsUp className="h-6 w-6 text-accent" />
                <CardTitle className="font-headline text-accent">Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feedback.strengths}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ThumbsDown className="h-6 w-6 text-destructive" />
                <CardTitle className="font-headline text-destructive">Areas for Improvement</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feedback.weaknesses}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline text-primary">Personalized Tips</CardTitle>
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
        </div>
      </div>
      
      <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">Interview Transcript</CardTitle>
            </div>
            <CardDescription>Review the full conversation from your interview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-96 overflow-y-auto p-4 border rounded-md bg-muted/20">
              {feedback.transcript.map((item, index) => (
                <div key={index} className={`flex gap-3 ${item.type === 'answer' ? 'justify-end' : 'justify-start'}`}>
                  {item.type === 'question' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage data-ai-hint={aiAvatar?.imageHint} src={aiAvatar?.imageUrl} />
                      <AvatarFallback><Bot size={16} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-xl p-3 rounded-lg ${item.type === 'question' ? 'bg-primary/10' : 'bg-accent/20'}`}>
                    <p>{item.content}</p>
                  </div>
                  {item.type === 'answer' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
