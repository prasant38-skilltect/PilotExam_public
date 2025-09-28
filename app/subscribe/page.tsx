import { Metadata } from 'next'
import Subscribe from '../../client/src/pages/subscribe'

export const metadata: Metadata = {
  title: 'Subscribe - ATPL Exam Preparation Plans',
  description: 'Choose the perfect subscription plan for your ATPL exam preparation. Access comprehensive question banks, practice tests, and study materials.',
  keywords: [
    'ATPL subscription',
    'aviation exam preparation',
    'pilot training subscription',
    'EASA ATPL access',
    'flight training plans',
    'aviation study materials'
  ],
  openGraph: {
    title: 'Subscribe to ATPL Exam Preparation',
    description: 'Get unlimited access to ATPL practice questions and study materials with our flexible subscription plans.',
    url: '/subscribe',
  },
}

export default function SubscribePage() {
  return <Subscribe />
}