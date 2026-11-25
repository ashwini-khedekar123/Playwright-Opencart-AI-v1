import { Locator, Page } from '@playwright/test';

export class CartPage {
  private readonly page: Page;

  // Locators
  private readonly cartHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with accessible roles
    this.cartHeading = page.getByRole('heading', { name: 'Shopping Cart' });
  }

  /**
   * Opens the shopping cart.
   * @returns Promise<void>
   */
  async openCart(): Promise<void> {
    await this.page.goto('https://awesomeqa.com/ui/index.php?route=checkout/cart');
  }

  /**
   * Checks whether the shopping cart page is displayed.
   * @returns Promise<boolean>
   */
  async isCartPageExists(): Promise<boolean> {
    try {
      await this.cartHeading.waitFor({ state: 'visible' });
      return await this.cartHeading.isVisible();
    } catch (error) {
      console.log(`Error checking cart page: ${error}`);
      return false;
    }
  }

  /**
   * Checks whether the selected product is in the cart.
   * @param productName - Product name
   * @returns Promise<boolean>
   */
  async isProductInCart(productName: string): Promise<boolean> {
    const row = this.getProductRow(productName);
    await row.waitFor({ state: 'visible' });
    return await row.isVisible();
  }

  /**
   * Reads the quantity for a cart product.
   * @param productName - Product name
   * @returns Promise<string>
   */
  async getProductQuantity(productName: string): Promise<string> {
    return await this.getProductRow(productName).locator('input[name^="quantity"]').inputValue();
  }

  /**
   * Reads the unit price for a cart product.
   * @param productName - Product name
   * @returns Promise<string>
   */
  async getProductUnitPrice(productName: string): Promise<string> {
    return await this.getProductRow(productName).locator('td').nth(4).innerText();
  }

  /**
   * Reads the final cart total.
   * @returns Promise<string>
   */
  async getCartTotal(): Promise<string> {
    const totalRow = this.page.locator('#content tr').filter({ hasText: 'Total:' });
    return await totalRow.locator('td').last().innerText();
  }

  private getProductRow(productName: string): Locator {
    return this.page.getByRole('row').filter({ hasText: productName });
  }
}
