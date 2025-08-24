import { useState } from 'react';
import { Question } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Flag, MessageSquare, BarChart3, FileText, ThumbsUp, ThumbsDown, Send } from '@/components/Icons';
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
    },
    {
      id: 3,
      username: 'User account deleted',
      comment: 'YCS seams as cc',
      likes: 0,
      dislikes: 0,
      createdAt: '03 Feb 23 | 21:32'
    },
    {
      id: 4,
      username: 'kamal350',
      comment: 'I thought rocking wings for radar failures??',
      likes: 0,
      dislikes: 0,
      createdAt: '24 Jun 22 | 18:13'
    }
  ]);

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

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1,
        username: 'Anonymous User',
        comment: newComment.trim(),
        likes: 0,
        dislikes: 0,
        createdAt: new Date().toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleVote = (commentId: number, voteType: 'like' | 'dislike') => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        if (voteType === 'like') {
          return { ...comment, likes: comment.likes + 1 };
        } else {
          return { ...comment, dislikes: comment.dislikes + 1 };
        }
      }
      return comment;
    }));
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardContent className="p-0">
        {/* Top Header */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Q {questionNumber} / {totalQuestions}</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">N° {question.id}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Clock className="mr-1" size={14} />
              <span data-testid="text-timer">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto bg-transparent p-0">
            <TabsTrigger 
              value="question" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent"
              data-testid="tab-question"
            >
              <FileText className="mr-2" size={16} />
              QUESTION
            </TabsTrigger>
            <TabsTrigger 
              value="explanation" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent"
              data-testid="tab-explanation"
            >
              EXPLANATION
            </TabsTrigger>
            <TabsTrigger 
              value="statistics" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent"
              data-testid="tab-statistics"
            >
              <BarChart3 className="mr-2" size={16} />
              STATISTICS
            </TabsTrigger>
            <TabsTrigger 
              value="comments" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent bg-transparent"
              data-testid="tab-comments"
            >
              <MessageSquare className="mr-2" size={16} />
              COMMENTS
            </TabsTrigger>
          </TabsList>

          {/* Question Tab Content */}
          <TabsContent value="question" className="p-6">
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-6" data-testid="text-question">
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
          </TabsContent>

          {/* Explanation Tab Content */}
          <TabsContent value="explanation" className="p-6">
            {question.explanation ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Explanation:</h4>
                <p className="text-blue-800 dark:text-blue-200" data-testid="text-explanation">
                  {question.explanation}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                  Correct Answer: <span className="font-semibold">{question.correctAnswer})</span>
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No explanation available for this question.
              </div>
            )}
          </TabsContent>

          {/* Statistics Tab Content */}
          <TabsContent value="statistics" className="p-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BarChart3 className="mx-auto mb-4" size={48} />
              <p>Question statistics not available in practice mode.</p>
            </div>
          </TabsContent>

          {/* Comments Tab Content */}
          <TabsContent value="comments" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">User comments</h3>
              
              {/* Add Comment Form */}
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <Textarea
                  placeholder="Add your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3"
                  data-testid="textarea-new-comment"
                />
                <Button 
                  onClick={handleCommentSubmit}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!newComment.trim()}
                  data-testid="button-submit-comment"
                >
                  <Send className="mr-2" size={16} />
                  Post Comment
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4" data-testid={`comment-${comment.id}`}>
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {comment.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm" data-testid={`username-${comment.id}`}>
                            {comment.username}
                          </span>
                          <span className="text-xs text-gray-500" data-testid={`timestamp-${comment.id}`}>
                            {comment.createdAt}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3" data-testid={`comment-text-${comment.id}`}>
                          {comment.comment}
                        </p>
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(comment.id, 'like')}
                            className="text-xs"
                            data-testid={`button-like-${comment.id}`}
                          >
                            <ThumbsUp className="mr-1" size={12} />
                            {comment.likes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(comment.id, 'dislike')}
                            className="text-xs"
                            data-testid={`button-dislike-${comment.id}`}
                          >
                            <ThumbsDown className="mr-1" size={12} />
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

        {/* Navigation Buttons */}
        <div className="p-6 border-t bg-gray-50 dark:bg-gray-800">
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
        </div>
      </CardContent>
    </Card>
  );
}
