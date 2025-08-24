import React from 'react'
import { Metadata } from 'next'
import RadioNavigation from '@/components/pages/RadioNavigation'

export const metadata: Metadata = {
  title: 'Radio Navigation - ATPL Practice Questions',
  description: 'Master radio navigation concepts with comprehensive ATPL practice questions. Cover VOR, ILS, DME, ADF, and GPS navigation systems for EASA exam preparation.',
  keywords: [
    'radio navigation',
    'ATPL radio nav',
    'VOR navigation',
    'ILS approach',
    'DME distance',
    'ADF bearing',
    'GPS navigation',
    'aviation navigation',
    'flight navigation systems'
  ],
  openGraph: {
    title: 'Radio Navigation - ATPL Practice Questions',
    description: 'Comprehensive radio navigation practice questions covering all major nav systems.',
    url: '/radio-navigation',
  },
}

export default function RadioNavigationPage() {
  return <RadioNavigation />
}