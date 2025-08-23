import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type Section = {
  id: number;
  name: string;
  description?: string;
  chapterId: number;
};

export default function OxfordInstruments() {
  // O#F#RD chapter ID is 4 based on our database insert
  const { data: sections, isLoading } = useQuery<Section[]>({
    queryKey: ['/api/chapters/4/sections'],
  });

  const handleSectionClick = (section: Section) => {
    // For PRESSURE HEADS, open external URL in new tab AND navigate to our test page
    if (section.name === 'PRESSURE HEADS') {
      if (section.description) {
        window.open(section.description, '_blank');
      }
      // Navigate to our test page
      window.location.href = '/pressure-heads/';
    } else {
      // For other sections, just open external URL
      if (section.description) {
        window.open(section.description, '_blank');
      }
    }
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
            {[...Array(30)].map((_, i) => (
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
            OXFORD INSTRUMENTS QUESTIONS
          </h1>
          <Link href="/instruments/">
            <Button
              variant="outline"
              className="mb-8 border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10"
              data-testid="button-back-instruments"
            >
              ← Back to Instruments
            </Button>
          </Link>
        </div>
        
        <div className="space-y-6">
          {sections?.map((section: Section) => (
            <Button
              key={section.id}
              variant="outline"
              className="w-full h-16 text-lg font-medium bg-slate-700/80 border-slate-600 text-white hover:bg-slate-600/80 transition-all duration-300 rounded-full"
              onClick={() => handleSectionClick(section)}
              data-testid={`section-${section.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {section.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}