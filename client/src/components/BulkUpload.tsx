import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

export function BulkUpload({showBulkUpload, setShowBulkUpload, handleDownloadTemplate, setUploadedQuestions, setShowTopicLinking, setSelectedQuestions}: {setShowBulkUpload: any, showBulkUpload: any, handleBulkUpload: () => void, bulkUploadMutation: any, handleDownloadTemplate: any, setUploadedQuestions: any, setShowTopicLinking: any, setSelectedQuestions: any}) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleBulkUpload = () => {
        if (!selectedFile) {
        toast({
            title: "Error",
            description: "Please select an Excel file to upload",
            variant: "destructive",
        });
        return;
        }

        bulkUploadMutation.mutate(selectedFile);
    };
    
      // Mutation for bulk upload questions
      const bulkUploadMutation = useMutation({
        mutationFn: async (file: File) => {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/admin/questions/bulk-upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload questions');
          }
          
          return await response.json();
        },
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
          setShowBulkUpload(false);
          setSelectedFile(null);
          
          // Store uploaded questions and show topic linking dialog
          if (data.questions && data.questions.length > 0) {
            setUploadedQuestions(data.questions);
            setSelectedQuestions(data.questions.map((q: any) => q.id)); // Select all by default
            setShowTopicLinking(true);
            toast({
              title: "Upload Complete",
              description: `${data.count} questions uploaded. Now select a topic to link them.`,
            });
          } else {
            toast({
              title: "Success",
              description: `Successfully uploaded ${data.count} questions.`,
            });
          }
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to upload questions. Please check the file format.",
            variant: "destructive",
          });
          console.error("Failed to upload questions:", error);
        }
      });
    
    return <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bulk Upload Questions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="excel-file">Select Excel File</Label>
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload an Excel file with questions, options, and explanations.
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  Need the correct format? Download our template first:
                </p>
                <Button
                  onClick={handleDownloadTemplate}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Excel Template
                </Button>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBulkUpload(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkUpload}
                  disabled={!selectedFile || bulkUploadMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {bulkUploadMutation.isPending ? "Uploading..." : "Upload Questions"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
}