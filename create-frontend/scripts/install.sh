#!/usr/bin/env sh
# Install or update the create-frontend skill for one or more agents. Run it from the clone.
#
# Usage: create-frontend/scripts/install.sh [--copy] [--project] [target ...]
#
#   target     agents   ~/.agents/skills   the cross-client convention (Codex, Cursor, GitHub Copilot,
#                                          Gemini CLI, OpenCode and other Agent Skills clients)   [default]
#              claude   ~/.claude/skills   Claude Code (it does not read ~/.agents/skills)
#              copilot  ~/.copilot/skills  GitHub Copilot's native location
#              <path>   any skills directory your agent documents
#   --project  install into the current project instead of the home directory:
#              ./.agents/skills, ./.claude/skills, ./.github/skills
#   --copy     copy the folder instead of symlinking it
#
# A symlink (the default) means `git pull` in this repository updates every install at once.
# A copy is what you want when the agent cannot follow symlinks or the repo will not stay on disk.
# Re-running over a copied install moves the old copy aside as create-frontend.bak.<timestamp>.
set -eu

here=$(cd "$(dirname "$0")/.." && pwd -P)      # the create-frontend/ folder
mode='link'; scope='home'
for a in "$@"; do
  case "$a" in
    --copy) mode='copy' ;;
    --project) scope='project' ;;
    -h|--help) sed -n '2,18p' "$0"; exit 0 ;;
    --*) echo "unknown option: $a" >&2; exit 2 ;;
  esac
done

# Targets stay positional so a path with spaces survives.
n=0
for a in "$@"; do
  case "$a" in --copy|--project) ;; *) n=$((n + 1)) ;; esac
done
[ "$n" -gt 0 ] || set -- "$@" agents

resolve() {
  case "$1" in
    agents)  [ "$scope" = project ] && echo ".agents/skills"  || echo "$HOME/.agents/skills" ;;
    claude)  [ "$scope" = project ] && echo ".claude/skills"  || echo "$HOME/.claude/skills" ;;
    copilot) [ "$scope" = project ] && echo ".github/skills"  || echo "$HOME/.copilot/skills" ;;
    *) echo "$1" ;;
  esac
}

for t in "$@"; do
  case "$t" in --copy|--project) continue ;; esac
  dir=$(resolve "$t")
  dest="$dir/create-frontend"
  mkdir -p "$dir"
  if [ ! -L "$dest" ] && [ -d "$dest" ] && [ "$(cd "$dest" && pwd -P)" = "$here" ]; then
    echo "refusing: $dest is this checkout; run the installer from a clone outside the skills directory" >&2
    exit 1
  fi
  if [ -L "$dest" ]; then
    rm "$dest"
  elif [ -d "$dest" ]; then
    if grep -q '^name: "create-frontend"' "$dest/SKILL.md" 2>/dev/null; then
      bak="$dest.bak.$(date +%Y%m%d%H%M%S)"
      mv "$dest" "$bak"
      echo "moved    previous copy to $bak"
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
