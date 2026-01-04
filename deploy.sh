#!/bin/bash

# SpaceMoney Deployment Script

set -e

echo "🚀 Starting SpaceMoney Deployment Process..."

# 1. Build Smart Contract (optional, for local reference)
echo "📦 Building Smart Contract..."
cd spacemoney-contract
anchor build
cd ..

# 2. Prepare Frontend
echo "🔧 Preparing Frontend..."
cd spacemoney-frontend
npm install
npm run build
cd ..

# 3. Deploy to Vercel
echo "☁️ Deploying to Vercel..."
if command -v vercel &> /dev/null
then
    vercel --prod
else
    echo "❌ Vercel CLI not found. Please install it with 'npm install -g vercel' and run 'vercel --prod' manually."
    exit 1
fi

echo "✅ Deployment complete!"
