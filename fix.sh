#!/usr/bin/env bash
files=$(git ls-files -- "*.js")
files=$(echo $files | tr " " "\n" | grep -vE '(^|/)strudel/' | grep -vE '(^|/)songs/'| grep -vE '(^|/)dist/' | tr "\n" " ")

if [ -n "$files" ]; then
  npm run --silent fix $files
fi