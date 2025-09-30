import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getSubjectUrl } from '@/shared/urlMapping';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import GenericSectionTest from './GenericSectionTest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, Settings, Tag, ChevronRight, Home } from 'lucide-react';
import ManageQuestions from '../components/ManangeQuestions';

export default function DynamicPage() {
  const link = useLocation();
  const [, setLocation] = useLocation();
  const auth = useAuth();
  const { isAuthenticated, isLoading: authLoading } = auth;
  const isAdmin = (auth as any)?.isAdmin;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: subjects, isLoading } = useQuery<any>({
    queryKey: [`/api${link[0]}`],
  });

  const {data: subcriptions = []} = useQuery<any>({
    queryKey: ['/api/subscriptions'],
  });
  // Topic management state
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [newTopicData, setNewTopicData] = useState({
    text: '',
    slug: '',
    categoryId: ''
  });

  // Fetch categories for topic creation
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/admin/categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/categories');
      return res instanceof Response ? await res.json() : res;
    },
    enabled: isAdmin && subjects?.type === "topic",
  });

  // Mutations for topic management
  const createTopicMutation = useMutation({
    mutationFn: async (topicData: any) => {
      const data = subjects.data[0];
      topicData.categoryId = parseInt(data.categoryId, 10);
      topicData.categoryName = data.categoryName;
      topicData.parentId = data.parentId;
      topicData.parentName = data.parentName;
      topicData.quizId = -1;

      return await apiRequest('POST', '/api/admin/topics', topicData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api${link[0]}`] });
      setShowAddTopic(false);
      setNewTopicData({ text: '', slug: '', categoryId: '' });
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
      queryClient.invalidateQueries({ queryKey: [`/api${link[0]}`] });
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
      queryClient.invalidateQueries({ queryKey: [`/api${link[0]}`] });
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
     if (!newTopicData.slug.trim()) {
      toast({
        title: "Error",
        description: "Please enter a slug name",
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

  // Check if this is a quiz and user needs authentication
  useEffect(() => {
    if (!isLoading && !authLoading && subjects?.type === "quiz" && !isAuthenticated) {
      // Store current path to redirect back after login
      localStorage.setItem('redirectAfterLogin', link[0]);
      setLocation('/sign-in');
    }
  }, [subjects, isAuthenticated, authLoading, isLoading, link, setLocation]);

  const setNewName = (name: string) => {
    setNewTopicData(prev => ({ ...prev, text: name }));
    setNewTopicData(prev => ({ ...prev, slug: name.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')   // replace spaces & special chars with _
      .replace(/^_+|_+$/g, '') }));     // remove leading/trailing _  
  }

  const setNewEditName = (name: string) => {
    setEditingTopic(prev => ({ ...prev, text: name }));
    setEditingTopic(prev => ({ ...prev, slug: name.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')   // replace spaces & special chars with _
      .replace(/^_+|_+$/g, '') }));     // remove leading/trailing _  
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-6" />
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(16)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // if(subjects?.type === "quiz" && isAuthenticated && subcriptions.length === 0) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
  //       <div className="max-w-4xl mx-auto px-4 py-20">
  //         <div className="text-center mb-12">
  //           <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-700 bg-clip-text text-transparent">
  //             You need to subscribe to access this quiz.
  //           </h1>
  //           <Link href="/subscriptions">
  //             <Button
  //               size="lg"
  //               className="bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-600 text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-cyan-400/20 shadow-lg shadow-cyan-400/20"
  //               data-testid="button-subscribe"
  //             > Subscribe Now
  //             </Button>
  //           </Link>   
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }
  console.log("link....", link[0])
  console.log("subjects....", subjects)
  const data = subjects?.data ? subjects?.data[0] : {}
  const category = subjects?.data ? subjects?.category : {}
  
  // Build breadcrumb data from subjects structure
  const breadcrumbData = {
    categoryName: subjects?.type === "topic" && subjects?.data?.[0]?.categoryName 
      ? subjects.data[0].categoryName 
      : null,
    categorySlug: subjects?.type === "topic" && subjects?.data?.[0]?.categorySlug 
      ? subjects.data[0].categorySlug 
      : null,
    parentName: subjects?.type === "topic" && subjects?.data?.[0]?.parentName 
      ? subjects.data[0].parentName 
      : null,
    parentSlug: subjects?.type === "topic" && subjects?.data?.[0]?.parentSlug 
      ? subjects.data[0].parentSlug 
      : null,
    currentPageName: subjects?.type === "quiz" 
      ? subjects.topicName 
      : (subjects?.category?.name || null),
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
          <Link href="/" className="flex items-center gap-1 text-cyan-300 hover:text-cyan-100 transition-colors" data-testid="breadcrumb-home">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          
          {breadcrumbData.categoryName && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {breadcrumbData.categorySlug ? (
                <Link href={`/${breadcrumbData.categorySlug}`} className="text-cyan-300 hover:text-cyan-100 transition-colors" data-testid="breadcrumb-category">
                  {breadcrumbData.categoryName}
                </Link>
              ) : (
                <span className="text-cyan-300" data-testid="breadcrumb-category">
                  {breadcrumbData.categoryName}
                </span>
              )}
            </>
          )}
          
          {breadcrumbData.parentName && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {breadcrumbData.parentSlug ? (
                <Link href={`/${breadcrumbData.parentSlug}`} className="text-cyan-300 hover:text-cyan-100 transition-colors" data-testid="breadcrumb-parent">
                  {breadcrumbData.parentName}
                </Link>
              ) : (
                <span className="text-cyan-300" data-testid="breadcrumb-parent">
                  {breadcrumbData.parentName}
                </span>
              )}
            </>
          )}
          
          {breadcrumbData.currentPageName && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300 font-medium" data-testid="breadcrumb-current">
                {breadcrumbData.currentPageName}
              </span>
            </>
          )}
        </nav>

        <h1 className="text-3xl text-white text-center mb-8">
          {category ? category.name : ''} 
        </h1>

        {/* Admin Topic Management */}
        {isAdmin && subjects?.type === "topic" && (
          <Card className="mb-8 bg-slate-800/80 backdrop-blur-sm shadow-lg border-cyan-400/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
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
              
              {subjects?.data && subjects.data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjects.data.map((topic: any) => (
                    topic.text !== 'ignore' && <div
                      key={topic.id}
                      className="bg-slate-700/60 p-3 rounded-lg border border-cyan-400/20"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{topic.text}</h4>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingTopic(topic)}
                            className="text-blue-400 hover:bg-blue-900/50"
                            data-testid={`button-edit-topic-${topic.id}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="text-red-400 hover:bg-red-900/50"
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

        {subjects?.type === "topic" &&
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects?.data?.map((subject: any) => (
              subject?.text !== 'ignore' && <Link key={subject.id} href={`/${subject.slug}/`}>
                <Button
                  variant="outline"
                  className="w-full h-16 text-sm font-medium bg-slate-800/60 border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300 whitespace-normal text-center p-3"
                  data-testid={`subject-${subject.text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
                >
                  {subject.text}
                </Button>
              </Link>
            ))}
          </div>
        }
        {subjects?.type === "quiz" && isAuthenticated &&
          <GenericSectionTest sectionId={subjects.id} quizData={subjects.data} sectionName={subjects.topicName}/>
        }

        {subjects?.type === "topic" && subjects.data.length === 1 && subjects.data[0].text === "ignore" && isAuthenticated &&
          <ManageQuestions sectionId={1} quizData={subjects.data} sectionName={subjects.data[0].slug}/>
        }

        {/* Add Topic Dialog */}
        <Dialog open={showAddTopic} onOpenChange={setShowAddTopic}>
          <DialogContent className="bg-slate-800 border-cyan-400/30">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Topic</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic-text" className="text-gray-200">Topic Name</Label>
                <Input
                  id="topic-text"
                  value={newTopicData.text}
                  onChange={(e) => setNewName(e.target.value )}
                  placeholder="Enter topic name"
                  className="bg-slate-700 border-cyan-400/30 text-white"
                  data-testid="input-topic-name"
                />
              </div>
              <div>
                <Label htmlFor="topic-description" className="text-gray-200">Slug</Label>
                <Input
                  id="topic-description"
                  value={newTopicData.slug}
                  onChange={(e) => setNewTopicData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Enter Topic Slug"
                  className="bg-slate-700 border-cyan-400/30 text-white"
                  data-testid="input-topic-description"
                />
              </div>
              <div>
                <Label htmlFor="topic-category" className="text-gray-200">Patent Topic</Label>
                {/* <Select value={newTopicData.categoryId} onValueChange={(value) => setNewTopicData(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger className="bg-slate-700 border-cyan-400/30 text-white" data-testid="select-topic-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger> */}
                  <div className="text-gray-200">
                    { data?.parentName ? data?.parentName : data?.categoryName }
                  </div>
                {/* </Select> */}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddTopic(false);
                    setNewTopicData({ text: '', slug: '', categoryId: '' });
                  }}
                    className="hover:bg-slate-700 hover:text-white"
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
          <DialogContent className="bg-slate-800 border-cyan-400/30">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Topic</DialogTitle>
            </DialogHeader>
            {editingTopic && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-topic-text" className="text-gray-200">Topic Name</Label>
                  <Input
                    id="edit-topic-text"
                    value={editingTopic.text}
                    onChange={(e) => setNewEditName(e.target.value )}
                    placeholder="Enter topic name"
                    className="bg-slate-700 border-cyan-400/30 text-white"
                    data-testid="input-edit-topic-name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-topic-description" className="text-gray-200">Slug</Label>
                  <Input
                    id="edit-topic-slub"
                    value={editingTopic.slug || ''}
                    onChange={(e) => setEditingTopic((prev: any) => ({ ...prev, slug: e.target.value }))}
                    placeholder="Enter topic slug"
                    className="bg-slate-700 border-cyan-400/30 text-white"
                    data-testid="textarea-edit-topic-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-topic-category" className="text-gray-200">Parent Topic</Label>
                  <div className="text-gray-200">
                    { data?.parentName ? data?.parentName : data?.categoryName }
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingTopic(null)}
                    className="hover:bg-slate-700 hover:text-white"
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