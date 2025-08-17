import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Clock, Trophy, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user } = useAuth();

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/progress'],
  });

  const { data: testHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/test-sessions/user/history'],
  });

  const { data: subjects } = useQuery({
    queryKey: ['/api/subjects'],
  });

  const recentTests = (testHistory as any)?.slice(0, 5) || [];
  const totalTests = (testHistory as any)?.length || 0;
  const averageScore = testHistory && (testHistory as any).length > 0 
    ? Math.round((testHistory as any).reduce((acc: number, test: any) => acc + (test.score || 0), 0) / (testHistory as any).length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {(user as any)?.firstName || 'Pilot'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Continue your ATPL preparation journey and track your progress.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-total-tests">
                    {totalTests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-average-score">
                    {averageScore}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Best Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-best-score">
                    {testHistory && testHistory.length > 0 
                      ? Math.max(...testHistory.map((t: any) => t.score || 0))
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Study Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round((totalTests * 75) / 60)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentTests.length > 0 ? (
                <div className="space-y-4">
                  {recentTests.map((test: any, index: number) => {
                    const subject = (subjects as any)?.find((s: any) => s.id === test.subjectId);
                    return (
                      <div key={test.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium">{subject?.title || `Subject ${test.subjectId}`}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(test.startTime).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${test.score >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                            {test.score}%
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {test.correctAnswers}/{test.totalQuestions}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No test results yet. <Link href="/question-bank"><span className="text-purple-600 hover:underline">Start your first test!</span></Link>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/question-bank">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300"
                    data-testid="button-start-test"
                  >
                    Start New Test
                  </Button>
                </Link>
                
                <Link href="/question-bank">
                  <Button variant="outline" className="w-full" data-testid="button-browse-subjects">
                    Browse All Subjects
                  </Button>
                </Link>

                <Link href="/aptitude-test">
                  <Button variant="outline" className="w-full" data-testid="button-aptitude-test">
                    Take Aptitude Test
                  </Button>
                </Link>

                <Link href="/atpl-viva">
                  <Button variant="outline" className="w-full" data-testid="button-viva-prep">
                    ATPL Viva Preparation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress */}
        {progress && progress.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progress.map((prog: any) => {
                  const subject = subjects?.find((s: any) => s.id === prog.subjectId);
                  return (
                    <div key={prog.subjectId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-medium mb-2">{subject?.title || `Subject ${prog.subjectId}`}</h4>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Average: {prog.averageScore}%</span>
                        <span>Best: {prog.bestScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-blue-700 h-2 rounded-full" 
                          style={{ width: `${Math.min(prog.averageScore, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {prog.totalTests} tests completed
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
