"""
Iron condor strike selection + option symbol lookup for NIFTY weekly expiry.

Given the current NIFTY spot price and IV, returns the 4 legs of the iron condor
as Kite-ready instrument tokens + metadata.
"""

from __future__ import annotations
import math
from datetime import date, timedelta
from typing import NamedTuple

from scipy.stats import norm
import numpy as np

from .config import SHORT_DELTA, WING_WIDTH, LOT_SIZE, RISK_FREE_RATE


RISK_FREE_RATE = 0.065


# ── Black-Scholes helpers ─────────────────────────────────────

def _bs_delta(S, K, T, r, sigma, kind='call') -> float:
    if T <= 1e-6:
        return 1.0 if (kind == 'call' and S > K) else 0.0
    d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
    return norm.cdf(d1) if kind == 'call' else norm.cdf(d1) - 1.0


def _find_strike(S, T, r, sigma, target_delta, kind='call') -> int:
    """Binary search for the strike nearest to target_delta, on 50-pt grid."""
    lo, hi = S * 0.6, S * 1.4
    for _ in range(60):
        mid = (lo + hi) / 2
        d = abs(_bs_delta(S, mid, T, r, sigma, kind))
        if d > target_delta:
            lo, hi = (mid, hi) if kind == 'call' else (lo, mid)
        else:
            lo, hi = (lo, mid) if kind == 'call' else (mid, hi)
    raw = (lo + hi) / 2
    return int(round(raw / 50) * 50)


# ── Nearest weekly expiry ─────────────────────────────────────

def next_thursday(from_date: date | None = None) -> date:
    d = from_date or date.today()
    days_ahead = (3 - d.weekday()) % 7   # Thursday = weekday 3
    if days_ahead == 0:
        days_ahead = 7
    return d + timedelta(days=days_ahead)


# ── Leg definition ────────────────────────────────────────────

class Leg(NamedTuple):
    kind:        str    # 'call' or 'put'
    strike:      int
    action:      str    # 'SELL' or 'BUY'
    tradingsymbol: str  # e.g. NIFTY2451724000CE
    expiry:      date


class IronCondor(NamedTuple):
    short_call: Leg
    short_put:  Leg
    long_call:  Leg
    long_put:   Leg
    expiry:     date
    spot:       float
    iv:         float
    t_years:    float


def _nifty_symbol(expiry: date, strike: int, kind: str) -> str:
    """
    Build NSE option trading symbol in Zerodha format.
    Format: NIFTY + YY + M_CODE + DD + STRIKE + CE/PE
    Monthly expiry months: JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC
    Weekly expiry: YY + 1-9/O/N/D (for Oct/Nov/Dec) + DD
    """
    yy  = expiry.strftime('%y')
    mon = expiry.month
    day = expiry.strftime('%d')
    # Weekly expiry month code: 1-9 for Jan-Sep, O=Oct, N=Nov, D=Dec
    week_codes = {1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',
                  7:'7',8:'8',9:'9',10:'O',11:'N',12:'D'}
    m_code = week_codes[mon]
    opt    = 'CE' if kind == 'call' else 'PE'
    return f"NIFTY{yy}{m_code}{day}{strike}{opt}"


def build_iron_condor(spot: float, iv: float | None = None) -> IronCondor:
    """
    Given NIFTY spot price and annualised IV, compute the 4-leg iron condor
    for this week's expiry. If iv is None, estimates from a 15% premium over
    a rough 20-day realized vol proxy (used in paper-trading mode).
    """
    if iv is None:
        iv = 0.14   # conservative fallback ~14%

    expiry   = next_thursday()
    t_cal    = (expiry - date.today()).days
    t_years  = max(t_cal, 1) / 252
    r        = RISK_FREE_RATE

    sc_k = _find_strike(spot, t_years, r, iv, SHORT_DELTA, 'call')
    sp_k = _find_strike(spot, t_years, r, iv, SHORT_DELTA, 'put')
    lc_k = sc_k + WING_WIDTH
    lp_k = sp_k - WING_WIDTH

    return IronCondor(
        short_call = Leg('call', sc_k, 'SELL', _nifty_symbol(expiry, sc_k, 'call'), expiry),
        short_put  = Leg('put',  sp_k, 'SELL', _nifty_symbol(expiry, sp_k, 'put'),  expiry),
        long_call  = Leg('call', lc_k, 'BUY',  _nifty_symbol(expiry, lc_k, 'call'), expiry),
        long_put   = Leg('put',  lp_k, 'BUY',  _nifty_symbol(expiry, lp_k, 'put'),  expiry),
        expiry     = expiry,
        spot       = spot,
        iv         = iv,
        t_years    = t_years,
    )


def print_condor(ic: IronCondor):
    print(f"\n  Iron Condor — NIFTY spot ₹{ic.spot:,.0f}  IV {ic.iv*100:.1f}%  expiry {ic.expiry}")
    print(f"  {'Leg':<12} {'Action':<6} {'Strike':>7}  {'Symbol':<24}")
    print(f"  {'-'*55}")
    for leg in [ic.short_call, ic.short_put, ic.long_call, ic.long_put]:
        print(f"  {leg.kind:<12} {leg.action:<6} {leg.strike:>7}  {leg.tradingsymbol:<24}")
    print()
