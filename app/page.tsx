import React from 'react'
import { Metadata } from 'next'
import AuthenticatedHome from '@/components/AuthenticatedHome'

export const metadata: Metadata = {
  title: 'ATPL Exam Preparation - 14 EASA ATPL Subjects | Eatpl.in',
  description: 'Master all 14 EASA ATPL subjects with 10,000+ practice questions. Comprehensive airline transport pilot license exam preparation with real exam conditions and detailed explanations.',
  keywords: 'ATPL exam, airline transport pilot license, EASA ATPL, aviation training, pilot exam preparation, flight training'
}

export default function HomePage() {
  return <AuthenticatedHome />
}