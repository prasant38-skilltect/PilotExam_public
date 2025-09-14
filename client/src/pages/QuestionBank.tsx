import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plane } from '@/components/Icons';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuestionBank() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['/api/subjects'],
  });

  const filteredSubjects = (subjects as any)?.filter((subject: any) =>
    subject?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject?.code?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-700 bg-clip-text text-transparent">
            Master all DGCA subjects with our comprehensive question bank and practice tests
          </h1>
        </div>

        {/* <div className="text-center mb-8">
          <Link href="/subjects/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-600 text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-cyan-400/20 shadow-lg shadow-cyan-400/20"
              data-testid="button-start-flight-prep"
            >
              <Plane className="mr-2 h-5 w-5" />
              Start Your Flight Prep
            </Button>
          </Link>
        </div> */}

        {/* Info Section */}
        <div className="mt-16 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">About ATPL Subjects</h2>
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
