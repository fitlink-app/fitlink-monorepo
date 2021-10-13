#!/bin/sh

# Migrate the database
node migrate.js

# Install the required versions of Chromium etc for Amazon Linux 2
npm install -g node-html-to-image@3.2.0
