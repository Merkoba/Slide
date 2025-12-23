#!/usr/bin/env ruby
require "git"
require "json"

# 1. Load Config
config_path = "server/config/config.json"

unless File.exist?(config_path)
  abort "Error: Could not find config file at #{config_path}"
end

config = JSON.parse(File.read(config_path))
version = config["version"]

unless version
  abort "Error: No 'version' key found in #{config_path}"
end

tag_name = "v#{version}"

# 2. Check Local Git State
repo = Git.open(".")

# Check if tag already exists to prevent errors
if repo.tags.map(&:name).include?(tag_name)
  abort "Error: Tag #{tag_name} already exists. Update the version in config.json first."
end

# 3. Create Release via GitHub CLI
# This command automatically creates the tag, pushes it, and drafts the release notes.
puts "Creating GitHub Release for #{tag_name}..."

# --generate-notes autocompiles the changes based on PRs/commits
command = "gh release create #{tag_name} --title \"#{tag_name}\" --generate-notes"

if system(command)
  puts "Successfully created GitHub release: #{tag_name}"
else
  abort "Error: Failed to create release. Make sure 'gh' CLI is installed and you are logged in."
end