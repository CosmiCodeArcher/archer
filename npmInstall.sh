#!/bin/bash

# 1. Install NVM
echo "Installing NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 2. Manually load NVM environment variables so the script can use it immediately
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# 3. Install the Long-Term Support (LTS) version of Node.js
echo "Installing Node.js LTS..."
nvm install --lts

# 4. Install project dependencies
echo "Installing npm packages..."
npm install

# 5. Start the development server
echo "Starting development server..."
npm run dev