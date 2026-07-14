#!/bin/sh

set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
source_dir="$repo_root/src"
docs_dir="$repo_root/docs"

rm -rf "$docs_dir"

hugo --source "$source_dir" \
  --theme tiago-command-bridge \
  --destination "$docs_dir" \
  --baseURL "https://www.tiago.dev/"

find "$docs_dir" -name '*.html' -type f -exec perl -pi -e 's/[ \t]+$//' {} +

printf "Built Command Bridge at /.\n"
