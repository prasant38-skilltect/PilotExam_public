import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { getSubjectUrl } from '@/shared/urlMapping';
import { Skeleton } from '@/components/ui/skeleton';
import GenericSectionTest from './GenericSectionTest';

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
  
  // Check if this is a single topic with a quizId (quiz page)
  if (subjects && subjects.length === 1 && subjects[0].quizId) {
    const topic = subjects[0];
    const currentPath = link[0];
    // Extract the parent path for back navigation
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    
    return (
      <GenericSectionTest 
        sectionId={topic.quizId}
        sectionName={topic.text}
        backUrl={parentPath}
      />
    );
  }
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
                className={`w-full h-16 text-sm font-medium transition-all duration-300 whitespace-normal text-center p-3 ${
                  subject.quizId 
                    ? 'bg-green-800/60 border-green-400/30 text-green-100 hover:bg-green-400/10 hover:border-green-400/50' 
                    : 'bg-slate-800/60 border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/10 hover:border-cyan-400/50'
                }`}
                data-testid={`subject-${subject.text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
              >
                {subject.text}
                {subject.quizId && (
                  <span className="block text-xs text-green-300 mt-1">
                    📝 Quiz Available
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}