import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

import { Rocket, Database, BarChart3, Clock, Smartphone, GraduationCap, UserCheck, Search, Play, Plane } from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'subjects', 'radio-nav', 'chapterwise'
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: apiSubjects, isLoading } = useQuery({
    queryKey: ['/api/subjects'],
  });

  const filteredSubjects = (apiSubjects as any)?.filter((subject: any) =>
    subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    totalQuestions: '10,000+',
    subjects: '14',
    passRate: '95%',
    students: '50,000+',
  };

  const features = [
    {
      icon: UserCheck,
      title: 'No Registration Required',
      description: 'Start practicing immediately without creating an account. Perfect for quick study sessions.',
    },
    {
      icon: Database,
      title: 'EASA Question Bank',
      description: '10,000+ questions from the official European Central Question Bank (ECQB 2024).',
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Track your performance across all 14 ATPL subjects with detailed analytics.',
    },
    {
      icon: Clock,
      title: 'Real Exam Conditions',
      description: 'Timed tests that simulate actual EASA exam environment and time constraints.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Study anywhere with our tablet and mobile-optimized interface.',
    },
    {
      icon: GraduationCap,
      title: 'Detailed Explanations',
      description: 'Learn from detailed answer explanations and professional commentary.',
    },
  ];

  const subjectsList = [
    'INSTRUMENTS',
    'RADIO NAVIGATION', 
    'PERFORMANCE',
    'METEOROLOGY',
    'TECHNICAL',
    'NAVIGATION',
    'ATPL QUESTION BANK',
    'INDIGO QUESTION BANK (6000) JAA QB',
    'KEITH WILLIAMS',
    'OX*O*D ALL SUBJECTS',
    'REGULATIONS',
    'AIRCRAFT SPECIFIC',
    'MASS AND BALANCE',
    'PREVIOUS ATTEMPT DGCA PAPERS',
    'AIRLINE WRITTEN EXAM PREVIOUS ATTEMPT',
    'AIRBUS 320'
  ];

  const radioNavOptions = [
    'CHAPTERWISE QUESTIONS O#F#RD',
    'KIETH RADIO QB',
    'INDIGO RADIO NAV'
  ];

  const chapterwiseOptions = [
    'RADIO WAVES',
    'PROPAGATION',
    'MODULATION',
    'ANTENNAE',
    'DOPPLER',
    'VDF'
  ];

  const handleSubjectClick = (subject: string) => {
    setSelectedSubject(subject);
    if (subject === 'RADIO NAVIGATION') {
      setCurrentView('radio-nav');
    } else {
      // For other subjects, you can navigate to a test page or show other options
      setCurrentView('subjects');
    }
  };

  const handleRadioNavOptionClick = (option: string) => {
    if (option === 'CHAPTERWISE QUESTIONS O#F#RD') {
      setCurrentView('chapterwise');
    } else {
      // Handle other options or navigate to test
      setCurrentView('radio-nav');
    }
  };

  // Render different views based on current state
  if (currentView === 'subjects') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Choose Your Flight Training Module
            </h1>
            <Button
              variant="outline"
              onClick={() => setCurrentView('landing')}
              className="mb-8 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              data-testid="button-back"
            >
              ← Back to Home
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectsList.map((subject: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                className="w-full h-16 text-sm font-medium bg-slate-800/60 border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300 whitespace-normal text-center p-3"
                onClick={() => handleSubjectClick(subject)}
                data-testid={`subject-${subject.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
              >
                {subject}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'radio-nav') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif italic">
              Radio Navigation
            </h1>
            <Button
              variant="outline"
              onClick={() => setCurrentView('subjects')}
              className="mb-8 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              data-testid="button-back-subjects"
            >
              ← Back to Subjects
            </Button>
          </div>
          
          <div className="space-y-4">
            {radioNavOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full h-16 text-lg font-medium bg-slate-700/80 border-slate-600 text-white hover:bg-slate-600/80 transition-all duration-300 rounded-full"
                onClick={() => handleRadioNavOptionClick(option)}
                data-testid={`radio-nav-${option.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'chapterwise') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif italic">
              CHAPTERWISE QUESTIONS
            </h1>
            <Button
              variant="outline"
              onClick={() => setCurrentView('radio-nav')}
              className="mb-8 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              data-testid="button-back-radio-nav"
            >
              ← Back to Radio Navigation
            </Button>
          </div>
          
          <div className="space-y-6">
            {chapterwiseOptions.map((chapter, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full h-16 text-lg font-medium bg-slate-700/80 border-slate-600 text-white hover:bg-slate-600/80 transition-all duration-300 rounded-full"
                onClick={() => {
                  // For Radio Waves chapter, open the dedicated test page
                  if (chapter === 'RADIO WAVES') {
                    window.open('/test', '_blank');
                  } else {
                    // For other chapters, use the existing URL pattern
                    const testUrl = `/test?subject=radio-navigation&chapter=${encodeURIComponent(chapter.toLowerCase())}`;
                    window.open(testUrl, '_blank');
                  }
                }}
                data-testid={`chapter-${chapter.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {chapter}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default landing page view - show subjects with search
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-700 bg-clip-text text-transparent">
            14 ATPL Subject Modules
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Master all EASA ATPL subjects with our comprehensive question bank and practice tests
          </p>
        </div>

        {/* Start Your Flight Prep Button */}
        <div className="text-center mb-8">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-600 text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-cyan-400/20 shadow-lg shadow-cyan-400/20"
            data-testid="button-start-flight-prep"
            onClick={() => setCurrentView('subjects')}
          >
            <Plane className="mr-2 h-5 w-5" />
            Start Your Flight Prep
          </Button>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-subjects"
            />
          </div>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject: any) => (
            <Card key={subject.id} className="hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-700 w-12 h-12 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold" data-testid={`text-subject-code-${subject.code}`}>
                      {subject.code}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Questions</div>
                    <div className="font-bold text-purple-600 dark:text-purple-400" data-testid={`text-question-count-${subject.id}`}>
                      {subject.questionCount}
                    </div>
                  </div>
                </div>
                <CardTitle className="text-lg" data-testid={`text-subject-title-${subject.id}`}>
                  {subject.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4" data-testid={`text-subject-description-${subject.id}`}>
                  {subject.description}
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="mr-1" size={16} />
                    <span data-testid={`text-duration-${subject.id}`}>{subject.duration} min</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/test/${subject.id}`} className="flex-1">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300"
                      data-testid={`button-start-test-${subject.id}`}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Test
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
