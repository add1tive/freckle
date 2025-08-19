#!/bin/bash

# set working directory to script location
cd "$(dirname "$0")"

# delete cache
echo "Deleting cache..."
rm -rf ./.local/cache/
echo "Deleted cache (if it existed)."

# delete the logs too if the user wants that
if [[ "$1" == "-l" ]]; then
    echo "Deleting logs..."
    rm -rf ./.local/logs/
    echo "Deleted logs (if it existed)."
fi
