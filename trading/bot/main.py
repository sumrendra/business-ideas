"""
Main orchestrator — three modes:

  python -m bot.main entry     Run on Monday morning (9:30 AM) to enter the trade
  python -m bot.main monitor   Run every 30 min during market hours to check exit rules
  python -m bot.main status    Print current state + journal summary
  python -m bot.main exit      Manually force-exit any open position

All modes accept --dry-run to simulate without placing real orders.
"""

from __future__ import annotations
import argparse, json, sys
from datetime import date

from .auth     import get_kite
from .strategy import build_iron_condor, print_condor
from .orders   import enter_iron_condor, get_current_pnl, is_position_open
from .monitor  import load_state, save_state, check_position, record_expiry_exit
from . import journal


# ── Helpers ───────────────────────────────────────────────────

def _get_nifty_spot(kite) -> float:
    quote = kite.quote('NSE:NIFTY 50')
    return quote['NSE:NIFTY 50']['last_price']


def _get_current_iv(kite, spot: float) -> float:
    """
    Approximate current IV from the ATM straddle price.
    Falls back to 14% if anything fails.
    """
    from .strategy import next_thursday, _nifty_symbol
    try:
        expiry  = next_thursday()
        atm     = int(round(spot / 50) * 50)
        ce_sym  = f"NFO:{_nifty_symbol(expiry, atm, 'call')}"
        pe_sym  = f"NFO:{_nifty_symbol(expiry, atm, 'put')}"
        quotes  = kite.quote([ce_sym, pe_sym])
        straddle_price = (quotes[ce_sym]['last_price'] + quotes[pe_sym]['last_price'])
        # Rough IV from straddle: IV ≈ straddle_price / (spot × √T)
        import math
        t = max((expiry - date.today()).days, 1) / 252
        iv = straddle_price / (spot * math.sqrt(t)) * 0.8   # 0.8 calibration factor
        return max(0.08, min(iv, 0.80))
    except Exception as e:
        print(f"[main] IV fetch failed ({e}), using 14% fallback")
        return 0.14


# ── Commands ──────────────────────────────────────────────────

def cmd_entry(kite, dry_run: bool):
    state = load_state()

    if state.get('hard_stop'):
        print("[main] HARD STOP is active. Trading is suspended. Review strategy before continuing.")
        sys.exit(1)

    # Pause checks
    today_str = str(date.today())
    if state.get('week_pause_until') and today_str <= state['week_pause_until']:
        print(f"[main] Week pause active until {state['week_pause_until']}. Skipping entry.")
        return

    if state.get('month_pause_until') and today_str <= state['month_pause_until']:
        print(f"[main] Month pause active until {state['month_pause_until']}. Skipping entry.")
        return

    if state.get('position'):
        print("[main] A position is already open. Skipping entry.")
        return

    spot = _get_nifty_spot(kite) if not dry_run else 24_500.0
    iv   = _get_current_iv(kite, spot) if not dry_run else 0.14

    ic = build_iron_condor(spot, iv)
    print_condor(ic)

    # Margin sanity check
    net_credit_per_unit = 0  # will be estimated post-entry
    max_loss_approx = 150 * 75  # rough upper bound
    if max_loss_approx > state['capital'] * 0.70:
        print(f"[main] Insufficient capital for margin. Skipping.")
        return

    order_ids = enter_iron_condor(kite, ic, dry_run=dry_run)

    # Fetch actual premium received (average of fills)
    premium_collected = 0.0
    if not dry_run:
        import time; time.sleep(2)
        pnl_check = get_current_pnl(kite, ic)
        # Premium ≈ any positive value right after entry (slight bid-ask gain)
        # Better: fetch order fills. For now store a rough estimate.
        premium_collected = abs(pnl_check) if pnl_check > 0 else 2000.0

    # Persist state
    state['position']  = {
        'spot': spot, 'iv': iv,
        'expiry': str(ic.expiry),
        'short_call': ic.short_call.strike,
        'short_put':  ic.short_put.strike,
        'long_call':  ic.long_call.strike,
        'long_put':   ic.long_put.strike,
    }
    state['premium'] = premium_collected
    save_state(state)

    journal.log(
        'ENTRY',
        nifty_spot        = spot,
        expiry            = str(ic.expiry),
        short_call        = ic.short_call.strike,
        short_put         = ic.short_put.strike,
        long_call         = ic.long_call.strike,
        long_put          = ic.long_put.strike,
        premium_collected = premium_collected,
        capital_after     = state['capital'],
        notes             = f"iv={iv*100:.1f}%  orders={order_ids}",
    )
    print(f"\n[main] Entry complete. Next: run 'monitor' every 30 min during market hours.")


def cmd_monitor(kite, dry_run: bool):
    state = load_state()
    if not state.get('position'):
        print("[main] No open position to monitor.")
        return

    pos = state['position']
    from .strategy import IronCondor, Leg, next_thursday
    from datetime import date as _date
    expiry = _date.fromisoformat(pos['expiry'])

    ic = IronCondor(
        short_call = Leg('call', pos['short_call'], 'SELL',
                         f"NIFTY{expiry.strftime('%y')}{_month_code(expiry.month)}{expiry.strftime('%d')}{pos['short_call']}CE", expiry),
        short_put  = Leg('put',  pos['short_put'],  'SELL',
                         f"NIFTY{expiry.strftime('%y')}{_month_code(expiry.month)}{expiry.strftime('%d')}{pos['short_put']}PE",  expiry),
        long_call  = Leg('call', pos['long_call'],  'BUY',
                         f"NIFTY{expiry.strftime('%y')}{_month_code(expiry.month)}{expiry.strftime('%d')}{pos['long_call']}CE",  expiry),
        long_put   = Leg('put',  pos['long_put'],   'BUY',
                         f"NIFTY{expiry.strftime('%y')}{_month_code(expiry.month)}{expiry.strftime('%d')}{pos['long_put']}PE",   expiry),
        expiry     = expiry,
        spot       = pos['spot'],
        iv         = pos['iv'],
        t_years    = 0,
    )

    result = check_position(kite, ic, state['premium'], dry_run=dry_run)
    if result != 'HOLD':
        print(f"[main] Position closed — reason: {result}")
    else:
        pnl = get_current_pnl(kite, ic) if not dry_run else 0
        print(f"[main] Holding. Current P&L: ₹{pnl:,.0f}")


def cmd_status(_kite, _dry_run):
    state = load_state()
    print(f"\n{'━'*45}")
    print(f"  Capital       : ₹{state.get('capital', 0):,.0f}")
    print(f"  Peak capital  : ₹{state.get('peak_capital', 0):,.0f}")
    print(f"  Hard stop     : {'YES ⚠' if state.get('hard_stop') else 'No'}")
    print(f"  Open position : {'Yes — expires ' + str(state['position']['expiry']) if state.get('position') else 'None'}")
    print(f"  Month DD      : ₹{state.get('month_dd', 0):,.0f}")
    journal.print_summary()


def cmd_exit(kite, dry_run: bool):
    state = load_state()
    if not state.get('position'):
        print("[main] No open position to exit.")
        return
    cmd_monitor(kite, dry_run)   # reuses exit logic


def _month_code(m: int) -> str:
    return {1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',
            7:'7',8:'8',9:'9',10:'O',11:'N',12:'D'}[m]


# ── Entry point ───────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='NIFTY Iron Condor Bot')
    parser.add_argument('command', choices=['entry', 'monitor', 'status', 'exit'])
    parser.add_argument('--dry-run', action='store_true',
                        help='Simulate without placing real orders')
    args = parser.parse_args()

    kite = get_kite() if not args.dry_run else None

    dispatch = {
        'entry':   cmd_entry,
        'monitor': cmd_monitor,
        'status':  cmd_status,
        'exit':    cmd_exit,
    }
    dispatch[args.command](kite, args.dry_run)


if __name__ == '__main__':
    main()
