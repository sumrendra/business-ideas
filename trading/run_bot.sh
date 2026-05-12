#!/bin/bash
# Bot runner — called by launchd agents.
# Usage: run_bot.sh <command>   e.g. run_bot.sh entry | monitor | status

set -euo pipefail

COMMAND="${1:-status}"
PYTHON="/Users/harilsharma/.pyenv/versions/3.9.18/bin/python3"
PROJECT="/Users/harilsharma/business-ideas"
LOGDIR="$PROJECT/trading/logs"
LOGFILE="$LOGDIR/bot_$(date +%Y-%m-%d).log"

# IST offset check — skip if outside market hours (9:15–15:35)
HOUR=$(date +%H)
MIN=$(date +%M)
TIME_INT=$((HOUR * 60 + MIN))
MARKET_OPEN=$((9 * 60 + 15))    # 9:15 AM
MARKET_CLOSE=$((15 * 60 + 35))  # 3:35 PM

# For monitor: skip outside market hours entirely
if [ "$COMMAND" = "monitor" ]; then
    if [ "$TIME_INT" -lt "$MARKET_OPEN" ] || [ "$TIME_INT" -gt "$MARKET_CLOSE" ]; then
        exit 0
    fi
fi

# For entry: only run on Monday (weekday 1) — skip holidays silently
if [ "$COMMAND" = "entry" ]; then
    DOW=$(date +%u)   # 1=Mon ... 7=Sun
    if [ "$DOW" != "1" ]; then
        exit 0
    fi
fi

echo "──────────────────────────────────────" >> "$LOGFILE"
echo "$(date '+%Y-%m-%d %H:%M:%S')  CMD=$COMMAND" >> "$LOGFILE"

cd "$PROJECT"
"$PYTHON" -m trading.bot.main "$COMMAND" >> "$LOGFILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S')  ERROR: exit code $EXIT_CODE" >> "$LOGFILE"
fi

exit $EXIT_CODE
