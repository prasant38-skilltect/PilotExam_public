import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function RadioNavigation() {
  const radioNavOptions = [
    'CHAPTERWISE QUESTIONS O#F#RD',
    'KIETH RADIO QB',
    'INDIGO RADIO NAV'
  ];

  const getOptionUrl = (option: string) => {
    if (option === 'CHAPTERWISE QUESTIONS O#F#RD') {
      return '/radio-navigation/chapters/';
    }
    // For other options, create SEO-friendly URLs under radio-navigation
    return `/radio-navigation/${option.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}/`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif italic">
            Radio Navigation
          </h1>
          <Link href="/subjects/">
            <Button
              variant="outline"
              className="mb-8 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              data-testid="button-back-subjects"
            >
              ← Back to Subjects
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {radioNavOptions.map((option, index) => (
            <Link key={index} href={getOptionUrl(option)}>
              <Button
                variant="outline"
                className="w-full h-16 text-lg font-medium bg-slate-700/80 border-slate-600 text-white hover:bg-slate-600/80 transition-all duration-300 rounded-full"
                data-testid={`radio-nav-${option.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
              >
                {option}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}