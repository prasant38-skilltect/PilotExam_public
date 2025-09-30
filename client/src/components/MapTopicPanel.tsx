import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";

export function MapTopicPanel({ selectedQuestionsInTable, setSelectedQuestionsInTable, setShowBulkTopicMapping }: { selectedQuestionsInTable: any[]; setSelectedQuestionsInTable: (value: any[]) => void, setShowBulkTopicMapping: (value: boolean) => void}) {
  return <>
        {selectedQuestionsInTable.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-900">
                        {selectedQuestionsInTable.length} question{selectedQuestionsInTable.length > 1 ? 's' : ''} selected
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQuestionsInTable([])}
                        className="text-xs"
                    >
                        Clear Selection
                    </Button>
                    </div>
                    {/* <Button
                        onClick={() => setShowBulkTopicMapping(true)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-bulk-map-to-topic"
                    >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Map Selected to Topic
                    </Button> */}
                </div>
            </div>
        )}
    </>
}