#!/bin/bash

# Cleanup script to kill processes on test server ports
# This ensures a clean state before running Playwright tests

PORTS=(3000 3001 3002 3003 8787)

echo "Cleaning up processes on test server ports..."

for PORT in "${PORTS[@]}"; do
  echo -n "  Port $PORT: "

  # Find PIDs using the port
  PIDS=$(lsof -ti :$PORT 2>/dev/null)

  if [ -z "$PIDS" ]; then
    echo "✓ Free"
  else
    # Kill the processes
    echo "$PIDS" | xargs kill -9 2>/dev/null
    echo "✓ Cleaned (killed PIDs: $PIDS)"
  fi
done

echo ""
echo "All ports cleaned. Ready to run tests."
