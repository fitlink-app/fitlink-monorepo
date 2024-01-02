#!/bin/sh

# Migrate the database
node migrate.js

# Install Chrome and symlink to Chromium (required for AL 2023)
export BROWSERS_SRC_DIR="/usr/src/browsers" && mkdir -p $BROWSERS_SRC_DIR
wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm -O $BROWSERS_SRC_DIR/google-chrome-stable_current_x86_64.rpm
sudo yum install -y -q $BROWSERS_SRC_DIR/google-chrome-stable_current_x86_64.rpm
sudo ln -s /usr/bin/google-chrome-stable /usr/bin/chromium
