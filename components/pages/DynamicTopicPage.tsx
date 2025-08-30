'use client'

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Search, Play, ArrowLeft, BookOpen } from '@/components/Icons';
import { Skeleton } from '@/components/ui/skeleton';

type Topic = {
  id: number,
  title: string,
  description: string,
  code: string,
  slug: string,
  questionCount: number,
  duration: number
};

interface DynamicTopicPageProps {
  slug: string;
}

export default function DynamicTopicPage({ slug }: DynamicTopicPageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch topics based on the slug
  const { data: topics, isLoading, error } = useQuery<Topic[]>({
    queryKey: [`/api/${slug}`],
    retry: 1,
  });

  const filteredTopics = (topics || []).filter((topic: Topic) =>
    topic.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Topic Not Found</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              The topic "{slug}" could not be found.
            </p>
            <Link href="/question-bank">
              <Button>
                <ArrowLeft className="mr-2" size={16} />
                Back to Question Bank
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton className="h-12 w-96 mb-4" />
            <Skeleton className="h-6 w-[600px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Convert slug to title for display
  const pageTitle = slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/question-bank">
            <Button 
              variant="outline" 
              className="mb-4 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back to Question Bank
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-700 bg-clip-text text-transparent">
            {pageTitle}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {topics?.length > 0 
              ? `Explore ${topics.length} topic${topics.length !== 1 ? 's' : ''} in ${pageTitle}`
              : `Practice questions and topics for ${pageTitle}`
            }
          </p>
        </div>

        {/* Search */}
        {topics && topics.length > 0 && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Topics Grid */}
        {topics && topics.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((topic: Topic) => (
                <Card key={topic.id} className="hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-700 w-12 h-12 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {topic.code}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Questions</div>
                        <div className="font-bold text-purple-600 dark:text-purple-400">
                          {topic.questionCount}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg">
                      {topic.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {topic.description}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="mr-1" size={16} />
                        <span>{topic.duration} min</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/test/${topic.id}`} className="flex-1">
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300"
                        >
                          <Play className="mr-2" size={16} />
                          Start Test
                        </Button>
                      </Link>

                      <Link href={`/test/${topic.id}?mode=practice`}>
                        <Button variant="outline">
                          <BookOpen className="mr-1" size={16} />
                          Practice
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTopics.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No topics found matching "{searchTerm}"
                </p>
              </div>
            )}
          </>
        ) : (
          // No topics found - this might be a direct topic page
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Sub-topics Available
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This appears to be a direct topic without sub-topics. You can start practicing questions directly.
              </p>
              <div className="space-y-3">
                <Link href={`/test/${slug}`}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-700 text-white">
                    <Play className="mr-2" size={16} />
                    Start Test
                  </Button>
                </Link>
                <Link href={`/test/${slug}?mode=practice`}>
                  <Button variant="outline" className="w-full">
                    <BookOpen className="mr-2" size={16} />
                    Practice Mode
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        {topics && topics.length > 0 && (
          <div className="mt-16 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">About {pageTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-2">Study Tips</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Review each topic systematically</li>
                  <li>• Practice with both test and practice modes</li>
                  <li>• Focus on areas with lower scores</li>
                  <li>• Read explanations for all questions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Exam Format</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Multiple Choice Questions (MCQ)</li>
                  <li>• 4 options per question</li>
                  <li>• Minimum 75% pass rate required</li>
                  <li>• Based on EASA ECQB standards</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}