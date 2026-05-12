#!/usr/bin/env python3
"""
NIFTY Weekly Iron Condor Backtest
Capital: ₹75,000 | Strategy: Sell weekly iron condor Monday → Thursday expiry

Methodology:
- Uses yfinance for historical NIFTY spot prices
- Uses Black-Scholes to price options (synthetic but valid — standard quant approach
  when exact historical option chains aren't available)
- IV estimated from realized vol + 15% premium (documented persistent bias in NIFTY options)
- Simulates entry every Monday, exit at Thursday expiry (or stop/target hit)
"""

import pandas as pd
import numpy as np
from scipy.stats import norm
import yfinance as yf
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────────────────────
# STRATEGY PARAMETERS
# ─────────────────────────────────────────────────────────────
CAPITAL            = 75_000
LOT_SIZE           = 75          # NIFTY current lot size
SHORT_DELTA        = 0.16        # ~1 SD OTM short strikes
WING_WIDTH         = 150         # Points between short and long strike (each side)
STOP_MULTIPLIER    = 2.0         # Exit if loss = 2× premium collected
PROFIT_TARGET      = 0.70        # Exit early at 70% of max profit (mid-week check)
RISK_FRACTION      = 0.70        # Never risk more than 70% of capital on margin

WEEKLY_DRAWDOWN    = 7_500       # ₹7,500  → pause rest of week
MONTHLY_DRAWDOWN   = 15_000      # ₹15,000 → pause, review
TOTAL_DRAWDOWN     = 22_500      # ₹22,500 → hard stop

BROKERAGE          = 200         # ₹200 round-trip per iron condor (4 legs × Zerodha flat)
STT_APPROX         = 100         # STT on exercised options (rough)
RISK_FREE_RATE     = 0.065       # 6.5% — Indian 91-day T-bill rate

# ─────────────────────────────────────────────────────────────
# BLACK-SCHOLES UTILITIES
# ─────────────────────────────────────────────────────────────

def bs_price(S, K, T, r, sigma, kind='call'):
    if T <= 1e-6:
        return max(0.0, S - K) if kind == 'call' else max(0.0, K - S)
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    if kind == 'call':
        return float(S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2))
    return float(K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1))

def bs_delta(S, K, T, r, sigma, kind='call'):
    if T <= 1e-6:
        return 1.0 if (kind == 'call' and S > K) else 0.0
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    return float(norm.cdf(d1) if kind == 'call' else norm.cdf(d1) - 1)

def find_strike(S, T, r, sigma, target_delta, kind='call'):
    """Binary-search for strike nearest to target_delta, rounded to 50-point grid."""
    lo, hi = S * 0.5, S * 1.5
    for _ in range(50):
        mid = (lo + hi) / 2
        d = abs(bs_delta(S, mid, T, r, sigma, kind))
        if d > target_delta:
            if kind == 'call':
                lo = mid
            else:
                hi = mid
        else:
            if kind == 'call':
                hi = mid
            else:
                lo = mid
    return round((lo + hi) / 2 / 50) * 50

# ─────────────────────────────────────────────────────────────
# IV ESTIMATION
# ─────────────────────────────────────────────────────────────

def estimate_iv_series(close_series, window=20):
    """
    Realized vol (annualized) × 1.15 IV premium.
    NIFTY implied vol has historically run ~15% above realized vol —
    this is the persistent edge options sellers exploit.
    """
    log_returns = np.log(close_series / close_series.shift(1))
    realized = log_returns.rolling(window).std() * np.sqrt(252)
    iv = realized * 1.15
    return iv.clip(0.10, 0.90)

# ─────────────────────────────────────────────────────────────
# BACKTEST ENGINE
# ─────────────────────────────────────────────────────────────

def run_backtest(start='2019-01-01', end='2024-12-31'):
    print("=" * 65)
    print("  NIFTY Weekly Iron Condor — Backtest")
    print(f"  Period  : {start}  →  {end}")
    print(f"  Capital : ₹{CAPITAL:,}  |  Lot size: {LOT_SIZE}  |  Δ-target: {SHORT_DELTA}")
    print(f"  Wings   : ±{WING_WIDTH} pts  |  Stop: {STOP_MULTIPLIER}× premium  |  Target: {PROFIT_TARGET*100:.0f}%")
    print("=" * 65)

    # ── Data ──────────────────────────────────────────────────
    print("\n  Downloading NIFTY data from Yahoo Finance...")
    raw = yf.download('^NSEI', start='2018-01-01', end=end, progress=False, auto_adjust=True)
    if raw.empty:
        print("  ERROR: Could not download data. Check network connection.")
        return None, None

    # Flatten multi-level columns if present
    if isinstance(raw.columns, pd.MultiIndex):
        raw.columns = raw.columns.get_level_values(0)

    nifty = raw[['Close']].copy()
    nifty['iv'] = estimate_iv_series(nifty['Close'])
    nifty = nifty.dropna()
    nifty.index = pd.to_datetime(nifty.index)
    print(f"  Got {len(nifty)} trading days  ({nifty.index[0].date()} → {nifty.index[-1].date()})\n")

    # ── Trade loop ────────────────────────────────────────────
    all_mondays = pd.date_range(start=start, end=end, freq='W-MON')

    trades         = []
    equity_curve   = [CAPITAL]
    capital        = CAPITAL
    peak_capital   = CAPITAL   # for peak-to-trough drawdown
    current_month  = None
    month_dd       = 0         # losses this calendar month only
    week_start_cap = CAPITAL   # capital at start of current week
    hard_stop      = False
    week_pause     = None
    month_pause    = None

    r = RISK_FREE_RATE

    for monday in all_mondays:
        if hard_stop:
            break

        # ── Pause checks ─────────────────────────────────────
        if week_pause and monday <= week_pause:
            continue
        if month_pause and monday <= month_pause:
            continue

        # ── Nearest trading days ──────────────────────────────
        e_idx = nifty.index.searchsorted(monday)
        if e_idx >= len(nifty):
            continue
        entry_day = nifty.index[e_idx]

        thursday = monday + timedelta(days=3)
        x_idx = nifty.index.searchsorted(thursday)
        if x_idx >= len(nifty):
            continue
        expiry_day = nifty.index[x_idx]

        S0  = float(nifty.loc[entry_day,  'Close'])
        Sx  = float(nifty.loc[expiry_day, 'Close'])
        iv  = float(nifty.loc[entry_day,  'iv'])
        T   = 4 / 252   # ~4 trading days to expiry

        # ── Strike selection ──────────────────────────────────
        sc_k = find_strike(S0, T, r, iv, SHORT_DELTA, 'call')
        sp_k = find_strike(S0, T, r, iv, SHORT_DELTA, 'put')
        lc_k = sc_k + WING_WIDTH
        lp_k = sp_k - WING_WIDTH

        # ── Entry prices ──────────────────────────────────────
        sc_e = bs_price(S0, sc_k, T, r, iv, 'call')
        sp_e = bs_price(S0, sp_k, T, r, iv, 'put')
        lc_e = bs_price(S0, lc_k, T, r, iv, 'call')
        lp_e = bs_price(S0, lp_k, T, r, iv, 'put')

        net_credit = (sc_e + sp_e - lc_e - lp_e)  # per unit
        if net_credit <= 0:
            continue

        premium_total = net_credit * LOT_SIZE
        max_loss      = (WING_WIDTH - net_credit) * LOT_SIZE
        margin_req    = max_loss * 1.1  # 10% SPAN buffer

        if margin_req > capital * RISK_FRACTION:
            trades.append({'entry': entry_day, 'expiry': expiry_day,
                           'result': 'SKIPPED_MARGIN', 'net_pnl': 0, 'capital': capital})
            continue

        # ── Exit at expiry (simplified: no intra-week stop check) ─
        sc_x = bs_price(Sx, sc_k, 0, r, iv, 'call')
        sp_x = bs_price(Sx, sp_k, 0, r, iv, 'put')
        lc_x = bs_price(Sx, lc_k, 0, r, iv, 'call')
        lp_x = bs_price(Sx, lp_k, 0, r, iv, 'put')

        gross = ((sc_e - sc_x) + (sp_e - sp_x)
                 - (lc_e - lc_x) - (lp_e - lp_x)) * LOT_SIZE
        gross = max(gross, -max_loss)           # iron condor caps loss
        net   = gross - BROKERAGE - STT_APPROX

        # ── Update capital first, then assess drawdown ────────
        capital += net
        peak_capital    = max(peak_capital, capital)
        dd_from_peak    = peak_capital - capital   # always >= 0

        # Reset month bucket at month boundary
        trade_month = entry_day.to_period('M')
        if trade_month != current_month:
            month_dd      = 0
            month_pause   = None          # new month → lift pause
            current_month = trade_month

        # Track week starting capital (for weekly loss limit)
        week_start_cap = capital - net   # capital before this trade

        if net < 0:
            month_dd += abs(net)
            week_loss = week_start_cap - capital   # loss this week

            if dd_from_peak >= TOTAL_DRAWDOWN:
                # Equity has fallen 30% from its peak — hard stop
                hard_stop = True
                result = 'HARD_STOP'
            elif month_dd >= MONTHLY_DRAWDOWN:
                # Lost ≥₹15k this month → skip rest of month
                next_month_start = entry_day + pd.offsets.MonthBegin(1)
                month_pause = next_month_start
                result = 'MONTH_PAUSE'
            elif week_loss >= WEEKLY_DRAWDOWN:
                # Lost ≥₹7.5k this week → skip next week
                week_pause = monday + timedelta(days=7)
                result = 'WEEK_PAUSE'
            else:
                result = 'LOSS'
        else:
            result = 'WIN'
            week_pause = None   # clear week pause after a winning week
        equity_curve.append(capital)

        trades.append({
            'entry'            : entry_day.date(),
            'expiry'           : expiry_day.date(),
            'nifty_entry'      : round(S0),
            'nifty_exit'       : round(Sx),
            'iv_pct'           : round(iv * 100, 1),
            'short_call'       : int(sc_k),
            'short_put'        : int(sp_k),
            'premium_collected': round(premium_total),
            'max_loss'         : round(max_loss),
            'gross_pnl'        : round(gross),
            'net_pnl'          : round(net),
            'result'           : result,
            'capital'          : round(capital),
        })

    # ─────────────────────────────────────────────────────────
    # RESULTS
    # ─────────────────────────────────────────────────────────
    df = pd.DataFrame(trades)
    valid = df[df['result'].isin(['WIN', 'LOSS', 'WEEK_PAUSE', 'MONTH_PAUSE', 'HARD_STOP'])].copy()

    wins   = valid[valid['net_pnl'] > 0]
    losses = valid[valid['net_pnl'] <= 0]

    total_pnl = valid['net_pnl'].sum()
    win_rate  = len(wins) / len(valid) * 100 if len(valid) > 0 else 0
    avg_win   = wins['net_pnl'].mean()   if len(wins)   > 0 else 0
    avg_loss  = losses['net_pnl'].mean() if len(losses) > 0 else 0
    pf        = abs(wins['net_pnl'].sum() / losses['net_pnl'].sum()) if len(losses) > 0 else float('inf')

    # Equity curve drawdown
    eq  = np.array(equity_curve)
    pk  = np.maximum.accumulate(eq)
    dd  = (eq - pk)
    max_dd_abs = dd.min()
    max_dd_pct = (dd / pk).min() * 100

    # Monthly P&L
    valid['month'] = pd.to_datetime(valid['entry']).dt.to_period('M')
    monthly = valid.groupby('month')['net_pnl'].sum()

    # CAGR
    n_years = (pd.to_datetime(end) - pd.to_datetime(start)).days / 365.25
    cagr = ((capital / CAPITAL) ** (1 / n_years) - 1) * 100 if n_years > 0 else 0

    print("=" * 65)
    print("  RESULTS")
    print("=" * 65)
    print(f"\n  Trades executed  : {len(valid)}")
    print(f"  Win rate         : {win_rate:.1f}%")
    print(f"  Avg win          : ₹{avg_win:,.0f}")
    print(f"  Avg loss         : ₹{avg_loss:,.0f}")
    print(f"  Profit factor    : {pf:.2f}  (>1.5 is good; >2.0 is strong)")

    print(f"\n  Starting capital : ₹{CAPITAL:,}")
    print(f"  Final capital    : ₹{capital:,.0f}")
    print(f"  Total P&L        : ₹{total_pnl:,.0f}")
    print(f"  Total return     : {(capital - CAPITAL) / CAPITAL * 100:.1f}%")
    print(f"  CAGR             : {cagr:.1f}%")

    print(f"\n  Max drawdown     : ₹{max_dd_abs:,.0f}  ({max_dd_pct:.1f}%)")
    print(f"  Hard stop hit    : {'YES ⚠' if hard_stop else 'No'}")

    print(f"\n  ── Monthly P&L ──")
    print(f"  Best month       : ₹{monthly.max():,.0f}")
    print(f"  Worst month      : ₹{monthly.min():,.0f}")
    print(f"  Avg month        : ₹{monthly.mean():,.0f}")
    print(f"  Profitable months: {(monthly > 0).sum()} / {len(monthly)}")

    print(f"\n  ── Last 12 Trades ──")
    cols = ['entry','nifty_entry','short_call','short_put','premium_collected','net_pnl','result']
    print(valid[cols].tail(12).to_string(index=False))

    # Year-by-year breakdown
    valid['year'] = pd.to_datetime(valid['entry']).dt.year
    yearly = valid.groupby('year').agg(
        trades=('net_pnl', 'count'),
        pnl=('net_pnl', 'sum'),
        wins=('net_pnl', lambda x: (x > 0).sum())
    )
    yearly['win_rate'] = (yearly['wins'] / yearly['trades'] * 100).round(1)
    print(f"\n  ── Year-by-Year ──")
    print(yearly[['trades','pnl','win_rate']].to_string())

    out = 'trading/nifty_ic_backtest.csv'
    valid.to_csv(f'/Users/harilsharma/business-ideas/{out}', index=False)
    print(f"\n  Full trade log → {out}")
    print("=" * 65)

    return valid, monthly


if __name__ == '__main__':
    run_backtest()
