import { NextResponse } from 'next/server';
import { storage } from '@/server/storage';

export async function GET() {
  try {
    const parentTopics = await storage.getParentTopics();
    
    // Transform the topics data to match the expected format for the QuestionBank component
    const formattedTopics = await Promise.all(
      parentTopics.map(async (topic) => {
        const questionCount = await storage.getQuestionCountByTopic(topic.id);
        
        return {
          id: topic.id,
          title: topic.text,
          description: topic.text, // Using text as description for now
          code: topic.slug.toUpperCase().slice(0, 3), // Generate code from slug
          slug: topic.slug,
          questionCount,
          duration: 120, // Default duration in minutes
        };
      })
    );

    return NextResponse.json(formattedTopics);
  } catch (error) {
    console.error('Error fetching parent topics:', error);
    return NextResponse.json(
      { message: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}