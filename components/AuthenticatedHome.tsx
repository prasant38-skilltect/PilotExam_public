'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import Landing from '@/components/pages/Landing'
import Home from '@/components/pages/Home'

export default function AuthenticatedHome() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <Home /> : <Landing />
}
