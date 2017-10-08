#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

npm run docs
git add .
git commit -m "Travis: Deploy Docs"