import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plane } from '@/components/Icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, Settings, Tag } from 'lucide-react';

export default function QuestionBank() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['/api/subjects'],
  });

  // Auth and admin functionality
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Topic management state
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [newTopicData, setNewTopicData] = useState({
    text: '',
    description: '',
    categoryId: ''
  });

  // Fetch topics and categories for admin
  const { data: topics = [] } = useQuery({
    queryKey: ['/api/admin/topics'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/topics');
      return res instanceof Response ? await res.json() : res;
    },
    enabled: isAdmin,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/admin/categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/categories');
      return res instanceof Response ? await res.json() : res;
    },
    enabled: isAdmin,
  });

  // Mutations for topic management
  const createTopicMutation = useMutation({
    mutationFn: async (topicData: any) => {
      return await apiRequest('POST', '/api/admin/topics', topicData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/topics'] });
      setShowAddTopic(false);
      setNewTopicData({ text: '', description: '', categoryId: '' });
      toast({
        title: "Success",
        description: "Topic created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create topic.",
        variant: "destructive",
      });
    }
  });

  const updateTopicMutation = useMutation({
    mutationFn: async (topicData: any) => {
      return await apiRequest('PUT', `/api/admin/topics/${topicData.id}`, topicData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/topics'] });
      setEditingTopic(null);
      toast({
        title: "Success",
        description: "Topic updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update topic.",
        variant: "destructive",
      });
    }
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (topicId: number) => {
      return await apiRequest('DELETE', `/api/admin/topics/${topicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/topics'] });
      toast({
        title: "Success",
        description: "Topic deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete topic.",
        variant: "destructive",
      });
    }
  });

  const handleCreateTopic = () => {
    if (!newTopicData.text.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic name",
        variant: "destructive",
      });
      return;
    }
    if (!newTopicData.categoryId) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }
    createTopicMutation.mutate(newTopicData);
  };

  const handleUpdateTopic = () => {
    if (!editingTopic) return;
    updateTopicMutation.mutate(editingTopic);
  };

  const handleDeleteTopic = (topicId: number) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      deleteTopicMutation.mutate(topicId);
    }
  };

  const filteredSubjects = (subjects as any)?.filter((subject: any) =>
    subject?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-700 bg-clip-text text-transparent">
            Master all DGCA subjects with our comprehensive question bank and practice tests
          </h1>
        </div>

        {/* Admin Topic Management */}
        {isAdmin && (
          <Card className="mb-8 bg-white dark:bg-slate-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Admin: Topic Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setShowAddTopic(true)}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-add-topic"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
              </div>
              
              {topics.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topics.map((topic: any) => (
                    <div
                      key={topic.id}
                      className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg border border-gray-200 dark:border-slate-600"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{topic.text}</h4>
                          {topic.description && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{topic.description}</p>
                          )}
                          {topic.categoryName && (
                            <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                              Category: {topic.categoryName}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingTopic(topic)}
                            className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
                            data-testid={`button-edit-topic-${topic.id}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                            data-testid={`button-delete-topic-${topic.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* <div className="text-center mb-8">
          <Link href="/subjects/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-600 text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-cyan-400/20 shadow-lg shadow-cyan-400/20"
              data-testid="button-start-flight-prep"
            >
              <Plane className="mr-2 h-5 w-5" />
              Start Your Flight Prep
            </Button>
          </Link>
        </div> */}

        {/* Info Section */}
        <div className="mt-16 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">About ATPL Subjects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Exam Requirements</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Minimum 75% pass rate required</li>
                <li>• 18-month window to complete all exams</li>
                <li>• Maximum 6 exam sessions total</li>
                <li>• Maximum 4 attempts per subject</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Question Format</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Multiple Choice Questions (MCQ)</li>
                <li>• 4 options per question</li>
                <li>• Based on EASA ECQB 2024</li>
                <li>• Real exam simulation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add Topic Dialog */}
        <Dialog open={showAddTopic} onOpenChange={setShowAddTopic}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Topic</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic-text">Topic Name</Label>
                <Input
                  id="topic-text"
                  value={newTopicData.text}
                  onChange={(e) => setNewTopicData(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter topic name"
                  data-testid="input-topic-name"
                />
              </div>
              <div>
                <Label htmlFor="topic-description">Description (Optional)</Label>
                <Textarea
                  id="topic-description"
                  value={newTopicData.description}
                  onChange={(e) => setNewTopicData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter topic description"
                  data-testid="textarea-topic-description"
                />
              </div>
              <div>
                <Label htmlFor="topic-category">Category</Label>
                <Select value={newTopicData.categoryId} onValueChange={(value) => setNewTopicData(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger data-testid="select-topic-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddTopic(false);
                    setNewTopicData({ text: '', description: '', categoryId: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTopic}
                  disabled={createTopicMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-create-topic"
                >
                  {createTopicMutation.isPending ? "Creating..." : "Create Topic"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Topic Dialog */}
        <Dialog open={!!editingTopic} onOpenChange={() => setEditingTopic(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Topic</DialogTitle>
            </DialogHeader>
            {editingTopic && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-topic-text">Topic Name</Label>
                  <Input
                    id="edit-topic-text"
                    value={editingTopic.text}
                    onChange={(e) => setEditingTopic(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Enter topic name"
                    data-testid="input-edit-topic-name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-topic-description">Description (Optional)</Label>
                  <Textarea
                    id="edit-topic-description"
                    value={editingTopic.description || ''}
                    onChange={(e) => setEditingTopic(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter topic description"
                    data-testid="textarea-edit-topic-description"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-topic-category">Category</Label>
                  <Select value={editingTopic.categoryId?.toString()} onValueChange={(value) => setEditingTopic(prev => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger data-testid="select-edit-topic-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingTopic(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateTopic}
                    disabled={updateTopicMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-update-topic"
                  >
                    {updateTopicMutation.isPending ? "Updating..." : "Update Topic"}
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
