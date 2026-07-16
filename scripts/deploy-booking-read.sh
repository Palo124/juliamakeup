#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
READ_DIR="$ROOT/backend/apps-script-booking-read"
CLASP_JSON="$READ_DIR/.clasp.json"
DEPLOY_JSON="$READ_DIR/.clasp.deploy.json"
CONFIG_JS="$ROOT/assets/js/config.js"

bash "$ROOT/scripts/sync-booking-read.sh"

if [[ ! -f "$CLASP_JSON" ]]; then
  echo "Missing $CLASP_JSON"
  echo "Copy .clasp.json.example, create a new Apps Script project for read, and set scriptId."
  exit 1
fi

resolve_deployment_id() {
  if [[ -f "$DEPLOY_JSON" ]]; then
    node -e "
      const id = JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8')).deploymentId;
      if (!id || !String(id).trim()) process.exit(1);
      console.log(String(id).trim());
    " "$DEPLOY_JSON"
    return
  fi

  if [[ ! -f "$CONFIG_JS" ]]; then
    echo "Missing $CONFIG_JS and $DEPLOY_JSON"
    exit 1
  fi

  node -e "
    const fs = require('fs');
    const config = fs.readFileSync(process.argv[1], 'utf8');
    const match = config.match(/bookingReadScriptUrl:\\s*\"[^\"]*macros\\/s\\/([^/'\"]+)\\/exec/);
    if (!match) {
      console.error('Could not read deploymentId from bookingReadScriptUrl in config.js');
      process.exit(1);
    }
    console.log(match[1]);
  " "$CONFIG_JS"
}

DEPLOYMENT_ID="$(resolve_deployment_id)"
DESC="${1:-booking read deploy $(date -Iseconds)}"

cd "$READ_DIR"
clasp push --force
clasp deploy --deploymentId "$DEPLOYMENT_ID" --description "$DESC"

echo "Done: pushed and redeployed read API to the same /exec URL."
echo "Deployment ID: $DEPLOYMENT_ID"
