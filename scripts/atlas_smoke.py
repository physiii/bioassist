#!/usr/bin/env python3
"""Authenticated desktop/mobile smoke test for the deployed BioAssist Atlas."""

import json
import os
import time

from playwright.sync_api import ConsoleMessage, Error, Page, sync_playwright


BASE_URL = os.environ.get("BIOASSIST_BASE_URL", "http://localhost:15173").rstrip("/")
DESKTOP_SCREENSHOT = os.environ.get("BIOASSIST_DESKTOP_SCREENSHOT", "/tmp/bioassist-atlas-desktop.png")
MOBILE_SCREENSHOT = os.environ.get("BIOASSIST_MOBILE_SCREENSHOT", "/tmp/bioassist-atlas-mobile.png")
PROGRAM_SCREENSHOT = os.environ.get("BIOASSIST_PROGRAM_SCREENSHOT", "/tmp/bioassist-atlas-program.png")


def watch_errors(page: Page, errors: list[str]) -> None:
    def on_console(message: ConsoleMessage) -> None:
        if message.type == "error":
            errors.append(f"console: {message.text}")

    page.on("console", on_console)
    page.on("pageerror", lambda error: errors.append(f"page: {error}"))


def sign_up_and_onboard(page: Page) -> None:
    email = f"atlas-e2e-{time.time_ns()}@example.com"
    page.goto(BASE_URL, wait_until="networkidle", timeout=30_000)
    page.get_by_role("tab", name="Create account").click()
    page.get_by_label("Full name").fill("Atlas E2E")
    page.get_by_label("Email", exact=True).fill(email)
    page.get_by_label("Password", exact=True).fill("pass12345")
    page.get_by_label("Confirm password").fill("pass12345")
    page.get_by_role("button", name="Create account").click()

    page.get_by_role("heading", name="Complete your profile").wait_for()
    page.get_by_role("button", name="Sleep quality or regularity").click()
    page.get_by_role("button", name="Limited time").click()
    page.get_by_role("button", name="Continue to dashboard").click()
    page.get_by_role("heading", name="Home").wait_for()


def verify_atlas(page: Page) -> None:
    page.goto(f"{BASE_URL}/atlas", wait_until="networkidle", timeout=30_000)
    page.get_by_role("heading", name="Your health, mapped without flattening it").wait_for()
    assert page.get_by_text("All sources verified").is_visible()
    assert page.get_by_text("1,494").is_visible()
    assert page.get_by_role("heading", name="15", exact=True).is_visible()

    page.get_by_role("button", name="Organ-system health").click()
    assert page.get_by_text("System-specific measurement registries").is_visible()
    assert page.get_by_text("+11 additional system volumes").is_visible()

    page.get_by_role("tab", name="Source library").click()
    search = page.get_by_label("Search sources, measurements, or initiatives")
    search.fill("spirometry")
    assert page.get_by_text("Respiratory Health and Measurement Engineering").is_visible()
    assert page.get_by_text("1 of 19 canonical volumes").is_visible()

    page.get_by_role("tab", name="Build program").click()
    assert page.get_by_text("Safe reference acquisition stack").is_visible()
    assert page.get_by_text("measurement-quality", exact=True).is_visible()
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(300)
    page.screenshot(path=PROGRAM_SCREENSHOT, full_page=True)

    page.get_by_role("tab", name="Health map").click()
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(300)


def main() -> None:
    errors: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path="/usr/bin/google-chrome")
        desktop_context = browser.new_context(viewport={"width": 1440, "height": 1000})
        desktop = desktop_context.new_page()
        watch_errors(desktop, errors)
        sign_up_and_onboard(desktop)
        verify_atlas(desktop)
        desktop.screenshot(path=DESKTOP_SCREENSHOT, full_page=True)

        storage_state = desktop_context.storage_state()
        mobile_context = browser.new_context(viewport={"width": 390, "height": 844}, storage_state=storage_state)
        mobile = mobile_context.new_page()
        watch_errors(mobile, errors)
        mobile.goto(f"{BASE_URL}/atlas", wait_until="networkidle", timeout=30_000)
        mobile.get_by_role("heading", name="Your health, mapped without flattening it").wait_for()
        assert mobile.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
        mobile.screenshot(path=MOBILE_SCREENSHOT, full_page=True)

        mobile_context.close()
        desktop_context.close()
        browser.close()

    if errors:
        raise AssertionError("Browser errors:\n" + "\n".join(errors))

    print(
        json.dumps(
            {
                "baseUrl": BASE_URL,
                "desktopScreenshot": DESKTOP_SCREENSHOT,
                "mobileScreenshot": MOBILE_SCREENSHOT,
                "programScreenshot": PROGRAM_SCREENSHOT,
                "consoleErrors": 0,
                "result": "pass",
            }
        )
    )


if __name__ == "__main__":
    try:
        main()
    except Error as error:
        raise SystemExit(f"Playwright failure: {error}") from error
