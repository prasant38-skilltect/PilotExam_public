import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Target, BarChart3, CheckCircle, XCircle, Flag, RotateCcw } from '@/components/Icons';
import { Skeleton } from '@/components/ui/skeleton';

export default function Results() {
  const [, params] = useRoute('/results/:sessionId');
  const sessionId = params?.sessionId ? parseInt(params.sessionId) : null;

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['/api/test-sessions', sessionId],
    enabled: !!sessionId,
  });

  const { data: answers, isLoading: answersLoading } = useQuery({
    queryKey: ['/api/test-sessions', sessionId, 'answers'],
    enabled: !!sessionId,
  });

  const { data: subject } = useQuery({
    queryKey: ['/api/subjects', (session as any)?.subjectId],
    enabled: !!(session as any)?.subjectId,
  });

  const { data: questions } = useQuery({
    queryKey: ['/api/subjects', (session as any)?.subjectId, 'questions'],
    enabled: !!(session as any)?.subjectId,
  });

  if (sessionLoading || answersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!(session as any) || !(answers as any)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-lg mb-4">Test results not found</p>
            <Link href="/question-bank">
              <Button>Back to Question Bank</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const score = session.score || 0;
  const correctAnswers = session.correctAnswers || 0;
  const totalQuestions = session.totalQuestions || 0;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const passed = score >= 75;
  
  const testDuration = session.endTime && session.startTime 
    ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60))
    : 0;

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Group questions by correctness for detailed review
  const reviewQuestions = questions?.map((question: any) => {
    const userAnswer = answers.find((a: any) => a.questionId === question.id);
    return {
      ...question,
      userAnswer: userAnswer?.selectedAnswer,
      isCorrect: userAnswer?.isCorrect,
      timeSpent: userAnswer?.timeSpent,
    };
  }) || [];

  const correctQuestions = reviewQuestions.filter(q => q.isCorrect);
  const incorrectQuestions = reviewQuestions.filter(q => q.isCorrect === false);
  const unansweredQuestions = reviewQuestions.filter(q => !q.userAnswer);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold mb-4 ${
            passed 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {passed ? (
              <>
                <Trophy className="mr-2" size={20} />
                Test Passed!
              </>
            ) : (
              <>
                <XCircle className="mr-2" size={20} />
                Test Failed
              </>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {subject?.title} Results
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Subject {subject?.code} • Completed on {new Date(session.endTime).toLocaleDateString()}
          </p>
        </div>

        {/* Score Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold mb-4" data-testid="text-final-score">
            <span className={passed ? 'text-green-600' : 'text-red-600'}>
              {score}%
            </span>
          </div>
          <Progress 
            value={score} 
            className={`w-64 mx-auto h-4 ${passed ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'}`}
          />
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Passing Score: 75% • {passed ? 'You passed!' : 'Keep studying and try again'}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Correct</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-correct-answers">
                    {correctAnswers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Incorrect</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-incorrect-answers">
                    {incorrectAnswers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Time Taken</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-time-taken">
                    {testDuration}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-accuracy">
                    {accuracy}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href={`/test/${session.subjectId}`}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300"
              data-testid="button-retake-test"
            >
              <RotateCcw className="mr-2" size={20} />
              Retake Test
            </Button>
          </Link>
          
          <Link href={`/test/${session.subjectId}?mode=practice`}>
            <Button variant="outline" size="lg" data-testid="button-practice-mode">
              Practice Mode
            </Button>
          </Link>
          
          <Link href="/question-bank">
            <Button variant="outline" size="lg" data-testid="button-other-subjects">
              Other Subjects
            </Button>
          </Link>
        </div>

        {/* Detailed Review */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2" size={20} />
                Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-green-600">Correct Answers</span>
                    <span>{correctAnswers} ({Math.round((correctAnswers / totalQuestions) * 100)}%)</span>
                  </div>
                  <Progress value={(correctAnswers / totalQuestions) * 100} className="[&>div]:bg-green-500" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-red-600">Incorrect Answers</span>
                    <span>{incorrectAnswers} ({Math.round((incorrectAnswers / totalQuestions) * 100)}%)</span>
                  </div>
                  <Progress value={(incorrectAnswers / totalQuestions) * 100} className="[&>div]:bg-red-500" />
                </div>

                {unansweredQuestions.length > 0 && (
                  <div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-600">Unanswered</span>
                      <span>{unansweredQuestions.length} ({Math.round((unansweredQuestions.length / totalQuestions) * 100)}%)</span>
                    </div>
                    <Progress value={(unansweredQuestions.length / totalQuestions) * 100} className="[&>div]:bg-gray-400" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Study Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Study Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!passed && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                      Focus Areas for Improvement
                    </h4>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      <li>• Review incorrect answers and explanations</li>
                      <li>• Practice more questions in weak areas</li>
                      <li>• Study the official EASA syllabus</li>
                      <li>• Take more practice tests before retaking</li>
                    </ul>
                  </div>
                )}
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Next Steps</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    {passed ? (
                      <>
                        <li>• Continue with other ATPL subjects</li>
                        <li>• Maintain your knowledge with regular review</li>
                        <li>• Consider advanced preparation materials</li>
                      </>
                    ) : (
                      <>
                        <li>• Review all incorrect answers below</li>
                        <li>• Take practice tests to improve weak areas</li>
                        <li>• Schedule a retake when ready</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Review */}
        {incorrectQuestions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Review Incorrect Answers</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Study these questions to improve your understanding
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {incorrectQuestions.slice(0, 5).map((question: any, index: number) => (
                  <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">
                      Question {index + 1}: {question.questionText}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Your Answer: </span>
                          <span className="text-red-600">
                            {question.userAnswer}) {question[`option${question.userAnswer}`]}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Correct Answer: </span>
                          <span className="text-green-600">
                            {question.correctAnswer}) {question[`option${question.correctAnswer}`]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {question.explanation && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <h5 className="font-medium text-blue-800 dark:text-blue-400 mb-1">Explanation:</h5>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {incorrectQuestions.length > 5 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      And {incorrectQuestions.length - 5} more incorrect answers...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
