from playwright.sync_api import Page, expect

def test_tab_icons_are_visible(page: Page):
    """
    This test verifies that the icons in the main tab navigator are visible.
    """
    # 1. Arrange: Go to the application's URL.
    page.goto("http://localhost:8081", timeout=90000)

    # 2. Act: Wait for the "Chats" tab to be visible.
    chats_tab = page.get_by_text("Chats", exact=True)
    expect(chats_tab).to_be_visible(timeout=60000)

    # 3. Assert: Check for the presence of each icon.
    # Ionicons are rendered as <i> elements with a specific font-family.
    # We will check that at least one icon is visible.
    chat_icon = page.locator('//i[contains(@style, "font-family: Ionicons")]').first
    expect(chat_icon).to_be_visible()

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")