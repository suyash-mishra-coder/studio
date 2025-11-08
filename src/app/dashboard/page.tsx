'use client';

import * as React from 'react';
import { BarChart, BookOpen, ChevronRight, History, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { ChartConfig } from '@/components/ui/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartXAxis,
  ChartYAxis,
  ChartBar,
} from '@/components/ui/chart';
import * as RechartsPrimitive from "recharts"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSessions } from '@/lib/data';
import type { InterviewSession } from '@/lib/types';
import { SPECIALTIES } from '@/lib/constants';

const scoreChartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const specialtyChartConfig = {
  score: {
    label: 'Average Score',
  },
  ...SPECIALTIES.reduce((acc, spec, i) => {
    acc[spec] = {
      label: spec,
      color: `hsl(var(--chart-${(i % 5) + 1}))`,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>),
} satisfies ChartConfig;

export default function DashboardPage() {
  const [sessions, setSessions] = React.useState<InterviewSession[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      const data = await getSessions();
      setSessions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    }
    loadData();
  }, []);

  const scoreChartData = sessions.length > 0 ? sessions
    .map(session => ({
      date: format(new Date(session.date), 'MMM d'),
      score: session.score,
    }))
    .reverse().slice(-10) : [];
    
  const specialtyScoreData = React.useMemo(() => {
    if (sessions.length === 0) return [];
    
    const specialtyScores: Record<string, { totalScore: number; count: number }> = {};
    sessions.forEach(session => {
        if (!specialtyScores[session.specialty]) {
            specialtyScores[session.specialty] = { totalScore: 0, count: 0 };
        }
        specialtyScores[session.specialty].totalScore += session.score || 0;
        specialtyScores[session.specialty].count++;
    });

    return Object.entries(specialtyScores).map(([specialty, data]) => ({
        specialty,
        score: parseFloat((data.totalScore / data.count).toFixed(1)),
    }));
  }, [sessions]);


  return (
    <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Interviews
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Keep up the great work!
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length || 0).toFixed(1)}/10</div>
                <p className="text-xs text-muted-foreground">
                  Your average performance
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Specialty</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold truncate">{specialtyScoreData.length > 0 ? specialtyScoreData.sort((a,b) => b.score - a.score)[0].specialty : 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  Your top performing area
                </p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Practice Topics</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{[...new Set(sessions.map(s => s.specialty))].length}</div>
                <p className="text-xs text-muted-foreground">
                  Number of unique specialties practiced
                </p>
              </CardContent>
            </Card>
          </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your mock interview scores over the last 10 sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] w-full bg-muted animate-pulse rounded-md" />
            ) : sessions.length > 0 ? (
              <ChartContainer config={scoreChartConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={scoreChartData}>
                  <ChartXAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                  />
                  <ChartYAxis domain={[0, 10]} hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <ChartBar dataKey="score" radius={4} fill="var(--color-score)" />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No session data yet. Complete an interview to see your progress.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Scores by Specialty</CardTitle>
                <CardDescription>Your average score in each area.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                  <div className="h-[250px] w-full bg-muted animate-pulse rounded-md" />
                ) : specialtyScoreData.length > 0 ? (
                    <ChartContainer config={specialtyChartConfig} className="h-[250px] w-full">
                        <BarChart accessibilityLayer data={specialtyScoreData} layout="vertical">
                            <ChartYAxis
                                dataKey="specialty"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                className="w-24"
                                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                            />
                            <ChartXAxis type="number" domain={[0, 10]} hide />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            <ChartBar dataKey="score" layout="vertical" radius={4}>
                                {specialtyScoreData.map((entry) => (
                                    <RechartsPrimitive.Cell key={entry.specialty} fill={specialtyChartConfig[entry.specialty]?.color || 'hsl(var(--primary))'} />
                                ))}
                            </ChartBar>
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        No data to display.
                    </div>
                )}
            </CardContent>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>Review your past mock interviews and feedback.</CardDescription>
                </div>
                 <Button asChild variant="ghost">
                    <Link href="#">View All</Link>
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Specialty</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded w-24"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded w-32"></div></TableCell>
                      <TableCell className="hidden md:table-cell"><div className="h-4 bg-muted animate-pulse rounded w-20"></div></TableCell>
                      <TableCell className="text-right"><div className="h-4 bg-muted animate-pulse rounded w-8 ml-auto"></div></TableCell>
                      <TableCell><div className="h-8 w-8 bg-muted animate-pulse rounded-full ml-auto"></div></TableCell>
                    </TableRow>
                  ))
                ) : sessions.length > 0 ? (
                  sessions.slice(0, 5).map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{format(new Date(session.date), 'MMMM d, yyyy')}</TableCell>
                      <TableCell className="font-medium">{session.role}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{session.specialty}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={session.score && session.score >= 7 ? 'default' : session.score && session.score >= 4 ? 'secondary' : 'destructive'}>
                          {session.score}/10
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/feedback/${session.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No sessions found. Start an interview to build your history.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
