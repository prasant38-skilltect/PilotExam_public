import { useState } from 'react';
import { Question } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onFlag: () => void;
  timeLeft: number;
  isFlagged: boolean;
  showExplanation?: boolean;
}

export function TestQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  onFlag,
  timeLeft,
  isFlagged,
  showExplanation = false,
}: TestQuestionProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const options = [
    { value: 'A', text: question.optionA },
    { value: 'B', text: question.optionB },
    { value: 'C', text: question.optionC },
    { value: 'D', text: question.optionD },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-8">
        {/* Question Counter and Timer */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-lg font-semibold">
            Question {questionNumber} of {totalQuestions}
          </div>
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-semibold flex items-center">
            <Clock className="mr-2" size={16} />
            <span data-testid="text-timer">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4" data-testid="text-question">
            {question.questionText}
          </h3>
          
          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {options.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200",
                  selectedAnswer === option.value
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700",
                  showExplanation && question.correctAnswer === option.value
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "",
                  showExplanation && selectedAnswer === option.value && question.correctAnswer !== option.value
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : ""
                )}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.value}
                  checked={selectedAnswer === option.value}
                  onChange={(e) => onAnswerSelect(e.target.value)}
                  className="mr-4 text-purple-600 focus:ring-purple-500"
                  data-testid={`input-option-${option.value.toLowerCase()}`}
                />
                <span className="text-gray-900 dark:text-gray-100">
                  {option.value}) {option.text}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Explanation (shown after answering or in review mode) */}
        {showExplanation && question.explanation && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Explanation:</h4>
            <p className="text-blue-800 dark:text-blue-200" data-testid="text-explanation">
              {question.explanation}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
              Correct Answer: <span className="font-semibold">{question.correctAnswer})</span>
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={questionNumber === 1}
            data-testid="button-previous"
          >
            Previous
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onFlag}
              className={cn(
                "flex items-center",
                isFlagged && "border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
              )}
              data-testid="button-flag"
            >
              <Flag className="mr-2" size={16} />
              {isFlagged ? 'Unflag' : 'Flag'}
            </Button>
            
            <Button
              onClick={onNext}
              className="bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300"
              data-testid="button-next"
            >
              {questionNumber === totalQuestions ? 'Finish Test' : 'Next Question'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
