import React from 'react'
import { Metadata } from 'next'
import Subjects from '@/components/pages/Subjects'

export const metadata: Metadata = {
  title: 'ATPL Subjects - Choose Your Exam Topic',
  description: 'Explore all 14 EASA ATPL subjects including Instruments, Radio Navigation, Meteorology, Performance, and more. Start practicing with subject-specific question banks.',
  keywords: [
    'ATPL subjects',
    'EASA ATPL topics',
    'aviation subjects',
    'flight instruments',
    'radio navigation',
    'meteorology',
    'aircraft performance',
    'air law',
    'human factors',
    'flight planning'
  ],
  openGraph: {
    title: 'ATPL Subjects - Choose Your Exam Topic',
    description: 'Explore all 14 EASA ATPL subjects with comprehensive practice questions and tests.',
    url: '/subjects',
  },
}

export default function SubjectsPage() {
  return <Subjects />
}