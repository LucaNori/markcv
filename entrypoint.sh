#!/bin/sh
set -e

# Get runtime UID/GID from environment variables
RUNTIME_PUID=${PUID:-1000}
RUNTIME_PGID=${PGID:-1000}

echo "Starting MarkCV with UID: ${RUNTIME_PUID} GID: ${RUNTIME_PGID}"

# Ensure data directory exists
mkdir -p /app/data

# Set correct permissions on data directory
chown -R ${RUNTIME_PUID}:${RUNTIME_PGID} /app/data

# Run the application as the specified user
exec su-exec ${RUNTIME_PUID}:${RUNTIME_PGID} uvicorn app.main:app --host 0.0.0.0 --port 9876