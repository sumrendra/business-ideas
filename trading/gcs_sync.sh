#!/bin/bash
# Sync bot state files to/from a GCS bucket.
# Usage:
#   gcs_sync.sh pull    — download state from GCS before a bot run
#   gcs_sync.sh push    — upload state to GCS after a bot run

set -euo pipefail

DIRECTION="${1:-pull}"
BUCKET="${TRADING_STATE_BUCKET:?TRADING_STATE_BUCKET env var is required}"
STATE_DIR="/Users/harilsharma/business-ideas/trading"
FILES=".kite_token .bot_state.json trade_journal.csv"

if [ "$DIRECTION" = "pull" ]; then
    echo "[gcs] Pulling state from gs://$BUCKET/"
    for f in $FILES; do
        gsutil -q cp "gs://$BUCKET/$f" "$STATE_DIR/$f" 2>/dev/null && \
            echo "[gcs]   pulled $f" || \
            echo "[gcs]   $f not in bucket yet (first run?)"
    done

elif [ "$DIRECTION" = "push" ]; then
    echo "[gcs] Pushing state to gs://$BUCKET/"
    for f in $FILES; do
        if [ -f "$STATE_DIR/$f" ]; then
            gsutil -q cp "$STATE_DIR/$f" "gs://$BUCKET/$f" && \
                echo "[gcs]   pushed $f"
        fi
    done
fi
