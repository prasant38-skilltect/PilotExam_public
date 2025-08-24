import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Eye, Edit, CheckCircle, AlertCircle } from "@/components/Icons";

export default function PilotResume() {
  const resumeTemplates = [
    {
      id: 1,
      name: "Airline Professional",
      description: "Perfect for experienced pilots applying to major airlines",
      features: ["ATS-friendly format", "Skills highlight section", "Flight time breakdown"],
      image: "template1.jpg",
      popular: true
    },
    {
      id: 2,
      name: "Aviation Graduate",
      description: "Ideal for new pilots and recent aviation graduates", 
      features: ["Education focus", "Training highlights", "Certification display"],
      image: "template2.jpg",
      popular: false
    },
    {
      id: 3,
      name: "Military Transition",
      description: "Designed for military pilots transitioning to civilian aviation",
      features: ["Military experience translation", "Leadership emphasis", "Security clearance section"],
      image: "template3.jpg", 
      popular: false
    }
  ];

  const resumeSections = [
    {
      title: "Personal Information",
      description: "Contact details and basic information",
      completed: false,
      fields: ["Full Name", "Phone", "Email", "Address", "License Numbers"]
    },
    {
      title: "Flight Experience",
      description: "Total flight hours and aircraft type ratings",
      completed: false,
      fields: ["Total Hours", "PIC Hours", "Multi-Engine", "IFR Hours", "Night Hours"]
    },
    {
      title: "Licenses & Ratings",
      description: "Pilot certificates and endorsements",
      completed: false,
      fields: ["ATPL/CPL", "Type Ratings", "Instrument Rating", "Medical Certificate"]
    },
    {
      title: "Education",
      description: "Aviation and academic qualifications",
      completed: false,
      fields: ["Aviation Degree", "Training Schools", "Certifications", "Languages"]
    },
    {
      title: "Employment History",
      description: "Aviation and relevant work experience",
      completed: false,
      fields: ["Airlines", "Flight Schools", "Charter Companies", "Military Service"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Professional Pilot Resume Builder
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Create a professional aviation resume that gets noticed by airlines and aviation employers. 
            Choose from industry-specific templates designed by HR professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {resumeTemplates.map((template) => (
            <Card key={template.id} className="bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-gray-900 dark:text-white">{template.name}</CardTitle>
                  {template.popular && (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Popular
                    </Badge>
                  )}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-40 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Features:</h4>
                    {template.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 space-y-2">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Use This Template
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-purple-600" />
                Resume Builder Progress
              </CardTitle>
              <CardDescription>
                Complete all sections to build your professional pilot resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resumeSections.map((section, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
                      </div>
                      {section.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Required fields:</div>
                      <div className="flex flex-wrap gap-1">
                        {section.fields.map((field, fieldIndex) => (
                          <Badge key={fieldIndex} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant={section.completed ? "outline" : "default"}
                      size="sm"
                      className={!section.completed ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                    >
                      {section.completed ? 'Edit Section' : 'Complete Section'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Quick Start Form</CardTitle>
                <CardDescription>
                  Enter your basic information to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Smith" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john.smith@email.com" />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 (555) 123-4567" />
                </div>
                
                <div>
                  <Label htmlFor="totalHours">Total Flight Hours</Label>
                  <Input id="totalHours" type="number" placeholder="1500" />
                </div>
                
                <div>
                  <Label htmlFor="license">Highest License</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Select License</option>
                    <option value="atpl">ATPL</option>
                    <option value="cpl">CPL</option>
                    <option value="ppl">PPL</option>
                  </select>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Start Building Resume
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Resume Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                    <p className="text-gray-700 dark:text-gray-300">Keep it concise - ideally 1-2 pages maximum</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                    <p className="text-gray-700 dark:text-gray-300">Use action verbs and quantify achievements</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                    <p className="text-gray-700 dark:text-gray-300">Highlight safety record and incident-free hours</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                    <p className="text-gray-700 dark:text-gray-300">Include relevant type ratings and endorsements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}