#!/bin/sh
set -e

# entrypoint for running swagger generation at container startup
# This ensures `node ace swagger:generate` reads environment variables
# supplied at `docker run` / docker-compose time rather than build time.

echo "[entrypoint] Running swagger generator using runtime env..."
# ensure public/docs exists
mkdir -p /app/public/docs

# Run generator; if it fails we show a warning but continue so server can still start
if node ace swagger:generate; then
  echo "[entrypoint] swagger.json generated successfully"
else
  echo "[entrypoint] swagger:generate failed — continuing to start server (check logs)"
fi

# Exec the passed command (CMD) so dumb-init remains the real PID 1
exec "$@"
