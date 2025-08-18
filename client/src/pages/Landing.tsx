import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Rocket, Database, BarChart3, Clock, Smartphone, GraduationCap, UserCheck } from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'subjects', 'radio-nav', 'chapterwise'
  const [selectedSubject, setSelectedSubject] = useState('');

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

  const subjects = [
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
            {subjects.map((subject, index) => (
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
                  // Open test in new tab - for now all chapters go to Radio Waves test
                  const testUrl = `/test?subject=radio-navigation&chapter=${encodeURIComponent(chapter.toLowerCase())}`;
                  window.open(testUrl, '_blank');
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

  // Default landing page view
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Aviation Background - Cockpit/Runway theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        ></div>
        
        {/* Runway Lights Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-orange-400 rounded-full animate-ping shadow-lg shadow-orange-400/50"></div>
          <div className="absolute bottom-1/3 left-1/6 w-2.5 h-2.5 bg-cyan-300 rounded-full animate-pulse shadow-lg shadow-cyan-300/50"></div>
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-orange-300 rounded-full animate-ping shadow-lg shadow-orange-300/50"></div>
          <div className="absolute bottom-1/4 right-1/6 w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-lg shadow-cyan-500/50"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-orange-200 bg-clip-text text-transparent">
            Clear Skies Ahead: Master Your Pilot Exam Journey
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            From take-off to landing, practice every maneuver of your exam with precision tools.
          </p>
          
          <div className="flex justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-600 text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-cyan-400/20"
              data-testid="button-launch-practice"
              onClick={() => setCurrentView('subjects')}
            >
              ✈️ Start Your Flight Prep
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-400/20 shadow-lg shadow-cyan-400/10">
              <div className="text-2xl font-bold text-cyan-300" data-testid="text-stat-questions">
                {stats.totalQuestions}
              </div>
              <div className="text-sm text-gray-300">ATPL Questions</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-orange-400/20 shadow-lg shadow-orange-400/10">
              <div className="text-2xl font-bold text-orange-300" data-testid="text-stat-subjects">
                {stats.subjects}
              </div>
              <div className="text-sm text-gray-300">EASA Subjects</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-400/20 shadow-lg shadow-cyan-400/10">
              <div className="text-2xl font-bold text-cyan-300" data-testid="text-stat-passrate">
                {stats.passRate}
              </div>
              <div className="text-sm text-gray-300">Success Rate</div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-orange-400/20 shadow-lg shadow-orange-400/10">
              <div className="text-2xl font-bold text-orange-300" data-testid="text-stat-students">
                {stats.students}
              </div>
              <div className="text-sm text-gray-300">Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-cyan-600 bg-clip-text text-transparent dark:from-cyan-400 dark:to-orange-400 mb-4">
              Your Flight Deck Advantage
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Professional-grade training tools engineered for precision and built by aviation experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 border border-cyan-400/20 dark:border-cyan-400/30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="bg-gradient-to-r from-blue-800 to-cyan-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-400/20">
                      <Icon className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-cyan-100">{feature.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-900 relative overflow-hidden">
        {/* Subtle runway lights pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/6 w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready for Takeoff?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of pilots who have earned their wings with precision training.
          </p>
          <Link href="/question-bank">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-600 text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-cyan-400/20 shadow-lg shadow-cyan-400/20"
              data-testid="button-start-journey"
            >
              ✈️ Begin Flight Training
            </Button>
          </Link>
        </div>
      </section>


    </div>
  );
}
