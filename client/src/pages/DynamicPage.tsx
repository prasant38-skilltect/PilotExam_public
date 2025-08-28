import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { getSubjectUrl } from '@/shared/urlMapping';
import { Skeleton } from '@/components/ui/skeleton';

type Subject = {
  categoryId: number,
  categoryName: string,
  id: number,
  parentId: number,
  parentName: string,
  quizId: number,
  slug: string,
  text: string
};

export default function DynamicPage() {
  const link = useLocation();
  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: [`/api${link[0]}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-6" />
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(16)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  console.log("link....", link[0])
  console.log("subjects....", subjects)
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
          {subjects?.map((subject: Subject) => (
            <Link key={subject.id} href={`/${subject.slug}/`}>
              <Button
                variant="outline"
                className="w-full h-16 text-sm font-medium bg-slate-800/60 border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300 whitespace-normal text-center p-3"
                data-testid={`subject-${subject.text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
              >
                {subject.text}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}