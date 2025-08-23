import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { getRadioNavOptionUrl } from '@shared/urlMapping';
import { Skeleton } from '@/components/ui/skeleton';

type Chapter = {
  id: number;
  name: string;
  description?: string;
  subjectId: number;
};

export default function RadioNavigation() {
  // Radio Navigation subject ID is 2 based on our database insert
  const { data: chapters, isLoading } = useQuery<Chapter[]>({
    queryKey: ['/api/subjects/2/chapters'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-80 mx-auto mb-6" />
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
          {chapters?.map((chapter: Chapter) => (
            <Link key={chapter.id} href={getRadioNavOptionUrl(chapter.name)}>
              <Button
                variant="outline"
                className="w-full h-16 text-lg font-medium bg-slate-700/80 border-slate-600 text-white hover:bg-slate-600/80 transition-all duration-300 rounded-full"
                data-testid={`radio-nav-${chapter.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
              >
                {chapter.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}