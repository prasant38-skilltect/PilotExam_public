import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function RadioWavesTest() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const questions = [
    {
      id: 1,
      question: "A radio wave is:",
      options: [
        "an energy wave comprising an electrical field in the same plane as a magnetic field",
        "an electrical field alternating with a magnetic field",
        "an energy wave where there is an electrical field perpendicular to a magnetic field",
        "an energy field with an electrical component"
      ],
      correctAnswer: "an energy wave comprising an electrical field in the same plane as a magnetic field",
      explanation: "radio waves are made up of two components, an electrical (E) field parallel to the wire and a magnetic (H) field perpendicular to the wire."
    },
    {
      id: 2,
      question: "The speed of radio waves is:",
      options: [
        "300 km per second",
        "300 million metres per second",
        "162 nm per second",
        "162 million nm per second"
      ],
      correctAnswer: "300 million metres per second",
      explanation: "Radio waves travel at the speed of light, which is approximately 300 million metres per second (3 × 10⁸ m/s)."
    }
  ];

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Show explanation after selecting answer
    setShowExplanation(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 font-serif italic">
            RADIO WAVES
          </h1>
        </div>

        <div className="space-y-8">
          {questions.map((question, index) => (
            <Card key={question.id} className="bg-white dark:bg-slate-800 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white">
                  #{index + 1}. {question.question}
                </h2>

                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selectedAnswers[question.id] === option;
                    const isCorrect = option === question.correctAnswer;
                    const showResult = showExplanation[question.id];
                    
                    return (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(question.id, option)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-between ${
                          showResult
                            ? isCorrect
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : isSelected
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700'
                            : isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                        }`}
                        data-testid={`option-${question.id}-${optionIndex}`}
                      >
                        <span className="text-gray-800 dark:text-gray-200">
                          {option}
                        </span>
                        {showResult && isCorrect && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation[question.id] && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => window.close()}
            className="bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700"
            data-testid="button-close"
          >
            Close Test
          </Button>
        </div>
      </div>
    </div>
  );
}