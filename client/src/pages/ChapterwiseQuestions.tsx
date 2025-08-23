import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { getChapterUrl } from '@shared/urlMapping';

export default function ChapterwiseQuestions() {
  const chapterwiseOptions = [
    'RADIO WAVES',
    'PROPAGATION',
    'MODULATION',
    'ANTENNAE',
    'DOPPLER',
    'VDF'
  ];

  const handleChapterClick = (chapter: string) => {
    const url = getChapterUrl(chapter);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif italic">
            CHAPTERWISE QUESTIONS
          </h1>
          <Link href="/radio-navigation/">
            <Button
              variant="outline"
              className="mb-8 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              data-testid="button-back-radio-nav"
            >
              ← Back to Radio Navigation
            </Button>
          </Link>
        </div>
        
        <div className="space-y-6">
          {chapterwiseOptions.map((chapter, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full h-16 text-lg font-medium bg-slate-700/80 border-slate-600 text-white hover:bg-slate-600/80 transition-all duration-300 rounded-full"
              onClick={() => handleChapterClick(chapter)}
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