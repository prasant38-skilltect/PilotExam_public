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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BulkUpload } from "../components/BulkUpload";
import { Link, useLocation } from "wouter";
import { Home, Edit, Eye, Calendar, User, X, MessageSquare, Search, ChevronLeft, ChevronRight, TreePine, ExternalLink, Plus, Upload, Download, Link as LinkIcon, Check, ChevronsUpDown } from "lucide-react";
import { TopicLinking } from "../components/TopicLinking";
import { MapTopicPanel } from "../components/MapTopicPanel";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export default function Admin() {
  const [editingQuestion, setEditingQuestion] = useState<any>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [newQuestionData, setNewQuestionData] = useState({
    question_text: '',
    explanation: '',
    options: [{ optionText: '', isCorrect: false }],
    quizId: null
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Comment moderation state
  const [editingComment, setEditingComment] = useState<any>(null);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");

  // Pagination and search state for issue reports
  const [reportsPage, setReportsPage] = useState(1);

  // Pagination and search state for questions
  const [questionsPage, setQuestionsPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [hasEmptyExplanation, setHasEmptyExplanation] = useState(false);
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  
  // Question management state - unified dialog
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [questionData, setQuestionData] = useState({
    question_text: '',
    explanation_text: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  });
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const isEditMode = editingQuestionId !== null;
  
  // Topic linking state after bulk upload
  const [showTopicLinking, setShowTopicLinking] = useState(false);
  const [uploadedQuestions, setUploadedQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  
  // Bulk selection state for main questions table
  const [selectedQuestionsInTable, setSelectedQuestionsInTable] = useState<number[]>([]);
  const [showBulkTopicMapping, setShowBulkTopicMapping] = useState(false);
  const [topicSearchValue, setTopicSearchValue] = useState("");
  const link = useLocation();

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

  // Fetch pending comments for moderation
  const { data: pendingComments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['/api/admin/comments/pending'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/comments/pending');
      return res instanceof Response ? await res.json() : res;
    },
  });

  // Fetch topics for question linking
  const { data: allTopics = [], isLoading: loadingTopics } = useQuery({
    queryKey: ['/api/admin/topics'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/topics');
      return res instanceof Response ? await res.json() : res;
    },
  });

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
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/category-hierarchy'] });
      // Invalidate any quiz or topic queries that might contain this question
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKeyString = query.queryKey[0]?.toString() || '';
          return queryKeyString.startsWith('/api/') && 
                 (queryKeyString.includes('quiz') ||
                  queryKeyString.includes('topic') ||
                  queryKeyString.includes('section'));
        }
      });
      setShowAddQuestionForm(false);
      setShowQuestionDialog(false);
      setNewQuestionData({
        question_text: '',
        explanation: '',
        options: [],
        quizId: null
      });
      setEditingQuestionId(null);
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

  // Mutation for approving comments
  const approveCommentMutation = useMutation({
    mutationFn: async ({ commentId, adminResponse }: { commentId: number, adminResponse?: string }) => {
      return await apiRequest('POST', `/api/admin/comments/${commentId}/approve`, { adminResponse });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments/pending'] });
      setIsCommentDialogOpen(false);
      setEditingComment(null);
      setAdminResponse("");
      toast({
        title: "Success",
        description: "Comment approved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to approve comment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for rejecting comments
  const rejectCommentMutation = useMutation({
    mutationFn: async ({ commentId, adminResponse }: { commentId: number, adminResponse?: string }) => {
      return await apiRequest('POST', `/api/admin/comments/${commentId}/reject`, { adminResponse });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/comments/pending'] });
      setIsCommentDialogOpen(false);
      setEditingComment(null);
      setAdminResponse("");
      toast({
        title: "Success",
        description: "Comment rejected successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to reject comment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for linking questions to topics
  const linkQuestionsToTopicMutation = useMutation({
    mutationFn: async ({ questionIds, topicId }: { questionIds: number[], topicId: number }) => {
      return await apiRequest('POST', '/api/admin/questions/link-to-topic', { questionIds, topicId });
    },
    onSuccess: () => {
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/topics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/category-hierarchy'] });
      // Invalidate any topic-specific quiz queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const firstKey = query.queryKey[0];
          return !!(firstKey && 
                   firstKey.toString().startsWith('/api/') && 
                   (firstKey.toString().includes('quiz') ||
                    firstKey.toString().includes('topic')));
        }
      });
      setShowTopicLinking(false);
      setUploadedQuestions([]);
      setSelectedQuestions([]);
      setSelectedTopic(null);
      toast({
        title: "Success",
        description: "Questions successfully linked to topic.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to link questions to topic. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for creating new questions (admin only)
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      await apiRequest('POST', `/api/admin/questions`, questionData);
    },
    onSuccess: () => {
      setShowAddQuestionForm(false);
      setNewQuestionData({
        question_text: '',
        explanation: '',
        options: [{ optionText: '', isCorrect: false }],
        quizId: null
      });
      toast({
        title: "Success",
        description: "Question added successfully",
      });
      // Refresh the questions data - use predicate to match all question queries
      queryClient.invalidateQueries({ queryKey: [`/api${link[0]}`] });

      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey as string[];
          return queryKey && (
            queryKey[0]?.includes('questions') || 
            queryKey[0]?.includes('/api/sections/') ||
            queryKey[0]?.includes('/api/quiz/') ||
            queryKey[0]?.includes('/api/admin/questions')
          );
        }
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add question",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmitNewQuestion = () => {
    if (!newQuestionData.question_text.trim()) {
      toast({
        title: "Error",
        description: "Please enter question text",
        variant: "destructive",
      });
      return;
    }

    const validOptions = newQuestionData.options.filter(opt => opt.optionText.trim());
    if (validOptions.length === 0) {
      toast({
        title: "Error", 
        description: "Please add at least one option",
        variant: "destructive",
      });
      return;
    }

    const hasCorrectAnswer = validOptions.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      toast({
        title: "Error",
        description: "Please mark at least one option as correct",
        variant: "destructive",
      });
      return;
    }

    createQuestionMutation.mutate({
      ...newQuestionData,
      options: validOptions,
      quizId: -1 // Admin-created questions are not tied to a specific quiz
    });
  };

    const saveQuestion = () => {
    if (editingQuestionId) {
      updateQuestionMutation.mutate({
        id: editingQuestionId,
        ...newQuestionData
      });
    }
  };

  const cancelEditing = () => {
    setEditingQuestionId(null);
    setShowAddQuestionForm(false);
    setNewQuestionData({
      question_text: '',
      options: [],
      explanation: '',
      quizId: null
    });
  };

  const openEditDialog = (question: any) => {
    setNewQuestionData({
      question_text: question.text || '',
      explanation: question.explanation || '',
      options: question.options,
      quizId: question.quiz_id || null
    });
    setEditingQuestionId(question.id);
    setShowAddQuestionForm(true);
  };

  const handleDownloadTemplate = () => {
    // Create and download Excel template
    const link = document.createElement('a');
    link.href = '/api/admin/questions/template';
    link.download = 'questions_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper functions for comment moderation
  const handleCommentAction = (comment: any) => {
    setEditingComment(comment);
    setAdminResponse("");
    setIsCommentDialogOpen(true);
  };

  const handleApproveComment = () => {
    if (!editingComment) return;
    approveCommentMutation.mutate({ 
      commentId: editingComment.id, 
      adminResponse: adminResponse.trim() || undefined 
    });
  };

  const handleRejectComment = () => {
    if (!editingComment) return;
    rejectCommentMutation.mutate({ 
      commentId: editingComment.id, 
      adminResponse: adminResponse.trim() || undefined 
    });
  };

  // Helper functions for bulk question selection in main table
  const handleQuestionSelectionInTable = (questionId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedQuestionsInTable(prev => [...prev, questionId]);
    } else {
      setSelectedQuestionsInTable(prev => prev.filter(id => id !== questionId));
    }
  };

  const handleSelectAllQuestionsInTable = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedQuestionsInTable(questions.map((q: any) => q.id));
    } else {
      setSelectedQuestionsInTable([]);
    }
  };

  const handleBulkMapToTopic = () => {
    if (!selectedTopic || selectedQuestionsInTable.length === 0) {
      toast({
        title: "Error",
        description: "Please select a topic and at least one question.",
        variant: "destructive",
      });
      return;
    }
    
    linkQuestionsToTopicMutation.mutate({
      questionIds: selectedQuestionsInTable,
      topicId: selectedTopic.id
    });
    
    // Reset selections
    setSelectedQuestionsInTable([]);
    setShowBulkTopicMapping(false);
    setSelectedTopic(null);
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

  const updateOption = (index: number, field: 'optionText' | 'isCorrect', value: string | boolean) => {
    setNewQuestionData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };
  
  const removeOption = (index: number) => {
    if (newQuestionData.options.length > 1) {
      setNewQuestionData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  // Helper functions for add question form
  const addNewOption = () => {
    setNewQuestionData(prev => ({
      ...prev,
      options: [...prev.options, { optionText: '', isCorrect: false }]
    }));
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Issue Reports
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Manage Questions
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
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

              {/* Manage Questions Tab */}
              <TabsContent value="questions" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Manage Questions ({questionsTotal})
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowAddQuestionForm(true)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          data-testid="button-add-single-question"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Single Question
                        </Button>
                        <Button
                          onClick={() => setShowBulkUpload(true)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          data-testid="button-bulk-upload"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Bulk Upload
                        </Button>
                        <Button
                          onClick={handleDownloadTemplate}
                          size="sm"
                          variant="outline"
                          data-testid="button-download-template"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download Template
                        </Button>
                        <Button
                          onClick={() => {
                            if (selectedQuestionsInTable.length === 0) {
                              toast({
                                title: "No Questions Selected",
                                description: "Please select questions from the table first using the checkboxes.",
                                variant: "destructive",
                              });
                              return;
                            }
                            // Use the actual selected questions and show the same dialog as after upload
                            setShowBulkTopicMapping(true);
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          data-testid="button-map-selected-to-topic"
                        >
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Map Selected to Topic
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter Controls */}
                    <div className="mb-6 space-y-4">
                      <div className="flex-1">
                          {/* Bulk Actions for Selected Questions */}
                        <MapTopicPanel selectedQuestionsInTable={selectedQuestionsInTable} setSelectedQuestionsInTable={setSelectedQuestionsInTable} setShowBulkTopicMapping={setShowBulkTopicMapping} />
                      </div>
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
                              <TableHead className="w-[50px]">
                                <Checkbox
                                  checked={selectedQuestionsInTable.length === questions.length && questions.length > 0}
                                  onCheckedChange={handleSelectAllQuestionsInTable}
                                  data-testid="checkbox-select-all-questions"
                                />
                              </TableHead>
                              <TableHead>ID</TableHead>
                              <TableHead>Question</TableHead>
                              <TableHead>Has Explanation</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {questions.map((question: any) => (
                              <TableRow key={question.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedQuestionsInTable.includes(question.id)}
                                    onCheckedChange={(checked) => handleQuestionSelectionInTable(question.id, checked as boolean)}
                                    data-testid={`checkbox-question-table-${question.id}`}
                                  />
                                </TableCell>
                                <TableCell>{question.id}</TableCell>
                                <TableCell className="max-w-md">
                                  <div className="truncate" title={question.text}>
                                    <div
                                      className="dark:text-gray-200"
                                      dangerouslySetInnerHTML={{
                                        __html: question.text,
                                      }}
                                    />
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
                                      onClick={() => openEditDialog(question)}
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
                        
                        {/* Bulk Actions for Selected Questions */}
                        <MapTopicPanel selectedQuestionsInTable={selectedQuestionsInTable} setSelectedQuestionsInTable={setSelectedQuestionsInTable} setShowBulkTopicMapping={setShowBulkTopicMapping} />
                        
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

              {/* Comments Moderation Tab */}
              <TabsContent value="comments" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Pending Comments ({pendingComments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingComments ? (
                      <div className="text-center py-8">Loading pending comments...</div>
                    ) : pendingComments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No pending comments for moderation.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingComments.map((comment: any) => (
                          <Card key={comment.id} className="border-l-4 border-l-yellow-500">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">{comment.username}</span>
                                    <Badge variant="outline" className="text-xs">
                                      Question ID: {comment.questionId}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-gray-600 mb-3">
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-md mb-3">
                                    <p className="text-sm">{comment.comment}</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCommentAction(comment)}
                                  data-testid={`button-moderate-comment-${comment.id}`}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Moderate
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
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
                              {/* <div className="text-xs text-gray-500 mb-2">
                                Topics: {category.topics?.length || 0} | Debug: {JSON.stringify(category.topics?.slice(0, 2))}
                              </div> */}
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
                                            onClick={() => window.open(`/${topic.slug}`, '_blank', 'noopener,noreferrer')}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1 hover:underline"
                                            data-testid={`quiz-link-${topic.quizId}`}
                                          >
                                            {topic.quizTitle || topic.slug}
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
                                                    onClick={() => window.open(`/${subtopic.slug}`, '_blank', 'noopener,noreferrer')}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1 hover:underline"
                                                    data-testid={`quiz-link-${subtopic.slug}`}
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
                                                        Quiz ID : {deepSubtopic.quizId} 
                                                      </Badge>
                                                      <button
                                                        onClick={() => window.open(`/${deepSubtopic.slug}`, '_blank', 'noopener,noreferrer')}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 hover:underline"
                                                        data-testid={`quiz-link-${deepSubtopic.quizId}`}
                                                      >
                                                        {deepSubtopic.quizTitle || deepSubtopic.slug}
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
        {/* Question Dialog (Create/Edit) */}
        <Dialog open={showAddQuestionForm} onOpenChange={setShowAddQuestionForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Update Question" : "Add New Question"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-question-text">Question Text</Label>
                <RichTextEditor
                  value={newQuestionData.question_text}
                  onChange={(value: string) => setNewQuestionData(prev => ({...prev, question_text: value}))}
                  placeholder="Enter the question text with formatting..."
                />
              </div>

              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {newQuestionData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <RichTextEditor
                        value={option.optionText}
                        onChange={(value: string) => updateOption(index, 'optionText', value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Correct</span>
                      </div>
                      {newQuestionData.options.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNewOption}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>

              <div>
                <Label htmlFor="new-explanation">Explanation (Optional)</Label>
                <RichTextEditor
                  value={newQuestionData.explanation}
                  onChange={(value: string) => setNewQuestionData(prev => ({...prev, explanation: value}))}
                  placeholder="Enter explanation for the correct answer..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                >
                  Cancel
                </Button>
                {isEditMode ?
                  <Button
                    onClick={saveQuestion}
                    disabled={updateQuestionMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {updateQuestionMutation.isPending ? "Editing..." : "Update Question"}
                  </Button> 
                  : 
                  <Button
                    onClick={handleSubmitNewQuestion}
                    disabled={createQuestionMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createQuestionMutation.isPending ? "Adding..." : "Add Question"}
                  </Button>
                }
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <BulkUpload showBulkUpload={showBulkUpload} setShowBulkUpload={setShowBulkUpload} handleDownloadTemplate={handleDownloadTemplate} setUploadedQuestions={setUploadedQuestions} setShowTopicLinking={setShowTopicLinking} setSelectedQuestions={setSelectedQuestions} />

        {/* Comment Moderation Dialog */}
        <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Moderate Comment</DialogTitle>
            </DialogHeader>
            {editingComment && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{editingComment.username}</span>
                    <Badge variant="outline" className="text-xs">
                      Question ID: {editingComment.questionId}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {new Date(editingComment.createdAt).toLocaleString()}
                  </div>
                  <div className="border-l-4 border-l-blue-500 pl-4">
                    <p className="text-sm">{editingComment.comment}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="admin-response">Admin Response/Explanation (Optional)</Label>
                  <Textarea
                    id="admin-response"
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Provide an explanation or response to the user's comment..."
                    className="mt-1"
                    rows={4}
                    data-testid="textarea-admin-response"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This response will be visible to the user along with their comment.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCommentDialogOpen(false);
                      setEditingComment(null);
                      setAdminResponse("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRejectComment}
                    disabled={rejectCommentMutation.isPending}
                    data-testid="button-reject-comment"
                  >
                    {rejectCommentMutation.isPending ? "Rejecting..." : "Reject"}
                  </Button>
                  <Button
                    onClick={handleApproveComment}
                    disabled={approveCommentMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-approve-comment"
                  >
                    {approveCommentMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Topic Linking Dialog - Enhanced */}
        <TopicLinking 
          showTopicLinking={showTopicLinking} 
          setShowTopicLinking={setShowTopicLinking} 
          selectedQuestions={selectedQuestions} 
          linkQuestionsToTopicMutation={linkQuestionsToTopicMutation} 
          setUploadedQuestions={setUploadedQuestions} 
          allTopics={allTopics} 
          loadingTopics={loadingTopics} 
          handleQuestionSelection={handleQuestionSelectionInTable} 
          uploadedQuestions={uploadedQuestions} 
          setSelectedQuestions={setSelectedQuestions} 
          topics={allTopics} 
          selectedTopic={selectedTopic} 
          setSelectedTopic={setSelectedTopic}
        />

        {/* Bulk Topic Mapping Dialog - Enhanced */}
        <Dialog open={showBulkTopicMapping} onOpenChange={setShowBulkTopicMapping}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6 border-b">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <LinkIcon className="h-6 w-6 text-blue-600" />
                Map Selected Questions to Topic
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-2">
                Organize your questions by assigning them to the appropriate topic. This will automatically create or link them to the corresponding quiz.
              </p>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
              {/* Left Column - Selected Questions Summary */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{selectedQuestionsInTable.length}</span>
                    </div>
                    Selected Questions
                  </h3>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Edit className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900">Ready to Organize</h4>
                        <p className="text-sm text-blue-700">
                          {selectedQuestionsInTable.length} question{selectedQuestionsInTable.length > 1 ? 's' : ''} selected from the questions table
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-md border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Questions to be mapped:</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {selectedQuestionsInTable.length} items
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        These questions will be linked to your selected topic and automatically organized into the appropriate quiz structure.
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    How it works
                  </h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Search and select a topic from the dropdown</li>
                    <li>• Questions will be linked to that topic</li>
                    <li>• A quiz will be created automatically if needed</li>
                    <li>• You can organize questions anytime after upload</li>
                  </ul>
                </div>
              </div>

              {/* Right Column - Topic Selection */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TreePine className="h-5 w-5 text-green-600" />
                    Choose Topic
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium text-gray-700 mb-3 block">
                        Search and select a topic to organize your questions
                      </Label>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-12 text-left bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300"
                            data-testid="button-bulk-search-topic"
                          >
                            <div className="flex items-center gap-3">
                              <Search className="h-4 w-4 text-gray-400" />
                              <span className={selectedTopic ? "text-gray-900" : "text-gray-500"}>
                                {selectedTopic
                                  ? `${selectedTopic.text} (${selectedTopic.categoryName})`
                                  : "Search and select a topic..."}
                              </span>
                            </div>
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px] p-0" align="start" sideOffset={4}>
                          <Command className="rounded-lg border shadow-md">
                            <CommandInput placeholder="Type to search topics..." className="h-12" />
                            <CommandList className="max-h-[300px] overflow-y-auto">
                              <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                                {loadingTopics ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    Loading topics...
                                  </div>
                                ) : (
                                  "No topics found. Try adjusting your search."
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {allTopics.map((topic: any) => (
                                  <CommandItem
                                    key={topic.id}
                                    value={`${topic.text} ${topic.categoryName}`}
                                    onSelect={() => {
                                      setSelectedTopic(topic);
                                    }}
                                    className="px-4 py-3 cursor-pointer hover:bg-blue-50"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{topic.text}</span>
                                        <span className="text-sm text-gray-500">{topic.categoryName}</span>
                                      </div>
                                    </div>
                                    <Check
                                      className={`h-4 w-4 ${
                                        selectedTopic?.id === topic.id ? "opacity-100 text-blue-600" : "opacity-0"
                                      }`}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {selectedTopic && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-green-900 mb-1">Selected Topic</h4>
                            <p className="text-green-800 font-medium">{selectedTopic.text}</p>
                            <p className="text-sm text-green-700 mb-3">Category: {selectedTopic.categoryName}</p>
                            
                            <div className="flex items-center gap-2">
                              {selectedTopic.quizId ? (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>Has existing quiz (ID: {selectedTopic.quizId})</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-orange-600">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span>Will create new quiz for this topic</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="text-sm text-gray-600">
                {selectedQuestionsInTable.length} question{selectedQuestionsInTable.length > 1 ? 's' : ''} ready to be mapped
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkTopicMapping(false);
                    setSelectedTopic(null);
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkMapToTopic}
                  disabled={!selectedTopic || selectedQuestionsInTable.length === 0 || linkQuestionsToTopicMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 px-6"
                  data-testid="button-bulk-map-questions"
                >
                  {linkQuestionsToTopicMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Mapping...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Map {selectedQuestionsInTable.length} Questions
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}