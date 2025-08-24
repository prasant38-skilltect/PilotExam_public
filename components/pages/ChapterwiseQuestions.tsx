import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { getChapterUrl } from '@shared/urlMapping';
import { Skeleton } from '@/components/ui/skeleton';

type Section = {
  id: number;
  name: string;
  description?: string;
  chapterId: number;
};

export default function ChapterwiseQuestions() {
  // CHAPTERWISE QUESTIONS O#F#RD chapter ID is 1 based on our database insert
  const { data: sections, isLoading } = useQuery<Section[]>({
    queryKey: ['/api/chapters/1/sections'],
  });

  const handleSectionClick = (section: string) => {
    const url = getChapterUrl(section);
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-80 mx-auto mb-6" />
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          {sections?.map((section: Section) => (
            <Button
              key={section.id}
              variant="outline"
              className="w-full h-16 text-lg font-medium bg-slate-700/80 border-slate-600 text-white hover:bg-slate-600/80 transition-all duration-300 rounded-full"
              onClick={() => handleSectionClick(section.name)}
              data-testid={`chapter-${section.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {section.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}