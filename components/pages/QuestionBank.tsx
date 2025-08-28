'use client'

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Search, Play, Plane } from '@/components/Icons';
import { Skeleton } from '@/components/ui/skeleton';
// import { useTheme } from '@/contexts/ThemeContext'; // This import is not used in the provided file.

export default function QuestionBank() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: topics, isLoading } = useQuery({
    queryKey: ['/api/topics'],
  });

  const filteredTopics = (topics as any)?.filter((topic: any) =>
    (topic.text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (topic.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto" />
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-700 bg-clip-text text-transparent">
            Question Bank
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse categories and topics to start practicing questions
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-topics"
            />
          </div>
        </div>

        {/* Top-level Topics as Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic: any) => (
            <Button
              key={topic.id}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300"
              data-testid={`button-topic-${topic.slug}`}
            >
              {topic.text}
            </Button>
          ))}
        </div>

        {filteredTopics.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No topics found matching "{searchTerm}"
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">About the Question Bank</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Exam Requirements</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Minimum 75% pass rate required</li>
                <li>• 18-month window to complete all exams</li>
                <li>• Maximum 6 exam sessions total</li>
                <li>• Maximum 4 attempts per subject</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Question Format</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Multiple Choice Questions (MCQ)</li>
                <li>• 4 options per question</li>
                <li>• Based on EASA ECQB 2024</li>
                <li>• Real exam simulation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}