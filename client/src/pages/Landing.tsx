import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Rocket, Database, BarChart3, Clock, Smartphone, GraduationCap, UserCheck } from 'lucide-react';

export default function Landing() {
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Space Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/30"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        ></div>
        
        {/* Animated Stars */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-ping"></div>
          <div className="absolute bottom-1/3 left-1/6 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Your Flight Prep Galaxy
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Enter the space of elite pilot preparation. Elevate your career with ATPL question banks, 
            smart analytics, and galaxy-class performance tracking.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/question-bank">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                data-testid="button-launch-practice"
              >
                <Rocket className="mr-2" size={20} />
                Launch Practice Mode
              </Button>
            </Link>
            <Link href="/question-bank">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 text-white hover:bg-white/10 transition-all duration-300"
                data-testid="button-browse-questions"
              >
                Browse Question Bank
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-300" data-testid="text-stat-questions">
                {stats.totalQuestions}
              </div>
              <div className="text-sm text-gray-300">ATPL Questions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-300" data-testid="text-stat-subjects">
                {stats.subjects}
              </div>
              <div className="text-sm text-gray-300">EASA Subjects</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-300" data-testid="text-stat-passrate">
                {stats.passRate}
              </div>
              <div className="text-sm text-gray-300">Success Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-300" data-testid="text-stat-students">
                {stats.students}
              </div>
              <div className="text-sm text-gray-300">Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-700 bg-clip-text text-transparent">
              Why Choose Eatpl.in?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Advanced features designed specifically for airline pilot exam success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-700 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of pilots who have successfully passed their ATPL exams with our platform.
          </p>
          <Link href="/question-bank">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              data-testid="button-start-journey"
            >
              Start Practice Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
