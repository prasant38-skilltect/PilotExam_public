# Overview

This is a comprehensive ATPL (Airline Transport Pilot License) exam preparation platform built as a full-stack web application. The system provides practice tests, question banks, and learning resources for all 14 EASA ATPL subjects. It features both guest and authenticated user experiences, with the authenticated version offering progress tracking, personalized dashboards, and additional learning modules including airline interview preparation, simulator training, and specialized courses.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Next.js with TypeScript**: React framework with Server-Side Rendering (SSR) and Static Site Generation (SSG)
- **Next.js App Router**: File-based routing with enhanced SEO capabilities
- **shadcn/ui**: Component library built on Radix UI primitives with Tailwind CSS styling
- **TanStack Query**: Data fetching and caching for API interactions
- **Server-Side Rendering**: Improved SEO and initial page load performance

## Backend Architecture
- **Express.js**: Node.js web framework handling REST API endpoints
- **TypeScript**: Type-safe server-side development
- **Session-based Authentication**: Using Replit's OpenID Connect integration
- **RESTful API Design**: Clean separation between frontend and backend with JSON communication

## Database Layer
- **PostgreSQL**: Primary database using Neon serverless
- **Drizzle ORM**: Type-safe database queries with schema validation
- **Connection Pooling**: Efficient database connections using @neondatabase/serverless

## Authentication System
- **Replit Auth Integration**: OpenID Connect authentication flow
- **Session Management**: PostgreSQL-backed session storage with express-session
- **User Management**: Automatic user creation/updates with profile synchronization
- **Theme Preferences**: User-specific UI theme persistence

## Data Models
- **Users**: Profile information and preferences
- **Subjects**: 16 ATPL subjects with sequence ordering for consistent display
- **Chapters**: Subject subdivisions (e.g., O#F#RD, K#ITH WI##I#M, EASA) with sequence ordering
- **Sections**: Chapter subdivisions with unique URLs and sequence ordering for question sets
- **Questions**: Question bank with multiple choice options and explanations
- **Test Sessions**: Timed practice tests with progress tracking
- **User Answers**: Individual question responses with correctness tracking
- **User Progress**: Subject-wise performance analytics

## UI/UX Design System
- **Dark/Light Theme Support**: System-aware theme switching with user override
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Architecture**: Reusable UI components following design system principles
- **Accessibility**: ARIA-compliant components from Radix UI

## Development Environment
- **Monorepo Structure**: Client and server code in unified repository
- **Shared Types**: Common TypeScript interfaces in shared directory
- **Hot Reload**: Development server with instant updates
- **Path Aliases**: Clean import statements using TypeScript path mapping

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **PostgreSQL**: Primary database system for all data persistence

## Authentication Services  
- **Replit Identity**: OpenID Connect provider for user authentication
- **Express Session Store**: PostgreSQL-backed session management

## Development Tools
- **Next.js**: Frontend framework with SSR/SSG capabilities and built-in optimizations
- **Drizzle Kit**: Database migration and schema management
- **TypeScript Compiler**: Type checking and compilation

## UI Libraries
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: SVG icon library
- **React Hook Form**: Form validation and management

## Runtime Dependencies
- **Node.js**: Server runtime environment
- **Next.js**: React framework with SSR/SSG
- **React**: Frontend UI library
- **TanStack Query**: Data fetching and state management

# Recent Changes

**January 25, 2025:**
- **MAJOR MIGRATION**: Migrated entire application from Vite + React to Next.js with SSR
- Improved SEO capabilities with server-side rendering and proper meta tags
- Added comprehensive structured data (JSON-LD) for search engines
- Updated routing from client-side Wouter to Next.js App Router
- Enhanced page load performance with SSR/SSG
- Added proper Open Graph and Twitter Card meta tags
- Configured Next.js to work with existing Express API backend
- Updated all pages with SEO-optimized metadata

**January 23, 2025:**
- Implemented hierarchical database structure: subjects → chapters → sections
- Added sequence fields to all tables for consistent question ordering
- Inserted complete Instruments subject data with 3 chapters and 30 sections
- Radio Navigation data with 3 chapters and 6 Oxford sections
- Updated frontend components to fetch live data from database instead of hardcoded arrays
- Added loading states and skeleton components for better UX
- Fixed Landing component error for smooth navigation
- API routes for chapters and sections with proper ordering by sequence