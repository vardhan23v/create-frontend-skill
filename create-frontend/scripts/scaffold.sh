#!/usr/bin/env sh
# Non-interactive scaffold for the stacks create-frontend defaults to.
# Usage: scripts/scaffold.sh <vite-react|next|astro|vue|svelte|html> <project-dir>
# Flags are current as of October 2026 for the latest major of each tool. When a tool changes its
# flags, this script fails loudly: read the tool's current docs, do not guess.
set -eu

kind="${1:-}"; name="${2:-}"
if [ -z "$kind" ] || [ -z "$name" ]; then
  echo "usage: scaffold.sh <vite-react|next|astro|vue|svelte|html> <project-dir>" >&2
  exit 2
fi
if [ -e "$name" ]; then
  echo "refusing to scaffold: $name already exists" >&2
  exit 1
fi

# The scaffolders resolve their argument against the current directory, so run them from the
# parent with a plain directory name; an absolute path would be nested under the cwd.
mkdir -p "$(dirname "$name")"
parent=$(cd "$(dirname "$name")" && pwd -P)
base=$(basename "$name")
target="$parent/$base"
case "$base" in
  [a-z0-9]*) ;;
  *) echo "project directory name must start with a lowercase letter or digit (npm package name rules): $base" >&2; exit 2 ;;
esac
cd "$parent"

case "$kind" in
  vite-react)
    npm create vite@latest "$base" -- --template react-ts --no-interactive
    cd "$target"
    npm install
    npm install tailwindcss @tailwindcss/vite
    echo "next: add tailwindcss() to plugins in vite.config.ts and put '@import \"tailwindcss\";' at the top of src/index.css"
    ;;
  next)
    npx create-next-app@latest "$base" --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
    ;;
  astro)
    npm create astro@latest "$base" -- --template minimal --install --no-git --yes
    ;;
  vue)
    npm create vue@latest "$base" -- --ts --router --eslint --vitest
    cd "$target"
    npm install
    ;;
  svelte)
    npx sv create "$base" --template minimal --types ts --no-add-ons --install npm
    ;;
  html)
    mkdir "$target"
    cat > "$target/index.html" <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Untitled</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main></main>
    <script src="main.js" defer></script>
  </body>
</html>
EOF
    printf '/* tokens go here (see references/themes.md) */\n' > "$target/styles.css"
    printf '' > "$target/main.js"
    ;;
  *)
    echo "unknown kind: $kind (expected vite-react, next, astro, vue, svelte or html)" >&2
    exit 2
    ;;
esac

# Prove the scaffolder produced a project where we said it would; never report success on hope.
if [ "$kind" = html ]; then proof="$target/index.html"; else proof="$target/package.json"; fi
if [ ! -f "$proof" ]; then
  echo "scaffold failed: $proof was not created; the tool's flags have probably changed, read its current docs" >&2
  exit 1
fi
echo "scaffolded $kind in $target; remove the scaffold's demo page, logos and counter before building"
