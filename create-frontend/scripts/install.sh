#!/usr/bin/env sh
# Install or update the create-frontend skill for one or more agents.
#
# Usage: create-frontend/scripts/install.sh [--copy] [--project] [target ...]
#
#   target     agents   ~/.agents/skills   the cross-client convention (Codex, Cursor, GitHub Copilot,
#                                          Gemini CLI, OpenCode and other Agent Skills clients)   [default]
#              claude   ~/.claude/skills   Claude Code (it does not read ~/.agents/skills)
#              <path>   any skills directory your agent documents
#   --project  install into the current project instead of the home directory:
#              ./.agents/skills, ./.claude/skills (and ./.github/skills for GitHub Copilot)
#   --copy     copy the folder instead of symlinking it
#
# A symlink (the default) means `git pull` in this repository updates every install at once.
# A copy is what you want when the agent cannot follow symlinks or the repo will not stay on disk.
set -eu

here=$(cd "$(dirname "$0")/.." && pwd)        # the create-frontend/ folder
mode=link; scope=home; targets=''
for a in "$@"; do
  case "$a" in
    --copy) mode=copy ;;
    --project) scope=project ;;
    -h|--help) sed -n '2,16p' "$0"; exit 0 ;;
    *) targets="$targets $a" ;;
  esac
done
[ -n "$targets" ] || targets='agents'

resolve() {
  case "$1" in
    agents) [ "$scope" = project ] && echo ".agents/skills" || echo "$HOME/.agents/skills" ;;
    claude) [ "$scope" = project ] && echo ".claude/skills" || echo "$HOME/.claude/skills" ;;
    copilot) [ "$scope" = project ] && echo ".github/skills" || echo "$HOME/.copilot/skills" ;;
    *) echo "$1" ;;
  esac
}

for t in $targets; do
  dir=$(resolve "$t")
  dest="$dir/create-frontend"
  mkdir -p "$dir"
  if [ -L "$dest" ]; then
    rm "$dest"
  elif [ -d "$dest" ]; then
    if grep -q '^name: "create-frontend"' "$dest/SKILL.md" 2>/dev/null; then
      rm -rf "$dest"
    else
      echo "refusing to replace $dest: it is not a create-frontend install" >&2
      exit 1
    fi
  fi
  if [ "$mode" = link ]; then
    ln -s "$here" "$dest"
    echo "linked   $dest -> $here"
  else
    cp -R "$here" "$dest"
    echo "copied   $dest"
  fi
done
