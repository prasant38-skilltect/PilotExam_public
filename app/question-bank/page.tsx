import React from 'react'
import { Metadata } from 'next'
import QuestionBank from '@/components/pages/QuestionBank'

export const metadata: Metadata = {
  title: 'ATPL Question Bank - Practice Tests & MCQs',
  description: 'Access comprehensive ATPL question bank with thousands of practice questions across all 14 EASA subjects. Detailed explanations and progress tracking included.',
  keywords: [
    'ATPL question bank',
    'aviation practice tests',
    'pilot exam questions',
    'EASA ATPL MCQ',
    'flight training questions',
    'airline pilot test prep'
  ],
  openGraph: {
    title: 'ATPL Question Bank - Practice Tests & MCQs',
    description: 'Comprehensive question bank with thousands of ATPL practice questions and detailed explanations.',
    url: '/question-bank',
  },
}

export default function QuestionBankPage() {
  return <QuestionBank />
}