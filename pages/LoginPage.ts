import { Locator, Page } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;

  // Locators
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible names
    this.emailInput = page.getByLabel('E-Mail Address');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  /**
   * Logs in a customer.
   * @param email - Customer email address
   * @param password - Customer password
   * @returns Promise<void>
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Checks whether the login page is displayed.
   * @returns Promise<boolean>
   */
  async isLoginPageExists(): Promise<boolean> {
    try {
      const heading = this.page.getByRole('heading', { name: 'Returning Customer' });
      await heading.waitFor({ state: 'visible' });
      return await heading.isVisible();
    } catch (error) {
      console.log(`Error checking login page: ${error}`);
      return false;
    }
  }
}
