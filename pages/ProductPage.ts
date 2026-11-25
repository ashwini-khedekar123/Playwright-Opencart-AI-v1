import { Locator, Page } from '@playwright/test';

export class ProductPage {
  private readonly page: Page;

  // Locators
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;
  private readonly successAlert: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible names and stable selectors
    this.quantityInput = page.getByRole('textbox', { name: 'Qty' });
    this.addToCartButton = page.locator('#button-cart');
    this.successAlert = page.locator('.alert-success');
  }

  /**
   * Checks whether the requested product details are displayed.
   * @param productName - Product name
   * @returns Promise<boolean>
   */
  async isProductPageExists(productName: string): Promise<boolean> {
    try {
      const heading = this.page.getByRole('heading', { level: 1, name: productName });
      await heading.waitFor({ state: 'visible' });
      return await heading.isVisible();
    } catch (error) {
      console.log(`Error checking product page: ${error}`);
      return false;
    }
  }

  /**
   * Adds the selected quantity to the cart.
   * @param quantity - Quantity to add
   * @returns Promise<void>
   */
  async addToCart(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
    await this.addToCartButton.click();
  }

  /**
   * Checks whether the cart confirmation is visible.
   * @param productName - Product name
   * @returns Promise<boolean>
   */
  async isSuccessMessageVisible(productName: string): Promise<boolean> {
    try {
      const alert = this.successAlert.filter({ hasText: productName });
      await alert.waitFor({ state: 'visible' });
      return await alert.isVisible();
    } catch (error) {
      console.log(`Error checking product success message: ${error}`);
      return false;
    }
  }
}
