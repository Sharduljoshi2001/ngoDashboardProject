#!/usr/bin/env bash
set -e

echo "📦 Installing backend dependencies…"
cd backend && npm install

echo "📦 Installing frontend dependencies…"
cd ../frontend && npm install

echo "🔨 Building frontend…"
npm run build

echo "📂 Copying build to backend/public…"
cp -r dist ../backend/public

echo "✅ Build complete."
