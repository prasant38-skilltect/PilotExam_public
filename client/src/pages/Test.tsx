import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import { TestQuestion } from '@/components/TestQuestion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Loader2 } from 'lucide-react';

export default function Test() {
  const [, params] = useRoute('/test/:subjectId');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const subjectId = params?.subjectId ? parseInt(params.subjectId) : null;
  const urlParams = new URLSearchParams(window.location.search);
  const isPracticeMode = urlParams.get('mode') === 'practice';

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch subject details
  const { data: subject, isLoading: subjectLoading } = useQuery({
    queryKey: ['/api/subjects', subjectId],
    enabled: !!subjectId,
  });

  // Fetch questions for the test
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['/api/subjects', subjectId, 'questions', { count: isPracticeMode ? 10 : undefined }],
    enabled: !!subjectId,
  });

  // Create test session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/test-sessions', data);
      return response.json();
    },
    onSuccess: (session) => {
      setSessionId(session.id);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create test session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save answer mutation
  const saveAnswerMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/user-answers', data);
    },
  });

  // Submit test mutation
  const submitTestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', `/api/test-sessions/${sessionId}`, data);
      return response.json();
    },
    onSuccess: (session) => {
      setIsSubmitted(true);
      setLocation(`/results/${sessionId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize test session
  useEffect(() => {
    if (subject && questions && (questions as any).length > 0 && !sessionId) {
      const duration = isPracticeMode ? 10 * 60 : (subject as any).duration * 60; // Convert to seconds
      setTimeLeft(duration);
      
      createSessionMutation.mutate({
        subjectId: (subject as any).id,
        totalQuestions: (questions as any).length,
      });
    }
  }, [subject, questions, sessionId, isPracticeMode]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const currentQuestion = (questions as any)?.[currentQuestionIndex];
  const selectedAnswer = currentQuestion ? answers[(currentQuestion as any).id] : null;

  const handleAnswerSelect = useCallback((answer: string) => {
    if (!currentQuestion || !sessionId) return;
    
    setAnswers(prev => ({ ...prev, [(currentQuestion as any).id]: answer }));
    
    // Save answer to database
    const isCorrect = answer === (currentQuestion as any).correctAnswer;
    saveAnswerMutation.mutate({
      sessionId,
      questionId: (currentQuestion as any).id,
      selectedAnswer: answer,
      isCorrect,
      timeSpent: 30, // This could be tracked more precisely
    });
  }, [currentQuestion, sessionId]);

  const handleNext = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitTest();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFlag = () => {
    if (!currentQuestion) return;
    
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const handleSubmitTest = () => {
    if (!sessionId || !questions) return;
    
    const correctAnswers = Object.entries(answers).reduce((count, [questionId, answer]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      return question && answer === question.correctAnswer ? count + 1 : count;
    }, 0);
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    submitTestMutation.mutate({
      endTime: new Date(),
      isCompleted: true,
      score,
      correctAnswers,
    });
  };

  const progress = questions ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  if (subjectLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!subject || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-lg mb-4">Test not available</p>
            <Button onClick={() => setLocation('/question-bank')}>
              Back to Question Bank
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Test Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {subject.title} {isPracticeMode && '(Practice Mode)'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Subject {subject.code} • {questions.length} Questions
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {answeredCount} of {questions.length} answered
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {flaggedQuestions.size} flagged
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <Progress value={progress} className="mb-4" />
        </div>

        {/* Test Question */}
        {currentQuestion && (
          <TestQuestion
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onFlag={handleFlag}
            timeLeft={timeLeft}
            isFlagged={flaggedQuestions.has(currentQuestion.id)}
          />
        )}

        {/* Submit Test Dialog */}
        <div className="mt-8 text-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="mr-4"
                data-testid="button-submit-test"
              >
                Submit Test Early
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Test?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to submit your test? You have answered {answeredCount} out of {questions.length} questions.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Test</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmitTest} className="bg-red-600 hover:bg-red-700">
                  Submit Test
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Question Navigator */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Question Navigator</h3>
            <div className="grid grid-cols-10 gap-2 max-w-2xl mx-auto">
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 text-xs rounded border transition-all ${
                    index === currentQuestionIndex
                      ? 'bg-purple-600 text-white border-purple-600'
                      : answers[question.id]
                      ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400'
                      : flaggedQuestions.has(question.id)
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                  data-testid={`button-question-nav-${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex justify-center space-x-6 mt-3 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-600 rounded mr-2"></div>
                Current
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                Answered
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
                Flagged
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                Not Answered
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
