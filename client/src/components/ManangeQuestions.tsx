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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ManageQuestionsProps {
  quizData: any;
  sectionName: string;
  sectionId: number;
}

export default function ManageQuestions({
  quizData,
  sectionId,
  sectionName,
}: ManageQuestionsProps) {
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [newQuestionData, setNewQuestionData] = useState({
    question_text: '',
    explanation_text: '',
    options: [{ text: '', isCorrect: false }],
    quizId: null
  });

  // Bulk upload state
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Session ID for progress tracking
  const [sessionId] = useState(() => `quiz_${sectionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Parse URL parameters to check for resume session from browser's search params
  const urlParams = new URLSearchParams(window.location.search);

  const quizId = quizData && quizData[0]?.quiz_id ? quizData[0]?.quiz_id : -1;
  const topicSlug = quizData && quizData[0]?.slug ? quizData[0]?.slug : '';
  const topicId = quizData && quizData[0]?.id ? quizData[0]?.id : -1;

  // Mutation for creating new questions (admin only)
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      await apiRequest('POST', '/api/admin/questions', questionData);
    },
    onSuccess: () => {
      setShowAddQuestionForm(false);
      setNewQuestionData({
        question_text: '',
        explanation_text: '',
        options: [{ text: '', isCorrect: false }],
        quizId: null
      });
      toast({
        title: "Success",
        description: "Question added successfully",
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
        description: error.message || "Failed to add question",
        variant: "destructive",
      });
    }
  });

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('topicId', topicId);
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
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-white">{sectionName}</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 text-white">
            {isAuthenticated && (<>
              <Button
                onClick={() => setShowAddQuestionForm(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-add-question"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </Button>
              {/* Admin Bulk Upload Section */}
              {quizId && (
                <div className="flex gap-2 justify-center">
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
        </div>

        {/* Add Question Dialog */}
        <Dialog open={showAddQuestionForm} onOpenChange={setShowAddQuestionForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-question-text">Question Text</Label>
                <Textarea
                  id="new-question-text"
                  value={newQuestionData.question_text}
                  onChange={(e) => setNewQuestionData(prev => ({...prev, question_text: e.target.value}))}
                  rows={3}
                  placeholder="Enter the question text..."
                />
              </div>

              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {newQuestionData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(index, 'text', e.target.value)}
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
                <Textarea
                  id="new-explanation"
                  value={newQuestionData.explanation_text}
                  onChange={(e) => setNewQuestionData(prev => ({...prev, explanation_text: e.target.value}))}
                  rows={3}
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
