import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { Home, Edit, Eye, Calendar, User, MessageSquare, Search, ChevronLeft, ChevronRight, TreePine, ExternalLink } from "lucide-react";

export default function Admin() {
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Pagination and search state for issue reports
  const [reportsPage, setReportsPage] = useState(1);

  // Pagination and search state for questions
  const [questionsPage, setQuestionsPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [hasEmptyExplanation, setHasEmptyExplanation] = useState(false);
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  // Debounce search text to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setQuestionsPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch issue reports with pagination
  const { data: issueReportsData, isLoading: loadingReports } = useQuery({
    queryKey: ['/api/admin/issue-reports', { page: reportsPage, limit: 50 }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey as [string, { page: number; limit: number }];
      const res = await apiRequest('GET', `/api/admin/issue-reports?page=${params.page}&limit=${params.limit}`);
      // If apiRequest returns a Response, parse it here
      if (res instanceof Response) {
        return await res.json();
      }
      return res;    },
  });

  // Fetch questions with pagination and search
  const { data: questionsData, isLoading: loadingQuestions } = useQuery({
    queryKey: ['/api/admin/questions', { 
      page: questionsPage, 
      limit: 50, 
      search: debouncedSearchText, 
      hasEmptyExplanation 
    }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey as [string, { 
        page: number; 
        limit: number; 
        search: string; 
        hasEmptyExplanation: boolean 
      }];
      const searchParam = params.search ? `&search=${encodeURIComponent(params.search)}` : '';
      const emptyExplanationParam = params.hasEmptyExplanation ? '&hasEmptyExplanation=true' : '';
      const res = await apiRequest('GET', `/api/admin/questions?page=${params.page}&limit=${params.limit}${searchParam}${emptyExplanationParam}`);
      // If apiRequest returns a Response, parse it here
      if (res instanceof Response) {
        return await res.json();
      }
      return res;    },
  });

  const issueReports = issueReportsData?.reports || [];
  const issueReportsTotal = issueReportsData?.total || 0;
  const questions = questionsData?.questions || [];
  const questionsTotal = questionsData?.total || 0;

  // Fetch category hierarchy
  const { data: hierarchyData, isLoading: loadingHierarchy } = useQuery({
    queryKey: ['/api/admin/category-hierarchy'],
    queryFn: async ({ queryKey }) => {
      const res = await apiRequest('GET', '/api/admin/category-hierarchy');
      // If apiRequest returns a Response, parse it here
      if (res instanceof Response) {
        return await res.json();
      }
      return res;
    },
  });

  const hierarchy = hierarchyData || [];

  // Mutation for updating questions
  const updateQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      return await apiRequest('PUT', `/api/admin/questions/${questionData.id}`, questionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      toast({
        title: "Success",
        description: "Question updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update question. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update question:", error);
    }
  });

  const handleEditQuestion = (question: any) => {
    setEditingQuestion({
      id: question.id,
      question_text: question.text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
      explanation_text: question.explanation,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;
    updateQuestionMutation.mutate(editingQuestion);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      <div className="w-full mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Home className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-white">Admin Panel</h1>
          </div>
        </div>

        {/* Admin Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="reports" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Issue Reports
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Questions
                </TabsTrigger>
                <TabsTrigger value="hierarchy" className="flex items-center gap-2">
                  <TreePine className="h-4 w-4" />
                  Category Hierarchy
                </TabsTrigger>
              </TabsList>

              {/* Issue Reports Tab */}
              <TabsContent value="reports" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Issue Reports ({issueReports.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingReports ? (
                      <div className="text-center py-8">Loading reports...</div>
                    ) : issueReports.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No issue reports found.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {issueReports.map((report: any) => (
                          <Card key={report.id} className="border-l-4 border-l-orange-500">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    Question #{report.questionId}
                                  </Badge>
                                  <span className="flex items-center gap-1 text-sm text-gray-500">
                                    <User className="h-3 w-3" />
                                    {report.userId}
                                  </span>
                                </div>
                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(report.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">
                                {report.description}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {/* Pagination for Issue Reports */}
                        {issueReportsTotal > 50 && (
                          <div className="flex justify-center items-center gap-2 mt-6">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReportsPage(prev => Math.max(1, prev - 1))}
                              disabled={reportsPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                              Page {reportsPage} of {Math.ceil(issueReportsTotal / 50)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReportsPage(prev => prev + 1)}
                              disabled={reportsPage >= Math.ceil(issueReportsTotal / 50)}
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Edit Questions Tab */}
              <TabsContent value="questions" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Questions ({questionsTotal})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter Controls */}
                    <div className="mb-6 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <Label htmlFor="search">Search Questions</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="search"
                              placeholder="Search by question text..."
                              value={searchText}
                              onChange={(e) => setSearchText(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="emptyExplanation"
                              checked={hasEmptyExplanation}
                              onCheckedChange={(checked) => {
                                setHasEmptyExplanation(!!checked);
                                setQuestionsPage(1); // Reset to first page
                              }}
                            />
                            <Label htmlFor="emptyExplanation">
                              Questions without explanation
                            </Label>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchText("");
                              setHasEmptyExplanation(false);
                              setQuestionsPage(1);
                            }}
                          >
                            Clear Filters
                          </Button>
                        </div>
                      </div>
                    </div>

                    {loadingQuestions ? (
                      <div className="text-center py-8">Loading questions...</div>
                    ) : questions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No questions found.
                      </div>
                    ) : (
                      <div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Question</TableHead>
                              <TableHead>Has Explanation</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {questions.map((question: any) => (
                              <TableRow key={question.id}>
                                <TableCell>{question.id}</TableCell>
                                <TableCell className="max-w-md">
                                  <div className="truncate" title={question.text}>
                                    {question.text}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={question.explanation ? "default" : "destructive"}>
                                    {question.explanation ? "Yes" : "No"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditQuestion(question)}
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        {/* Pagination for Questions */}
                        {questionsTotal > 50 && (
                          <div className="flex justify-center items-center gap-2 mt-6">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setQuestionsPage(prev => Math.max(1, prev - 1))}
                              disabled={questionsPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                              Page {questionsPage} of {Math.ceil(questionsTotal / 50)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setQuestionsPage(prev => prev + 1)}
                              disabled={questionsPage >= Math.ceil(questionsTotal / 50)}
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Category Hierarchy Tab */}
              <TabsContent value="hierarchy" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TreePine className="h-5 w-5" />
                      Category Hierarchy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingHierarchy ? (
                      <div className="text-center py-8">Loading hierarchy...</div>
                    ) : hierarchy.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No categories found.
                        <br />
                        <small className="text-xs">Debug: {JSON.stringify(hierarchyData)}</small>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {hierarchy.map((category: any) => (
                          <Card key={category.id} className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {category.name} - {category.text}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="text-xs text-gray-500 mb-2">
                                Topics: {category.topics?.length || 0} | Debug: {JSON.stringify(category.topics?.slice(0, 2))}
                              </div>
                              {category.topics && category.topics.length > 0 ? category.topics.map((topic: any) => (
                                <div key={topic.id} className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                        {topic.text}
                                      </h4>
                                      {topic.quizId && topic.quizSlug && (
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge variant="outline" className="text-xs">
                                            Quiz ID: {topic.quizId}
                                          </Badge>
                                          <button
                                            onClick={() => window.open(`/quiz/${topic.quizSlug}`, '_blank', 'noopener,noreferrer')}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1 hover:underline"
                                            data-testid={`quiz-link-${topic.quizId}`}
                                          >
                                            {topic.quizTitle || topic.quizSlug}
                                            <ExternalLink className="h-3 w-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Render subtopics recursively */}
                                  {topic.subtopics && topic.subtopics.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      {topic.subtopics.map((subtopic: any) => (
                                        <div key={subtopic.id} className="ml-4 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {subtopic.text}
                                              </h5>
                                              {subtopic.quizId && subtopic.quizSlug && (
                                                <div className="flex items-center gap-2 mt-1">
                                                  <Badge variant="outline" className="text-xs">
                                                    Quiz ID: {subtopic.quizId}
                                                  </Badge>
                                                  <button
                                                    onClick={() => window.open(`/quiz/${subtopic.quizSlug}`, '_blank', 'noopener,noreferrer')}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1 hover:underline"
                                                    data-testid={`quiz-link-${subtopic.quizId}`}
                                                  >
                                                    {subtopic.quizTitle || subtopic.quizSlug}
                                                    <ExternalLink className="h-3 w-3" />
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          
                                          {/* Handle deeper nesting if needed */}
                                          {subtopic.subtopics && subtopic.subtopics.length > 0 && (
                                            <div className="mt-2 ml-4 space-y-1">
                                              {subtopic.subtopics.map((deepSubtopic: any) => (
                                                <div key={deepSubtopic.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between">
                                                  <span>{deepSubtopic.text}</span>
                                                  {deepSubtopic.quizId && deepSubtopic.quizSlug && (
                                                    <div className="flex items-center gap-1">
                                                      <Badge variant="outline" className="text-xs">
                                                        Quiz ID: {deepSubtopic.quizId}
                                                      </Badge>
                                                      <button
                                                        onClick={() => window.open(`/quiz/${deepSubtopic.quizSlug}`, '_blank', 'noopener,noreferrer')}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 hover:underline"
                                                        data-testid={`quiz-link-${deepSubtopic.quizId}`}
                                                      >
                                                        {deepSubtopic.quizTitle || deepSubtopic.quizSlug}
                                                        <ExternalLink className="h-2 w-2" />
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )) : (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                  No topics found for this category.
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Edit Question Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Question #{editingQuestion?.id}</DialogTitle>
            </DialogHeader>
            {editingQuestion && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question_text">Question Text</Label>
                  <Textarea
                    id="question_text"
                    value={editingQuestion.question_text}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        question_text: e.target.value,
                      })
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="option_a">Option A</Label>
                    <Input
                      id="option_a"
                      value={editingQuestion.option_a || ""}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          option_a: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="option_b">Option B</Label>
                    <Input
                      id="option_b"
                      value={editingQuestion.option_b || ""}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          option_b: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="option_c">Option C</Label>
                    <Input
                      id="option_c"
                      value={editingQuestion.option_c || ""}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          option_c: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="option_d">Option D</Label>
                    <Input
                      id="option_d"
                      value={editingQuestion.option_d || ""}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          option_d: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="correct_answer">Correct Answer</Label>
                  <select
                    id="correct_answer"
                    value={editingQuestion.correct_answer || ""}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correct_answer: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select correct answer</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="explanation_text">Explanation</Label>
                  <Textarea
                    id="explanation_text"
                    value={editingQuestion.explanation_text || ""}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        explanation_text: e.target.value,
                      })
                    }
                    className="min-h-[100px]"
                    placeholder="Enter explanation text (use \n for line breaks)"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveQuestion}
                    disabled={updateQuestionMutation.isPending}
                  >
                    {updateQuestionMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}