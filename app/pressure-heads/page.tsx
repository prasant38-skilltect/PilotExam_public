import React from 'react'
import { Metadata } from 'next'
import GenericSectionTest from '@/components/pages/GenericSectionTest'

export const metadata: Metadata = {
  title: 'Pressure Heads - ATPL Instruments Practice Test',
  description: 'Practice ATPL Instruments questions on Pressure Heads. Interactive MCQ test with instant feedback and detailed explanations for EASA exam preparation.',
  keywords: [
    'pressure heads',
    'ATPL instruments',
    'aviation pressure systems',
    'pitot static system',
    'altimeter',
    'airspeed indicator',
    'vertical speed indicator',
    'flight instruments test'
  ],
  openGraph: {
    title: 'Pressure Heads - ATPL Instruments Practice Test',
    description: 'Master pressure head concepts with interactive practice questions and detailed explanations.',
    url: '/pressure-heads',
  },
}

export default function PressureHeadsPage() {
  return (
    <GenericSectionTest 
      sectionId={7} 
      sectionName="PRESSURE HEADS" 
      backUrl="/oxford-instruments-questions/" 
    />
  )
}