import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, Settings, BookOpen } from 'lucide-react';

type Chapter = {
  id: number;
  name: string;
  description?: string;
  subjectId: number;
};

export default function Instruments() {
  // Instruments subject ID is 1 based on our database insert
  const { data: chapters, isLoading } = useQuery<Chapter[]>({
    queryKey: ['/api/subjects/1/chapters'],
  });

  // Auth and admin functionality
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Chapter management state
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [newChapterData, setNewChapterData] = useState({
    name: '',
    description: '',
    subjectId: 1 // Instruments subject ID
  });

  // Mutations for chapter management
  const createChapterMutation = useMutation({
    mutationFn: async (chapterData: any) => {
      return await apiRequest('POST', '/api/admin/chapters', chapterData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects/1/chapters'] });
      setShowAddChapter(false);
      setNewChapterData({ name: '', description: '', subjectId: 1 });
      toast({
        title: "Success",
        description: "Chapter created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create chapter.",
        variant: "destructive",
      });
    }
  });

  const updateChapterMutation = useMutation({
    mutationFn: async (chapterData: any) => {
      return await apiRequest('PUT', `/api/admin/chapters/${chapterData.id}`, chapterData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects/1/chapters'] });
      setEditingChapter(null);
      toast({
        title: "Success",
        description: "Chapter updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update chapter.",
        variant: "destructive",
      });
    }
  });

  const deleteChapterMutation = useMutation({
    mutationFn: async (chapterId: number) => {
      return await apiRequest('DELETE', `/api/admin/chapters/${chapterId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subjects/1/chapters'] });
      toast({
        title: "Success",
        description: "Chapter deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete chapter.",
        variant: "destructive",
      });
    }
  });

  const handleCreateChapter = () => {
    if (!newChapterData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a chapter name",
        variant: "destructive",
      });
      return;
    }
    createChapterMutation.mutate(newChapterData);
  };

  const handleUpdateChapter = () => {
    if (!editingChapter) return;
    updateChapterMutation.mutate(editingChapter);
  };

  const handleDeleteChapter = (chapterId: number) => {
    if (confirm('Are you sure you want to delete this chapter?')) {
      deleteChapterMutation.mutate(chapterId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-80 mx-auto mb-6" />
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif italic">
            Instruments
          </h1>
          <Link href="/subjects/">
            <Button
              variant="outline"
              className="mb-8 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              data-testid="button-back-subjects"
            >
              ← Back to Subjects
            </Button>
          </Link>
        </div>

        {/* Admin Chapter Management */}
        {isAdmin && (
          <Card className="mb-8 bg-slate-800/80 backdrop-blur-sm shadow-lg border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="h-5 w-5" />
                Admin: Chapter Management (Instruments)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setShowAddChapter(true)}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-add-chapter"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Chapter
                </Button>
              </div>
              
              {chapters && chapters.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {chapters.map((chapter: Chapter) => (
                    <div
                      key={chapter.id}
                      className="bg-slate-700/60 p-3 rounded-lg border border-slate-600"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{chapter.name}</h4>
                          {chapter.description && (
                            <p className="text-gray-300 text-sm mt-1">{chapter.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingChapter(chapter)}
                            className="text-blue-400 hover:bg-blue-900/50"
                            data-testid={`button-edit-chapter-${chapter.id}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="text-red-400 hover:bg-red-900/50"
                            data-testid={`button-delete-chapter-${chapter.id}`}
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
        
        <div className="space-y-4">
          {chapters?.map((chapter: Chapter) => {
            const getChapterUrl = (chapterName: string) => {
              switch (chapterName) {
                case 'O#F#RD':
                  return '/oxford-instruments-questions/';
                case 'K#ITH WI##I#M':
                  return '/keith-instruments-questions/';
                case 'EASA (INDIGO)':
                  return '/easa-instruments-questions/';
                default:
                  return `/instruments/${chapterName.toLowerCase().replace(/[^a-z0-9]/g, '-')}/`;
              }
            };

            return (
              <Link key={chapter.id} href={getChapterUrl(chapter.name)}>
                <Button
                  variant="outline"
                  className="w-full h-16 text-lg font-medium bg-slate-700/80 border-slate-600 text-white hover:bg-slate-600/80 transition-all duration-300 rounded-full"
                  data-testid={`instruments-${chapter.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
                >
                  {chapter.name}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Add Chapter Dialog */}
        <Dialog open={showAddChapter} onOpenChange={setShowAddChapter}>
          <DialogContent className="bg-slate-800 border-slate-600">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Chapter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="chapter-name" className="text-gray-200">Chapter Name</Label>
                <Input
                  id="chapter-name"
                  value={newChapterData.name}
                  onChange={(e) => setNewChapterData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter chapter name"
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="input-chapter-name"
                />
              </div>
              <div>
                <Label htmlFor="chapter-description" className="text-gray-200">Description (Optional)</Label>
                <Textarea
                  id="chapter-description"
                  value={newChapterData.description}
                  onChange={(e) => setNewChapterData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter chapter description"
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="textarea-chapter-description"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddChapter(false);
                    setNewChapterData({ name: '', description: '', subjectId: 1 });
                  }}
                  className="border-slate-600 text-gray-200 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateChapter}
                  disabled={createChapterMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-create-chapter"
                >
                  {createChapterMutation.isPending ? "Creating..." : "Create Chapter"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Chapter Dialog */}
        <Dialog open={!!editingChapter} onOpenChange={() => setEditingChapter(null)}>
          <DialogContent className="bg-slate-800 border-slate-600">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Chapter</DialogTitle>
            </DialogHeader>
            {editingChapter && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-chapter-name" className="text-gray-200">Chapter Name</Label>
                  <Input
                    id="edit-chapter-name"
                    value={editingChapter.name}
                    onChange={(e) => setEditingChapter(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter chapter name"
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="input-edit-chapter-name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-chapter-description" className="text-gray-200">Description (Optional)</Label>
                  <Textarea
                    id="edit-chapter-description"
                    value={editingChapter.description || ''}
                    onChange={(e) => setEditingChapter(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter chapter description"
                    className="bg-slate-700 border-slate-600 text-white"
                    data-testid="textarea-edit-chapter-description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingChapter(null)}
                    className="border-slate-600 text-gray-200 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateChapter}
                    disabled={updateChapterMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-update-chapter"
                  >
                    {updateChapterMutation.isPending ? "Updating..." : "Update Chapter"}
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