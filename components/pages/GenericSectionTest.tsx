'use client'

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Flag, MessageSquare, FileText, ThumbsUp, ThumbsDown, Send, Home, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Question = {
  id: number;
  subject_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  difficulty?: string;
  sequence: number;
  explanation_text?: string;
  explanation_image?: string;
};

interface GenericSectionTestProps {
  sectionId: number;
  sectionName: string;
  backUrl: string;
}

export default function GenericSectionTest({ sectionId, sectionName, backUrl }: GenericSectionTestProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [testStartTime, setTestStartTime] = useState<number | null>(null);
  const [isTestActive, setIsTestActive] = useState(true);
  const [reportIssue, setReportIssue] = useState<{ questionId: number | null; description: string }>({
    questionId: null,
    description: ''
  });
  const [activeTab, setActiveTab] = useState('question');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      username: 'Handith99',
      comment: 'It appears on easa exam in thai but reworded',
      likes: 1,
      dislikes: 0,
      createdAt: '28 Feb 25 | 12:16'
    },
    {
      id: 2,
      username: 'Svindy',
      comment: 'Guys on the ground singing to the guy in the air.. "Everybooody... Yeeeeeah... Rock your boooooody... Yeeeeeah"',
      likes: 2,
      dislikes: 0,
      createdAt: '13 Jul 24 | 17:24'
    }
  ]);
  const { toast } = useToast();

  // Get questions for this section
  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: [`/api/sections/${sectionId}/questions`],
  });

  // Auto-start test when component mounts
  useEffect(() => {
    if (!testStartTime) {
      setTestStartTime(Date.now());
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTestActive && testStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - testStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestActive, testStartTime]);

  const startTest = () => {
    setTestStartTime(Date.now());
    setIsTestActive(true);
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
    setAnsweredQuestions(prev => new Set(Array.from(prev).concat([questionId])));
  };

  const handleNext = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishTest = () => {
    setIsTestActive(false);
    setShowResults(true);
  };

  const handleReportIssue = (questionId: number) => {
    setReportIssue({ questionId, description: '' });
  };

  const submitIssueReport = () => {
    toast({
      title: "Issue Reported",
      description: "Thank you for reporting this issue. We'll review it soon.",
    });
    setReportIssue({ questionId: null, description: '' });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    if (!questions) return { correct: 0, total: 0, percentage: 0 };

    const correct = questions.filter(q => 
      selectedAnswers[q.id] === q.correct_answer
    ).length;

    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-white">Loading questions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-white">
            <h1 className="text-2xl mb-4">No Questions Available</h1>
            <Link href={backUrl}>
              <Button variant="outline" className="border-cyan-400/40 text-cyan-200">
                ← Go Back
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sortedQuestions = [...questions].sort((a, b) => a.sequence - b.sequence);
  const currentQuestion = sortedQuestions[currentQuestionIndex];
  const score = calculateScore();

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">{sectionName} - Results</h1>
            <Link href={backUrl}>
              <Button variant="outline" className="border-cyan-400/40 text-cyan-200 mb-6">
                ← Go Back
              </Button>
            </Link>
          </div>

          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Your Score</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold mb-4 text-blue-600">
                {score.percentage}%
              </div>
              <p className="text-xl mb-4">
                {score.correct} out of {score.total} questions correct
              </p>
              <p className="text-gray-600">
                Time taken: {formatTime(elapsedTime)}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {sortedQuestions.map((question, index) => {
              const userAnswer = selectedAnswers[question.id];
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <Card key={question.id} className={`${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      #{question.sequence}. {question.question_text}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {[
                        { key: 'A', text: question.option_a },
                        { key: 'B', text: question.option_b },
                        { key: 'C', text: question.option_c },
                        { key: 'D', text: question.option_d }
                      ].map((option) => {
                        const isUserAnswer = userAnswer === option.key;
                        const isCorrectAnswer = question.correct_answer === option.key;

                        return (
                          <div
                            key={option.key}
                            className={`p-3 rounded-lg border ${
                              isCorrectAnswer
                                ? 'bg-green-100 border-green-500 text-green-800'
                                : isUserAnswer
                                ? 'bg-red-100 border-red-500 text-red-800'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            {option.key}. {option.text}
                            {isCorrectAnswer && ' ✓ Correct'}
                            {isUserAnswer && !isCorrectAnswer && ' ✗ Your answer'}
                          </div>
                        );
                      })}
                    </div>
                    {(question.explanation_text || question.explanation) && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Explanation:</h4>
                        <p className="text-sm">{question.explanation_text || question.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!isTestActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">{sectionName}</h1>
            <div className="text-white mb-8">
              <p className="text-xl mb-2">Ready to start the test?</p>
              <p>Total Questions: {sortedQuestions.length}</p>
            </div>
            <div className="space-x-4">
              <Link href={backUrl}>
                <Button variant="outline" className="border-cyan-400/40 text-cyan-200">
                  ← Go Back
                </Button>
              </Link>
              <Button onClick={startTest} className="bg-green-600 hover:bg-green-700">
                Start Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Link href={backUrl}>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Home className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">{sectionName}</h1>
          </div>
          <div className="flex items-center space-x-4 text-white">
            <Clock className="h-5 w-5" />
            <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Questions ({answeredQuestions.size}/{sortedQuestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {sortedQuestions.map((q, index) => {
                    const isAnswered = answeredQuestions.has(q.id);
                    const isCorrect = isAnswered && selectedAnswers[q.id] === q.correct_answer;
                    const isWrong = isAnswered && selectedAnswers[q.id] !== q.correct_answer;
                    const isCurrent = currentQuestionIndex === index;

                    let buttonClass = "";
                    if (isCurrent) {
                      buttonClass = "bg-blue-600 text-white border-blue-600";
                    } else if (isCorrect) {
                      buttonClass = "bg-green-500 text-white border-green-500";
                    } else if (isWrong) {
                      buttonClass = "bg-red-500 text-white border-red-500";
                    } else {
                      buttonClass = "bg-white text-black border-gray-300";
                    }

                    return (
                      <Button
                        key={q.id}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 text-xs",
                          buttonClass
                        )}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {q.sequence}
                      </Button>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={handleFinishTest}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={answeredQuestions.size === 0}
                  >
                    Finish Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="question">Question</TabsTrigger>
                    <TabsTrigger value="explanation">Explanation</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                  </TabsList>

                  <TabsContent value="question" className="mt-4">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold">
                          #{currentQuestion.sequence}. {currentQuestion.question_text}
                        </h2>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReportIssue(currentQuestion.id)}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Report
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {[
                          { key: 'A', text: currentQuestion.option_a },
                          { key: 'B', text: currentQuestion.option_b },
                          { key: 'C', text: currentQuestion.option_c },
                          { key: 'D', text: currentQuestion.option_d }
                        ].map((option) => {
                          const isSelected = selectedAnswers[currentQuestion.id] === option.key;
                          const isCorrect = currentQuestion.correct_answer === option.key;
                          const hasAnswered = currentQuestion.id in selectedAnswers;

                          let buttonClass = "";
                          if (hasAnswered) {
                            if (isSelected && !isCorrect) {
                              buttonClass = "bg-red-500 text-white border-red-500";
                            } else if (isCorrect) {
                              buttonClass = "bg-green-500 text-white border-green-500";
                            } else {
                              buttonClass = "bg-gray-100 text-gray-600";
                            }
                          } else {
                            buttonClass = isSelected ? "bg-blue-600 text-white" : "bg-white text-black hover:bg-gray-50";
                          }

                          return (
                            <Button
                              key={option.key}
                              variant="outline"
                              className={cn(
                                "w-full text-left justify-start p-4 h-auto",
                                buttonClass
                              )}
                              onClick={() => handleAnswerSelect(currentQuestion.id, option.key)}
                              disabled={hasAnswered}
                            >
                              <span className="font-semibold mr-3">{option.key}.</span>
                              {option.text}
                              {hasAnswered && isCorrect && <span className="ml-2">✓</span>}
                              {hasAnswered && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Show explanation immediately when answer is selected */}
                      {currentQuestion.id in selectedAnswers && (currentQuestion.explanation_text || currentQuestion.explanation) && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold mb-2 text-blue-800">Explanation:</h4>
                          <p className="text-blue-700">{currentQuestion.explanation_text || currentQuestion.explanation}</p>
                        </div>
                      )}

                      <div className="flex justify-between pt-4">
                        <Button
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={currentQuestionIndex === 0}
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={currentQuestionIndex === sortedQuestions.length - 1 ? handleFinishTest : handleNext}
                          disabled={false}
                        >
                          {currentQuestionIndex === sortedQuestions.length - 1 ? "Finish" : "Next"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="explanation" className="mt-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Explanation</h3>
                      {(currentQuestion.explanation_text || currentQuestion.explanation) ? (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p>{currentQuestion.explanation_text || currentQuestion.explanation}</p>
                        </div>
                      ) : (
                        <p className="text-gray-500">No explanation available for this question.</p>
                      )}
                    </div>
                  </TabsContent>


                  <TabsContent value="comments" className="mt-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Comments
                      </h3>

                      <div className="border rounded-lg p-4">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="mb-3"
                        />
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Post Comment
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="border rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {comment.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-semibold text-sm">{comment.username}</span>
                                  <span className="text-xs text-gray-500">{comment.createdAt}</span>
                                </div>
                                <p className="text-sm">{comment.comment}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    {comment.likes}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                                    <ThumbsDown className="h-3 w-3 mr-1" />
                                    {comment.dislikes}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Report Issue Dialog */}
        <Dialog open={reportIssue.questionId !== null} onOpenChange={() => setReportIssue({ questionId: null, description: '' })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Issue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Report an issue with this question:</p>
              <Textarea
                placeholder="Describe the issue..."
                value={reportIssue.description}
                onChange={(e) => setReportIssue({ ...reportIssue, description: e.target.value })}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setReportIssue({ questionId: null, description: '' })}>
                  Cancel
                </Button>
                <Button onClick={submitIssueReport}>Submit Report</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}