#!/bin/sh

# Migrate the database
node migrate.js

# Install the required versions of Chromium etc for Amazon Linux 2
sudo amazon-linux-extras install epel -y
sudo yum install -y chromium
