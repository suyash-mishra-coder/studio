'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bot, Code2, Loader, Mic, MicOff, Send, CheckCircle, Timer, Radio } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';

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

  const [isRecording, setIsRecording] = React.useState(false);
  const [hasMicPermission, setHasMicPermission] = React.useState<boolean | null>(null);
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  const aiAvatar = PlaceHolderImages.find(p => p.id === 'ai-avatar');
  
  const interviewConfig = React.useMemo(() => {
    const config: Record<string, string> = {
      role: searchParams.get('role') || "Unspecified Role",
      experienceLevel: searchParams.get('experienceLevel') || "Unknown",
      specialty: searchParams.get('specialty') || "General",
      topic: searchParams.get('topic') || "Anything",
      name: searchParams.get('name') || "Candidate",
    };
    const targetCompany = searchParams.get('targetCompany');
    if (targetCompany) {
      config.targetCompany = targetCompany;
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
          title: "Couldn't get AI questions",
          description: "Using generic questions. Don't mess these up.",
          variant: "destructive",
        });
        setQuestions([
          'What makes you think you are qualified for this role?',
          'Explain a complex topic as if I have no patience.',
          'Describe a failure and why it was your fault.',
          'Justify your salary expectations.',
          'Why shouldn\'t we hire you?',
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [toast, interviewConfig]);
  
  React.useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setUserAnswer(prev => prev + finalTranscript);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed' || event.error === 'no-speech') {
          setHasMicPermission(false);
          toast({
              variant: 'destructive',
              title: 'Microphone Not Working',
              description: 'Permission denied or no speech detected. Check your settings.',
          });
        }
      };

      recognitionRef.current = recognition;
    } else {
       setHasMicPermission(false);
    }
  }, [toast]);


  const toggleRecording = async () => {
    if (!recognitionRef.current) {
        toast({
            title: "Voice Not Supported",
            description: "Your browser is too old or unsupported for speech recognition.",
            variant: "destructive"
        });
        return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setHasMicPermission(true);
            recognitionRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setHasMicPermission(false);
             toast({
                variant: 'destructive',
                title: 'Microphone Access Denied',
                description: 'You denied microphone access. You have to type now.',
            });
        }
    }
  };

  const finishInterview = React.useCallback(async (finalAnswer?: string) => {
    if (isFinishing) return;
    setIsFinishing(true);

    if (isRecording) {
      recognitionRef.current?.stop();
    }
    
    const answerToSave = finalAnswer !== undefined ? finalAnswer : userAnswer;

    const finalTranscript = [
      ...transcript,
      { type: 'question' as const, content: questions[currentQuestionIndex], timestamp: Date.now() },
      { type: 'answer' as const, content: answerToSave, timestamp: Date.now() }
    ].filter(item => item?.content?.trim() !== '');

    console.log("Interview Finished. Transcript:", finalTranscript);
    
    try {
      const configToSave = { ...interviewConfig, date: new Date().toISOString() };
      if (!configToSave.targetCompany) {
        delete configToSave.targetCompany;
      }
      const sessionId = await saveSession(configToSave as any, finalTranscript);
      
      toast({
        title: "Interview Over.",
        description: "Redirecting to your feedback.",
      });

      setTimeout(() => {
        router.push(`/feedback/${sessionId}`); 
      }, 1500);

    } catch (error) {
      console.error("Failed to save session:", error);
      toast({
        title: "Save Failed",
        description: "Couldn't save your session. Try again if you want.",
        variant: "destructive",
      });
      setIsFinishing(false);
    }
  }, [isFinishing, transcript, questions, currentQuestionIndex, userAnswer, router, interviewConfig, toast, isRecording]);


  const handleNextQuestion = () => {
    const currentAnswer = userAnswer;
    if (!currentAnswer.trim()) {
      toast({
        title: "No answer provided.",
        description: "You have to actually answer the question.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
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
          <p className="text-muted-foreground">Preparing questions...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-8rem)]">
      <motion.header
        className="mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <InterviewTimer onFinish={() => finishInterview(userAnswer)} />
        </div>
      </motion.header>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <Card className="flex-shrink-0 shadow-lg">
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
        </motion.div>
        
        <motion.div 
            className="flex-1 flex flex-col min-h-[250px]"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <label htmlFor="code-editor" className="font-medium mb-2 flex items-center gap-2"><Code2 className="h-5 w-5 text-primary"/> Your Answer</label>
           { hasMicPermission === false && (
                <Alert variant="destructive" className="mb-4">
                  <MicOff className="h-4 w-4" />
                  <AlertTitle>Microphone Not Available</AlertTitle>
                  <AlertDescription>
                    Speech recognition is off. You need to type.
                  </AlertDescription>
                </Alert>
           )}
          <Textarea 
            id="code-editor"
            placeholder="Type your answer here, or click the microphone to speak."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="flex-1 font-mono text-sm shadow-inner bg-background/80"
          />
        </motion.div>

        <div className="mt-auto pt-4">
          {isFinishing ? (
            <Button size="lg" disabled className="w-full">
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Finishing...
            </Button>
          ) : (
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Button size="icon" variant={isRecording ? 'destructive' : 'outline'} onClick={toggleRecording}>
                    {isRecording ? <Radio className="h-5 w-5 animate-pulse"/> : <Mic className="h-5 w-5"/>}
                 </Button>
                 <p className="text-sm text-muted-foreground">{isRecording ? 'Listening...' : 'Voice Input'}</p>
              </div>
              <Button size="lg" onClick={handleNextQuestion} className="w-1/2">
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Next Question
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finish & Get Judged
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
