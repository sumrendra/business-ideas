"""
Trade journal — append-only CSV log of every entry, exit, and risk event.
This is the full audit trail; nothing is ever deleted or modified.
"""

from __future__ import annotations
import csv, os
from datetime import datetime

from .config import JOURNAL_FILE

_FIELDS = [
    'timestamp', 'event', 'nifty_spot',
    'expiry', 'short_call', 'short_put', 'long_call', 'long_put',
    'premium_collected', 'exit_cost', 'net_pnl',
    'reason', 'capital_after', 'notes',
]


def _ensure_header():
    if not os.path.exists(JOURNAL_FILE):
        with open(JOURNAL_FILE, 'w', newline='') as f:
            csv.DictWriter(f, fieldnames=_FIELDS).writeheader()


def log(event: str, *, nifty_spot: float = 0, expiry: str = '',
        short_call: int = 0, short_put: int = 0,
        long_call: int = 0, long_put: int = 0,
        premium_collected: float = 0, exit_cost: float = 0,
        net_pnl: float = 0, reason: str = '',
        capital_after: float = 0, notes: str = ''):
    _ensure_header()
    row = {
        'timestamp':         datetime.now().isoformat(timespec='seconds'),
        'event':             event,
        'nifty_spot':        round(nifty_spot, 2),
        'expiry':            expiry,
        'short_call':        short_call,
        'short_put':         short_put,
        'long_call':         long_call,
        'long_put':          long_put,
        'premium_collected': round(premium_collected, 2),
        'exit_cost':         round(exit_cost, 2),
        'net_pnl':           round(net_pnl, 2),
        'reason':            reason,
        'capital_after':     round(capital_after, 2),
        'notes':             notes,
    }
    with open(JOURNAL_FILE, 'a', newline='') as f:
        csv.DictWriter(f, fieldnames=_FIELDS).writerow(row)
    print(f"[journal] {event:20s}  pnl=₹{net_pnl:>8,.0f}  capital=₹{capital_after:>9,.0f}  {reason}")


def print_summary():
    """Print a quick P&L summary from the journal."""
    if not os.path.exists(JOURNAL_FILE):
        print("[journal] No trades recorded yet.")
        return

    with open(JOURNAL_FILE) as f:
        rows = list(csv.DictReader(f))

    exits = [r for r in rows if r['event'] == 'EXIT']
    if not exits:
        print("[journal] No completed trades yet.")
        return

    pnls = [float(r['net_pnl']) for r in exits]
    wins = [p for p in pnls if p > 0]
    losses = [p for p in pnls if p <= 0]

    print(f"\n{'─'*45}")
    print(f"  Trades     : {len(pnls)}")
    print(f"  Win rate   : {len(wins)/len(pnls)*100:.1f}%")
    print(f"  Avg win    : ₹{sum(wins)/len(wins):,.0f}"    if wins   else "  Avg win  : —")
    print(f"  Avg loss   : ₹{sum(losses)/len(losses):,.0f}" if losses else "  Avg loss : —")
    print(f"  Total P&L  : ₹{sum(pnls):,.0f}")
    if exits:
        print(f"  Last trade : {exits[-1]['timestamp'][:10]}  ₹{float(exits[-1]['net_pnl']):,.0f}  {exits[-1]['reason']}")
    print(f"{'─'*45}\n")
