import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TestType = 'short-term-memory' | 'spatial-awareness' | 'multitasking' | 'advanced-flight-control';

interface TestConfig {
  id: TestType;
  title: string;
  description: string;
  content: JSX.Element;
}

export default function AirSpeedIndicator() {
  const [activeTest, setActiveTest] = useState<TestType>('short-term-memory');

  const tests: TestConfig[] = [
    {
      id: 'short-term-memory',
      title: 'Short Term Memory Test',
      description: 'This test evaluates your ability to quickly memorize and recall sequences - critical for remembering instructions, radio communications, and checklists.',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">How to Play:</h3>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>Memorize the flight data (Altitude, Heading, Speed, Radio) shown on the screen.</p>
              <p>After a few seconds, the data will disappear.</p>
              <p>Type each number with its letter:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li><strong>a</strong> for Altitude (Example: 3000a)</li>
                <li><strong>h</strong> for Heading (Example: 090h)</li>
                <li><strong>s</strong> for Speed (Example: 250s)</li>
                <li><strong>r</strong> for Radio (Example: 12345r)</li>
              </ul>
              <p className="mt-4">You have limited time to enter all answers.</p>
              <p>You get points for each correct entry.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'spatial-awareness',
      title: 'Spatial Awareness Test',
      description: 'This test evaluates your ability to mentally rotate objects and understand spatial relationships - essential for flight navigation and situational awareness.',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This test evaluates your ability to mentally rotate objects and visualize spatial relationships.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Critical skills for pilots when navigating through 3D airspace.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Game Objective:</h4>
            <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-300">
              <li>Find the ONE correct aircraft matching all three instruments</li>
              <li>Only one aircraft is completely correct</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">Instrument Explanations:</h4>
            <ul className="list-disc list-inside space-y-2 text-green-700 dark:text-green-300">
              <li><strong>Compass:</strong> Shows magnetic heading (red arrow direction)</li>
              <li><strong>Artificial Horizon:</strong> Shows pitch/roll attitude (blue=sky, brown=ground)</li>
              <li><strong>ADF:</strong> Green needle points TO the NDB station</li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Aircraft Symbol Guide:</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Dark Gray:</strong> Correct orientation (nose matches heading)</li>
              <li><strong>Orange:</strong> Wrong orientation (nose direction differs)</li>
              <li><strong>Blue:</strong> Selected aircraft (highlighted)</li>
              <li><strong>Movement Arrows:</strong> Various directional and diagonal combinations</li>
            </ul>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">Step-by-Step Gameplay:</h4>
            <ol className="list-decimal list-inside space-y-2 text-purple-700 dark:text-purple-300">
              <li>Study the three instruments</li>
              <li>Examine each aircraft's position, nose direction, and movement</li>
              <li>Find the aircraft matching ALL three instruments</li>
              <li>Get feedback and scoring</li>
              <li>New scenario appears automatically</li>
            </ol>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3">Common Mistakes to Avoid:</h4>
            <ul className="list-disc list-inside space-y-2 text-red-700 dark:text-red-300">
              <li>Wrong nose direction</li>
              <li>Wrong position relative to ADF</li>
              <li>Wrong attitude (pitch/roll)</li>
              <li>Spatial confusion about ADF positioning</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">Tips for Success:</h4>
            <ul className="list-disc list-inside space-y-2 text-yellow-700 dark:text-yellow-300">
              <li>Take your time</li>
              <li>Process systematically</li>
              <li>Watch for orange aircraft</li>
              <li>Use the compass rose for orientation</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'multitasking',
      title: 'Multitasking Test',
      description: 'This test evaluates your ability to monitor multiple systems and respond to various inputs simultaneously - crucial for managing aircraft systems while flying.',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This test evaluates your ability to manage multiple tasks simultaneously, a critical skill for pilots.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">You'll need to:</h4>
            <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-300">
              <li>Monitor left and right grids for red squares</li>
              <li>Click the center grid to fix red squares before they disappear</li>
              <li>Match flight parameters using keyboard controls</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              The test lasts 8 minutes and requires sustained focus and quick reactions.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-medium">
              Your multitasking performance will be scored based on accuracy and response time.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'advanced-flight-control',
      title: 'Advanced Flight Control Test',
      description: 'This test evaluates your precision control abilities and response to flight dynamics - essential for handling complex aircraft maneuvers and emergency situations.',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Aircraft PFD Simulator</h3>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Mission Mode:</h4>
            <p className="text-blue-700 dark:text-blue-300 mb-3">
              Follow the assigned targets for altitude, speed, and heading within the time limit!
            </p>
            <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-300">
              <li>You have 3 minutes to complete each mission</li>
              <li>When you reach all target values you score a point and get a new mission</li>
              <li>Target values are shown in cyan boxes on the PFD</li>
              <li>The game ends if you can't complete a mission in time</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">The Primary Flight Display (PFD) shows essential flight information:</h4>
            <ul className="list-disc list-inside space-y-2 text-green-700 dark:text-green-300">
              <li>Attitude indicator (pitch and roll)</li>
              <li>Altitude tape (right side)</li>
              <li>Airspeed tape (left side)</li>
              <li>Heading indicator (top)</li>
              <li>Vertical speed indicator (far right)</li>
            </ul>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">You can also use keyboard controls (reversed):</h4>
            <ul className="list-disc list-inside space-y-2 text-purple-700 dark:text-purple-300">
              <li><strong>W/S:</strong> Pitch DOWN/UP</li>
              <li><strong>A/D:</strong> Roll RIGHT/LEFT</li>
              <li><strong>Q/E:</strong> Increase/decrease airspeed</li>
              <li><strong>R/F:</strong> Decrease/increase altitude</li>
              <li><strong>Z/C:</strong> Turn right/left (heading)</li>
              <li><strong>X/V:</strong> Yaw right/left</li>
            </ul>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3">Click and drag directly on the PFD to use the yoke control:</h4>
            <ul className="list-disc list-inside space-y-2 text-orange-700 dark:text-orange-300">
              <li>Drag up/down: Control pitch</li>
              <li>Drag left/right: Control roll</li>
              <li>Roll to bank and turn: Rolling left/right changes heading</li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">External Yoke Support:</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Connect any USB gamepad or flight stick</li>
              <li>X/Y axis controls pitch and roll</li>
              <li>Twist axis or buttons control heading</li>
              <li>Device is detected automatically</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const currentTest = tests.find(test => test.id === activeTest)!;

  const handleStartTest = () => {
    // Open the test in a new tab
    const testUrl = `/test/${activeTest}`;
    window.open(testUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 dark:bg-gray-950 min-h-screen">
          <div className="p-4">
            <h2 className="text-white font-bold text-lg mb-6">Pilot Aptitude Tests</h2>
            <nav className="space-y-2">
              {tests.map((test) => (
                <button
                  key={test.id}
                  onClick={() => setActiveTest(test.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg transition-colors text-sm",
                    activeTest === test.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                  data-testid={`nav-${test.id}`}
                >
                  {test.title.replace(' Test', '').toUpperCase()}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-blue-600 dark:text-blue-400 mb-2" data-testid="test-title">
                  {currentTest.title}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed" data-testid="test-description">
                  {currentTest.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentTest.content}
                
                <div className="flex justify-center pt-6">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
                    data-testid="start-test-button"
                    onClick={handleStartTest}
                  >
                    START TEST
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}