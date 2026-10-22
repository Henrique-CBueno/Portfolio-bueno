# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Portfolio project in its initial stage: there is no source code, build system, or tests yet. The only content so far is `exemplos/`, which holds reference videos (`urna.mp4`, `virtual-threads.mp4`, `circuit-breaker.mp4`, `fencing.mp4`) for the topics the portfolio is expected to cover. Update this file with commands and architecture once code exists.

## Prompt log

Every user prompt is saved automatically to `prompts/NNN.md` (001, 002, ...) by a `UserPromptSubmit` hook (`.claude/settings.json` → `.claude/hooks/save-prompt.sh`). The next number is the highest existing `NNN.md` + 1. Don't rename or renumber files in `prompts/`, and don't write to it by hand.
