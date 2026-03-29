#!/bin/bash
set -euo pipefail

# oh-my-paul release script
# Usage: scripts/release.sh <major|minor|patch> [--push]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Parse arguments
BUMP_TYPE="${1:-}"
DO_PUSH=false
for arg in "$@"; do
  if [ "$arg" = "--push" ]; then
    DO_PUSH=true
  fi
done

if [ -z "$BUMP_TYPE" ] || [[ ! "$BUMP_TYPE" =~ ^(major|minor|patch)$ ]]; then
  echo "Usage: scripts/release.sh <major|minor|patch> [--push]"
  echo ""
  echo "  major   Bump major version (X.0.0) — breaking changes"
  echo "  minor   Bump minor version (0.X.0) — new features"
  echo "  patch   Bump patch version (0.0.X) — bug fixes"
  echo "  --push  Push commit and tag to origin"
  exit 1
fi

cd "$ROOT_DIR"

# Check for clean working tree
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working tree is not clean. Commit or stash changes first."
  exit 1
fi

# Read current version from plugin.json
CURRENT_VERSION=$(python3 -c "import json; print(json.load(open('.claude-plugin/plugin.json'))['version'])")
echo "Current version: $CURRENT_VERSION"

# Calculate new version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
case "$BUMP_TYPE" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
esac
NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
echo "New version: $NEW_VERSION"

# Update plugin.json
python3 -c "
import json
with open('.claude-plugin/plugin.json', 'r') as f:
    data = json.load(f)
data['version'] = '${NEW_VERSION}'
with open('.claude-plugin/plugin.json', 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')
"

# Update marketplace.json (root version + plugins[0].version)
python3 -c "
import json
with open('.claude-plugin/marketplace.json', 'r') as f:
    data = json.load(f)
data['version'] = '${NEW_VERSION}'
for p in data.get('plugins', []):
    p['version'] = '${NEW_VERSION}'
with open('.claude-plugin/marketplace.json', 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')
"

# Update CHANGELOG.md — add new version header if not present
if ! grep -q "## \[${NEW_VERSION}\]" CHANGELOG.md; then
  DATE=$(date +%Y-%m-%d)
  sed -i '' "s/^## \[${CURRENT_VERSION}\]/## [${NEW_VERSION}] - ${DATE}\n\n### Changed\n- Version bump to ${NEW_VERSION}\n\n## [${CURRENT_VERSION}]/" CHANGELOG.md 2>/dev/null || \
  sed -i "s/^## \[${CURRENT_VERSION}\]/## [${NEW_VERSION}] - ${DATE}\n\n### Changed\n- Version bump to ${NEW_VERSION}\n\n## [${CURRENT_VERSION}]/" CHANGELOG.md
fi

# Verify changes
echo ""
echo "Files updated:"
git diff --name-only

# Commit and tag
echo ""
git add -A
git commit -m "chore: release v${NEW_VERSION}"
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"

echo ""
echo "Created commit and tag: v${NEW_VERSION}"

# Push if requested
if [ "$DO_PUSH" = true ]; then
  echo "Pushing to origin..."
  git push origin main --tags
  echo "Pushed v${NEW_VERSION} to origin"
else
  echo ""
  echo "To push: git push origin main --tags"
fi

echo ""
echo "Done! v${CURRENT_VERSION} → v${NEW_VERSION}"
