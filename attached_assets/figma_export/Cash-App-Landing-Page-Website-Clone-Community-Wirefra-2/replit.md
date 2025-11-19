# KALGIRISIMCILIK - Turkish Entrepreneurship Gaming Platform

## Project Overview
A Turkish entrepreneurship gaming website migrated from Figma to Replit. The application features a dark-themed design with a hero section asking "KAZANMAYA CESARETIN VAR MI?" (Do you have the courage to win?) and includes user authentication functionality.

## Architecture
- **Frontend**: React with Vite, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js server with REST API
- **Database**: In-memory storage (MemStorage) with option for PostgreSQL via Drizzle ORM
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state
- **Authentication**: Passport.js with local strategy

## Current Features
- Landing page with hero section and Turkish branding
- User authentication system (username/password)
- Responsive design with dark theme (#1b1b1b background)
- Social media integration display
- Quote/testimonial section

## File Structure
```
client/src/
  ├── App.tsx - Main application with routing
  ├── pages/
  │   ├── Wireframe.tsx - Main landing page
  │   └── not-found.tsx - 404 page
  ├── components/ui/ - shadcn/ui components
  └── lib/
      ├── queryClient.ts - TanStack Query setup
      └── utils.ts - Utility functions

server/
  ├── index.ts - Express server setup
  ├── routes.ts - API routes
  ├── storage.ts - Memory storage implementation
  └── vite.ts - Vite integration

shared/
  └── schema.ts - Database schema and types
```

## Recent Changes
- January 23, 2025: Migrated from Figma to Replit environment
- Configured full-stack JavaScript application with modern tooling
- Set up development workflow with hot reload
- Adjusted email positioning in quote section (moved higher in y-axis)
- Improved social media section layout with better flexbox alignment
- Updated social media icons to use proper img tags instead of background images
- Created design extraction guide and reusable template for project transfer

## User Preferences
- Turkish language interface
- Dark theme design preference
- Gaming/entrepreneurship focus

## Development
- Run `npm run dev` to start development server
- Frontend served on Vite dev server
- Backend API on Express.js
- Hot reload enabled for both frontend and backend