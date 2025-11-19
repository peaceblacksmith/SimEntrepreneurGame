// Server type definitions and fixes
declare module 'express-session' {
  interface SessionData {
    teamId?: string;
    isAdmin?: boolean;
  }
}