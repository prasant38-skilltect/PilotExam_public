import React from 'react'
import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { WhatsAppChat } from "@/components/WhatsAppChat";
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'ATPL Exam Preparation - Practice Tests & Question Bank',
    template: '%s | ATPL Exam Prep'
  },
  description: 'Comprehensive ATPL (Airline Transport Pilot License) exam preparation platform with practice tests, question banks, and learning resources for all 14 EASA ATPL subjects.',
  keywords: [
    'ATPL exam',
    'pilot license',
    'aviation exam',
    'EASA ATPL',
    'flight training',
    'pilot preparation',
    'aviation test',
    'commercial pilot',
    'airline pilot',
    'flight instruments',
    'radio navigation',
    'meteorology',
    'aircraft performance'
  ],
  authors: [{ name: 'ATPL Prep Team' }],
  creator: 'ATPL Prep Platform',
  publisher: 'ATPL Prep Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://atplprep.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'ATPL Exam Preparation - Practice Tests & Question Bank',
    description: 'Comprehensive ATPL exam preparation with practice tests for all 14 EASA subjects. Ace your airline pilot license exam.',
    siteName: 'ATPL Exam Prep',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ATPL Exam Preparation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATPL Exam Preparation - Practice Tests & Question Bank',
    description: 'Comprehensive ATPL exam preparation with practice tests for all 14 EASA subjects.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'ATPL Exam Prep Platform',
  description: 'Comprehensive ATPL exam preparation platform with practice tests and question banks for all EASA subjects.',
  url: 'https://atplprep.com',
  logo: 'https://atplprep.com/logo.png',
  sameAs: [
    'https://www.facebook.com/atplprep',
    'https://www.twitter.com/atplprep',
    'https://www.linkedin.com/company/atplprep',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-555-0123',
    contactType: 'customer service',
    availableLanguage: 'English'
  },
  offers: {
    '@type': 'Offer',
    category: 'Education',
    description: 'ATPL exam preparation courses and practice tests',
  }
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <TooltipProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <WhatsAppChat />
              </div>
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}