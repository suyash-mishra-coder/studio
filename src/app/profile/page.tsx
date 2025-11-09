
'use client';

import * as React from 'react';
import { Award, BarChart, Calendar, Star, TrendingUp, Zap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessions } from '@/lib/data';
import type { InterviewSession } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/firebase';

export default function UserProfilePage() {
  const [sessions, setSessions] = React.useState<InterviewSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useUser();

  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
  const userName = user?.displayName || "Anonymous"; // In a real app, this would come from auth state

  React.useEffect(() => {
    async function loadData() {
      const data = await getSessions();
      setSessions(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const totalInterviews = sessions.length;
  const averageScore = totalInterviews > 0
    ? sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalInterviews
    : 0;

  const bestScore = totalInterviews > 0
    ? Math.max(...sessions.map(s => s.score || 0))
    : 0;

  const uniqueSpecialties = [...new Set(sessions.map(s => s.specialty))];

  const SummaryCard = ({ icon: Icon, title, value, isLoading, suffix = '', color = 'text-primary' }: { icon: React.ElementType, title: string, value: string | number, isLoading: boolean, suffix?: string, color?: string }) => (
    <Card className="animate-fade-in-up transition-all duration-300 hover:border-primary/50 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 bg-muted animate-pulse rounded-md w-1/2"></div>
        ) : (
          <div className={`text-2xl font-bold ${color}`}>{value}{suffix}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      <header className="mb-12 flex flex-col items-center text-center animate-fade-in-up">
        <div className="relative">
          <Avatar className="h-28 w-28 mb-4 border-4 border-white shadow-lg">
            <AvatarImage data-ai-hint={userAvatar?.imageHint} src={user?.photoURL || userAvatar?.imageUrl} />
            <AvatarFallback className="text-4xl">{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <h1 className="font-headline text-4xl font-bold text-foreground mt-4">{userName}</h1>
        <p className="text-muted-foreground mt-2">A record of your performance.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
         <SummaryCard
            icon={Calendar}
            title="Total Interviews"
            value={totalInterviews}
            isLoading={loading}
         />
         <SummaryCard
            icon={BarChart}
            title="Average Score"
            value={averageScore.toFixed(1)}
            isLoading={loading}
            color="text-blue-500"
         />
         <SummaryCard
            icon={Award}
            title="Best Score"
            value={bestScore}
            isLoading={loading}
            suffix="/10"
            color="text-green-500"
         />
         <SummaryCard 
            icon={Star}
            title="Specialties"
            value={uniqueSpecialties.length}
            isLoading={loading}
            color="text-yellow-500"
         />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-8">
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <CardTitle>Progress</CardTitle>
              </div>
              <CardDescription>Your average score is {averageScore.toFixed(1)}.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={(averageScore/10) * 100} className="h-3"/>
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current Average</span>
                    <span>Goal: 10</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-primary" />
                <CardTitle>Practiced Specialties</CardTitle>
              </div>
              <CardDescription>Topics you've attempted.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-24 bg-muted animate-pulse rounded-full"></div>
                  <div className="h-6 w-32 bg-muted animate-pulse rounded-full"></div>
                  <div className="h-6 w-28 bg-muted animate-pulse rounded-full"></div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {uniqueSpecialties.slice(0, 5).map(specialty => (
                    <Badge key={specialty} variant="secondary" className="text-base py-1 px-3">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
           <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Metrics, not participation trophies.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className={`p-3 rounded-full ${totalInterviews > 0 ? 'bg-primary/10 text-primary' : 'bg-muted'}`}><Calendar size={24}/></div>
                <span className="text-xs">First Interview</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                <div className="p-3 bg-muted rounded-full"><Award size={24}/></div>
                <span className="text-xs">Perfect Score</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                <div className="p-3 bg-muted rounded-full"><TrendingUp size={24}/></div>
                <span className="text-xs">5-Day Streak</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
