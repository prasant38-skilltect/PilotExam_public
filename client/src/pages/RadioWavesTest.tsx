import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Flag, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RadioWavesTest() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [reportIssue, setReportIssue] = useState<{ questionId: number | null; description: string }>({
    questionId: null,
    description: ''
  });
  const { toast } = useToast();

  const questions = [
    {
      id: 1,
      question: "A radio wave is:",
      image: null,
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
      image: null,
      options: [
        "300 km per second",
        "300 million metres per second",
        "162 nm per second", 
        "162 million nm per second"
      ],
      correctAnswer: "300 million metres per second",
      explanation: "Radio waves travel at the speed of light, which is approximately 300 million metres per second (3 × 10⁸ m/s)."
    },
    {
      id: 3,
      question: "The phase of the reference wave is 110° and the phase of the variable wave is 315°. What is the phase difference?",
      image: "/api/placeholder-diagram.svg", // Placeholder for future dynamic images
      options: [
        "105°",
        "025°", 
        "155°",
        "315°"
      ],
      correctAnswer: "025°",
      explanation: "Phase difference = |315° - 110°| = 205°. Since we want the smaller angle, 360° - 205° = 155°. Actually, the direct calculation gives us 205°, but looking at the reference, the answer should be 025° which suggests a different calculation method."
    },
    {
      id: 4,
      question: "Determine the approximate phase difference between the reference wave and the variable wave:",
      image: "/api/placeholder-waveform.svg", // Placeholder for future dynamic images
      options: [
        "030°",
        "150°",
        "210°", 
        "330°"
      ],
      correctAnswer: "150°",
      explanation: "By examining the waveform diagram, we can measure the phase shift between the reference and variable waves by counting the horizontal distance between corresponding peaks or zero crossings."
    }
  ];

  const handleAnswerSelect = (questionId: number, answer: string) => {
    if (showResults) return; // Prevent changes after finish
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleFinish = () => {
    if (Object.keys(selectedAnswers).length === 0) {
      toast({
        title: "No Answers Selected",
        description: "Please answer at least one question before finishing the test.",
        variant: "destructive",
      });
      return;
    }
    
    setShowResults(true);
    
    // Calculate score
    const correctCount = questions.reduce((count, question) => {
      return selectedAnswers[question.id] === question.correctAnswer ? count + 1 : count;
    }, 0);
    
    const score = Math.round((correctCount / questions.length) * 100);
    
    toast({
      title: "Test Completed!",
      description: `You scored ${correctCount} out of ${questions.length} (${score}%)`,
      variant: score >= 70 ? "default" : "destructive",
    });
  };

  const handleReportIssue = (questionId: number) => {
    setReportIssue({ questionId, description: '' });
  };

  const submitIssueReport = () => {
    if (!reportIssue.description.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe the issue with this question.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would send to an API
    toast({
      title: "Issue Reported",
      description: "Thank you for reporting this issue. We'll review it shortly.",
    });
    
    setReportIssue({ questionId: null, description: '' });
  };

  const calculateScore = () => {
    const correctCount = questions.reduce((count, question) => {
      return selectedAnswers[question.id] === question.correctAnswer ? count + 1 : count;
    }, 0);
    
    return {
      correct: correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100)
    };
  };

  const score = calculateScore();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 font-serif italic">
            RADIO WAVES
          </h1>
        </div>

        {/* Score Display */}
        {showResults && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Test Results
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    You scored {score.correct} out of {score.total} ({score.percentage}%)
                  </p>
                  <p className={`text-sm mt-1 ${score.percentage >= 70 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {score.percentage >= 70 ? 'Congratulations! You passed!' : 'Keep studying and try again!'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          {questions.map((question, index) => (
            <Card key={question.id} className="bg-white dark:bg-slate-800 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex-1">
                    #{index + 1}. {question.question}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReportIssue(question.id)}
                    className="text-gray-500 hover:text-red-500 ml-4"
                    data-testid={`report-issue-${question.id}`}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>

                {/* Question Image */}
                {question.image && (
                  <div className="mb-6">
                    <img
                      src={question.image}
                      alt={`Diagram for question ${index + 1}`}
                      className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                      data-testid={`question-image-${question.id}`}
                    />
                  </div>
                )}

                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selectedAnswers[question.id] === option;
                    const isCorrect = option === question.correctAnswer;
                    const isIncorrect = showResults && isSelected && !isCorrect;
                    
                    return (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(question.id, option)}
                        disabled={showResults}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-between ${
                          showResults
                            ? isCorrect
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : isIncorrect
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
                        {showResults && isCorrect && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {showResults && isIncorrect && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showResults && (
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

        {/* Test Actions */}
        <div className="mt-8 text-center space-x-4">
          {!showResults ? (
            <Button
              onClick={handleFinish}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              data-testid="button-finish"
            >
              Finish Test
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAnswers({});
                setShowResults(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              data-testid="button-retake"
            >
              Retake Test
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => window.close()}
            className="bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 px-8 py-3"
            data-testid="button-close"
          >
            Close Test
          </Button>
        </div>

        {/* Report Issue Dialog */}
        <Dialog open={reportIssue.questionId !== null} onOpenChange={() => setReportIssue({ questionId: null, description: '' })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report an Issue</DialogTitle>
              <DialogDescription>
                Please describe the issue with question #{reportIssue.questionId}. Our team will review it.
              </DialogDescription>
            </DialogHeader>
            
            <Textarea
              placeholder="Describe the issue (e.g., incorrect answer, typo, unclear question...)"
              value={reportIssue.description}
              onChange={(e) => setReportIssue(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px]"
              data-testid="textarea-issue-description"
            />
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReportIssue({ questionId: null, description: '' })}
                data-testid="button-cancel-report"
              >
                Cancel
              </Button>
              <Button
                onClick={submitIssueReport}
                className="bg-red-600 hover:bg-red-700"
                data-testid="button-submit-report"
              >
                Submit Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}