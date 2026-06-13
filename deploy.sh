#!/bin/bash
# Deploy to GitHub Pages (gh-pages branch)

echo "🏗️ Building..."
npx vite build

echo "📁 Creating gh-pages branch..."
cd . || exit 1
git init
git checkout -b gh-pages
git add -f dist
git commit -m "deploy"
git push -f https://github.com/Plugy17/site.git gh-pages
git checkout main

echo "✅ Deployed! Now set GitHub Pages → Source: gh-pages branch"