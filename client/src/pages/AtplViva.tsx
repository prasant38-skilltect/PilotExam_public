import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, BookOpen, Award } from "lucide-react";

export default function AtplViva() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ATPL Viva Preparation
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive oral examination preparation for your ATPL license. Practice with experienced instructors and boost your confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Users className="h-5 w-5" />
                Expert Instructors
              </CardTitle>
              <CardDescription>
                Learn from experienced airline pilots and flight instructors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our instructors have extensive airline experience and deep knowledge of ATPL requirements.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Clock className="h-5 w-5" />
                Mock Viva Sessions
              </CardTitle>
              <CardDescription>
                Realistic oral examination simulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Practice with actual EASA examination scenarios and receive detailed feedback.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Award className="h-5 w-5" />
                Pass Guarantee
              </CardTitle>
              <CardDescription>
                High success rate with our preparation program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                95% of our students pass their ATPL viva on the first attempt.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Viva Topics Covered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Air Law & ATC Procedures",
                  "Aircraft General Knowledge",
                  "Flight Planning & Monitoring",
                  "Human Performance & Limitations",
                  "Meteorology",
                  "Navigation",
                  "Operational Procedures",
                  "Principles of Flight",
                  "Performance",
                  "Mass & Balance",
                  "Instrumentation",
                  "Radio Navigation",
                  "Communications",
                  "General Navigation"
                ].map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{topic}</span>
                    <Badge variant="secondary" className="text-xs">
                      Essential
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>
                Book your ATPL viva preparation session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Duration:</span>
                  <span className="text-gray-600 dark:text-gray-400">2-3 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Format:</span>
                  <span className="text-gray-600 dark:text-gray-400">One-on-one or small group</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Preparation:</span>
                  <span className="text-gray-600 dark:text-gray-400">Study materials provided</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Follow-up:</span>
                  <span className="text-gray-600 dark:text-gray-400">Detailed feedback report</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Book Viva Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}