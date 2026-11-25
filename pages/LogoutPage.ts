import { Locator, Page } from '@playwright/test';

export class LogoutPage {
  private readonly page: Page;

  // Locators
  private readonly logoutHeading: Locator;
  private readonly continueLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible roles
    this.logoutHeading = page.getByRole('heading', { name: 'Account Logout' });
    this.continueLink = page.getByRole('link', { name: 'Continue' });
  }

  /**
   * Checks whether the logout confirmation page is displayed.
   * @returns Promise<boolean>
   */
  async isLogoutPageExists(): Promise<boolean> {
    try {
      await this.logoutHeading.waitFor({ state: 'visible' });
      return await this.logoutHeading.isVisible();
    } catch (error) {
      console.log(`Error checking logout page: ${error}`);
      return false;
    }
  }

  /**
   * Continues to the storefront.
   * @returns Promise<void>
   */
  async continueToStore(): Promise<void> {
    await this.continueLink.click();
  }
}
