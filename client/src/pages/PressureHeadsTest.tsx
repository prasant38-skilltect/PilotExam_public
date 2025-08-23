import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type Question = {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation_text?: string;
  explanation_image?: string;
  sequence: number;
};

export default function PressureHeadsTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  // Get questions for PRESSURE HEADS section (id: 7)
  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ['/api/sections/7/questions'],
  });

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (questions && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
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
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-80 mx-auto mb-6" />
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-6">No Questions Available</h1>
            <Link href="/oxford-instruments-questions/">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-200">
                ← Back to Oxford Instruments
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sortedQuestions = [...questions].sort((a, b) => a.sequence - b.sequence);
  const current = sortedQuestions[currentQuestion];
  const score = calculateScore();

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              PRESSURE HEADS - Test Results
            </h1>
            <Link href="/oxford-instruments-questions/">
              <Button
                variant="outline"
                className="mb-8 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              >
                ← Back to Oxford Instruments
              </Button>
            </Link>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Your Score</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold mb-4 text-blue-600">
                {score.percentage}%
              </div>
              <p className="text-xl">
                {score.correct} out of {score.total} questions correct
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
                      #{index + 1}. {question.question_text}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {['A', 'B', 'C', 'D'].map((option) => {
                        const optionText = question[`option_${option.toLowerCase()}` as keyof Question] as string;
                        const isUserAnswer = userAnswer === option;
                        const isCorrectAnswer = question.correct_answer === option;
                        
                        return (
                          <div
                            key={option}
                            className={`p-3 rounded-lg border ${
                              isCorrectAnswer
                                ? 'bg-green-100 border-green-500 text-green-800'
                                : isUserAnswer
                                ? 'bg-red-100 border-red-500 text-red-800'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            {option}. {optionText}
                            {isCorrectAnswer && ' ✓ Correct'}
                            {isUserAnswer && !isCorrectAnswer && ' ✗ Your answer'}
                          </div>
                        );
                      })}
                    </div>
                    {question.explanation_text && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Explanation:</h4>
                        <p className="text-sm">{question.explanation_text}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            PRESSURE HEADS Test
          </h1>
          <Link href="/oxford-instruments-questions/">
            <Button
              variant="outline"
              className="mb-8 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
            >
              ← Back to Oxford Instruments
            </Button>
          </Link>
          <div className="text-white">
            Question {currentQuestion + 1} of {sortedQuestions.length}
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              #{current.sequence}. {current.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map((option) => {
                const optionText = current[`option_${option.toLowerCase()}` as keyof Question] as string;
                const isSelected = selectedAnswers[current.id] === option;
                
                return (
                  <Button
                    key={option}
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full text-left justify-start p-4 h-auto ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-50'
                    }`}
                    onClick={() => handleAnswerSelect(current.id, option)}
                  >
                    <span className="font-semibold mr-3">{option}.</span>
                    {optionText}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
          >
            Previous
          </Button>
          
          <div className="text-white">
            {Object.keys(selectedAnswers).length} / {sortedQuestions.length} answered
          </div>

          {currentQuestion === sortedQuestions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== sortedQuestions.length}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Test
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!selectedAnswers[current.id]}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}