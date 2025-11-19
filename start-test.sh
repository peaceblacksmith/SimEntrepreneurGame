#!/bin/bash
# Railway deployment test script
echo "🚂 Testing Railway server locally..."

# Kill any existing processes
pkill -f "minimal.cjs" 2>/dev/null || true
pkill -f "railway.cjs" 2>/dev/null || true

# Start server in background
echo "Starting server..."
cd server
node minimal.cjs &
SERVER_PID=$!

# Wait for startup
sleep 3

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_response http://localhost:3000/health 2>/dev/null)
echo "Health response code: $HEALTH_RESPONSE"
if [ -f /tmp/health_response ]; then
  echo "Response body:"
  cat /tmp/health_response
fi

# Test root endpoint
echo "Testing root endpoint..."
ROOT_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/root_response http://localhost:3000/ 2>/dev/null)  
echo "Root response code: $ROOT_RESPONSE"

# Check if server process is running
if ps -p $SERVER_PID > /dev/null; then
  echo "✅ Server process is running (PID: $SERVER_PID)"
else
  echo "❌ Server process died"
fi

# Cleanup
kill $SERVER_PID 2>/dev/null || true
echo "Test complete."