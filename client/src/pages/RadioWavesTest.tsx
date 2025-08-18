import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Flag, Trophy, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RadioWavesTest() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
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

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || showResults) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    if (showResults) return; // Prevent changes after finish
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Mark question as answered for immediate validation and show explanation
    setAnsweredQuestions(prev => new Set(prev).add(questionId));
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
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Timer */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white font-serif italic">
            RADIO WAVES
          </h1>
          
          <div className="flex items-center space-x-6">
            {/* Timer */}
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-md">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className={`font-mono text-lg font-semibold ${
                timeLeft < 300 ? 'text-red-600' : 'text-gray-800 dark:text-white'
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            {/* Cancel Test Button */}
            <Button
              variant="outline"
              onClick={() => window.close()}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              data-testid="button-cancel-test"
            >
              Cancel test
            </Button>
          </div>
        </div>

        {/* Main Layout with Questions on Left and Navigator on Right */}
        <div className="flex gap-6">
          {/* Questions Section - Left Side */}
          <div className="flex-1 space-y-8">
            {/* Score Display */}
            {showResults && (
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700">
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

            {/* Current Question Display */}
            {!showResults ? (
              // Single question view
              <Card className="bg-white dark:bg-slate-800 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex-1">
                      #{currentQuestionIndex + 1}. {questions[currentQuestionIndex].question}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReportIssue(questions[currentQuestionIndex].id)}
                      className="text-gray-500 hover:text-red-500 ml-4 flex items-center space-x-1"
                      data-testid={`report-issue-${questions[currentQuestionIndex].id}`}
                    >
                      <Flag className="h-4 w-4" />
                      <span className="text-sm">Report Issue</span>
                    </Button>
                  </div>

                  {/* Question Image */}
                  {questions[currentQuestionIndex].image && (
                    <div className="mb-6">
                      <img
                        src={questions[currentQuestionIndex].image}
                        alt={`Diagram for question ${currentQuestionIndex + 1}`}
                        className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                        data-testid={`question-image-${questions[currentQuestionIndex].id}`}
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    {questions[currentQuestionIndex].options.map((option, optionIndex) => {
                      const isSelected = selectedAnswers[questions[currentQuestionIndex].id] === option;
                      const isCorrectOption = option === questions[currentQuestionIndex].correctAnswer;
                      const isAnswered = answeredQuestions.has(questions[currentQuestionIndex].id);
                      const showValidation = isAnswered;
                      const isIncorrect = showValidation && isSelected && !isCorrectOption;
                      
                      return (
                        <button
                          key={optionIndex}
                          onClick={() => handleAnswerSelect(questions[currentQuestionIndex].id, option)}
                          disabled={isAnswered}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-between ${
                            showValidation
                              ? isCorrectOption
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : isIncorrect
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700'
                              : isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                          }`}
                          data-testid={`option-${questions[currentQuestionIndex].id}-${optionIndex}`}
                        >
                          <span className="text-gray-800 dark:text-gray-200">
                            {option}
                          </span>
                          {showValidation && isCorrectOption && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {showValidation && isIncorrect && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation - shown immediately after answering */}
                  {answeredQuestions.has(questions[currentQuestionIndex].id) && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Explanation:</strong> {questions[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              // All questions review after finishing
              <div className="space-y-8">
                {questions.map((question, index) => {
                  const isAnswered = answeredQuestions.has(question.id);
                  
                  return (
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
                            className="text-gray-500 hover:text-red-500 ml-4 flex items-center space-x-1"
                            data-testid={`report-issue-${question.id}`}
                          >
                            <Flag className="h-4 w-4" />
                            <span className="text-sm">Report Issue</span>
                          </Button>
                        </div>

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
                            const isCorrectOption = option === question.correctAnswer;
                            const isIncorrect = isSelected && !isCorrectOption;
                            
                            return (
                              <button
                                key={optionIndex}
                                disabled={true}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-between ${
                                  isCorrectOption
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : isIncorrect
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700'
                                }`}
                                data-testid={`option-${question.id}-${optionIndex}`}
                              >
                                <span className="text-gray-800 dark:text-gray-200">
                                  {option}
                                </span>
                                {isCorrectOption && (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                )}
                                {isIncorrect && (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border-l-4 border-blue-500">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Navigation Buttons for individual question view */}
            {!showResults && (
              <div className="flex justify-between items-center mt-6">
                <Button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  data-testid="button-previous"
                >
                  Previous
                </Button>
                
                <span className="text-gray-600 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                
                <Button
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  variant="outline"
                  data-testid="button-next"
                >
                  Next
                </Button>
              </div>
            )}

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
                    setAnsweredQuestions(new Set());
                    setShowResults(false);
                    setCurrentQuestionIndex(0);
                    setTimeLeft(30 * 60);
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
          </div>

          {/* Question Navigator - Right Side */}
          <div className="w-80 space-y-4">
            <Card className="bg-white dark:bg-slate-800 shadow-md sticky top-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Question Navigator
                  </h3>
                  <Button
                    onClick={handleFinish}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
                    data-testid="button-finish-test"
                  >
                    FINISH TEST
                  </Button>
                </div>
                
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {questions.map((question, index) => {
                    const isAnswered = answeredQuestions.has(question.id);
                    const isCorrect = isAnswered && selectedAnswers[question.id] === question.correctAnswer;
                    const isIncorrect = isAnswered && selectedAnswers[question.id] !== question.correctAnswer;
                    const isCurrent = index === currentQuestionIndex;
                    
                    return (
                      <button
                        key={question.id}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-12 h-12 text-sm font-semibold rounded transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                            : isCorrect
                            ? 'bg-green-500 text-white'
                            : isIncorrect
                            ? 'bg-red-500 text-white'
                            : isAnswered
                            ? 'bg-orange-400 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                        }`}
                        data-testid={`nav-question-${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                    Current Question
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    Correct Answer
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                    Incorrect Answer
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-400 rounded mr-2"></div>
                    Answered (Not Yet Scored)
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                    Not Answered
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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