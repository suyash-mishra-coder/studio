'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Bot, Clapperboard, Code2, Loader, Mic, MicOff, Send, Video, VideoOff, CheckCircle, Timer } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { getInterviewQuestions } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { InterviewTranscriptItem } from '@/lib/types';

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

function VideoFeed() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = React.useState<MediaStream | null>(null);
  const [isMicOn, setMicOn] = React.useState(true);
  const [isCameraOn, setCameraOn] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Turn camera off by default
        stream.getVideoTracks().forEach(track => track.enabled = false);
        setMediaStream(stream);
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setError("Could not access camera or microphone. Please check permissions.");
      }
    }
    setupMedia();
    return () => {
      mediaStream?.getTracks().forEach(track => track.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCamera = () => {
    if (!mediaStream) return;
    mediaStream.getVideoTracks().forEach(track => track.enabled = !isCameraOn);
    setCameraOn(!isCameraOn);
  }

  const toggleMic = () => {
    if (!mediaStream) return;
    mediaStream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
    setMicOn(!isMicOn);
  }

  if (error) {
    return (
      <Alert variant="destructive" className="h-full">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Media Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="overflow-hidden relative aspect-video shadow-lg bg-black">
      <video ref={videoRef} autoPlay muted className={`w-full h-full object-cover transition-opacity ${isCameraOn ? 'opacity-100' : 'opacity-0'}`} />
      {!mediaStream && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white"><Loader className="animate-spin" /></div>}
      {!isCameraOn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <VideoOff className="h-16 w-16" />
          <p className="mt-2">Camera is off</p>
        </div>
      )}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <Button size="icon" variant={isCameraOn ? 'secondary' : 'destructive'} onClick={toggleCamera}>
            {isCameraOn ? <Video className="h-5 w-5"/> : <VideoOff className="h-5 w-5"/>}
          </Button>
          <Button size="icon" variant={isMicOn ? 'secondary' : 'destructive'} onClick={toggleMic}>
            {isMicOn ? <Mic className="h-5 w-5"/> : <MicOff className="h-5 w-5"/>}
          </Button>
      </div>
    </Card>
  );
}

export default function InterviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [questions, setQuestions] = React.useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswer, setUserAnswer] = React.useState('');
  const [transcript, setTranscript] = React.useState<InterviewTranscriptItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFinishing, setIsFinishing] = React.useState(false);
  const aiAvatar = PlaceHolderImages.find(p => p.id === 'ai-avatar');

  React.useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await getInterviewQuestions({
          role: "Software Engineer",
          experienceLevel: "Mid-level",
          specialty: "Data Structures and Algorithms",
          topic: "Arrays and Hashing",
          targetCompany: "Google",
        });
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
  }, [toast]);

  const finishInterview = React.useCallback((currentAnswer?: string) => {
    if (isFinishing) return;
    setIsFinishing(true);
    
    // Capture the final answer if it exists
    const finalTranscript = [
      ...transcript,
      { type: 'question', content: questions[currentQuestionIndex], timestamp: Date.now() },
      { type: 'answer', content: currentAnswer || userAnswer, timestamp: Date.now() }
    ].filter(item => item?.content?.trim() !== '');

    // In a real app, we'd save the transcript and then redirect.
    // For MVP, we'll just simulate this and redirect.
    console.log("Interview Finished. Transcript:", finalTranscript);
    setTimeout(() => {
      // Here you would typically save `finalTranscript` to your backend
      // and redirect to the feedback page for that new session.
      router.push('/feedback/session-1'); 
    }, 1500);
  }, [isFinishing, transcript, questions, currentQuestionIndex, userAnswer, router]);


  const handleNextQuestion = () => {
    const currentAnswer = userAnswer;
    const newTranscript: InterviewTranscriptItem[] = [
      ...transcript,
      { type: 'question', content: questions[currentQuestionIndex], timestamp: Date.now() },
      { type: 'answer', content: currentAnswer, timestamp: Date.now() }
    ];
    
    setTranscript(newTranscript);
    setUserAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishInterview(currentAnswer);
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
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-4rem)]">
      <header className="mb-4">
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <InterviewTimer onFinish={() => finishInterview(userAnswer)} />
        </div>
      </header>

      <div className="flex-1 grid md:grid-cols-2 gap-4 overflow-hidden">
        {/* Left Panel */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
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
          
          <div className="flex-1 flex flex-col min-h-[200px]">
            <label htmlFor="code-editor" className="font-medium mb-2 flex items-center gap-2"><Code2 className="h-5 w-5 text-primary"/> Shared Code Editor / Notepad</label>
            <Textarea 
              id="code-editor"
              placeholder="Your answer or code here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="flex-1 font-mono text-sm shadow-inner"
            />
          </div>
        </div>
        
        {/* Right Panel */}
        <div className="flex flex-col gap-4">
          <VideoFeed />
          <div className="flex-1" />
          {isFinishing ? (
            <Button size="lg" disabled className="w-full">
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Finishing up...
            </Button>
          ) : (
            <Button size="lg" onClick={handleNextQuestion} disabled={!userAnswer} className="w-full">
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Answer & Next
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit & Finish Interview
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
