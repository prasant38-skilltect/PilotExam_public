import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getSubjectUrl } from '@/shared/urlMapping';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';

type Subject = {
  id: number;
  name: string;
  text: string;
};

export default function Subjects({ showBackToHome = true }: { showBackToHome?: boolean }) {
  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

  // Auth and admin functionality
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Category management state
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [categoryData, setCategoryData] = useState({ name: '', slug: '', description: '' });
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const isEditMode = editingCategoryId !== null;

  // Fetch categories for admin
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/admin/categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/categories');
      return res instanceof Response ? await res.json() : res;
    },
    enabled: isAdmin,
  });

  // Mutations for category management
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      return await apiRequest('POST', '/api/admin/categories', categoryData);
    },
    onSuccess: () => {
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/topics'] });
      setShowCategoryDialog(false);
      setCategoryData({ name: '', slug: '', description: '' });
      setEditingCategoryId(null);
      toast({
        title: "Success",
        description: "Category created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create category.",
        variant: "destructive",
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      return await apiRequest('PUT', `/api/admin/categories/${categoryData.id}`, categoryData);
    },
    onSuccess: () => {
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/topics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/category-hierarchy'] });
      setShowCategoryDialog(false);
      setCategoryData({ name: '', slug: '', description: '' });
      setEditingCategoryId(null);
      toast({
        title: "Success",
        description: "Category updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive",
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return await apiRequest('DELETE', `/api/admin/categories/${categoryId}`);
    },
    onSuccess: () => {
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subjects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/topics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/category-hierarchy'] });
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      });
    }
  });

  // Unified dialog handlers
  const openCreateDialog = () => {
    setCategoryData({ name: '', slug: '', description: '' });
    setEditingCategoryId(null);
    setShowCategoryDialog(true);
  };

  const openEditDialog = (category: any) => {
    setCategoryData({ 
      name: category.name, 
      slug: category.slug || '',
      description: category.description || ''
    });
    setEditingCategoryId(category.id);
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = () => {
    if (!categoryData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }
    if (!categoryData.slug.trim()) {
      toast({
        title: "Error",
        description: "Please enter a slug name",
        variant: "destructive",
      });
      return;
    }

    if (isEditMode) {
      updateCategoryMutation.mutate({ ...categoryData, id: editingCategoryId });
    } else {
      createCategoryMutation.mutate(categoryData);
    }
  };

  const closeDialog = () => {
    setShowCategoryDialog(false);
    setCategoryData({ name: '', slug: '', description: '' });
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const setCategoryName = (name: string) => {
    setCategoryData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }));
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          {showBackToHome && (<Link href="/">
            <Button
              variant="outline"
              className="mb-8 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              data-testid="button-back"
            >
              ← Back to Home
            </Button>
          </Link>)}
        </div>

        {/* Admin Category Management */}
        {isAdmin && (
          <Card className="mb-8 bg-white/10 border-cyan-400/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin: Category Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={openCreateDialog}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-add-category"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              
              {categories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((category: any) => (
                    <div
                      key={category.id}
                      className="bg-white/20 p-3 rounded-lg border border-cyan-400/30"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{category.name}</h4>
                          {category.description && (
                            <p className="text-cyan-200 text-sm mt-1">{category.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(category)}
                            className="text-cyan-200 hover:bg-cyan-400/20"
                            data-testid={`button-edit-category-${category.id}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-300 hover:bg-red-400/20"
                            data-testid={`button-delete-category-${category.id}`}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects?.map((subject: Subject) => (
            <Link key={subject.id} href={`/${subject.text}/`}>
              <Button
                variant="outline"
                className="w-full h-16 text-sm font-medium bg-slate-800/60 border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300 whitespace-normal text-center p-3"
                data-testid={`subject-${subject.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
              >
                {subject.name}
              </Button>
            </Link>
          ))}
        </div>

        {/* Category Dialog (Create/Edit) */}
        <Dialog open={showCategoryDialog} onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={categoryData.name}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  data-testid="input-category-name"
                />
              </div>
              <div>
                <Label htmlFor="category-slug">Slug</Label>
                <Input
                  id="category-slug"
                  value={categoryData.slug}
                  onChange={(e) => setCategoryData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Enter category slug"
                  data-testid="input-category-slug"
                />
              </div>
              <div>
                <Label htmlFor="category-description">Description (Optional)</Label>
                <Textarea
                  id="category-description"
                  value={categoryData.description}
                  onChange={(e) => setCategoryData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description"
                  data-testid="textarea-category-description"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCategory}
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className={isEditMode ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
                  data-testid={isEditMode ? "button-update-category" : "button-create-category"}
                >
                  {(createCategoryMutation.isPending || updateCategoryMutation.isPending) 
                    ? `${isEditMode ? 'Updating' : 'Creating'}...` 
                    : `${isEditMode ? 'Update' : 'Create'} Category`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}