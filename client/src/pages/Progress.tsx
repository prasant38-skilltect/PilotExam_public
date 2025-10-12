import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  TrendingUp, 
  Calendar, 
  Trophy, 
  BookOpen, 
  Clock,
  Target,
  BarChart3,
  Play,
  Eye
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TestSessionDetails } from "@/components/TestSessionDetails";

export default function ProgressPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);

  // Filter and pagination state
  const [filterSection, setFilterSection] = useState<string>("");
  const [filterCompleted, setFilterCompleted] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch user test sessions
  const { data: testSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['/api/user/test-sessions'],
    enabled: isAuthenticated,
  });

  // Fetch user progress
  const { data: userProgress = [], isLoading: loadingProgress } = useQuery({
    queryKey: ['/api/user/progress'],
    enabled: isAuthenticated,
  });

  // Get unique section names for filter dropdown
  const sectionNames = Array.from(new Set(testSessions.map((s: any) => s.sectionName))).filter(Boolean);

  // Filter logic
  const filteredSessions = testSessions.filter((session: any) => {
    const sectionMatch = filterSection ? session.sectionName === filterSection : true;
    const completedMatch =
      filterCompleted === "all"
        ? true
        : filterCompleted === "completed"
        ? session.isCompleted
        : !session.isCompleted;
    return sectionMatch && completedMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSessions.length / pageSize);
  const paginatedSessions = filteredSessions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center p-8">
            <CardContent>
              <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please log in to view your progress and test history.
              </p>
              <Link href="/">
                <Button>
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Progress Dashboard
            </h1>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track your exam performance and monitor improvement over time
          </p>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                Completed exams
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {testSessions.length > 0
                  ? Math.round(
                      testSessions.reduce(
                        (sum: number, session: any) =>
                          sum + (session.total_attempted_questions && session.totalQuestions
                            ? (session.total_attempted_questions / session.totalQuestions) * 100
                            : 0),
                        0
                      ) / testSessions.length
                    )
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                Progress across all tests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Progress</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {testSessions.length > 0
                  ? Math.max(
                      ...testSessions.map(
                        (session: any) =>
                          session.total_attempted_questions && session.totalQuestions
                            ? Math.round((session.total_attempted_questions / session.totalQuestions) * 100)
                            : 0
                      )
                    )
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                Personal best progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(testSessions.reduce((sum: number, session: any) => sum + (session.timeSpent || 0), 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Total time spent
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <Card className="mb-4">
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center pt-6">
              <div>
                <label className="mr-2 font-medium">Section:</label>
                <select
                  value={filterSection}
                  onChange={e => {
                    setFilterSection(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1"
                >
                  <option value="">All</option>
                  {sectionNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mr-2 font-medium">Status:</label>
                <select
                  value={filterCompleted}
                  onChange={e => {
                    setFilterCompleted(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Test Sessions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Test Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSessions ? (
              <div className="text-center py-8">Loading test sessions...</div>
            ) : testSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No test sessions found. Start taking tests to see your progress here!
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium">{session.sectionName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(session.timeSpent || 0)}
                        </span>
                        <span>
                          {session.correctAnswers}/{session.totalQuestions} correct
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={
                          session.total_attempted_questions && session.totalQuestions
                            ? Math.round((session.total_attempted_questions / session.totalQuestions) * 100)
                            : 0
                        }
                        className="w-24"
                        title={`Attempted ${session.total_attempted_questions || 0} out of ${session.totalQuestions || 0} questions`}
                      />
                      <Badge 
                        variant={
                          session.isCompleted
                            ? "default"
                            : session.total_attempted_questions && session.totalQuestions
                              ? Math.round((session.total_attempted_questions / session.totalQuestions) * 100) >= 80
                                ? "default"
                                : Math.round((session.total_attempted_questions / session.totalQuestions) * 100) >= 60
                                ? "secondary"
                                : "destructive"
                              : "secondary"
                        }
                      >
                        {session.isCompleted
                          ? "Complete"
                          : session.total_attempted_questions && session.totalQuestions
                            ? Math.round((session.total_attempted_questions / session.totalQuestions) * 100) + "%"
                            : "0%"
                        }
                      </Badge>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-2">
                          {
                            !session.isCompleted && <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => {
                                                        // Navigate to resume test with session ID
                                                        const sectionPath = session.sectionName.toLowerCase().replace(/\s+/g, '-');
                                                        setLocation(`/${sectionPath}?resumeSession=${session.id}`);
                                                      }}
                                                      className="flex items-center gap-1"
                                                      data-testid={`button-resume-${session.id}`}
                                                    >
                                                      <Play className="h-3 w-3" />
                                                      Resume
                                                    </Button>
                          }
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSessionId(session.id);
                              setShowSessionDetails(true);
                            }}
                            className="flex items-center gap-1"
                            data-testid={`button-view-details-${session.id}`}
                          >
                            <Eye className="h-3 w-3" />
                            View Details
                          </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Pagination Controls */}
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Section Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProgress ? (
              <div className="text-center py-8">Loading progress data...</div>
            ) : userProgress.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No progress data available yet. Complete some tests to see detailed progress!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProgress.map((progress: any) => (
                  <Card key={progress.id} className="p-4">
                    <h3 className="font-medium mb-2">{progress.sectionName}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tests Taken:</span>
                        <span className="font-medium">{progress.totalTests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Score:</span>
                        <Badge variant={progress.averageScore >= 80 ? "default" : "secondary"}>
                          {progress.averageScore}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Best Score:</span>
                        <Badge variant="default">
                          {progress.bestScore}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Test:</span>
                        <span className="text-gray-500">
                          {formatDate(progress.lastTestDate)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Test Session Details Modal */}
        <TestSessionDetails
          sessionId={selectedSessionId}
          open={showSessionDetails}
          onOpenChange={setShowSessionDetails}
        />
      </div>
    </div>
  );
}