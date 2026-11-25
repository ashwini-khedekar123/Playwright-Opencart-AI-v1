import { Locator, Page } from '@playwright/test';

export class AccountPage {
  private readonly page: Page;

  // Locators
  private readonly accountHeading: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible roles and page section
    this.accountHeading = page.locator('#content').getByRole('heading', { name: 'My Account' });
    this.logoutLink = page.locator('#column-right').getByRole('link', { name: 'Logout' });
  }

  /**
   * Checks whether the customer account page is displayed.
   * @returns Promise<boolean>
   */
  async isAccountPageExists(): Promise<boolean> {
    try {
      await this.accountHeading.waitFor({ state: 'visible' });
      return await this.accountHeading.isVisible();
    } catch (error) {
      console.log(`Error checking account page: ${error}`);
      return false;
    }
  }

  /**
   * Logs out the authenticated customer.
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    await this.logoutLink.click();
  }
}
