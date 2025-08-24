import React from 'react'
import { Metadata } from 'next'
import OxfordInstruments from '@/components/pages/OxfordInstruments'

export const metadata: Metadata = {
  title: 'Oxford Instruments Questions - ATPL Practice',
  description: 'Practice with Oxford Aviation Academy instrument questions. Access organized sections covering all aspects of aircraft instruments for ATPL exam preparation.',
  keywords: [
    'Oxford instruments',
    'Oxford aviation',
    'ATPL instruments questions',
    'pressure heads',
    'flight instruments',
    'Oxford practice test'
  ],
  openGraph: {
    title: 'Oxford Instruments Questions - ATPL Practice',
    description: 'Access Oxford Aviation Academy instrument questions organized by sections.',
    url: '/oxford-instruments-questions',
  },
}

export default function OxfordInstrumentsPage() {
  return <OxfordInstruments />
}