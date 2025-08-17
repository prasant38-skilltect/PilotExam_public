# Overview

This is a comprehensive ATPL (Airline Transport Pilot License) exam preparation platform built as a full-stack web application. The system provides practice tests, question banks, and learning resources for all 14 EASA ATPL subjects. It features both guest and authenticated user experiences, with the authenticated version offering progress tracking, personalized dashboards, and additional learning modules including airline interview preparation, simulator training, and specialized courses.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Wouter**: Lightweight client-side routing library for navigation
- **shadcn/ui**: Component library built on Radix UI primitives with Tailwind CSS styling
- **TanStack Query**: Data fetching and caching for API interactions
- **Vite**: Build tool and development server with hot module replacement

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
- **ATPL Subjects**: 14 standardized aviation subjects with metadata
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
- **Vite**: Frontend build tool and development server
- **Drizzle Kit**: Database migration and schema management
- **TypeScript Compiler**: Type checking and compilation

## UI Libraries
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: SVG icon library
- **React Hook Form**: Form validation and management

## Runtime Dependencies
- **Node.js**: Server runtime environment
- **React**: Frontend framework
- **TanStack Query**: Data fetching and state management
- **Wouter**: Client-side routing