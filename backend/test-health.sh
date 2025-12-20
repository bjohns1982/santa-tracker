#!/bin/bash

# Test script to verify the /api/health endpoint works
# This simulates what the ALB and container health checks do

echo "Testing /api/health endpoint..."
echo ""

# Test 1: Check if server is running (simulating container health check with curl)
echo "Test 1: Container health check (curl from inside container)"
echo "Command: curl -f http://localhost:3001/api/health || exit 1"
echo ""

if curl -f http://localhost:3001/api/health 2>/dev/null; then
    echo "✅ Container health check would PASS"
    echo "Response: $(curl -s http://localhost:3001/api/health)"
else
    echo "❌ Container health check would FAIL"
    echo "Error: Server not responding or endpoint not available"
fi

echo ""
echo "---"
echo ""

# Test 2: Check HTTP status code (simulating ALB health check)
echo "Test 2: ALB health check (HTTP 200 status code)"
echo "Command: curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/api/health"
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/api/health)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ ALB health check would PASS (HTTP $HTTP_CODE)"
    echo "Response body: $(curl -s http://localhost:3001/api/health)"
else
    echo "❌ ALB health check would FAIL (HTTP $HTTP_CODE)"
    echo "Expected: 200, Got: $HTTP_CODE"
fi

echo ""
echo "---"
echo ""

# Test 3: Verify response format
echo "Test 3: Response format verification"
RESPONSE=$(curl -s http://localhost:3001/api/health)

if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    echo "✅ Response format is correct"
    echo "Response: $RESPONSE"
else
    echo "❌ Response format is incorrect"
    echo "Response: $RESPONSE"
    echo "Expected: {\"status\":\"ok\"}"
fi

echo ""
echo "Note: Make sure the backend server is running on port 3001"
echo "Start it with: npm run dev (or npm start if built)"

