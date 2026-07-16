#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WRITE_DIR="$ROOT/backend/apps-script-booking"
READ_DIR="$ROOT/backend/apps-script-booking-read"

SHARED=(
  "00_SchemaUrlsAndConfig.gs"
  "20_SpreadsheetAndTimeUtils.gs"
  "25_HttpResponses.gs"
  "28_AvailabilityCache.gs"
  "30_SheetsReservationIO.gs"
  "35_BookingServiceTypes.gs"
  "40_BookingHandlers.gs"
)

for file in "${SHARED[@]}"; do
  src="$WRITE_DIR/$file"
  dst="$READ_DIR/$file"
  if [[ ! -f "$src" ]]; then
    echo "Missing shared source: $src"
    exit 1
  fi
  cp "$src" "$dst"
  echo "synced $file"
done

echo "Read project shared modules updated from $WRITE_DIR"
