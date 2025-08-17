import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Users, Monitor, BookOpen, CheckCircle, Star } from 'lucide-react';

export default function AirlineInterviews() {
  const interviewTopics = [
    {
      title: "Technical Knowledge",
      icon: BookOpen,
      description: "Aircraft systems, regulations, and operational procedures",
      items: ["Jet engine principles", "Hydraulic systems", "Avionics", "Weather interpretation"]
    },
    {
      title: "Simulator Assessment", 
      icon: Monitor,
      description: "Flight simulation exercises and technical evaluations",
      items: ["ILS approaches", "Emergency procedures", "CRM scenarios", "Multi-crew operations"]
    },
    {
      title: "Behavioral Interview",
      icon: Users, 
      description: "Competency-based questions and scenario discussions",
      items: ["Leadership examples", "Problem solving", "Teamwork", "Decision making"]
    },
    {
      title: "Company Knowledge",
      icon: Plane,
      description: "Airline-specific information and industry awareness", 
      items: ["Route network", "Fleet composition", "Safety culture", "Recent developments"]
    }
  ];

  const majorAirlines = [
    { name: "Emirates", location: "Dubai", requirements: "ATPL, 3000+ hrs" },
    { name: "Singapore Airlines", location: "Singapore", requirements: "ATPL, 2500+ hrs" },
    { name: "Lufthansa", location: "Germany", requirements: "ATPL, 4000+ hrs" },
    { name: "British Airways", location: "UK", requirements: "ATPL, 3500+ hrs" },
    { name: "Qatar Airways", location: "Doha", requirements: "ATPL, 3000+ hrs" },
    { name: "Cathay Pacific", location: "Hong Kong", requirements: "ATPL, 4000+ hrs" }
  ];

  const simPreparation = [
    {
      title: "Type Rating Preparation",
      description: "Prepare for specific aircraft type ratings including A320, A330, B737, B777"
    },
    {
      title: "CRM Training",
      description: "Crew Resource Management scenarios and multi-pilot operations"
    },
    {
      title: "Emergency Procedures", 
      description: "Practice critical scenarios including engine failures, system malfunctions"
    },
    {
      title: "Weather Challenges",
      description: "Low visibility approaches, turbulence management, adverse conditions"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-700 bg-clip-text text-transparent">
            Airline Interviews & Simulator Preparation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive preparation for airline pilot interviews and simulator assessments. 
            Get ready for your dream airline job with our expert guidance.
          </p>
        </div>

        {/* Interview Process Overview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Interview Process Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {interviewTopics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="text-white" size={28} />
                    </div>
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{topic.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {topic.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center text-sm">
                          <CheckCircle className="text-green-500 mr-2" size={16} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Simulator Preparation */}
        <section className="mb-16">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-8">Simulator Assessment Preparation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Monitor className="mr-2 text-blue-600" />
                  What to Expect
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li>• Multi-crew cooperation scenarios</li>
                  <li>• Standard instrument approaches</li>
                  <li>• Emergency and abnormal procedures</li>
                  <li>• Communication and decision-making skills</li>
                  <li>• Basic aircraft handling and systems knowledge</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Preparation Areas</h3>
                <div className="space-y-4">
                  {simPreparation.map((prep, index) => (
                    <div key={index} className="border-l-4 border-purple-600 pl-4">
                      <h4 className="font-medium">{prep.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{prep.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Major Airlines */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Major Airline Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {majorAirlines.map((airline, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <Plane className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-lg">{airline.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{airline.location}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    {airline.requirements}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Success Tips */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                <Star className="inline-block mr-2 text-yellow-500" />
                Interview Success Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-3">Before the Interview</h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Research the airline thoroughly</li>
                    <li>• Practice STAR method responses</li>
                    <li>• Review technical knowledge</li>
                    <li>• Prepare questions to ask them</li>
                    <li>• Get adequate rest</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">During the Interview</h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li>• Dress professionally</li>
                    <li>• Show enthusiasm and confidence</li>
                    <li>• Listen actively to questions</li>
                    <li>• Demonstrate safety-first mindset</li>
                    <li>• Be honest about experience</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Airline Career?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Begin your preparation today with our comprehensive ATPL question bank and interview guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300"
            >
              Start ATPL Preparation
            </Button>
            <Button variant="outline" size="lg">
              Contact for Coaching
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
