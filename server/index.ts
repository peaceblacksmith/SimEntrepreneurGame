import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import ConnectPgSimple from 'connect-pg-simple';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import "./types"; // Type definitions

const app = express();

// Security and parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Security headers for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
}

import config from "./config";

// Create PostgreSQL session store factory for production
const PgSession = ConnectPgSimple(session);

// Session configuration with store selection
const sessionConfig: any = {
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: config.SESSION_SECURE,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: config.isProduction ? (config.isRender ? 'none' as const : 'strict' as const) : 'lax' as const
  }
};

// Use PostgreSQL session store in production, memory store in development
if (config.isProduction && process.env.DATABASE_URL) {
  sessionConfig.store = new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session',
    createTableIfMissing: true
  });
  log('Using PostgreSQL session store for production');
} else {
  log('Using memory session store for development');
}

// @ts-ignore - Express session type issue workaround
app.use(session(sessionConfig));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // Only log error in development, don't throw in production
    if (process.env.NODE_ENV === 'development') {
      console.error(err);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use environment PORT for cloud deployment, fallback to 5000 for local
  const port = config.PORT;
  const host = config.HOST;
  
  // Platform-specific optimizations
  if (config.isRailway) {
    log(`Railway detected - optimized binding PORT=${port} HOST=${host}`);
  } else if (config.isRender) {
    log(`Render detected - optimized for Render.com deployment`);
  } else if (config.isReplit) {
    log(`Replit detected - using Replit infrastructure`);
  }
  
  // Graceful shutdown handling
  const shutdown = () => {
    log('Received shutdown signal, closing server...');
    server.close(() => {
      log('Server closed successfully');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  server.listen(port, host, () => {
    log(`serving on ${host}:${port} in ${config.NODE_ENV} mode`);
    log(`session config: secure=${sessionConfig.cookie.secure}, sameSite=${sessionConfig.cookie.sameSite}`);
    log(`deployment: replit=${config.isReplit}, railway=${config.isRailway}, render=${config.isRender}, production=${config.isProduction}`);
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
        deployment: {
          replit: config.isReplit,
          railway: config.isRailway,
          render: config.isRender,
          production: config.isProduction,
          platform: config.isReplitDeployment ? 'replit' : 
                   config.isRailwayDeployment ? 'railway' : 
                   config.isRenderDeployment ? 'render' : 
                   config.isVercel ? 'vercel' :
                   config.isNetlify ? 'netlify' : 'development'
        },
        database: {
          connected: !!process.env.DATABASE_URL,
          sessionStore: config.isProduction && process.env.DATABASE_URL ? 'postgresql' : 'memory'
        }
      });
    });
  });
})();
