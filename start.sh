#!/bin/sh
echo "Running Prisma db push..."
npx prisma db push --accept-data-loss 2>&1 || echo "Prisma db push failed, continuing anyway..."
echo "Starting NestJS server..."
exec node dist/main.js
