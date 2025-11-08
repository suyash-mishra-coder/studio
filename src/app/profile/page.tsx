'use client';

import * as React from 'react';
import { Award, BarChart, Calendar, Star, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessions } from '@/lib/data';
import type { InterviewSession } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function UserProfilePage() {
  const [sessions, setSessions] = React.useState<InterviewSession[]>([]);
  const [loading, setLoading] = React.useState(true);

  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
  const userName = "Alex Doe"; // In a real app, this would come from auth state

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

  const SummaryCard = ({ icon: Icon, title, value, isLoading }: { icon: React.ElementType, title: string, value: string | number, isLoading: boolean }) => (
    <Card className="shadow-md animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 bg-muted/50 animate-pulse rounded-md w-1/2"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <header className="mb-10 flex flex-col items-center text-center animate-fade-in-up">
        <Avatar className="h-24 w-24 mb-4 border-4 border-primary shadow-lg">
          <AvatarImage data-ai-hint={userAvatar?.imageHint} src={userAvatar?.imageUrl} />
          <AvatarFallback className="text-3xl">{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="font-headline text-4xl font-bold text-primary">{userName}</h1>
        <p className="text-muted-foreground mt-2">Your journey to interview mastery starts here.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
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
         />
         <SummaryCard 
            icon={Award}
            title="Best Score"
            value={bestScore}
            isLoading={loading}
         />
      </div>

      <Card className="shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Recent Specialties</CardTitle>
          </div>
          <CardDescription>Topics you've recently practiced.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-24 bg-muted/50 animate-pulse rounded-full"></div>
              <div className="h-6 w-32 bg-muted/50 animate-pulse rounded-full"></div>
              <div className="h-6 w-28 bg-muted/50 animate-pulse rounded-full"></div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[...new Set(sessions.map(s => s.specialty))].slice(0, 5).map(specialty => (
                <Badge key={specialty} variant="secondary" className="text-base py-1 px-3">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
