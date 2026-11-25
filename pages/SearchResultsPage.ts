import { Page } from '@playwright/test';

export class SearchResultsPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Checks whether the requested product appears in search results.
   * @param productName - Product name
   * @returns Promise<boolean>
   */
  async isProductExists(productName: string): Promise<boolean> {
    try {
      const product = this.page
        .locator('.product-thumb')
        .getByText(productName, { exact: true })
        .first();
      await product.waitFor({ state: 'visible' });
      return await product.isVisible();
    } catch (error) {
      console.log(`Error checking search result: ${error}`);
      return false;
    }
  }

  /**
   * Opens a product from the search results.
   * @param productName - Product name
   * @returns Promise<void>
   */
  async openProduct(productName: string): Promise<void> {
    await this.page
      .locator('.product-thumb')
      .filter({ hasText: productName })
      .getByRole('link', { name: productName, exact: true })
      .first()
      .click();
  }
}
