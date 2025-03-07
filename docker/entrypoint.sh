#!/bin/sh
set -e

echo "Starting MarkCV with UID: $(id -u) GID: $(id -g)"

# Ensure data directory has correct permissions
mkdir -p /app/data
chown -R $(id -u):$(id -g) /app/data

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port 9876