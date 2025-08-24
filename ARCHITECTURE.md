
# Next.js + Express Architecture

## Overview
This application uses a **hybrid architecture** combining Next.js for the frontend with SSR capabilities and Express.js for API routes.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTP Requests
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                Next.js Server (Port 3000)                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  App Router (/app directory)                           ││
│  │  - Server-Side Rendering (SSR)                         ││
│  │  - Static Generation (SSG)                             ││
│  │  - Client Components with 'use client'                 ││
│  │  - Metadata API for SEO                                ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Middleware (middleware.ts)                             ││
│  │  - API Route Proxy: /api/* → Express Server            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ API Calls (/api/*)
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                Express.js Server (Port 5000)                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  API Routes                                             ││
│  │  - /api/auth/* - Authentication                        ││
│  │  │  - /api/subjects - Subjects data                    ││
│  │  - /api/questions/* - Question management              ││
│  │  - Session Management                                  ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Database Layer (Drizzle ORM)                          ││
│  │  - PostgreSQL via Neon                                 ││
│  │  - Schema definitions in /shared                       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ SQL Queries
                  │
┌─────────────────▼───────────────────────────────────────────┐
│               Neon PostgreSQL Database                      │
└─────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with SSR
│   ├── page.tsx                 # Home page (SSR)
│   ├── globals.css              # Global styles
│   └── [subject]/               # Dynamic routes for subjects
│       └── page.tsx             # Subject pages (SSR)
│
├── components/                   # Shared React components
│   ├── pages/                   # Page components
│   ├── ui/                      # UI components (shadcn/ui)
│   └── AuthenticatedHome.tsx    # Client-side auth wrapper
│
├── server/                      # Express.js API server
│   ├── index.ts                 # Main server file
│   ├── routes.ts                # API route definitions
│   ├── db.ts                    # Database connection
│   └── replitAuth.ts            # Authentication logic
│
├── shared/                      # Shared types and schemas
│   ├── schema.ts                # Database schema (Drizzle)
│   └── urlMapping.ts            # URL configurations
│
├── hooks/                       # React hooks
├── lib/                         # Utility functions
└── middleware.ts                # Next.js middleware for API proxy
```

## Server-Side Rendering (SSR) Implementation

### 1. **Next.js Pages (SSR)**
- All pages in `/app` directory use SSR by default
- Metadata is generated server-side for SEO
- Initial HTML is rendered on the server

### 2. **Client Components**
- Components marked with `'use client'` run on client
- Used for interactivity and state management
- Authentication state is managed client-side

### 3. **API Integration**
- Next.js middleware proxies `/api/*` to Express server
- Express handles all database operations
- Next.js focuses on rendering and user experience

## Data Flow

### SSR Request Flow:
1. **User visits page** → Next.js server (Port 3000)
2. **Server renders page** → Includes metadata, SEO tags
3. **Client receives HTML** → Fully rendered page
4. **Hydration occurs** → React takes over for interactivity

### API Request Flow:
1. **Client makes API call** → `/api/subjects`
2. **Next.js middleware** → Proxies to `http://0.0.0.0:5000/api/subjects`
3. **Express processes** → Database query via Drizzle
4. **Response returns** → Through Next.js to client

## Development Workflow

### Starting Development:
```bash
# Both servers run in parallel
npm run dev  # Starts both Express (5000) and Next.js (3000)
```

### Production Deployment:
```bash
npm run build  # Builds Next.js and Express
npm start      # Runs both servers in production
```

## Key Benefits

1. **SEO Optimization**: Server-side rendering with proper metadata
2. **Performance**: Static generation where possible
3. **Scalability**: Separate API server for database operations
4. **Developer Experience**: Hot reload for both frontend and API
5. **Type Safety**: Shared TypeScript types between frontend and backend

## Authentication Flow

1. **Server-side**: Express handles Replit Identity OAuth
2. **Client-side**: Next.js components check auth state
3. **Session**: Stored in PostgreSQL via Express sessions
4. **Protected Routes**: Client-side route protection with React hooks
