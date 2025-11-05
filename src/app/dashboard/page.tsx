'use client';

import * as React from 'react';
import { BarChart, ChevronRight, History } from 'lucide-react';
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

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--accent))',
  },
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

  const chartData = sessions
    .map(session => ({
      date: format(new Date(session.date), 'MMM d'),
      score: session.score,
    }))
    .reverse();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="font-headline text-3xl font-bold mb-8 text-primary">Your Dashboard</h1>

      <div className="grid gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">Performance Trend</CardTitle>
            </div>
            <CardDescription>Your mock interview scores over time.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] w-full bg-muted/50 animate-pulse rounded-md" />
            ) : sessions.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={chartData}>
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
                  <ChartBar dataKey="score" radius={8} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No session data yet. Complete an interview to see your progress.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <History className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline">Session History</CardTitle>
            </div>
            <CardDescription>Review your past mock interviews and feedback.</CardDescription>
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
                      <TableCell><div className="h-4 bg-muted/50 animate-pulse rounded w-24"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted/50 animate-pulse rounded w-32"></div></TableCell>
                      <TableCell className="hidden md:table-cell"><div className="h-4 bg-muted/50 animate-pulse rounded w-20"></div></TableCell>
                      <TableCell className="text-right"><div className="h-4 bg-muted/50 animate-pulse rounded w-8 ml-auto"></div></TableCell>
                      <TableCell><div className="h-8 w-8 bg-muted/50 animate-pulse rounded-full ml-auto"></div></TableCell>
                    </TableRow>
                  ))
                ) : sessions.length > 0 ? (
                  sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{format(new Date(session.date), 'MMMM d, yyyy')}</TableCell>
                      <TableCell className="font-medium">{session.role}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary">{session.specialty}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={session.score && session.score >= 7 ? 'default' : 'destructive'} className="bg-accent text-accent-foreground">
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
                      No sessions found.
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
