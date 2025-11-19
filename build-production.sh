#!/bin/bash
# Railway build script
echo "Building Cash or Crash for Railway..."

# Build frontend
npm run build

# Copy production server
cp server/production.js ./

echo "Build complete - ready for Railway!"
echo "Files created:"
echo "- dist/public/ (React frontend)"  
echo "- production.js (Node.js server)"