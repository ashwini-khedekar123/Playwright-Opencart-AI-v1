import { Locator, Page } from '@playwright/test';

export class RegisterPage {
  private readonly page: Page;

  // Locators
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly telephoneInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly privacyCheckbox: Locator;
  private readonly continueButton: Locator;
  private readonly accountCreatedHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible names and stable selectors
    this.firstNameInput = page.getByLabel('First Name');
    this.lastNameInput = page.getByLabel('Last Name');
    this.emailInput = page.getByLabel('E-Mail');
    this.telephoneInput = page.getByLabel('Telephone');
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Password Confirm');
    this.privacyCheckbox = page.locator('input[name="agree"]');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.accountCreatedHeading = page.getByRole('heading', { name: 'Your Account Has Been Created!' });
  }

  /**
   * Registers a customer with generated details.
   * @param firstName - Customer first name
   * @param lastName - Customer last name
   * @param email - Customer email address
   * @param telephone - Customer telephone number
   * @param password - Customer password
   * @returns Promise<void>
   */
  async register(firstName: string, lastName: string, email: string, telephone: string, password: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.telephoneInput.fill(telephone);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.privacyCheckbox.check();
    await this.continueButton.click();
  }

  /**
   * Checks whether the registration form is displayed.
   * @returns Promise<boolean>
   */
  async isRegisterPageExists(): Promise<boolean> {
    try {
      const heading = this.page.getByRole('heading', { name: 'Register Account' });
      await heading.waitFor({ state: 'visible' });
      return await heading.isVisible();
    } catch (error) {
      console.log(`Error checking registration page: ${error}`);
      return false;
    }
  }

  /**
   * Checks whether account creation succeeded.
   * @returns Promise<boolean>
   */
  async isAccountCreated(): Promise<boolean> {
    try {
      await this.accountCreatedHeading.waitFor({ state: 'visible' });
      return await this.accountCreatedHeading.isVisible();
    } catch (error) {
      console.log(`Error checking account-created confirmation: ${error}`);
      return false;
    }
  }

  /**
   * Continues from the confirmation page to the account area.
   * @returns Promise<void>
   */
  async continueToAccount(): Promise<void> {
    await this.page.getByRole('link', { name: 'Continue' }).click();
  }
}
