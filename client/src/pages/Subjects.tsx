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
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    slug: ''
  });

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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      setShowAddCategory(false);
      setNewCategoryData({ name: '', slug: '' });
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      setEditingCategory(null);
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
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

  const handleCreateCategory = () => {
    if (!newCategoryData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }
     if (!newCategoryData.slug.trim()) {
      toast({
        title: "Error",
        description: "Please enter a slug name",
        variant: "destructive",
      });
      return;
    }
    createCategoryMutation.mutate(newCategoryData);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    updateCategoryMutation.mutate(editingCategory);
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const setNewName = (name: string) => {
    setNewCategoryData(prev => ({ ...prev, name }));
    setNewCategoryData(prev => ({ ...prev, slug: name.trim()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Choose Your Flight Training Module111
          </h1>
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
                  onClick={() => setShowAddCategory(true)}
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
                            onClick={() => setEditingCategory(category)}
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

        {/* Add Category Dialog */}
        <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={newCategoryData.name}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter category name"
                  data-testid="input-category-name"
                />
              </div>
              <div>
                <Label htmlFor="category-description">Slug</Label>
                <Textarea
                  id="category-description"
                  value={newCategoryData.slug}
                  onChange={(e) => setNewCategoryData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Enter category description"
                  data-testid="textarea-category-description"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategoryData({ name: '', slug: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCategory}
                  disabled={createCategoryMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-create-category"
                >
                  {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-category-name">Category Name</Label>
                  <Input
                    id="edit-category-name"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    data-testid="input-edit-category-name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category-description">Description (Optional)</Label>
                  <Textarea
                    id="edit-category-description"
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                    data-testid="textarea-edit-category-description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingCategory(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateCategory}
                    disabled={updateCategoryMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-update-category"
                  >
                    {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
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