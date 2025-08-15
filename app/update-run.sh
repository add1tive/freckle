#!/bin/bash

# set working directory to script location
cd "$(dirname "$0")"

echo "Running git pull."
if git pull | grep -q 'up to date'; then
  echo "Repo is already up to date. Not doing anything."
else
  echo "Repo successfully pulled. Restarting Freckle."
  ./run.sh
fi
