import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, Target, TrendingUp, Users, Award } from "lucide-react";

export default function AptitudeTest() {
  const testCategories = [
    {
      name: "Spatial Awareness",
      description: "3D orientation and spatial reasoning",
      questions: 25,
      timeLimit: "20 minutes",
      difficulty: "Medium",
      completion: 0
    },
    {
      name: "Mathematical Reasoning",
      description: "Quick calculations and problem solving",
      questions: 30,
      timeLimit: "25 minutes", 
      difficulty: "Medium",
      completion: 0
    },
    {
      name: "Verbal Reasoning",
      description: "Language comprehension and logic",
      questions: 20,
      timeLimit: "15 minutes",
      difficulty: "Easy",
      completion: 0
    },
    {
      name: "Logical Sequences",
      description: "Pattern recognition and sequencing",
      questions: 28,
      timeLimit: "22 minutes",
      difficulty: "Hard",
      completion: 0
    },
    {
      name: "Memory & Attention",
      description: "Short-term memory and concentration",
      questions: 15,
      timeLimit: "18 minutes",
      difficulty: "Medium",
      completion: 0
    },
    {
      name: "Multi-tasking",
      description: "Simultaneous task management",
      questions: 12,
      timeLimit: "25 minutes",
      difficulty: "Hard",
      completion: 0
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pilot Aptitude Tests
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive cognitive assessments designed to evaluate the mental skills essential for professional pilots. 
            Used by major airlines worldwide for pilot selection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Brain className="h-5 w-5" />
                Cognitive Assessment
              </CardTitle>
              <CardDescription>
                Evaluate mental processing speed and accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tests designed by aviation psychologists to assess pilot-specific cognitive abilities.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Target className="h-5 w-5" />
                Industry Standard
              </CardTitle>
              <CardDescription>
                Based on real airline selection processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our tests mirror those used by major airlines like Emirates, Lufthansa, and British Airways.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <TrendingUp className="h-5 w-5" />
                Performance Tracking
              </CardTitle>
              <CardDescription>
                Monitor progress and improvement over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detailed analytics and recommendations for focused practice and improvement.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Test Categories
              </CardTitle>
              <CardDescription>
                Complete all categories for a comprehensive aptitude assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testCategories.map((category, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                      </div>
                      <Badge className={getDifficultyColor(category.difficulty)}>
                        {category.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{category.questions} questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{category.timeLimit}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-gray-600 dark:text-gray-400">{category.completion}%</span>
                      </div>
                      <Progress value={category.completion} className="h-2" />
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      size="sm"
                    >
                      {category.completion > 0 ? 'Continue Test' : 'Start Test'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Test Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                  <p className="text-gray-700 dark:text-gray-300">Choose a quiet environment free from distractions</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                  <p className="text-gray-700 dark:text-gray-300">Ensure stable internet connection</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                  <p className="text-gray-700 dark:text-gray-300">Read each question carefully before answering</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                  <p className="text-gray-700 dark:text-gray-300">Work quickly but accurately - time is limited</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-semibold">5</span>
                  <p className="text-gray-700 dark:text-gray-300">Complete all sections for comprehensive assessment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Assessment Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">Total Questions</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">130</div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">Total Time</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">125 min</div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">Pass Score</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">75%</div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">Attempts</div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">3</div>
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Begin Full Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}