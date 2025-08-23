import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { getSubjectUrl } from '@shared/urlMapping';

export default function Subjects() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Choose Your Flight Training Module
          </h1>
          <Link href="/">
            <Button
              variant="outline"
              className="mb-8 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              data-testid="button-back"
            >
              ← Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectsList.map((subject: string, index: number) => (
            <Link key={index} href={getSubjectUrl(subject)}>
              <Button
                variant="outline"
                className="w-full h-16 text-sm font-medium bg-slate-800/60 border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300 whitespace-normal text-center p-3"
                data-testid={`subject-${subject.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
              >
                {subject}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}