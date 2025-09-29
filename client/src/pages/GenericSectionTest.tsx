import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Clock,
  Flag,
  MessageSquare,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Send,
  Home,
  Calendar,
  Users,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import DOMPurify from "dompurify";

interface GenericSectionTestProps {
  quizData: any;
  sectionName: string;
  sectionId: number;
}

export default function GenericSectionTest({
  quizData,
  sectionId,
  sectionName,
}: GenericSectionTestProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [showResults, setShowResults] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [testStartTime, setTestStartTime] = useState<number | null>(null);
  const [isTestActive, setIsTestActive] = useState(true);
  const [reportIssue, setReportIssue] = useState<{
    questionId: number | null;
    description: string;
  }>({
    questionId: null,
    description: "",
  });
  const [activeTab, setActiveTab] = useState("question");
  const [newComment, setNewComment] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    explanation: ''
  });
  const [currentTestSession, setCurrentTestSession] = useState<any>(null);
  const [resumedSession, setResumedSession] = useState<any>(null);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [newQuestionData, setNewQuestionData] = useState({
    question_text: '',
    explanation: '',
    options: [{ text: '', isCorrect: false }],
    quizId: null
  });

  // Bulk upload state
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const link = useLocation();

  // Session ID for progress tracking
  const [sessionId] = useState(() => `quiz_${sectionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const { toast } = useToast();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Parse URL parameters to check for resume session from browser's search params
  const urlParams = new URLSearchParams(window.location.search);
  const resumeSessionId = urlParams.get('resumeSession');

  const quizId = quizData && quizData[0]?.quiz_id ? quizData[0]?.quiz_id : -1;
  // Mutation for updating questions (admin only)
  const updateQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      await apiRequest('PUT', `/api/admin/questions/${questionData.id}`, questionData);
    },
    onSuccess: () => {
      setEditingQuestionId(null);
      
      toast({
        title: "Success",
        description: "Question updated successfully",
      });

      // 🔥 This will refresh your subjects query
      queryClient.invalidateQueries({ queryKey: [`/api${link[0]}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update question",
        variant: "destructive",
      });
    }
  });

  // Mutation for creating new questions (admin only)
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      await apiRequest('POST', `/api/admin/questions/quiz/${quizId}`, questionData);
    },
    onSuccess: () => {
      setShowAddQuestionForm(false);
      setNewQuestionData({
        question_text: '',
        explanation: '',
        options: [{ text: '', isCorrect: false }],
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

  // Mutation for soft deleting questions (admin only)
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      await apiRequest('DELETE', `/api/admin/questions/${questionId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      // Refresh the questions data - use predicate to match all question queries
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
        description: error.message || "Failed to delete question",
        variant: "destructive",
      });
    }
  });

  // Mutation for creating test session
  const createTestSessionMutation = useMutation({
    mutationFn: async (sessionData: { sectionName: string; totalQuestions: number }) => {
       const response = await apiRequest('POST', '/api/test-sessions', sessionData);

      // ✅ Manually parse if it's a Response object
      if (response instanceof Response) {
        if (!response.ok) {
          throw new Error(`Failed: ${response.status}`);
        }
        return await response.json(); // convert ReadableStream → JSON
      }

      return response; // already parsed, just return
    },
    onSuccess: (session) => {
      setCurrentTestSession(session);
    },
    onError: (error: any) => {
      console.error("Failed to create test session:", error);
    }
  });

  // Mutation for updating test session
  const updateTestSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: number; updates: any }) => {
      // ✅ Send { updates } as body, so backend can destructure it
      return await apiRequest('PUT', `/api/test-sessions/${sessionId}`, { updates });
    },
    onError: (error: any) => {
      console.error("Failed to update test session:", error);
    }
  });

  // Mutation for saving user answers
  const saveAnswerMutation = useMutation({
    mutationFn: async (answerData: {
      sessionId: number;
      questionId: number;
      selectedAnswer: string;
      isCorrect: boolean;
      timeSpent: number;
    }) => {
      return await apiRequest('POST', '/api/user-answers', answerData);
    },
    onError: (error: any) => {
      console.error("Failed to save answer:", error);
    }
  });
  
  
  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quizId', quizId.toString());
      const response = await fetch(`/api/quizzes/${quizId}/questions/bulk-upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload questions');
      }
      
      return await response.json();
      // const response = await apiRequest('POST', `/api/quizzes/${quizId}/questions/bulk-upload`, formData);
      // return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${data.count} questions to ${sectionName}`,
      });
      setShowBulkUpload(false);
      setUploadFile(null);
      setIsUploading(false);
      // Refresh questions - use predicate to match all question queries
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
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload questions. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  
  // Get questions for this section
  // const { data: questions, isLoading } = useQuery<Question[]>({
  //   queryKey: [`/api/sections/${sectionId}/questions`],
  // });

  const questions = useMemo(() => {
    const optionLabels = ["A", "B", "C", "D", "E", "F"];

    if (quizData?.length > 0) {
      return quizData.map((q: any, index: number) => {
        // Build options dynamically
        const options: Record<string, string> = {};
        let correctAnswer: string | undefined;

        q.options.forEach((opt: any) => {
          const optionKey = `option_${optionLabels[opt.optionOrder]?.toLowerCase()}`;
          options[optionKey] = opt.option_text;

          if (opt.isCorrect) {
            correctAnswer = optionLabels[opt.optionOrder];
          }
        });

        // Process explanation (replace escaped characters, sanitize)
        let rawHTML = q.explanation;
        rawHTML = rawHTML?.replace(/\\n/g, "<br/>").replace(/\\"/g, '"');

        return {
          id: q.id,
          question_id: q.question_id,
          sequence: index + 1,
          question_text: q.question_text,
          explanation: DOMPurify.sanitize(rawHTML),
          explanation_img: q.explanation_image,
          tooltip: q.tooltip,
          featured_img: q.featured_image,
          correct_answer: correctAnswer,
          optionCount: q.options.length,
          is_single_option: q.options.length === 1,
          ...options, // spread all option_a, option_b, etc.
        };
      });
    } else {
      return [];
    }
  }, [quizData]);

  // Admin editing functions
  const startEditing = (question: any) => {
    setEditingQuestionId(question.id);
    setEditFormData({
      question_text: question.question_text || '',
      option_a: question.option_a || '',
      option_b: question.option_b || '',
      option_c: question.option_c || '',
      option_d: question.option_d || '',
      correct_answer: question.correct_answer || '',
      explanation: question.explanation || ''
    });
  };

  const cancelEditing = () => {
    setEditingQuestionId(null);
    setEditFormData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: '',
      explanation: ''
    });
  };

  const saveQuestion = () => {
    if (editingQuestionId) {
      updateQuestionMutation.mutate({
        id: editingQuestionId,
        ...editFormData
      });
    }
  };

  // Get current question for comments  
  const currentQuestionForComments = questions?.[currentQuestionIndex] as any;
  
  // Fetch comments for current question
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['/api/comments', currentQuestionForComments?.id],
    enabled: !!currentQuestionForComments?.id,
  });

  // Mutation for adding comments
  const addCommentMutation = useMutation({
    mutationFn: async ({ questionId, comment }: { questionId: number; comment: string }) => {
      return await apiRequest('POST', '/api/comments', { questionId, comment });
    },
    onSuccess: () => {
      refetchComments();
      setNewComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to add comment:", error);
    }
  });

  // Fetch existing session if resuming
  const { data: existingSession, isLoading: isLoadingSession, isError: isSessionError } = useQuery({
    queryKey: ['/api/test-sessions', resumeSessionId, 'details'],
    enabled: !!resumeSessionId && isAuthenticated,
  });

  // Auto-start test when component mounts and create or resume test session
  useEffect(() => {
    if (!testStartTime && isAuthenticated && questions.length > 0) {
      // If we're trying to resume a session, wait for the query to complete
      if (resumeSessionId) {
        if (isLoadingSession) {
          return; // Wait for the session to load
        }
        
        if (existingSession && !isSessionError) {
          // Resume existing session
          setCurrentTestSession(existingSession.session);
          setResumedSession(existingSession.session);
          setTestStartTime(new Date(existingSession.session.startTime).getTime());
          
          // Restore user answers from existing session
          const existingAnswers: Record<number, string> = {};
          const existingAnsweredQuestions = new Set<number>();
          
          existingSession.answers.forEach((answer: any) => {
            existingAnswers[answer.questionId] = answer.selectedAnswer;
            existingAnsweredQuestions.add(answer.questionId);
          });
          
          setSelectedAnswers(existingAnswers);
          setAnsweredQuestions(existingAnsweredQuestions);
          
          // Set current question index to first unanswered question or last answered + 1
          const answeredQuestionIds = Array.from(existingAnsweredQuestions);
          let resumeIndex = 0;
          
          if (answeredQuestionIds.length > 0) {
            // Find first unanswered question
            const firstUnansweredIndex = questions.findIndex(q => !existingAnsweredQuestions.has(q.id));
            resumeIndex = firstUnansweredIndex !== -1 ? firstUnansweredIndex : Math.max(0, questions.length - 1);
          }
          
          setCurrentQuestionIndex(resumeIndex);
          
          toast({
            title: "Session Resumed",
            description: `Your previous test session has been restored. Continuing from question ${resumeIndex + 1}.`,
          });
          return;
        } else {
          // Session not found or error - fall through to create new session
          toast({
            title: "Session Not Found",
            description: "Could not resume the session. Starting a new test.",
            variant: "destructive",
          });
        }
      }
      
      // Start new session (no resume ID or session not found)
      setTestStartTime(Date.now());
      createTestSessionMutation.mutate({
        sectionName: sectionName,
        totalQuestions: questions.length
      });
    }
  }, [isAuthenticated, questions.length, sectionName, resumeSessionId, existingSession, isLoadingSession, isSessionError]);

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
    const currentQuestion = questions.find(q => q.id === questionId);
    const isCorrect = currentQuestion?.correct_answer === answer;
    
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setAnsweredQuestions(
      (prev) => new Set(Array.from(prev).concat([questionId])),
    );

    // Save answer to database if user is authenticated and test session exists
    if (isAuthenticated && currentTestSession) {
      const timeSpent = Math.floor((Date.now() - testStartTime!) / 1000); // Time in seconds
      saveAnswerMutation.mutate({
        sessionId: currentTestSession.id,
        questionId: questionId,
        selectedAnswer: answer,
        isCorrect: isCorrect,
        timeSpent: timeSpent
      });
    }
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

    // Calculate final results and update test session
    if (isAuthenticated && currentTestSession) {
      const totalQuestions = questions.length;
      const correctAnswers = Object.entries(selectedAnswers).reduce((count, [questionId, answer]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        return question?.correct_answer === answer ? count + 1 : count;
      }, 0);
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const timeSpent = Math.floor((Date.now() - testStartTime!) / 1000);

      // Update test session with final results
      updateTestSessionMutation.mutate({
        sessionId: currentTestSession.id,
        updates: {
          endTime: new Date(),
          isCompleted: true,
          score: score,
          correctAnswers: correctAnswers,
          timeSpent: timeSpent
        }
      });

      // Update user progress statistics
      const progressData = {
        sectionName: sectionName,
        averageScore: score,
        bestScore: score
      };

      // Call progress update API
      apiRequest('POST', '/api/user/progress', progressData).catch((error) => {
        console.error("Failed to update user progress:", error);
      });
    }
  };

  const handleReportIssue = (questionId: number) => {
    setReportIssue({ questionId, description: "" });
  };

  const reportIssueMutation = useMutation({
    mutationFn: async ({
      questionId,
      description,
    }: {
      questionId: number;
      description: string;
    }) => {
      return await apiRequest("POST", "/api/issue-reports", {
        questionId,
        description,
      });
    },
    onSuccess: () => {
      toast({
        title: "Issue Reported",
        description:
          "Thank you for reporting this issue. We'll review it soon.",
      });
      setReportIssue({ questionId: null, description: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to submit issue report:", error);
    },
  });

  const submitIssueReport = () => {
    if (!reportIssue.questionId || !reportIssue.description.trim()) {
      toast({
        title: "Error",
        description: "Please describe the issue before submitting.",
        variant: "destructive",
      });
      return;
    }

    reportIssueMutation.mutate({
      questionId: reportIssue.questionId,
      description: reportIssue.description.trim(),
    });
  };

  // Helper functions for add question form
  const addNewOption = () => {
    setNewQuestionData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
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

  const updateOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setNewQuestionData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const handleSubmitNewQuestion = () => {
    if (!newQuestionData.question_text.trim()) {
      toast({
        title: "Error",
        description: "Please enter question text",
        variant: "destructive",
      });
      return;
    }

    const validOptions = newQuestionData.options.filter(opt => opt.text.trim());
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
      quizId: quizId || null
    });
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  const handleAddComment = () => {
    if (!currentQuestionForComments?.id || !newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      });
      return;
    }

    addCommentMutation.mutate({
      questionId: currentQuestionForComments.id,
      comment: newComment.trim(),
    });
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }) + ' | ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Bulk upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setUploadFile(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!quizId) {
      toast({
        title: "Quiz ID Missing",
        description: "Cannot upload questions without a quiz ID",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    bulkUploadMutation.mutate(uploadFile);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await apiRequest('GET', `/api/quizzes/${quizId}/questions/template`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sectionName.replace(/[^a-zA-Z0-9]/g, '_')}_questions_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Template download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const calculateScore = () => {
    if (!questions) return { correct: 0, total: 0, percentage: 0 };

    const correct = questions.filter(
      (q: any) => selectedAnswers[q.id] === q.correct_answer,
    ).length;

    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
  //       <div className="max-w-7xl mx-auto px-4 py-8">
  //         <div className="text-center">
  //           <div className="text-white">Loading questions...</div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!questions || questions.length === 0) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
  //       <div className="max-w-7xl mx-auto px-4 py-8">
  //         <div className="text-center text-white">
  //           <h1 className="text-2xl mb-4">No Questions Available</h1>
  //           <Link href="/">
  //             <Button
  //               variant="outline"
  //               className="border-cyan-400/40 text-cyan-200"
  //             >
  //               ← Back to Home
  //             </Button>
  //           </Link>
  //         </div>
  //           {isAdmin && (<>
              
  //             {/* Admin Bulk Upload Section */}
  //               <div className="flex gap-2 justify-center">
  //                 <Button
  //                   onClick={() => setShowAddQuestionForm(true)}
  //                   size="sm"
  //                   className="bg-green-600 hover:bg-green-700"
  //                   data-testid="button-add-question"
  //                 >
  //                   <Plus className="h-4 w-4 mr-1" />
  //                   Add Question
  //                 </Button>
  //                 <Button
  //                   onClick={handleDownloadTemplate}
  //                   className="bg-blue-600 hover:bg-blue-700"
  //                   data-testid="button-download-quiz-template"
  //                 >
  //                   <Download className="h-4 w-4 mr-2" />
  //                   Download Template
  //                 </Button>
  //                 <Button
  //                   onClick={() => setShowBulkUpload(true)}
  //                   className="bg-cyan-600 hover:bg-cyan-700"
  //                   data-testid="button-bulk-upload-quiz"
  //                 >
  //                   <Upload className="h-4 w-4 mr-2" />
  //                   Bulk Upload
  //                 </Button>
  //               </div>
  //             </>
  //           )}
  //       </div>
  //     </div>
  //   );
  // }

  const sortedQuestions = [...questions].sort(
    (a: any, b: any) => a.sequence - b.sequence,
  );
  const currentQuestion: any = sortedQuestions[currentQuestionIndex] || {};
  const score = calculateScore();
  
  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              {sectionName} - Results
            </h1>
            <Link href="/">
              <Button
                variant="outline"
                className="border-cyan-400/40 text-cyan-200 mb-6"
              >
                ← Back to Home
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
            {sortedQuestions.map((question: any, index) => {
              const userAnswer = selectedAnswers[question.id];
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <Card
                  key={question.id}
                  className={`${isCorrect ? "border-green-500" : "border-red-500"}`}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      #{question.sequence}. {question.question_text}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {[
                        { key: "A", text: question.option_a },
                        { key: "B", text: question.option_b },
                        { key: "C", text: question.option_c },
                        { key: "D", text: question.option_d },
                      ].map((option) => {
                        const isUserAnswer = userAnswer === option.key;
                        const isCorrectAnswer =
                          question.correct_answer === option.key;

                        return (
                          <div
                            key={option.key}
                            className={`p-3 rounded-lg border ${
                              isCorrectAnswer
                                ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200"
                                : isUserAnswer
                                  ? "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200"
                                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {option.key}. {option.text}
                            {isCorrectAnswer && " ✓ Correct"}
                            {isUserAnswer &&
                              !isCorrectAnswer &&
                              " ✗ Your answer"}
                          </div>
                        );
                      })}
                    </div>
                    {(question.explanation || question.explanation) && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                          Explanation:
                        </h4>
                        <div
                          className="text-gray-800 dark:text-gray-200"
                          dangerouslySetInnerHTML={{
                            __html: question.explanation,
                          }}
                        />
                        {/* <p className="text-sm">{question.explanation || question.explanation}</p> */}
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
            <h1 className="text-4xl font-bold text-white mb-6">
              {sectionName}
            </h1>
            <div className="text-white mb-8">
              <p className="text-xl mb-2">Ready to start the test?</p>
              <p>Total Questions: {sortedQuestions.length}</p>
            </div>
            <div className="space-x-4">
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-cyan-400/40 text-cyan-200"
                >
                  ← Back to Home
                </Button>
              </Link>
              <Button
                onClick={startTest}
                className="bg-green-600 hover:bg-green-700"
              >
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
      <div className="w-full mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Progress Saving Alert */}
          {
            quizData.length > 1 && <Alert className="mb-6 border-green-500/20 bg-green-500/10">
            <AlertDescription className="text-green-100">
              <span className="inline-flex items-center gap-2">
                <span>✅ Your progress is being saved automatically. Use progress page in profile section.</span>
                {/* <Link 
                  href={`/resume/${sessionId}`} 
                  className="text-green-300 hover:text-green-200 underline font-medium"
                  data-testid="link-resume-quiz"
                >
                  Resume Quiz
                </Link> */}
              </span>
            </AlertDescription>
          </Alert>
          }
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
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-white">{sectionName}</h1>
          </div>
           <div className="flex items-center space-x-2 sm:space-x-4 text-white">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-mono text-base sm:text-lg">{formatTime(elapsedTime)}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          {isAdmin && (<>
            {/* Admin Bulk Upload Section */}
            {quizId && (
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => setShowAddQuestionForm(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-add-question"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
                <Button
                  onClick={handleDownloadTemplate}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-download-quiz-template"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button
                  onClick={() => setShowBulkUpload(true)}
                  className="bg-cyan-600 hover:bg-cyan-700"
                  data-testid="button-bulk-upload-quiz"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
              </div>
            )}
            </>
          )}
        </div>
        {
          quizData.length > 1 && (
            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
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
                  <div className="grid grid-cols-5 gap-4">
                    {sortedQuestions.map((q: any, index) => {
                      const isAnswered = answeredQuestions.has(q.id);
                      const isCorrect =
                        isAnswered && selectedAnswers[q.id] === q.correct_answer;
                      const isWrong =
                        isAnswered && selectedAnswers[q.id] !== q.correct_answer;
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
                          className={cn("h-8 w-8 p-0 text-xs", buttonClass)}
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
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="h-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="question">Question</TabsTrigger>
                      {isAdmin && <TabsTrigger value="explanation">Explanation</TabsTrigger>}
                      <TabsTrigger value="comments">Write Your Answer</TabsTrigger>
                    </TabsList>

                    <TabsContent value="question" className="mt-4">
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                          {editingQuestionId === currentQuestion.id ? (
                            <div className="flex-1 space-y-4">
                              <Label htmlFor="edit-question">Question Text</Label>
                              <RichTextEditor
                                value={editFormData.question_text}
                                onChange={(value: string) => setEditFormData(prev => ({...prev, question_text: value}))}
                                placeholder="Enter the question text with formatting..."
                              />
                            </div>
                          ) : (
                            <h2 className="text-lg sm:text-xl font-semibold leading-relaxed flex-1">
                              <div
                                className="text-gray-800 dark:text-gray-200"
                                dangerouslySetInnerHTML={{
                                  __html: currentQuestion.question_text,
                                }}
                              />
                            </h2>
                          )}
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReportIssue(currentQuestion.id)}
                              className="flex-shrink-0"
                            >
                              <Flag className="h-4 w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Report</span>
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0">
                            {isAdmin && (
                              <>
                                {editingQuestionId === currentQuestion.id ? (
                                  <>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={saveQuestion}
                                      disabled={updateQuestionMutation.isPending}
                                    >
                                      <Save className="h-4 w-4 mr-1" />
                                      Save
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={cancelEditing}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => startEditing(currentQuestion)}
                                    >
                                      <Edit className="h-4 w-4 mr-1 sm:mr-2" />
                                      <span className="hidden sm:inline">Edit</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteQuestion(currentQuestion.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      disabled={deleteQuestionMutation.isPending}
                                      data-testid="button-delete-question"
                                    >
                                      <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                                      <span className="hidden sm:inline">Delete</span>
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        <div className="space-y-3">
                          {editingQuestionId === currentQuestion.id ? (
                            <div className="space-y-4">
                              <div className="grid gap-4">
                                <div>
                                  <Label htmlFor="edit-option-a">Option A</Label>
                                  <RichTextEditor
                                    id="edit-option-a"
                                    value={editFormData.option_a}
                                    onChange={(value: string) => setEditFormData(prev => ({...prev, option_a: value}))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-option-b">Option B</Label>
                                  <RichTextEditor
                                    id="edit-option-b"
                                    value={editFormData.option_b}
                                    onChange={(value: string) => setEditFormData(prev => ({...prev, option_b: value}))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-option-c">Option C</Label>
                                  <RichTextEditor
                                    id="edit-option-c"
                                    value={editFormData.option_c}
                                    onChange={(value: string) => setEditFormData(prev => ({...prev, option_c: value}))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-option-d">Option D</Label>
                                  <RichTextEditor
                                    id="edit-option-d"
                                    value={editFormData.option_b}
                                    onChange={(value: string) => setEditFormData(prev => ({...prev, option_d: value}))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-correct">Correct Answer</Label>
                                  <select
                                    id="edit-correct"
                                    value={editFormData.correct_answer}
                                    onChange={(e) => setEditFormData(prev => ({...prev, correct_answer: e.target.value}))}
                                    className="w-full p-2 border rounded-md"
                                  >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {[
                                { key: "A", text: currentQuestion.option_a },
                                { key: "B", text: currentQuestion.option_b },
                                { key: "C", text: currentQuestion.option_c },
                                { key: "D", text: currentQuestion.option_d },
                              ]
                                .filter((option) => option.text) // Only show options that have text
                                .map((option) => {
                                  const isSelected =
                                    selectedAnswers[currentQuestion.id] === option.key;
                                  const isCorrect =
                                    currentQuestion.correct_answer === option.key;
                                  const hasAnswered =
                                    currentQuestion.id in selectedAnswers;
                                  const isSingleOption = currentQuestion.is_single_option;

                                  let buttonClass = "";
                                  if (hasAnswered) {
                                    if (isSelected && !isCorrect) {
                                      buttonClass =
                                        "bg-red-500 text-white border-red-500";
                                    } else if (isCorrect || (isSingleOption && isSelected)) {
                                      buttonClass =
                                        "bg-green-500 text-white border-green-500";
                                    } else {
                                      buttonClass = "bg-gray-100 text-gray-600";
                                    }
                                  } else {
                                    buttonClass = isSelected
                                      ? "bg-blue-600 text-white"
                                      : "bg-white text-black hover:bg-gray-50";
                                  }

                                  return (
                                    <Button
                                      key={option.key}
                                      variant="outline"
                                      className={cn(
                                        "w-full text-left justify-start p-3 sm:p-4 h-auto min-h-[3rem] whitespace-normal break-words",
                                        buttonClass,
                                      )}
                                      onClick={() =>
                                        handleAnswerSelect(
                                          currentQuestion.id,
                                          option.key,
                                        )
                                      }
                                      disabled={hasAnswered}
                                    >
                                  <span className="font-semibold mr-2 sm:mr-3 flex-shrink-0">
                                    {isSingleOption ? "" : `${option.key}.`}
                                  </span>
                                  <span className="flex-1 text-left leading-relaxed">
                                    <div
                                      className="text-gray-800 dark:text-gray-200"
                                      dangerouslySetInnerHTML={{
                                        __html: option.text,
                                      }}
                                    />
                                  </span>
                                  {hasAnswered && (isCorrect || (isSingleOption && isSelected)) && (
                                    <span className="ml-2">✓</span>
                                  )}
                                  {hasAnswered && isSelected && !isCorrect && !isSingleOption && (
                                    <span className="ml-2">✗</span>
                                  )}
                                </Button>
                              );
                            })}
                            </>
                          )}
                        </div>

                        {/* Show explanation immediately when answer is selected */}
                        {currentQuestion.id in selectedAnswers &&
                          (currentQuestion.explanation ||
                            currentQuestion.explanation) && (
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                                Explanation:
                              </h4>
                              <div
                                className="text-gray-800 dark:text-gray-200"
                                dangerouslySetInnerHTML={{
                                  __html: currentQuestion.explanation,
                                }}
                              />
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
                            onClick={
                              currentQuestionIndex === sortedQuestions.length - 1
                                ? handleFinishTest
                                : handleNext
                            }
                            disabled={false}
                          >
                            {currentQuestionIndex === sortedQuestions.length - 1
                              ? "Finish"
                              : "Next"}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="explanation" className="mt-4">
                      <div className="space-y-4">
                        {isAdmin && editingQuestionId === currentQuestion.id ? (
                          <div className="space-y-4">
                            <Label htmlFor="edit-explanation">Explanation</Label>
                            <RichTextEditor
                              value={editFormData.explanation}
                              onChange={(value: string) => setEditFormData(prev => ({...prev, explanation: value}))}
                              placeholder="Enter explanation with formatting..."
                            />
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-semibold">Explanation</h3>
                            {currentQuestion.explanation ||
                            currentQuestion.explanation ? (
                              <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div
                                  className="text-gray-800 dark:text-gray-200"
                                  dangerouslySetInnerHTML={{
                                    __html: currentQuestion.explanation,
                                  }}
                                />
                              </div>
                            ) : (
                              <p className="text-gray-500">
                                No explanation available for this question.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="comments" className="mt-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2" />
                          Comments ({comments.length})
                        </h3>

                        <div className="border rounded-lg p-4">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="mb-3"
                          />
                          <Button 
                            size="sm" 
                            onClick={handleAddComment}
                            disabled={addCommentMutation.isPending || !newComment.trim()}
                            data-testid="button-post-comment"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {(comments as any[]).length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                              No comments yet. Be the first to comment!
                            </p>
                          ) : (
                            (comments as any[]).map((comment: any) => (
                            <div
                              key={comment.id}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {comment.username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-semibold text-sm">
                                      {comment.username}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatCommentDate(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.comment}</p>
                                  {/* <div className="flex items-center space-x-4 mt-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs"
                                    >
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      {comment.likes}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs"
                                    >
                                      <ThumbsDown className="h-3 w-3 mr-1" />
                                      {comment.dislikes}
                                    </Button>
                                  </div> */}
                                </div>
                              </div>
                            </div>
                            ))
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
          )
        }

        {/* Report Issue Dialog */}
        <Dialog
          open={reportIssue.questionId !== null}
          onOpenChange={() =>
            setReportIssue({ questionId: null, description: "" })
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Issue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Report an issue with this question:</p>
              <Textarea
                placeholder="Describe the issue..."
                value={reportIssue.description}
                onChange={(e) =>
                  setReportIssue({
                    ...reportIssue,
                    description: e.target.value,
                  })
                }
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setReportIssue({ questionId: null, description: "" })
                  }
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitIssueReport}
                  disabled={reportIssueMutation.isPending}
                  data-testid="button-submit-report"
                >
                  {reportIssueMutation.isPending
                    ? "Submitting..."
                    : "Submit Report"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Question Dialog */}
        <Dialog open={showAddQuestionForm} onOpenChange={setShowAddQuestionForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
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
                        value={option.text}
                        onChange={(value: string) => updateOption(index, 'text', value)}
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
                  value={editFormData.explanation}
                  onChange={(value: string) => setEditFormData(prev => ({...prev, explanation: value}))}
                  placeholder="Enter explanation for the correct answer..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddQuestionForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitNewQuestion}
                  disabled={createQuestionMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createQuestionMutation.isPending ? "Adding..." : "Add Question"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Bulk Upload Dialog */}
        <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Questions to {sectionName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Excel File
                </label>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  data-testid="input-bulk-upload-file"
                />
                {uploadFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {uploadFile.name}
                  </p>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="mb-2">File requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Excel format (.xlsx or .xls)</li>
                  <li>Maximum size: 10MB</li>
                  <li>Use the template format</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkUpload(false);
                    setUploadFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkUpload}
                  disabled={!uploadFile || isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-upload-questions"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Questions
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
