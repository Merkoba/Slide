#!/usr/bin/env bash
export NODE_OPTIONS="--no-warnings"

# Only check files that have changed recently
last_tag=$(git describe --tags --abbrev=0)

# Pick one
# files=$(git diff --name-only $last_tag HEAD -- '*.js')
files=$(git ls-files -- "*.js")
files=$(echo $files | tr " " "\n" | grep -vE '(^|/)strudel/' | grep -vE '(^|/)songs/' | grep -vE '(^|/)dist/' | grep -vE '(^|/)vite.config.js$' | grep -vE '(^|/)src/libs/*' | tr "\n" " ")

if [ -n "$files" ]; then
  pnpm run --silent lint $files
fi