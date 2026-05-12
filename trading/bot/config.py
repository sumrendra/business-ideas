"""
Strategy configuration — single source of truth for all parameters.
Edit here; nothing else needs changing.
"""
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# ── Capital & risk ────────────────────────────────────────────
CAPITAL             = int(os.getenv('CAPITAL',          75_000))
WEEKLY_DRAWDOWN     = int(os.getenv('WEEKLY_DRAWDOWN',   7_500))
MONTHLY_DRAWDOWN    = int(os.getenv('MONTHLY_DRAWDOWN', 15_000))
TOTAL_DRAWDOWN      = int(os.getenv('TOTAL_DRAWDOWN',   22_500))
RISK_FRACTION       = 0.70   # max % of capital used as margin
RISK_FREE_RATE      = 0.065  # 6.5% — Indian 91-day T-bill rate

# ── Iron condor parameters ────────────────────────────────────
LOT_SIZE            = 75     # NIFTY current lot size
SHORT_DELTA         = 0.16   # ~1 SD OTM
WING_WIDTH          = 150    # points between short and long strike

# ── Zerodha credentials ───────────────────────────────────────
KITE_API_KEY        = os.getenv('KITE_API_KEY',    '')
KITE_API_SECRET     = os.getenv('KITE_API_SECRET', '')
KITE_USER_ID        = os.getenv('KITE_USER_ID',    '')
KITE_PASSWORD       = os.getenv('KITE_PASSWORD',   '')
KITE_TOTP_SECRET    = os.getenv('KITE_TOTP_SECRET','')

# ── State file paths — works in both local and GitHub Actions CI ──
_TRADING_DIR        = os.path.join(os.path.dirname(__file__), '..')
TOKEN_FILE          = os.path.join(_TRADING_DIR, '.kite_token')
JOURNAL_FILE        = os.path.join(_TRADING_DIR, 'trade_journal.csv')
STATE_FILE_DEFAULT  = os.path.join(_TRADING_DIR, '.bot_state.json')

# ── Exchange / instrument ─────────────────────────────────────
EXCHANGE            = 'NFO'
UNDERLYING          = 'NIFTY'
UNDERLYING_EXCHANGE = 'NSE'
UNDERLYING_SYMBOL   = 'NIFTY 50'
