'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bot, Code2, Loader, Mic, MicOff, Send, CheckCircle, Timer } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { getInterviewQuestions } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { InterviewTranscriptItem } from '@/lib/types';
import { saveSession } from '@/lib/data';

const INTERVIEW_DURATION_MIN = 45;

function InterviewTimer({ onFinish }: { onFinish: () => void }) {
  const [timeLeft, setTimeLeft] = React.useState(INTERVIEW_DURATION_MIN * 60);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      onFinish();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onFinish]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <Timer className="h-4 w-4" />
      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
}


export default function InterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [questions, setQuestions] = React.useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswer, setUserAnswer] = React.useState('');
  const [transcript, setTranscript] = React.useState<InterviewTranscriptItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFinishing, setIsFinishing] = React.useState(false);
  const [isMicOn, setMicOn] = React.useState(true);
  const aiAvatar = PlaceHolderImages.find(p => p.id === 'ai-avatar');
  const userName = searchParams.get('name') || "User";

  const interviewConfig = React.useMemo(() => {
    const config: Record<string, string> = {
      role: searchParams.get('role') || "Software Engineer",
      experienceLevel: searchParams.get('experienceLevel') || "Mid-level",
      specialty: searchParams.get('specialty') || "Data Structures and Algorithms",
      topic: searchParams.get('topic') || "Arrays and Hashing",
    };
    const targetCompany = searchParams.get('targetCompany');
    if (targetCompany) {
      config.targetCompany = targetCompany;
    }
    const name = searchParams.get('name');
    if (name) {
      config.name = name;
    }
    return config;
  }, [searchParams]);


  React.useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await getInterviewQuestions(interviewConfig as any);
        setQuestions(response.questions);
      } catch (error) {
        toast({
          title: "Failed to load questions",
          description: "Using fallback questions. You can proceed with the interview.",
          variant: "destructive",
        });
        setQuestions([
          'Could you tell me about a challenging project you worked on?',
          'What are your biggest strengths and weaknesses?',
          'Describe a time you had to learn a new technology quickly.'
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [toast, interviewConfig]);

  const finishInterview = React.useCallback(async (finalAnswer?: string) => {
    if (isFinishing) return;
    setIsFinishing(true);
    
    // Ensure the final answer is included in the transcript
    const answerToSave = finalAnswer !== undefined ? finalAnswer : userAnswer;

    const finalTranscript = [
      ...transcript,
      { type: 'question' as const, content: questions[currentQuestionIndex], timestamp: Date.now() },
      { type: 'answer' as const, content: answerToSave, timestamp: Date.now() }
    ].filter(item => item?.content?.trim() !== '');

    console.log("Interview Finished. Transcript:", finalTranscript);
    
    try {
      const configToSave = { ...interviewConfig, date: new Date().toISOString() };
      // The targetCompany might be an empty string from the form, which we should treat as undefined
      if (!configToSave.targetCompany) {
        delete configToSave.targetCompany;
      }
      const sessionId = await saveSession(configToSave as any, finalTranscript);
      
      toast({
        title: "Interview Complete!",
        description: "Redirecting to your feedback...",
      });

      setTimeout(() => {
        router.push(`/feedback/${sessionId}`); 
      }, 1500);

    } catch (error) {
      console.error("Failed to save session:", error);
      toast({
        title: "Error",
        description: "Could not save your interview session. Please try again.",
        variant: "destructive",
      });
      setIsFinishing(false);
    }
  }, [isFinishing, transcript, questions, currentQuestionIndex, userAnswer, router, interviewConfig, toast]);


  const handleNextQuestion = () => {
    const currentAnswer = userAnswer;
    if (!currentAnswer.trim()) {
      toast({
        title: "Please provide an answer",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestionIndex >= questions.length - 1) {
      finishInterview(currentAnswer);
    } else {
      const newTranscript: InterviewTranscriptItem[] = [
        ...transcript,
        { type: 'question', content: questions[currentQuestionIndex], timestamp: Date.now() },
        { type: 'answer', content: currentAnswer, timestamp: Date.now() }
      ];
      setTranscript(newTranscript);
      setUserAnswer('');
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Preparing your interview...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-4">
        <Progress value={progress} className="w-full animate-in" />
        <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <InterviewTimer onFinish={() => finishInterview(userAnswer)} />
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        <Card className="flex-shrink-0 shadow-lg animate-fade-in-up bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage data-ai-hint={aiAvatar?.imageHint} src={aiAvatar?.imageUrl} />
                <AvatarFallback><Bot /></AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-primary">AI Interviewer</h2>
                <p className="text-lg mt-2 font-medium">{questions[currentQuestionIndex]}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex-1 flex flex-col min-h-[250px] animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <label htmlFor="code-editor" className="font-medium mb-2 flex items-center gap-2"><Code2 className="h-5 w-5 text-primary"/> Your Answer / Notepad</label>
          <Textarea 
            id="code-editor"
            placeholder="Your answer or code here... You can talk to the AI, but for now, your response must be written."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="flex-1 font-mono text-sm shadow-inner bg-background/80"
          />
        </div>

        <div className="mt-auto pt-4">
          {isFinishing ? (
            <Button size="lg" disabled className="w-full">
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Finishing up...
            </Button>
          ) : (
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Button size="icon" variant={isMicOn ? 'secondary' : 'destructive'} onClick={() => setMicOn(!isMicOn)}>
                    {isMicOn ? <Mic className="h-5 w-5"/> : <MicOff className="h-5 w-5"/>}
                 </Button>
                 <p className="text-sm text-muted-foreground">Mic is {isMicOn ? 'on' : 'off'}</p>
              </div>
              <Button size="lg" onClick={handleNextQuestion} className="w-1/2 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit & Next
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit & Finish Interview
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
