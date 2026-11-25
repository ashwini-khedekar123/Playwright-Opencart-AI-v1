/**
 * Test Case: End-to-end customer shopping flow
 *
 * Tags: @master @sanity @regression @end-to-end @web
 *
 * Steps:
 * 1) Register a new customer
 * 2) Log out and log in again
 * 3) Search for the configured product
 * 4) Add the product to the cart
 * 5) Verify the cart product, quantity, price, and total
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('End-to-end shopping flow @master @sanity @regression @end-to-end @web', async ({
  homePage,
  registerPage,
  loginPage,
  accountPage,
  logoutPage,
  searchResultsPage,
  productPage,
  cartPage,
}) => {
  const firstName = RandomDataUtil.getFirstName();
  const lastName = RandomDataUtil.getLastName();
  const email = `playwright_${Date.now()}_${RandomDataUtil.getNumber()}@example.com`;
  const telephone = RandomDataUtil.getPhoneNumber();
  const password = `Test@${RandomDataUtil.getPassword(12)}`;
  const productName = process.env.PRODUCT_NAME ?? '';
  const quantity = Number(process.env.PRODUCT_QUANTITY);
  const expectedTotal = process.env.TOTAL_PRICE ?? '';

  await test.step('1) Register a new customer', async () => {
    expect(productName, 'Set PRODUCT_NAME in .env').toBeTruthy();
    expect(Number.isInteger(quantity) && quantity > 0, 'Set PRODUCT_QUANTITY to a positive integer in .env').toBeTruthy();
    expect(expectedTotal, 'Set TOTAL_PRICE in .env').toBeTruthy();

    await homePage.openRegistration();
    expect(await registerPage.isRegisterPageExists(), 'Registration form should be displayed').toBeTruthy();

    await registerPage.register(firstName, lastName, email, telephone, password);
    expect(await registerPage.isAccountCreated(), 'Registration confirmation should be displayed').toBeTruthy();
    await registerPage.continueToAccount();
    expect(await accountPage.isAccountPageExists(), 'New customer should reach My Account').toBeTruthy();
  });

  await test.step('2) Log out and log in with the new credentials', async () => {
    await accountPage.logout();
    expect(await logoutPage.isLogoutPageExists(), 'Logout confirmation should be displayed').toBeTruthy();
    await logoutPage.continueToStore();

    await homePage.openLogin();
    expect(await loginPage.isLoginPageExists(), 'Login page should be displayed after logout').toBeTruthy();
    await loginPage.login(email, password);
    expect(await accountPage.isAccountPageExists(), 'New customer should log in to My Account').toBeTruthy();
  });

  await test.step('3) Search for the configured product', async () => {
    await homePage.searchForProduct(productName);
    expect(
      await searchResultsPage.isProductExists(productName),
      `Search results should include ${productName}`,
    ).toBeTruthy();
  });

  await test.step('4) Add the product to the cart', async () => {
    await searchResultsPage.openProduct(productName);
    expect(await productPage.isProductPageExists(productName), 'Product details should be displayed').toBeTruthy();
    await productPage.addToCart(quantity);
    expect(
      await productPage.isSuccessMessageVisible(productName),
      `Cart confirmation should mention ${productName}`,
    ).toBeTruthy();
  });

  await test.step('5) Verify product, quantity, price, and cart total', async () => {
    await cartPage.openCart();
    expect(await cartPage.isCartPageExists(), 'Shopping Cart page should be displayed').toBeTruthy();
    expect(await cartPage.isProductInCart(productName), `${productName} should be in the cart`).toBeTruthy();
    expect(await cartPage.getProductQuantity(productName), 'Cart quantity should match PRODUCT_QUANTITY').toBe(
      String(quantity),
    );
    expect(await cartPage.getProductUnitPrice(productName), 'Product price should match TOTAL_PRICE').toContain(
      expectedTotal,
    );
    expect(await cartPage.getCartTotal(), 'Cart total should match TOTAL_PRICE').toContain(expectedTotal);
  });

  console.log('✅ End-to-end shopping flow completed');
});
