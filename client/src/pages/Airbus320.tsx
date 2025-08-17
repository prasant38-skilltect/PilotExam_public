import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plane, Monitor, Settings, Zap, Clock, Users, BookOpen, Award } from "lucide-react";

export default function Airbus320() {
  const modules = [
    {
      title: "A320 Systems Overview",
      description: "Comprehensive systems knowledge",
      progress: 0,
      lessons: 12,
      duration: "8 hours",
      difficulty: "Medium"
    },
    {
      title: "Flight Management System",
      description: "FMGC operations and procedures",
      progress: 0,
      lessons: 8,
      duration: "6 hours",
      difficulty: "Hard"
    },
    {
      title: "ECAM Procedures",
      description: "Electronic Centralized Aircraft Monitoring",
      progress: 0,
      lessons: 15,
      duration: "10 hours",
      difficulty: "Hard"
    },
    {
      title: "Normal Procedures",
      description: "Standard operating procedures",
      progress: 0,
      lessons: 20,
      duration: "12 hours",
      difficulty: "Medium"
    },
    {
      title: "Abnormal & Emergency Procedures",
      description: "Non-normal situation handling",
      progress: 0,
      lessons: 25,
      duration: "15 hours",
      difficulty: "Hard"
    },
    {
      title: "Performance & Limitations",
      description: "Aircraft performance calculations",
      progress: 0,
      lessons: 10,
      duration: "7 hours",
      difficulty: "Medium"
    }
  ];

  const systemsTopics = [
    "Air Conditioning & Pressurization",
    "Automatic Flight System",
    "Communications",
    "Electrical Power",
    "Emergency Equipment",
    "Engine & APU",
    "Fire Protection",
    "Flight Controls",
    "Fuel System",
    "Hydraulics",
    "Ice & Rain Protection",
    "Landing Gear & Brakes",
    "Navigation Systems",
    "Oxygen System",
    "Pneumatics"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Airbus A320 Type Rating Course
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Complete A320 type rating preparation covering all systems, procedures, and operational knowledge 
            required for airline pilots. EASA approved training materials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <Plane className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">A320 Family</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">A319/A320/A321 coverage</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6 text-center">
              <Monitor className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Interactive Cockpit</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">3D cockpit simulations</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Systems Training</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">All 15 aircraft systems</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">EASA Approved</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Official training materials</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  Course Modules
                </CardTitle>
                <CardDescription>
                  Complete all modules to master A320 operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{module.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
                        </div>
                        <Badge 
                          className={
                            module.difficulty === 'Hard' ? 
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }
                        >
                          {module.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">{module.lessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">{module.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Expert led</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="text-gray-600 dark:text-gray-400">{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>

                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        size="sm"
                      >
                        {module.progress > 0 ? 'Continue Module' : 'Start Module'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                    <div className="font-semibold text-gray-900 dark:text-white">Total Content</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">58 hours</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                    <div className="font-semibold text-gray-900 dark:text-white">Lessons</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">90</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                    <div className="font-semibold text-gray-900 dark:text-white">Completion</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">0%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>A320 Systems</CardTitle>
                <CardDescription>
                  All systems covered in detail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {systemsTopics.slice(0, 8).map((topic, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 rounded bg-gray-50 dark:bg-slate-700">
                      <span className="text-gray-700 dark:text-gray-300">{topic}</span>
                      <Settings className="h-4 w-4 text-gray-500" />
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm">
                      View All Systems ({systemsTopics.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your A320 Journey?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Join thousands of pilots who have successfully completed their A320 type rating with our comprehensive course. 
                Start your training today and advance your airline career.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                  Start Free Trial
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  Course Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}