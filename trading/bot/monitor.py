"""
Position monitor — runs after entry to watch intraday P&L and enforce exit rules.

Exit triggers (in priority order):
  1. HARD_STOP : cumulative equity drawdown from peak >= TOTAL_DRAWDOWN
  2. STOP_LOSS : this trade's loss >= 2× premium collected
  3. PROFIT_TARGET : this trade's profit >= 70% of max profit
  4. EXPIRY : Thursday — let expire (called explicitly by main.py)

Run this as a scheduled job every 30 minutes during market hours (9:30–15:00).
"""

from __future__ import annotations
import json, os
from datetime import date

from kiteconnect import KiteConnect

from .config import TOTAL_DRAWDOWN, JOURNAL_FILE, STATE_FILE_DEFAULT
from .strategy import IronCondor
from .orders import get_current_pnl, exit_iron_condor, is_position_open
from . import journal

STOP_MULTIPLIER  = 2.0    # exit if loss = 2× premium collected
PROFIT_TARGET    = 0.70   # exit at 70% of max profit
STATE_FILE       = STATE_FILE_DEFAULT


# ── Bot state (persists across runs) ─────────────────────────

def load_state() -> dict:
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {
        'capital':      75_000,
        'peak_capital': 75_000,
        'position':     None,     # serialized IronCondor or None
        'premium':      0,
        'max_profit':   0,
        'hard_stop':    False,
        'week_pause_until':  None,
        'month_pause_until': None,
        'month_dd':     0,
        'month_key':    None,
    }


def save_state(state: dict):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2, default=str)


# ── Main monitor tick ─────────────────────────────────────────

def check_position(kite: KiteConnect, ic: IronCondor,
                   premium_collected: float, dry_run: bool = False) -> str:
    """
    Evaluate current P&L and apply exit rules.
    Returns: 'HOLD' | 'STOP_LOSS' | 'PROFIT_TARGET' | 'HARD_STOP'
    """
    state = load_state()

    if state.get('hard_stop'):
        print("[monitor] Hard stop is active — no new positions should be open.")
        return 'HARD_STOP'

    if not is_position_open(kite, ic) and not dry_run:
        print("[monitor] No open position found.")
        return 'HOLD'

    pnl = get_current_pnl(kite, ic)
    max_loss   = premium_collected * STOP_MULTIPLIER
    profit_tgt = premium_collected * PROFIT_TARGET

    print(f"[monitor] Current P&L: ₹{pnl:,.0f}  |  "
          f"Stop: -₹{max_loss:,.0f}  Target: +₹{profit_tgt:,.0f}")

    # ── Check hard stop (equity peak-to-trough) ───────────────
    current_capital = state['capital'] + pnl
    dd_from_peak    = state['peak_capital'] - current_capital
    if dd_from_peak >= TOTAL_DRAWDOWN:
        print(f"[monitor] HARD STOP — drawdown ₹{dd_from_peak:,.0f} >= ₹{TOTAL_DRAWDOWN:,}")
        exit_iron_condor(kite, ic, reason='HARD_STOP', dry_run=dry_run)
        _record_exit(state, ic, premium_collected, pnl, 'HARD_STOP')
        state['hard_stop'] = True
        save_state(state)
        return 'HARD_STOP'

    # ── Stop loss ─────────────────────────────────────────────
    if pnl <= -max_loss:
        print(f"[monitor] STOP LOSS hit — P&L ₹{pnl:,.0f}")
        exit_iron_condor(kite, ic, reason='STOP_LOSS', dry_run=dry_run)
        _record_exit(state, ic, premium_collected, pnl, 'STOP_LOSS')
        save_state(state)
        return 'STOP_LOSS'

    # ── Profit target ─────────────────────────────────────────
    if pnl >= profit_tgt:
        print(f"[monitor] PROFIT TARGET reached — P&L ₹{pnl:,.0f}")
        exit_iron_condor(kite, ic, reason='PROFIT_TARGET', dry_run=dry_run)
        _record_exit(state, ic, premium_collected, pnl, 'PROFIT_TARGET')
        save_state(state)
        return 'PROFIT_TARGET'

    return 'HOLD'


def record_expiry_exit(ic: IronCondor, final_pnl: float):
    """Call on Thursday after expiry to record the final outcome."""
    state = load_state()
    _record_exit(state, ic, state.get('premium', 0), final_pnl, 'EXPIRY')
    save_state(state)


def _record_exit(state: dict, ic: IronCondor, premium: float, pnl: float, reason: str):
    state['capital']      += pnl
    state['peak_capital']  = max(state['peak_capital'], state['capital'])
    state['position']      = None
    state['premium']       = 0

    # Monthly drawdown tracking
    month_key = str(date.today())[:7]
    if state.get('month_key') != month_key:
        state['month_dd']  = 0
        state['month_key'] = month_key
    if pnl < 0:
        state['month_dd'] += abs(pnl)

    journal.log(
        'EXIT',
        nifty_spot        = ic.spot,
        expiry            = str(ic.expiry),
        short_call        = ic.short_call.strike,
        short_put         = ic.short_put.strike,
        long_call         = ic.long_call.strike,
        long_put          = ic.long_put.strike,
        premium_collected = premium,
        exit_cost         = premium - pnl,
        net_pnl           = pnl,
        reason            = reason,
        capital_after     = state['capital'],
    )
