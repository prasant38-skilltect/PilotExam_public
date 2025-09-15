import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  BookOpen,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface TestSessionDetailsProps {
  sessionId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestSessionDetails({ sessionId, open, onOpenChange }: TestSessionDetailsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: sessionDetails, isLoading } = useQuery({
    queryKey: ['/api/test-sessions', sessionId, 'details'],
    enabled: open && sessionId !== null,
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!sessionDetails || isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p>Loading test session details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { session, questionsWithAnswers } = sessionDetails;
  const currentQuestion = questionsWithAnswers[currentQuestionIndex];
  const correctAnswers = questionsWithAnswers.filter(q => q.isCorrect).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-xl font-bold">Test Session Details</DialogTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{session.sectionName}</div>
                <div className="text-sm text-gray-500">Section</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{session.score || 0}%</div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {correctAnswers}/{questionsWithAnswers.length}
                </div>
                <div className="text-sm text-gray-500">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatDuration(session.timeSpent || 0)}
                </div>
                <div className="text-sm text-gray-500">Time Spent</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
              <span>Started: {formatDate(session.startTime)}</span>
              {session.endTime && <span>Finished: {formatDate(session.endTime)}</span>}
              <Badge variant={session.isCompleted ? "default" : "secondary"}>
                {session.isCompleted ? "Completed" : "In Progress"}
              </Badge>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
              {/* Question List Sidebar */}
              <div className="border-r bg-gray-50 dark:bg-gray-900">
                <div className="p-4 border-b">
                  <h3 className="font-medium mb-2">Questions ({questionsWithAnswers.length})</h3>
                  <Progress 
                    value={(correctAnswers / questionsWithAnswers.length) * 100} 
                    className="h-2" 
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {correctAnswers} correct out of {questionsWithAnswers.length}
                  </div>
                </div>
                <ScrollArea className="h-[calc(100vh-320px)]">
                  <div className="p-2 space-y-1">
                    {questionsWithAnswers.map((question, index) => (
                      <Button
                        key={question.id}
                        variant={currentQuestionIndex === index ? "default" : "ghost"}
                        size="sm"
                        className={`w-full justify-start h-auto p-3 ${
                          question.isCorrect ? 'border-l-4 border-green-500' : 
                          question.userAnswer ? 'border-l-4 border-red-500' : 
                          'border-l-4 border-gray-300'
                        }`}
                        onClick={() => setCurrentQuestionIndex(index)}
                        data-testid={`question-nav-${index}`}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-xs font-mono">{index + 1}</span>
                          {question.isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : question.userAnswer ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <div className="flex-1 text-left">
                            <div className="text-xs truncate">
                              {question.text?.substring(0, 40)}...
                            </div>
                            {question.timeSpent && (
                              <div className="text-xs text-gray-500">
                                {formatDuration(question.timeSpent)}
                              </div>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Main Question Display */}
              <div className="lg:col-span-2 flex flex-col">
                {currentQuestion && (
                  <>
                    {/* Question Header */}
                    <div className="p-4 border-b bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            Question {currentQuestionIndex + 1} of {questionsWithAnswers.length}
                          </span>
                          {currentQuestion.isCorrect ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Correct
                            </Badge>
                          ) : currentQuestion.userAnswer ? (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Incorrect
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Not Answered
                            </Badge>
                          )}
                        </div>
                        {currentQuestion.timeSpent && (
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(currentQuestion.timeSpent)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Question Content */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-6">
                        {/* Question Text */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              Question
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                              {currentQuestion.text}
                            </p>
                          </CardContent>
                        </Card>

                        {/* Answer Options */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Target className="h-5 w-5" />
                              Answer Options
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {[
                                { key: 'A', text: currentQuestion.option_a },
                                { key: 'B', text: currentQuestion.option_b },
                                { key: 'C', text: currentQuestion.option_c },
                                { key: 'D', text: currentQuestion.option_d }
                              ].filter(option => option.text).map((option) => {
                                const isUserAnswer = currentQuestion.userAnswer === option.key;
                                const isCorrectAnswer = currentQuestion.correct_answer === option.key;
                                
                                return (
                                  <div
                                    key={option.key}
                                    className={`p-3 rounded-lg border-2 ${
                                      isCorrectAnswer 
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                        : isUserAnswer && !isCorrectAnswer
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                        {option.key}
                                      </span>
                                      <span className="flex-1">{option.text}</span>
                                      <div className="flex gap-1">
                                        {isCorrectAnswer && (
                                          <CheckCircle className="h-5 w-5 text-green-600" />
                                        )}
                                        {isUserAnswer && !isCorrectAnswer && (
                                          <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                        {isUserAnswer && (
                                          <Badge variant="outline" className="text-xs">
                                            Your Answer
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Explanation */}
                        {currentQuestion.explanation && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Explanation</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div 
                                className="prose prose-sm max-w-none dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: currentQuestion.explanation }}
                              />
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Navigation Footer */}
                    <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                          disabled={currentQuestionIndex === 0}
                          data-testid="button-previous-question"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        
                        <span className="text-sm text-gray-600">
                          {currentQuestionIndex + 1} of {questionsWithAnswers.length}
                        </span>
                        
                        <Button
                          variant="outline"
                          onClick={() => setCurrentQuestionIndex(Math.min(questionsWithAnswers.length - 1, currentQuestionIndex + 1))}
                          disabled={currentQuestionIndex === questionsWithAnswers.length - 1}
                          data-testid="button-next-question"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}