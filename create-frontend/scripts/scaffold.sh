#!/usr/bin/env sh
# Non-interactive scaffold for the stacks create-frontend defaults to.
# Usage: scripts/scaffold.sh <vite-react|next|astro|vue|svelte|html> <project-name>
# Flags are current as of October 2026 for the latest major of each tool. When a tool changes its
# flags, this script fails loudly: read the tool's current docs, do not guess.
set -eu

kind="${1:-}"; name="${2:-}"
if [ -z "$kind" ] || [ -z "$name" ]; then
  echo "usage: scaffold.sh <vite-react|next|astro|vue|svelte|html> <project-name>" >&2
  exit 2
fi
if [ -e "$name" ]; then
  echo "refusing to scaffold: $name already exists" >&2
  exit 1
fi

case "$kind" in
  vite-react)
    npm create vite@latest "$name" -- --template react-ts
    cd "$name" && npm install && npm install tailwindcss @tailwindcss/vite
    echo "next: add tailwindcss() to plugins in vite.config.ts and put '@import \"tailwindcss\";' at the top of src/index.css"
    ;;
  next)
    npx create-next-app@latest "$name" --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
    ;;
  astro)
    npm create astro@latest "$name" -- --template minimal --typescript strict --install --no-git --yes
    ;;
  vue)
    npm create vue@latest "$name" -- --ts --router --eslint --vitest
    cd "$name" && npm install
    ;;
  svelte)
    npx sv create "$name" --template minimal --types ts --no-add-ons --install npm
    ;;
  html)
    mkdir -p "$name"
    cat > "$name/index.html" <<'EOF'
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
    printf '/* tokens go here (see references/themes.md) */\n' > "$name/styles.css"
    printf '' > "$name/main.js"
    ;;
  *)
    echo "unknown kind: $kind (expected vite-react, next, astro, vue, svelte or html)" >&2
    exit 2
    ;;
esac

echo "scaffolded $kind in ./$name; remove the scaffold's demo page, logos and counter before building"
