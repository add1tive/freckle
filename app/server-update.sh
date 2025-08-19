#!/bin/bash

# set working directory to script location
cd "$(dirname "$0")"

echo "Running git pull."
if git pull | grep -q 'up to date'; then
  echo "Repo is already up to date. Not doing anything."
else
  echo "Repo successfully pulled. Checking if Freckle is running..."
  # check if Freckle is already running by checking if a tmux session called "freckle" is running
  if tmux ls | grep -q freckle; then
    echo "A Freckle session is already running. Restarting Freckle."
    ./run.sh
  else
    echo "Freckle isn't running. Not doing anynthing."
  fi
fi
