#!/bin/sh

# make script an executable
# chmod +x deploy.sh

# If a command fails then the deploy stops
set -e

printf "\033[0;32mDeploying updates to GitHub...\033[0m\n"

# delete existing generated files
rm -rf docs/

# build site
hugo -t terminal

# go to deployment folder
cd docs

# add changes
git add .

# Commit changes.
msg="rebuilding site : [$(date)]"
if [ -n "$*" ]; then
	msg="$*"
fi
git commit -m "$msg"

git push origin master