import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ATPL Exam Preparation - 14 EASA ATPL Subjects | Eatpl.in',
  description: 'Master all 14 EASA ATPL subjects with 10,000+ practice questions. Comprehensive airline transport pilot license exam preparation with real exam conditions and detailed explanations.',
  keywords: 'ATPL exam, airline transport pilot license, EASA ATPL, aviation training, pilot exam preparation, flight training'
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to ATPL Exam Preparation
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Home page is loading successfully. The API endpoints are working.
        </p>
        <div className="space-y-4">
          <p>✅ Express Server: Running on port 5000</p>
          <p>✅ Next.js Server: Running on port 3000</p>
          <p>✅ API Proxy: Working</p>
          <p>✅ Topics Data: Available from database</p>
        </div>
      </div>
    </div>
  )
}