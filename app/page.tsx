import React from 'react'
import { Metadata } from 'next'
import Landing from '@/components/pages/Landing'
import Home from '@/components/pages/Home'
import { useAuth } from '@/hooks/useAuth'
import dynamic from 'next/dynamic'

// Client-side component to handle authentication state
const AuthenticatedHome = dynamic(() => import('@/components/AuthenticatedHome'), {
  loading: () => <div>Loading...</div>
})

export const metadata: Metadata = {
  title: 'ATPL Exam Preparation - Practice Tests & Question Bank',
  description: 'Master your ATPL exam with comprehensive practice tests, question banks, and learning resources for all 14 EASA subjects. Start your journey to becoming an airline pilot.',
  keywords: [
    'ATPL exam preparation',
    'airline pilot license',
    'EASA ATPL',
    'pilot training',
    'aviation exam',
    'flight test preparation',
    'commercial pilot license',
    'airline pilot training'
  ],
  openGraph: {
    title: 'ATPL Exam Preparation - Practice Tests & Question Bank',
    description: 'Master your ATPL exam with comprehensive practice tests and question banks for all 14 EASA subjects.',
    url: '/',
    siteName: 'ATPL Exam Prep',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATPL Exam Preparation - Practice Tests & Question Bank',
    description: 'Master your ATPL exam with comprehensive practice tests and question banks.',
  },
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return <AuthenticatedHome />
}