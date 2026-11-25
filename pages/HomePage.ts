import { Locator, Page } from '@playwright/test';

export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly accountLink: Locator;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with selectors verified on the live page
    this.accountLink = page.locator('a[href*="route=account/account"]').first();
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
    this.searchButton = page.locator('#search button');
  }

  /**
   * Opens the My Account page.
   * @returns Promise<void>
   */
  async openMyAccount(): Promise<void> {
    await this.accountLink.click();
  }

  /**
   * Opens the registration form from the account menu.
   * @returns Promise<void>
   */
  async openRegistration(): Promise<void> {
    await this.openMyAccount();
    await this.page.getByRole('link', { name: 'Register', exact: true }).click();
  }

  /**
   * Opens the login form from the account menu.
   * @returns Promise<void>
   */
  async openLogin(): Promise<void> {
    await this.openMyAccount();
    await this.page.getByRole('link', { name: 'Login', exact: true }).click();
  }

  /**
   * Searches for a product.
   * @param productName - Product name to search
   * @returns Promise<void>
   */
  async searchForProduct(productName: string): Promise<void> {
    await this.searchInput.fill(productName);
    await this.searchButton.click();
  }
}
