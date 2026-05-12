"""
Order placement and position management via Kite Connect.

All order functions are idempotent-safe:
  - Before placing, we check existing positions to avoid double-entry.
  - Every order is tagged with the strategy name so we can filter them.
"""

from __future__ import annotations
import time
from typing import Optional

from kiteconnect import KiteConnect

from .config import LOT_SIZE, EXCHANGE
from .strategy import IronCondor, Leg

TAG = 'NIFTY_IC'   # order tag for filtering


# ── Helpers ───────────────────────────────────────────────────

def _place_leg(kite: KiteConnect, leg: Leg, dry_run: bool = False) -> Optional[str]:
    """Place a single option leg. Returns order_id or None in dry_run."""
    if dry_run:
        print(f"    [DRY-RUN] {leg.action} {leg.tradingsymbol} x{LOT_SIZE}")
        return f"dry_{leg.tradingsymbol}"

    transaction = kite.TRANSACTION_TYPE_SELL if leg.action == 'SELL' else kite.TRANSACTION_TYPE_BUY
    order_id = kite.place_order(
        variety          = kite.VARIETY_REGULAR,
        exchange         = EXCHANGE,
        tradingsymbol    = leg.tradingsymbol,
        transaction_type = transaction,
        quantity         = LOT_SIZE,
        order_type       = kite.ORDER_TYPE_MARKET,
        product          = kite.PRODUCT_MIS,
        tag              = TAG,
    )
    print(f"    [{leg.action}] {leg.tradingsymbol} x{LOT_SIZE}  → order {order_id}")
    return order_id


# ── Entry ─────────────────────────────────────────────────────

def enter_iron_condor(kite: KiteConnect, ic: IronCondor, dry_run: bool = False) -> dict:
    """
    Place all 4 legs of the iron condor.
    Sells the short legs first (collect premium), then buys the wings (cap risk).
    Returns a dict of {leg_name: order_id}.
    """
    print(f"\n[orders] Entering iron condor — expiry {ic.expiry}")
    order_ids = {}

    # Short legs first (premium in hand before paying for wings)
    for name, leg in [('short_call', ic.short_call), ('short_put', ic.short_put)]:
        order_ids[name] = _place_leg(kite, leg, dry_run)
        time.sleep(0.3)  # Kite rate-limit buffer

    # Wing legs (protection)
    for name, leg in [('long_call', ic.long_call), ('long_put', ic.long_put)]:
        order_ids[name] = _place_leg(kite, leg, dry_run)
        time.sleep(0.3)

    print(f"[orders] All 4 legs placed.")
    return order_ids


# ── Exit ──────────────────────────────────────────────────────

def exit_iron_condor(kite: KiteConnect, ic: IronCondor, reason: str, dry_run: bool = False) -> dict:
    """
    Close all 4 legs — reverse of entry (buy back short legs, sell back long legs).
    """
    print(f"\n[orders] Exiting iron condor — reason: {reason}")
    order_ids = {}

    exit_legs = [
        ('exit_short_call', Leg('call', ic.short_call.strike, 'BUY',  ic.short_call.tradingsymbol, ic.expiry)),
        ('exit_short_put',  Leg('put',  ic.short_put.strike,  'BUY',  ic.short_put.tradingsymbol,  ic.expiry)),
        ('exit_long_call',  Leg('call', ic.long_call.strike,  'SELL', ic.long_call.tradingsymbol,  ic.expiry)),
        ('exit_long_put',   Leg('put',  ic.long_put.strike,   'SELL', ic.long_put.tradingsymbol,   ic.expiry)),
    ]

    for name, leg in exit_legs:
        order_ids[name] = _place_leg(kite, leg, dry_run)
        time.sleep(0.3)

    print(f"[orders] All exit legs placed.")
    return order_ids


# ── Position query ────────────────────────────────────────────

def get_current_pnl(kite: KiteConnect, ic: IronCondor) -> float:
    """
    Returns the current unrealised P&L for the open iron condor position.
    Positive = profit, Negative = loss.
    """
    try:
        positions = kite.positions()
        net_positions = positions.get('net', [])
        pnl = 0.0
        symbols = {
            ic.short_call.tradingsymbol,
            ic.short_put.tradingsymbol,
            ic.long_call.tradingsymbol,
            ic.long_put.tradingsymbol,
        }
        for pos in net_positions:
            if pos['tradingsymbol'] in symbols:
                pnl += pos.get('unrealised', 0) + pos.get('realised', 0)
        return pnl
    except Exception as e:
        print(f"[orders] Warning: could not fetch P&L — {e}")
        return 0.0


def is_position_open(kite: KiteConnect, ic: IronCondor) -> bool:
    """Returns True if any leg of the iron condor is still open."""
    try:
        positions = kite.positions()
        net_positions = positions.get('net', [])
        symbols = {
            ic.short_call.tradingsymbol,
            ic.short_put.tradingsymbol,
            ic.long_call.tradingsymbol,
            ic.long_put.tradingsymbol,
        }
        for pos in net_positions:
            if pos['tradingsymbol'] in symbols and pos.get('quantity', 0) != 0:
                return True
        return False
    except Exception:
        return False
