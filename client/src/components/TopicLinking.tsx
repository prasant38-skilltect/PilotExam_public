import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import { Search, Link as LinkIcon, Check, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function TopicLinking({showTopicLinking, setShowTopicLinking, selectedQuestions, linkQuestionsToTopicMutation, setUploadedQuestions, allTopics, loadingTopics, handleQuestionSelection, uploadedQuestions, setSelectedQuestions, topics, selectedTopic, setSelectedTopic}: {showTopicLinking: any, setShowTopicLinking: any, selectedQuestions: any, linkQuestionsToTopicMutation: any, setUploadedQuestions: any, allTopics: any, loadingTopics: any, handleQuestionSelection: any, uploadedQuestions: any, setSelectedQuestions: any, topics: any, selectedTopic: any, setSelectedTopic: any}) {
    const [topicSearchOpen, setTopicSearchOpen] = useState(false);
    const { toast } = useToast();

    const handleSelectAllQuestions = (selectAll: boolean) => {
        if (selectAll) {
        setSelectedQuestions(uploadedQuestions.map((q: any) => q.id));
        } else {
        setSelectedQuestions([]);
        }
    };
    
    const handleLinkToTopic = () => {
        if (!selectedTopic || selectedQuestions.length === 0) {
        toast({
            title: "Error",
            description: "Please select a topic and at least one question.",
            variant: "destructive",
        });
        return;
        }
        
        linkQuestionsToTopicMutation.mutate({
        questionIds: selectedQuestions,
        topicId: selectedTopic.id
        });
    };
    
    return (
         <Dialog open={showTopicLinking} onOpenChange={setShowTopicLinking}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6 border-b">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <LinkIcon className="h-6 w-6 text-blue-600" />
                Link Uploaded Questions to Topic
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-2">
                Your questions have been uploaded successfully! Now organize them by assigning to the appropriate topic.
              </p>
            </DialogHeader>
            <div className="space-y-6">
              {/* Question Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Select Questions ({selectedQuestions.length} of {uploadedQuestions.length})</h3>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedQuestions.length === uploadedQuestions.length}
                      onCheckedChange={handleSelectAllQuestions}
                      data-testid="checkbox-select-all"
                    />
                    <Label>Select All</Label>
                  </div>
                </div>
                
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  {uploadedQuestions.map((question: any, index: any) => (
                    <div key={question.id} className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50">
                      <Checkbox
                        checked={selectedQuestions.includes(question.id)}
                        onCheckedChange={(checked) => handleQuestionSelection(question.id, checked as boolean)}
                        data-testid={`checkbox-question-${question.id}`}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Question {index + 1}</div>
                        <div className="text-sm text-gray-600 truncate max-w-lg">
                          {question.text || question.question_text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic Selection */}
              <div>
                <Label className="text-lg font-medium">Select Topic</Label>
                <Popover open={topicSearchOpen} onOpenChange={setTopicSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={topicSearchOpen}
                      className="mt-2 w-full justify-between h-12 text-left bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300"
                      data-testid="button-search-topic"
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
                                setTopicSearchOpen(false);
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
                
                {selectedTopic && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <div className="text-sm font-medium">Selected Topic: {selectedTopic.text}</div>
                    <div className="text-sm text-gray-600">Category: {selectedTopic.categoryName}</div>
                    {selectedTopic.quizId ? (
                      <div className="text-sm text-green-600">✓ Has existing quiz (ID: {selectedTopic.quizId})</div>
                    ) : (
                      <div className="text-sm text-orange-600">⚠ Will create new quiz for this topic</div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTopicLinking(false);
                    setUploadedQuestions([]);
                    setSelectedQuestions([]);
                    setSelectedTopic(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLinkToTopic}
                  disabled={!selectedTopic || selectedQuestions.length === 0 || linkQuestionsToTopicMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-link-to-topic"
                >
                  {linkQuestionsToTopicMutation.isPending ? "Linking..." : `Link ${selectedQuestions.length} Questions`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    )}