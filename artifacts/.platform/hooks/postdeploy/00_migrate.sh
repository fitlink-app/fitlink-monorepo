#!/bin/sh

# Migrate the database
node migrate.js

# Install the required versions of Chromium etc for Amazon Linux 2
# Note that the environment variable is required to be set in ELB
# PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
sudo amazon-linux-extras install epel -y
sudo yum install -y chromium
