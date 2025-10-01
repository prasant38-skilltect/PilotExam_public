'use client'

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, Search, Play, Plane } from '@/components/Icons';
import { apiRequest } from '@/lib/queryClient';
import { clearBreadcrumb } from '../utils/breadcrumb';
// import JetEngine from '../components/JetEngine';

interface SearchResult {
  questionId: number;
  questionText: string;
  explanation: string | null;
  quizzes: Array<{
    quizId: number;
    quizTitle: string;
    quizSlug: string;
  }>;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<SearchResult | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clearBreadcrumb();
  }, []);
  
  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= 3) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await apiRequest('GET', `/api/questions/search?query=${encodeURIComponent(searchTerm)}`);
          const results: SearchResult[] = await response.json();
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleQuestionClick = (question: SearchResult) => {
    setSelectedQuestion(question);
    setShowQuizModal(true);
    setShowDropdown(false);
  };

  const handleQuizSelect = (quiz: { quizId: number; quizTitle: string; quizSlug: string }) => {
    // Open quiz in new tab using the existing quiz route structure
    window.open(`/${quiz.quizSlug}`, '_blank');
    // setShowQuizModal(false);
  };

  // const { data: subjects, isLoading } = useQuery({
  //   queryKey: ['/api/subjects'],
  // });

  // const filteredSubjects = (subjects as any)?.filter((subject: any) =>
  //   subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  // ) || [];

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //         <div className="text-center mb-12">
  //           <Skeleton className="h-12 w-96 mx-auto mb-4" />
  //           <Skeleton className="h-6 w-[600px] mx-auto" />
  //         </div>
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  //           {[...Array(12)].map((_, i) => (
  //             <Skeleton key={i} className="h-64 w-full" />
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-xl text-black-600 dark:text-black-300 max-w-4xl mx-auto">
            Master all DGCA subjects with our comprehensive question bank and practice tests
          </h1>
        </div>

        {/* Search */}
        <div className="mb-8 mt-10 mx-auto gap-6" ref={searchContainerRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border border-blue-400"
              data-testid="input-search-questions"
            />
            
            {/* Search Results Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Searching questions...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.questionId}
                        onClick={() => handleQuestionClick(result)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        data-testid={`search-result-${result.questionId}`}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {result.questionText.length > 100 
                            ? `${result.questionText.substring(0, 100)}...` 
                            : result.questionText}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Found in {result.quizzes.length} quiz{result.quizzes.length !== 1 ? 'es' : ''}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No questions found matching "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* {filteredSubjects.map((subject: any) => (
            <Card key={subject.id} className="hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-700 w-12 h-12 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold" data-testid={`text-subject-code-${subject.code}`}>
                      {subject.code}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Questions</div>
                    <div className="font-bold text-purple-600 dark:text-purple-400" data-testid={`text-question-count-${subject.id}`}>
                      {subject.questionCount}
                    </div>
                  </div>
                </div>
                <CardTitle className="text-lg" data-testid={`text-subject-title-${subject.id}`}>
                  {subject.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4" data-testid={`text-subject-description-${subject.id}`}>
                  {subject.description}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="mr-1" size={16} />
                    <span data-testid={`text-duration-${subject.id}`}>{subject.duration} min</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/test/${subject.id}`} className="flex-1">
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300"
                      data-testid={`button-start-test-${subject.id}`}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Test
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))} */}
        </div>

        {/* Quiz Selection Modal */}
        <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select Quiz</DialogTitle>
            </DialogHeader>
            
            {selectedQuestion && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Question:</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedQuestion.questionText}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    This question appears in the following quizzes:
                  </h3>
                  
                  {selectedQuestion.quizzes.length > 0 ? (
                    <div className="space-y-2">
                      {selectedQuestion.quizzes.map((quiz) => (
                        <button
                          key={quiz.quizId}
                          onClick={() => handleQuizSelect(quiz)}
                          className="w-full p-3 text-left bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors"
                          data-testid={`quiz-option-${quiz.quizId}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {quiz.quizTitle}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Opens in new tab
                              </div>
                            </div>
                            {/* <ExternalLink className="h-4 w-4 text-gray-400" /> */}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      This question is not currently assigned to any quiz.
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {/* <div className="my-12 border-t border-gray-200 dark:border-gray-700">
        <JetEngine />
      </div> */}
    </div>
  );
}