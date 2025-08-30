import React from 'react'
import { Metadata } from 'next'
import DynamicTopicPage from '@/components/pages/DynamicTopicPage'
import { notFound } from 'next/navigation'

// This will be populated with proper metadata generation
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params
  
  // You can fetch topic data here to generate proper metadata
  // For now, using basic metadata based on slug
  const title = slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
  
  return {
    title: `${title} - ATPL Practice Questions`,
    description: `Master ${title.toLowerCase()} with comprehensive ATPL practice questions and exam preparation.`,
    keywords: [
      title.toLowerCase(),
      'ATPL',
      'aviation',
      'pilot training',
      'exam preparation',
      'practice questions'
    ],
    openGraph: {
      title: `${title} - ATPL Practice Questions`,
      description: `Comprehensive ${title.toLowerCase()} practice questions for ATPL exam preparation.`,
      url: `/${slug}`,
    },
  }
}

export default function DynamicPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  
  return <DynamicTopicPage slug={slug} />
}

// Optional: Generate static params for known routes (for better SEO)
export async function generateStaticParams() {
  // You can fetch all topic slugs from your database here
  // For now, returning common ones
  return [
    { slug: 'instruments' },
    { slug: 'radio-navigation' },
    { slug: 'oxford-instruments-questions' },
    { slug: 'pressure-heads' },
    { slug: 'general-navigation' },
    { slug: 'meteorology' },
    { slug: 'principal-of-flight' },
    { slug: 'electric' },
    { slug: 'systems' },
    { slug: 'engines' },
  ]
}