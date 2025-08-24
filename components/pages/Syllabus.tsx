import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, FileText, CheckCircle, Circle } from "@/components/Icons";

export default function Syllabus() {
  const subjects = [
    {
      id: 1,
      code: "010",
      name: "Air Law",
      questions: 44,
      timeLimit: 75,
      passScore: 75,
      completed: true,
      score: 85,
      topics: [
        "International Law and ICAO",
        "Airworthiness and Aircraft Registration",
        "Personnel Licensing",
        "Rules of the Air",
        "Air Traffic Services",
        "Aerodromes",
        "Aircraft Operations",
        "Aviation Security"
      ]
    },
    {
      id: 2,
      code: "021",
      name: "Aircraft General Knowledge - Airframe/Systems",
      questions: 70,
      timeLimit: 120,
      passScore: 75,
      completed: false,
      score: null,
      topics: [
        "System Design and Operation",
        "Airframe Structure",
        "Landing Gear",
        "Flight Controls",
        "Hydraulic Power",
        "Landing Gear and Brakes",
        "Air Conditioning and Cabin Pressurization",
        "Fire Protection",
        "Fuel Systems"
      ]
    },
    {
      id: 3,
      code: "022", 
      name: "Aircraft General Knowledge - Instrumentation",
      questions: 60,
      timeLimit: 90,
      passScore: 75,
      completed: false,
      score: null,
      topics: [
        "Classification of Instruments",
        "Pitot Static System",
        "Gyroscopic Instruments",
        "Compass Systems",
        "Electronic Flight Displays",
        "Flight Management Systems",
        "Autopilot and Flight Director",
        "Warning and Recording Systems"
      ]
    },
    {
      id: 4,
      code: "031",
      name: "Mass and Balance",
      questions: 25,
      timeLimit: 45,
      passScore: 75,
      completed: true,
      score: 92,
      topics: [
        "Definitions and Theory",
        "Centre of Gravity and Limits",
        "Mass Distribution",
        "Loading and Load Sheets",
        "Fuel Planning",
        "Special Loads"
      ]
    },
    {
      id: 5,
      code: "032",
      name: "Performance",
      questions: 45,
      timeLimit: 75,
      passScore: 75,
      completed: false,
      score: null,
      topics: [
        "Flight Mechanics",
        "Takeoff and Landing Performance",
        "Climb and Descent Performance", 
        "Cruise Performance",
        "Contaminated Runways",
        "Performance Class A"
      ]
    },
    {
      id: 6,
      code: "033",
      name: "Flight Planning and Monitoring",
      questions: 40,
      timeLimit: 60,
      passScore: 75,
      completed: false,
      score: null,
      topics: [
        "Flight Planning",
        "ATS Flight Plan",
        "Fuel Planning",
        "Navigation Planning",
        "ETOPS Planning",
        "Flight Monitoring"
      ]
    }
  ];

  const calculateOverallProgress = () => {
    const completedSubjects = subjects.filter(s => s.completed).length;
    return Math.round((completedSubjects / subjects.length) * 100);
  };

  const calculateAverageScore = () => {
    const completedWithScores = subjects.filter(s => s.completed && s.score);
    if (completedWithScores.length === 0) return 0;
    const totalScore = completedWithScores.reduce((sum, s) => sum + (s.score || 0), 0);
    return Math.round(totalScore / completedWithScores.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ATPL Syllabus & Study Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Complete EASA ATPL theoretical knowledge syllabus covering all 14 subjects. 
            Track your progress and master each topic systematically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {calculateOverallProgress()}%
                </div>
                <p className="text-gray-600 dark:text-gray-400">Overall Progress</p>
                <Progress value={calculateOverallProgress()} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {subjects.filter(s => s.completed).length}/{subjects.length}
                </div>
                <p className="text-gray-600 dark:text-gray-400">Subjects Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {calculateAverageScore()}%
                </div>
                <p className="text-gray-600 dark:text-gray-400">Average Score</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      {subject.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-gray-900 dark:text-white">
                        {subject.code} - {subject.name}
                      </span>
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    {subject.completed && subject.score && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Score: {subject.score}%
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {subject.questions} Questions
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Topics Covered:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {subject.topics.map((topic, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm p-2 rounded bg-gray-50 dark:bg-slate-700">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {subject.timeLimit} minutes
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Pass: {subject.passScore}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {subject.completed ? (
                        <>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            size="sm"
                          >
                            Review Results
                          </Button>
                          <Button 
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                            size="sm"
                          >
                            Retake Test
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outline"
                            className="w-full"
                            size="sm"
                          >
                            Study Materials
                          </Button>
                          <Button 
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                            size="sm"
                          >
                            Start Test
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Begin Your ATPL Journey?</h3>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Follow our structured syllabus to systematically master all ATPL subjects. 
                Our comprehensive study materials and practice tests will prepare you for success.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
                  Download Study Guide
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  Start First Subject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}