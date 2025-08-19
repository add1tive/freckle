#!/bin/bash

# set working directory to script location
cd "$(dirname "$0")"

# check if Freckle is already running by checking if a tmux session called "freckle" is running
if tmux ls | grep -q freckle; then
  echo "A Freckle session is already running. Killing."
  tmux kill-session -t freckle
fi

echo "Running Freckle."
tmux new -d -sfreckle "pnpm start"
