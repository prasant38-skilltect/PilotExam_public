import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Search, Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuestionBank() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['/api/subjects'],
  });

  const filteredSubjects = (subjects as any)?.filter((subject: any) =>
    subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
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
            14 ATPL Subject Modules
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Master all EASA ATPL subjects with our comprehensive question bank and practice tests
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-subjects"
            />
          </div>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject: any) => (
            <Card key={subject.id} className="hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-700 w-12 h-12 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold" data-testid={`text-subject-code-${subject.code}`}>
                      {subject.code}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Questions</div>
                    <div className="font-bold text-purple-600 dark:text-purple-400" data-testid={`text-question-count-${subject.id}`}>
                      {subject.questionCount}
                    </div>
                  </div>
                </div>
                <CardTitle className="text-lg" data-testid={`text-subject-title-${subject.id}`}>
                  {subject.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4" data-testid={`text-subject-description-${subject.id}`}>
                  {subject.description}
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="mr-1" size={16} />
                    <span data-testid={`text-duration-${subject.id}`}>{subject.duration} min</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/test/${subject.id}`} className="flex-1">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300"
                      data-testid={`button-start-test-${subject.id}`}
                    >
                      <Play className="mr-2" size={16} />
                      Start Test
                    </Button>
                  </Link>
                  
                  <Link href={`/test/${subject.id}?mode=practice`}>
                    <Button 
                      variant="outline"
                      data-testid={`button-practice-${subject.id}`}
                    >
                      Practice
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSubjects.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No subjects found matching "{searchTerm}"
            </p>
          </div>
        )}

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
