"""
Zerodha Kite Connect authentication using Playwright (headless Chromium).

Daily flow:
  1. Check if a valid access_token is cached for today.
  2. If not, launch a headless browser, complete login + TOTP + consent,
     extract the request_token from the final redirect URL.
  3. Exchange request_token for access_token via KiteConnect SDK.
  4. Cache the token with today's date so subsequent calls are instant.
"""

import os, json
from datetime import date

import pyotp
from playwright.sync_api import sync_playwright
from kiteconnect import KiteConnect

from .config import (
    KITE_API_KEY, KITE_API_SECRET,
    KITE_USER_ID, KITE_PASSWORD, KITE_TOTP_SECRET,
    TOKEN_FILE,
)


def _load_cached_token():
    if not os.path.exists(TOKEN_FILE):
        return None
    try:
        with open(TOKEN_FILE) as f:
            data = json.load(f)
        if data.get('date') == str(date.today()):
            return data.get('access_token')
    except Exception:
        pass
    return None


def _save_token(access_token: str):
    with open(TOKEN_FILE, 'w') as f:
        json.dump({'date': str(date.today()), 'access_token': access_token}, f)


def _get_request_token() -> str:
    """
    Launches a headless Chromium browser, completes:
      1. Password login
      2. TOTP 2FA
      3. Clicks the Authorise button on the Kite Connect consent page
    Returns the request_token from the final redirect URL.
    """
    login_url = f'https://kite.trade/connect/login?api_key={KITE_API_KEY}&v=3'
    request_token = None

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage'],
        )
        page = browser.new_page()

        # Intercept the final redirect to 127.0.0.1 — it won't load but
        # we capture the URL before the connection error fires.
        def handle_request(req):
            nonlocal request_token
            if '127.0.0.1' in req.url and 'request_token' in req.url:
                import re
                m = re.search(r'request_token=([^&]+)', req.url)
                if m:
                    request_token = m.group(1)

        page.on('request', handle_request)

        print("[auth] Launching headless browser for login...")
        page.goto(login_url, wait_until='domcontentloaded')
        page.screenshot(path='/tmp/kite_step1_login.png')
        print(f"[auth] Step 1 URL: {page.url}")

        # Step 1 — fill credentials
        page.wait_for_selector('input[type="text"]', timeout=15000)
        page.fill('input[type="text"]', KITE_USER_ID)
        page.fill('input[type="password"]', KITE_PASSWORD)
        page.click('button[type="submit"]')
        page.wait_for_timeout(2000)
        page.screenshot(path='/tmp/kite_step2_after_password.png')
        print(f"[auth] Step 2 URL: {page.url}")

        # Step 2 — fill TOTP (try all possible selectors Zerodha uses)
        totp_selectors = [
            'input[type="number"]',
            'input[type="text"][maxlength="6"]',
            'input[autocomplete="one-time-code"]',
            'input[placeholder*="OTP"]',
            'input[placeholder*="TOTP"]',
            'input[placeholder*="code"]',
        ]
        totp_filled = False
        for sel in totp_selectors:
            try:
                page.wait_for_selector(sel, timeout=3000)
                totp_code = pyotp.TOTP(KITE_TOTP_SECRET).now()
                page.fill(sel, totp_code)
                print(f"[auth] TOTP filled using selector: {sel}")
                totp_filled = True
                break
            except Exception:
                continue

        if not totp_filled:
            page.screenshot(path='/tmp/kite_step2_totp_fail.png')
            raise RuntimeError("Could not find TOTP input field. Screenshot saved.")

        # Submit TOTP — click the Continue button explicitly
        page.screenshot(path='/tmp/kite_step3_before_continue.png')
        print(f"[auth] Step 3 URL before continue: {page.url}")
        try:
            page.wait_for_selector(
                'button:has-text("Continue"), button[type="submit"]',
                timeout=5000,
            )
            page.click('button:has-text("Continue"), button[type="submit"]')
            print("[auth] Clicked Continue button after TOTP")
        except Exception:
            # Fallback: press Enter if button not found
            print("[auth] Continue button not found, pressing Enter")
            page.keyboard.press('Enter')

        # Wait for the consent page to fully load (networkidle catches React hydration)
        try:
            page.wait_for_load_state('networkidle', timeout=15000)
        except Exception:
            pass  # not critical — just ensures SPA has settled

        page.screenshot(path='/tmp/kite_step3_after_totp.png')
        print(f"[auth] Step 3 URL after continue: {page.url}")

        # Step 3 — click Authorise on Kite Connect consent page
        try:
            page.wait_for_selector(
                'button:has-text("Authorise"), button:has-text("Authorize")',
                timeout=30000,
            )
            page.screenshot(path='/tmp/kite_step4_authorise.png')
            page.click('button:has-text("Authorise"), button:has-text("Authorize")')
        except Exception:
            page.screenshot(path='/tmp/kite_step4_authorise_fail.png')
            raise RuntimeError(
                f"Timed out waiting for Authorise button at URL: {page.url} "
                "— screenshots saved to /tmp/kite_step*.png"
            )

        # Wait for the redirect to 127.0.0.1 (captured by request handler)
        page.wait_for_timeout(4000)
        browser.close()

    if not request_token:
        raise RuntimeError("Could not capture request_token from redirect. Check credentials or TOTP secret.")

    print(f"[auth] request_token captured.")
    return request_token


def get_kite() -> KiteConnect:
    """
    Returns an authenticated KiteConnect instance.
    Uses a cached token if valid for today; otherwise re-authenticates.
    """
    kite = KiteConnect(api_key=KITE_API_KEY)

    access_token = _load_cached_token()
    if access_token:
        kite.set_access_token(access_token)
        print("[auth] Using cached token for today.")
        return kite

    print("[auth] No valid token — running automated login...")
    request_token = _get_request_token()

    data = kite.generate_session(request_token, api_secret=KITE_API_SECRET)
    access_token = data['access_token']
    _save_token(access_token)
    kite.set_access_token(access_token)
    print(f"[auth] Login successful. Token cached for {date.today()}.")
    return kite
