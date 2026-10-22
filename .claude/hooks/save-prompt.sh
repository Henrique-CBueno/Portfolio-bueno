#!/usr/bin/env bash
# Salva cada prompt enviado em prompts/NNN.md (001, 002, ...)
set -euo pipefail
dir="${CLAUDE_PROJECT_DIR:-$(pwd)}/prompts"
mkdir -p "$dir"
last=$(find "$dir" -maxdepth 1 -name '[0-9][0-9][0-9].md' -printf '%f\n' | sort | tail -n1 | cut -c1-3)
next=$(printf '%03d' $((10#${last:-0} + 1)))
jq -r '.prompt' > "$dir/$next.md"
