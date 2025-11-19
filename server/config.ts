// Server configuration and environment variables
export const config = {
  // Server
  PORT: parseInt(process.env.PORT || '5000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || 'cashcrash-secret-key-' + Math.random(),
  SESSION_SECURE: process.env.NODE_ENV === 'production' && process.env.HTTPS !== 'false',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Object Storage
  DEFAULT_OBJECT_STORAGE_BUCKET_ID: process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID,
  PRIVATE_OBJECT_DIR: process.env.PRIVATE_OBJECT_DIR,
  PUBLIC_OBJECT_SEARCH_PATHS: process.env.PUBLIC_OBJECT_SEARCH_PATHS,
  
  // Development
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Universal deployment detection
  isReplit: !!process.env.REPL_ID,
  isRailway: !!process.env.RAILWAY_ENVIRONMENT,
  isRender: !!(process.env.RENDER || process.env.RENDER_SERVICE_ID),
  isVercel: !!process.env.VERCEL,
  isNetlify: !!process.env.NETLIFY,
  
  // Production deployment detection
  isReplitDeployment: process.env.NODE_ENV === 'production' && !!process.env.REPL_ID,
  isRailwayDeployment: process.env.NODE_ENV === 'production' && !!process.env.RAILWAY_ENVIRONMENT,
  isRenderDeployment: process.env.NODE_ENV === 'production' && !!(process.env.RENDER || process.env.RENDER_SERVICE_ID),
};

// Universal deployment validation
if (config.isProduction) {
  // Detect platform and validate
  let platform = 'generic';
  if (config.isReplitDeployment) {
    platform = 'replit';
    console.log('🚀 Replit deployment detected');
  } else if (config.isRailwayDeployment) {
    platform = 'railway';
    console.log('🚂 Railway deployment detected');
  } else if (config.isRenderDeployment) {
    platform = 'render';
    console.log('🎨 Render deployment detected');
  } else if (config.isVercel) {
    platform = 'vercel';
    console.log('▲ Vercel deployment detected');
  } else if (config.isNetlify) {
    platform = 'netlify';
    console.log('🌐 Netlify deployment detected');
  }
  
  // Universal validation
  if (!process.env.SESSION_SECRET) {
    console.warn(`Warning: SESSION_SECRET not set - using auto-generated secret`);
  }
  
  // Database validation for production
  if (process.env.DATABASE_URL) {
    console.log('✅ PostgreSQL database detected - using persistent sessions');
  } else if (config.isProduction) {
    console.warn('Warning: No DATABASE_URL in production - using memory sessions');
  }
  
  console.log(`Platform: ${platform} | Production: ${config.isProduction}`);
}

export default config;