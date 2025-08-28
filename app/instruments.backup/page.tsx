import React from 'react'
import { Metadata } from 'next'
import Instruments from '@/components/pages/Instruments'

export const metadata: Metadata = {
  title: 'Instruments - ATPL Practice Questions',
  description: 'Master aircraft instruments with comprehensive ATPL practice questions. Cover flight instruments, engine instruments, and navigation displays for EASA exam preparation.',
  keywords: [
    'aircraft instruments',
    'ATPL instruments',
    'flight instruments',
    'engine instruments',
    'navigation displays',
    'cockpit instruments',
    'avionics systems',
    'instrument flying'
  ],
  openGraph: {
    title: 'Instruments - ATPL Practice Questions',
    description: 'Comprehensive aircraft instruments practice questions covering all cockpit systems.',
    url: '/instruments',
  },
}

export default function InstrumentsPage() {
  return <Instruments />
}