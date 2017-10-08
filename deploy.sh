#!/bin/bash

npm run docs
git add .
git commit -m "update documentation"
git push