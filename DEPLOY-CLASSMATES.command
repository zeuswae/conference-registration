#!/bin/bash
osascript -e 'tell application "Terminal" to activate' -e 'tell application "Terminal" to do script "export PATH=\"/Users/shu/conference-registration/.tools/node/bin:$HOME/.local/bin:$PATH\"; cd /Users/shu/conference-registration; bash scripts/vercel-deploy.sh; echo; echo Press Enter in this window when done.; read"'
