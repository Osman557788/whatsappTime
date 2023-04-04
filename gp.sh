#!/bin/bash

# get commit message from user input
read -p "Enter commit message: " message

# add all changes
git add .

# commit changes with commit message
git commit -m "$message"

# push changes to remote repository
git push origin main
