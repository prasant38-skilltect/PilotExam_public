import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Video, BookOpen, Star } from "lucide-react";

export default function Classes() {
  const classes = [
    {
      id: 1,
      title: "ATPL Ground School - Complete Package",
      instructor: "Capt. John Smith",
      duration: "6 months",
      students: 24,
      rating: 4.9,
      price: "£2,999",
      nextStart: "2024-02-01",
      type: "Comprehensive",
      subjects: ["All 14 ATPL subjects", "Mock exams", "Viva preparation"],
      format: "Hybrid (Online + In-person)"
    },
    {
      id: 2,
      title: "Navigation & Flight Planning Masterclass",
      instructor: "Capt. Sarah Johnson",
      duration: "4 weeks",
      students: 18,
      rating: 4.8,
      price: "£599",
      nextStart: "2024-01-15",
      type: "Specialized",
      subjects: ["General Navigation", "Radio Navigation", "Flight Planning"],
      format: "Online Live"
    },
    {
      id: 3,
      title: "Meteorology Deep Dive",
      instructor: "Dr. Michael Brown",
      duration: "3 weeks",
      students: 15,
      rating: 4.7,
      price: "£449",
      nextStart: "2024-01-22",
      type: "Specialized",
      subjects: ["Meteorology", "Weather interpretation", "Route planning"],
      format: "Online Live"
    },
    {
      id: 4,
      title: "Aircraft Performance & Mass Balance",
      instructor: "Capt. Lisa Wilson",
      duration: "2 weeks",
      students: 12,
      rating: 4.9,
      price: "£399",
      nextStart: "2024-02-05",
      type: "Specialized",
      subjects: ["Performance calculations", "Mass & Balance", "Practical applications"],
      format: "Online Live"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ATPL Classes & Courses
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Expert-led classes to accelerate your ATPL preparation. Learn from experienced airline pilots and aviation professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6 text-center">
              <Video className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Live Online Classes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Interactive sessions with Q&A</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Small Group Sizes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Maximum 25 students per class</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Study Materials</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Comprehensive resources included</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Expert Instructors</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active airline pilots & examiners</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white mb-2">
                      {classItem.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Taught by {classItem.instructor}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={classItem.type === 'Comprehensive' ? 'default' : 'secondary'}
                    className={classItem.type === 'Comprehensive' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : ''}
                  >
                    {classItem.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{classItem.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{classItem.students} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Starts {new Date(classItem.nextStart).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-gray-600 dark:text-gray-400">{classItem.rating}/5.0</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Format: {classItem.format}</p>
                    <div className="space-y-1">
                      {classItem.subjects.map((subject, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          • {subject}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {classItem.price}
                      </span>
                    </div>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Need a Custom Course?</h3>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                We can create personalized training programs tailored to your specific needs and schedule. 
                Contact us to discuss your requirements.
              </p>
              <Button variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
                Contact Us
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}