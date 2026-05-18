#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LEGACY_DIR="$(cd "$ROOT_DIR/.." && pwd)"

publish_package() {
  local package_dir="$1"
  (
    cd "$package_dir"
    yalc publish
  )
}

update_consumer() {
  local consumer_dir="$1"
  (
    cd "$consumer_dir"
    yalc update
  )
}

publish_package "$ROOT_DIR/packages/koenig-lexical"
publish_package "$ROOT_DIR/packages/kg-default-nodes"
publish_package "$ROOT_DIR/packages/kg-html-to-lexical"
publish_package "$ROOT_DIR/packages/kg-lexical-html-renderer"

update_consumer "$LEGACY_DIR/01-jibunsee-react/apps/host"
update_consumer "$LEGACY_DIR/00-Ghost-5.116.2/ghost/core"
