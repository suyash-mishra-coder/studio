
'use client';

import * as React from 'react';
import { BookOpen, Youtube, Newspaper } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { SPECIALTIES } from '@/lib/constants';

const learningResources = {
  'Frontend Development': {
    articles: [
      { title: 'The Complete Guide to Flexbox', url: '#', level: 'Beginner' },
      { title: 'Understanding the React Component Lifecycle', url: '#', level: 'Intermediate' },
      { title: 'Micro-Frontends: A Comprehensive Guide', url: '#', level: 'Advanced' },
    ],
    videos: [
      { title: 'React Crash Course for Beginners', url: '#', level: 'Beginner' },
      { title: 'Advanced State Management with Redux Toolkit', url: '#', level: 'Intermediate' },
      { title: 'Optimizing Webpack for Production', url: '#', level: 'Advanced' },
    ],
  },
  'Backend Development': {
    articles: [
      { title: 'Building a RESTful API with Node.js and Express', url: '#', level: 'Beginner' },
      { title: 'Database Indexing Explained', url: '#', level: 'Intermediate' },
      { title: 'Designing Distributed Systems', url: '#', level: 'Advanced' },
    ],
    videos: [
      { title: 'Docker for Beginners', url: '#', level: 'Beginner' },
      { title: 'Mastering Microservices Communication', url: '#', level: 'Intermediate' },
      { title: 'Kubernetes Explained in 100 Seconds', url: '#', level: 'Advanced' },
    ],
  },
  'Full-Stack Development': {
    articles: [
        { title: 'How to structure a full-stack monorepo', url: '#', level: 'Beginner' },
        { title: 'Authentication with NextAuth.js', url: '#', level: 'Intermediate' },
        { title: 'gRPC for Full-Stack Developers', url: '#', level: 'Advanced' },
    ],
    videos: [
        { title: 'Full-Stack App with Next.js, Prisma, and PostgreSQL', url: '#', level: 'Beginner' },
        { title: 'CI/CD Pipelines for Full-Stack Apps', url: '#', level: 'Intermediate' },
        { title: 'Scaling a Full-Stack Application', url: '#', level: 'Advanced' },
    ],
  },
  'Data Science': {
    articles: [
        { title: 'Introduction to Pandas for Data Analysis', url: '#', level: 'Beginner' },
        { title: 'Feature Engineering for Machine Learning', url: '#', level: 'Intermediate' },
        { title: 'Understanding and Implementing Transformers', url: '#', level: 'Advanced' },
    ],
    videos: [
        { title: 'Python for Data Science - Full Course', url: '#', level: 'Beginner' },
        { title: 'Statistics for Data Science', url: '#', level: 'Intermediate' },
        { title: 'Deep Learning with TensorFlow', url: '#', level: 'Advanced' },
    ],
  },
};


function ResourceLink({ title, url, level }: { title: string; url: string; level: 'Beginner' | 'Intermediate' | 'Advanced' }) {
  const levelColor = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-yellow-100 text-yellow-800',
    'Advanced': 'bg-red-100 text-red-800',
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 rounded-md transition-colors hover:bg-muted"
    >
      <span>{title}</span>
      <Badge className={levelColor[level]}>{level}</Badge>
    </a>
  );
}

export default function LearningHubPage() {
  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      <header className="mb-12 text-center animate-fade-in-up">
        <h1 className="font-headline text-4xl font-bold text-foreground">Learning Hub</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Curated articles and videos to help you master key concepts and prepare for your interviews.
        </p>
      </header>

      <div className="space-y-8">
        {(Object.keys(learningResources) as (keyof typeof learningResources)[]).map((specialty, index) => (
          <motion.div
            key={specialty}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{specialty}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="articles">
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <Newspaper className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Articles</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      {learningResources[specialty].articles.map(resource => (
                        <ResourceLink key={resource.title} {...resource} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="videos">
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <Youtube className="h-5 w-5 text-destructive" />
                        <span className="font-semibold">Videos</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                       {learningResources[specialty].videos.map(resource => (
                        <ResourceLink key={resource.title} {...resource} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        ))}
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">More Specialties</CardTitle>
                <CardDescription>
                    Resources for other technical areas.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {SPECIALTIES.filter(s => !learningResources.hasOwnProperty(s)).map(specialty => (
                    <Badge key={specialty} variant="secondary">{specialty}</Badge>
                ))}
              </CardContent>
            </Card>
          </motion.div>
      </div>
    </div>
  );
}
