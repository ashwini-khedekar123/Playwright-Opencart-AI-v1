import { expect, test } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import path from 'path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

test.describe('FakeStore API Tests', () => {
  // ---------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------

  const BASE_URL = (process.env.API_BASE_URL || Routes.BASE_URL).replace(/\/$/, '');
  const VALID_USERNAME = process.env.API_USERNAME ?? '';
  const VALID_PASSWORD = process.env.API_PASSWORD ?? '';
  const PRODUCT_ID = Number(process.env.PRODUCT_ID);
  const USER_ID = Number(process.env.USER_ID);
  const CART_ID = Number(process.env.CART_ID);
  const LIMIT = Number(process.env.LIMIT);
  const START_DATE = process.env.START_DATE ?? '';
  const END_DATE = process.env.END_DATE ?? '';

  // ---------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------

  test('POST - Successful login @master @sanity @api', async ({ request }) => {
    expect(VALID_USERNAME, 'Set API_USERNAME in .env to run the valid-login test').toBeTruthy();
    expect(VALID_PASSWORD, 'Set API_PASSWORD in .env to run the valid-login test').toBeTruthy();

    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: { username: VALID_USERNAME, password: VALID_PASSWORD },
    });

    expect(response.status(), 'Valid login should return HTTP 201').toBe(201);
    const body = await response.json();
    expect(typeof body.token, 'Login response token should be a string').toBe('string');
    expect(body.token, 'Login response token should not be empty').toBeTruthy();
  });

  test('POST - Invalid login @master @regression @api', async ({ request }) => {
    const payload = RandomDataUtil.generateInvalidLoginPayload();
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, { data: payload });

    expect(response.status(), 'Invalid login should return HTTP 401').toBe(401);
    const body = await response.text();
    expect(body, 'Invalid login should return the documented error').toBe(
      'username or password is incorrect',
    );
  });

  // ---------------------------------------------------------
  // Products - GET
  // ---------------------------------------------------------

  test('GET - All products @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status(), 'Product list should return HTTP 200').toBe(200);

    const products = await response.json();
    expect(Array.isArray(products), 'Product response should be an array').toBeTruthy();
    expect(products.length, 'Product list should not be empty').toBeGreaterThan(0);
    for (const product of products) {
      expect(typeof product.id, 'Product id should be a number').toBe('number');
      expect(typeof product.title, 'Product title should be a string').toBe('string');
      expect(typeof product.price, 'Product price should be a number').toBe('number');
      expect(typeof product.category, 'Product category should be a string').toBe('string');
      expect(typeof product.image, 'Product image should be a string').toBe('string');
    }
  });

  test('GET - Product by ID @master @sanity @api', async ({ request }) => {
    expect(Number.isInteger(PRODUCT_ID), 'Set PRODUCT_ID to a valid integer in .env').toBeTruthy();
    const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Product lookup should return HTTP 200').toBe(200);

    const product = await response.json();
    expect(product.id, 'Returned product id should match PRODUCT_ID').toBe(PRODUCT_ID);
    expect(typeof product.title, 'Product title should be a string').toBe('string');
    expect(typeof product.price, 'Product price should be a number').toBe('number');
    expect(typeof product.category, 'Product category should be a string').toBe('string');
    expect(typeof product.image, 'Product image should be a string').toBe('string');
  });

  test('GET - Products with limit @master @sanity @api', async ({ request }) => {
    expect(Number.isInteger(LIMIT) && LIMIT > 0, 'Set LIMIT to a positive integer in .env').toBeTruthy();
    const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Limited product list should return HTTP 200').toBe(200);

    const products = await response.json();
    expect(Array.isArray(products), 'Limited product response should be an array').toBeTruthy();
    expect(products.length, 'Product count should match LIMIT').toBe(LIMIT);
  });

  test('GET - Products sorted ascending @master @regression @api', async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'asc');
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Ascending product sort should return HTTP 200').toBe(200);

    const products = await response.json();
    const ids = products.map((product: { id: number }) => product.id);
    expect(ids, 'Product ids should be in ascending order').toEqual([...ids].sort((a, b) => a - b));
  });

  test('GET - Products sorted descending @master @regression @api', async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'desc');
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Descending product sort should return HTTP 200').toBe(200);

    const products = await response.json();
    const ids = products.map((product: { id: number }) => product.id);
    expect(ids, 'Product ids should be in descending order').toEqual([...ids].sort((a, b) => b - a));
  });

  test('GET - All product categories @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
    expect(response.status(), 'Category list should return HTTP 200').toBe(200);

    const categories = await response.json();
    expect(Array.isArray(categories), 'Category response should be an array').toBeTruthy();
    expect(categories.length, 'Category list should not be empty').toBeGreaterThan(0);
    expect(categories.every((category: unknown) => typeof category === 'string')).toBeTruthy();
  });

  test('GET - Products by category @master @sanity @api', async ({ request }) => {
    const category = 'electronics';
    const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', encodeURIComponent(category));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Category product lookup should return HTTP 200').toBe(200);

    const products = await response.json();
    expect(Array.isArray(products), 'Category product response should be an array').toBeTruthy();
    expect(
      products.every((product: { category: string }) => product.category === category),
      'Every returned product should belong to the requested category',
    ).toBeTruthy();
  });

  // ---------------------------------------------------------
  // Products - POST / PUT / DELETE
  // ---------------------------------------------------------

  test('POST - Create product @master @regression @api', async ({ request }) => {
    const payload = RandomDataUtil.generateProductPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: payload });
    expect(response.status(), 'Product creation should return HTTP 201').toBe(201);

    const created = await response.json();
    expect(created.id, 'Created product should include an id').toBeTruthy();
    expect(created.title, 'Created product title should match the request').toBe(payload.title);
    expect(created.price, 'Created product price should match the request').toBe(payload.price);
    expect(created.description, 'Created product description should match the request').toBe(payload.description);
    expect(created.image, 'Created product image should match the request').toBe(payload.image);
    expect(created.category, 'Created product category should match the request').toBe(payload.category);

    const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(created.id));
    const cleanupResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(cleanupResponse.status(), 'Created product cleanup should return HTTP 200').toBe(200);
  });

  test('PUT - Update product @master @regression @api', async ({ request }) => {
    expect(Number.isInteger(PRODUCT_ID), 'Set PRODUCT_ID to a valid integer in .env').toBeTruthy();
    const payload = RandomDataUtil.generateUpdatedProductPayload();
    const route = Routes.UPDATE_PRODUCT.replace('{id}', String(PRODUCT_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), 'Product update should return HTTP 200').toBe(200);

    const updated = await response.json();
    expect(updated.id, 'Updated product id should match PRODUCT_ID').toBe(PRODUCT_ID);
    expect(updated.title, 'Updated product title should match the request').toBe(payload.title);
    expect(updated.price, 'Updated product price should match the request').toBe(payload.price);
    expect(updated.description, 'Updated product description should match the request').toBe(payload.description);
    expect(updated.image, 'Updated product image should match the request').toBe(payload.image);
    expect(updated.category, 'Updated product category should match the request').toBe(payload.category);
  });

  test('DELETE - Product @master @regression @api', async ({ request }) => {
    expect(Number.isInteger(PRODUCT_ID), 'Set PRODUCT_ID to a valid integer in .env').toBeTruthy();
    const route = Routes.DELETE_PRODUCT.replace('{id}', String(PRODUCT_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), 'Product deletion should return HTTP 200').toBe(200);

    const deleted = await response.json();
    expect(deleted.id, 'Deleted product response should match PRODUCT_ID').toBe(PRODUCT_ID);
  });

  // ---------------------------------------------------------
  // Users - GET
  // ---------------------------------------------------------

  test('GET - All users @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status(), 'User list should return HTTP 200').toBe(200);

    const users = await response.json();
    expect(Array.isArray(users), 'User response should be an array').toBeTruthy();
    expect(users.length, 'User list should not be empty').toBeGreaterThan(0);
  });

  test('GET - User by ID @master @sanity @api', async ({ request }) => {
    expect(Number.isInteger(USER_ID), 'Set USER_ID to a valid integer in .env').toBeTruthy();
    const route = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'User lookup should return HTTP 200').toBe(200);

    const user = await response.json();
    expect(user.id, 'Returned user id should match USER_ID').toBe(USER_ID);
  });

  test('GET - Users with limit @master @sanity @api', async ({ request }) => {
    expect(Number.isInteger(LIMIT) && LIMIT > 0, 'Set LIMIT to a positive integer in .env').toBeTruthy();
    const route = Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Limited user list should return HTTP 200').toBe(200);

    const users = await response.json();
    expect(Array.isArray(users), 'Limited user response should be an array').toBeTruthy();
    expect(users.length, 'User count should match LIMIT').toBe(LIMIT);
  });

  test('GET - Users sorted ascending @master @regression @api', async ({ request }) => {
    const route = Routes.GET_USERS_SORTED.replace('{order}', 'asc');
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Ascending user sort should return HTTP 200').toBe(200);

    const users = await response.json();
    const ids = users.map((user: { id: number }) => user.id);
    expect(ids, 'User ids should be in ascending order').toEqual([...ids].sort((a, b) => a - b));
  });

  test('GET - Users sorted descending @master @regression @api', async ({ request }) => {
    const route = Routes.GET_USERS_SORTED.replace('{order}', 'desc');
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Descending user sort should return HTTP 200').toBe(200);

    const users = await response.json();
    const ids = users.map((user: { id: number }) => user.id);
    expect(ids, 'User ids should be in descending order').toEqual([...ids].sort((a, b) => b - a));
  });

  // ---------------------------------------------------------
  // Users - POST / PUT / DELETE
  // ---------------------------------------------------------

  test('POST - Create user @master @regression @api', async ({ request }) => {
    const payload = RandomDataUtil.generateUserPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: payload });
    expect(response.status(), 'User creation should return HTTP 201').toBe(201);

    const created = await response.json();
    expect(created.id, 'Created user should include an id').toBeTruthy();

    const deleteRoute = Routes.DELETE_USER.replace('{id}', String(created.id));
    const cleanupResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(cleanupResponse.status(), 'Created user cleanup should return HTTP 200').toBe(200);
  });

  test('PUT - Update user @master @regression @api', async ({ request }) => {
    expect(Number.isInteger(USER_ID), 'Set USER_ID to a valid integer in .env').toBeTruthy();
    const payload = RandomDataUtil.generateUserUpdatePayload();
    const route = Routes.UPDATE_USER.replace('{id}', String(USER_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), 'User update should return HTTP 200').toBe(200);

    const updated = await response.json();
    expect(updated.username, 'Updated username should match the request').toBe(payload.username);
    expect(updated.email, 'Updated email should match the request').toBe(payload.email);
    expect(updated.name, 'Updated name should match the request').toEqual(payload.name);
    expect(updated.address, 'Updated address should match the request').toEqual(payload.address);
    expect(updated.phone, 'Updated phone should match the request').toBe(payload.phone);
  });

  test('DELETE - User @master @regression @api', async ({ request }) => {
    expect(Number.isInteger(USER_ID), 'Set USER_ID to a valid integer in .env').toBeTruthy();
    const route = Routes.DELETE_USER.replace('{id}', String(USER_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), 'User deletion should return HTTP 200').toBe(200);

    const deleted = await response.json();
    expect(deleted.id, 'Deleted user response should match USER_ID').toBe(USER_ID);
  });

  // ---------------------------------------------------------
  // Carts - GET
  // ---------------------------------------------------------

  test('GET - All carts @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(response.status(), 'Cart list should return HTTP 200').toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), 'Cart response should be an array').toBeTruthy();
    expect(carts.length, 'Cart list should not be empty').toBeGreaterThan(0);
  });

  test('GET - Cart by ID @master @sanity @api', async ({ request }) => {
    expect(Number.isInteger(CART_ID), 'Set CART_ID to a valid integer in .env').toBeTruthy();
    const route = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Cart lookup should return HTTP 200').toBe(200);

    const cart = await response.json();
    expect(cart.id, 'Returned cart id should match CART_ID').toBe(CART_ID);
  });

  test('GET - Carts by date range @master @regression @api', async ({ request }) => {
    expect(START_DATE, 'Set START_DATE in .env').toBeTruthy();
    expect(END_DATE, 'Set END_DATE in .env').toBeTruthy();
    const route = Routes.GET_CARTS_BY_DATE_RANGE
      .replace('{startdate}', encodeURIComponent(START_DATE))
      .replace('{enddate}', encodeURIComponent(END_DATE));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Date-filtered carts should return HTTP 200').toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), 'Date-filtered cart response should be an array').toBeTruthy();
    for (const cart of carts) {
      expect(cart.date >= START_DATE, 'Cart date should not precede START_DATE').toBeTruthy();
      expect(cart.date <= END_DATE, 'Cart date should not exceed END_DATE').toBeTruthy();
    }
  });

  test('GET - Carts by user @master @sanity @api', async ({ request }) => {
    expect(Number.isInteger(USER_ID), 'Set USER_ID to a valid integer in .env').toBeTruthy();
    const route = Routes.GET_USER_CART.replace('{userId}', String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'User cart lookup should return HTTP 200').toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), 'User cart response should be an array').toBeTruthy();
    expect(
      carts.every((cart: { userId: number }) => cart.userId === USER_ID),
      'Every returned cart should belong to USER_ID',
    ).toBeTruthy();
  });

  test('GET - Carts with limit @master @sanity @api', async ({ request }) => {
    expect(Number.isInteger(LIMIT) && LIMIT > 0, 'Set LIMIT to a positive integer in .env').toBeTruthy();
    const route = Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Limited cart list should return HTTP 200').toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), 'Limited cart response should be an array').toBeTruthy();
    expect(carts.length, 'Cart count should match LIMIT').toBe(LIMIT);
  });

  test('GET - Carts sorted ascending @master @regression @api', async ({ request }) => {
    const route = Routes.GET_CARTS_SORTED.replace('{order}', 'asc');
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Ascending cart sort should return HTTP 200').toBe(200);

    const carts = await response.json();
    const ids = carts.map((cart: { id: number }) => cart.id);
    expect(ids, 'Cart ids should be in ascending order').toEqual([...ids].sort((a, b) => a - b));
  });

  test('GET - Carts sorted descending @master @regression @api', async ({ request }) => {
    const route = Routes.GET_CARTS_SORTED.replace('{order}', 'desc');
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Descending cart sort should return HTTP 200').toBe(200);

    const carts = await response.json();
    const ids = carts.map((cart: { id: number }) => cart.id);
    expect(ids, 'Cart ids should be in descending order').toEqual([...ids].sort((a, b) => b - a));
  });

  // ---------------------------------------------------------
  // Carts - POST / PUT / DELETE
  // ---------------------------------------------------------

  test('POST - Create cart @master @regression @api', async ({ request }) => {
    expect(Number.isInteger(USER_ID), 'Set USER_ID to a valid integer in .env').toBeTruthy();
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: payload });
    expect(response.status(), 'Cart creation should return HTTP 201').toBe(201);

    const created = await response.json();
    expect(created.id, 'Created cart should include an id').toBeTruthy();
    expect(created.userId, 'Created cart user id should match the request').toBe(payload.userId);
    expect(created.products, 'Created cart products should match the request').toEqual(payload.products);

    const deleteRoute = Routes.DELETE_CART.replace('{id}', String(created.id));
    const cleanupResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(cleanupResponse.status(), 'Created cart cleanup should return HTTP 200').toBe(200);
  });

  test('PUT - Update cart @master @regression @api', async ({ request }) => {
    expect(Number.isInteger(CART_ID), 'Set CART_ID to a valid integer in .env').toBeTruthy();
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    payload.products[0].quantity += 1;
    const route = Routes.UPDATE_CART.replace('{id}', String(CART_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), 'Cart update should return HTTP 200').toBe(200);

    const updated = await response.json();
    expect(updated.id, 'Updated cart id should match CART_ID').toBe(CART_ID);
    expect(updated.userId, 'Updated cart user id should match the request').toBe(payload.userId);
    expect(updated.products, 'Updated cart products should match the request').toEqual(payload.products);
  });

  test('DELETE - Cart @master @regression @api', async ({ request }) => {
    expect(Number.isInteger(CART_ID), 'Set CART_ID to a valid integer in .env').toBeTruthy();
    const route = Routes.DELETE_CART.replace('{id}', String(CART_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), 'Cart deletion should return HTTP 200').toBe(200);

    const deleted = await response.json();
    expect(deleted.id, 'Deleted cart response should match CART_ID').toBe(CART_ID);
  });

  // ---------------------------------------------------------
  // JSON Schema Validation
  // ---------------------------------------------------------

  test('GET - Validate product response schema @master @regression @api', async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Schema product lookup should return HTTP 200').toBe(200);

    const product = await response.json();
    const schema = DataProvider.readJson(path.resolve(process.cwd(), 'api/schemas/product-api-schema.json'));
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const isValid = validate(product);
    expect(isValid, ajv.errorsText(validate.errors)).toBeTruthy();
  });

  test('GET - Validate user response schema @master @regression @api', async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Schema user lookup should return HTTP 200').toBe(200);

    const user = await response.json();
    const schema = DataProvider.readJson(path.resolve(process.cwd(), 'api/schemas/user-api-schema.json'));
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const isValid = validate(user);
    expect(isValid, ajv.errorsText(validate.errors)).toBeTruthy();
  });

  test('GET - Validate cart response schema @master @regression @api', async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'Schema cart lookup should return HTTP 200').toBe(200);

    const cart = await response.json();
    const schema = DataProvider.readJson(path.resolve(process.cwd(), 'api/schemas/cart-api-schema.json'));
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const isValid = validate(cart);
    expect(isValid, ajv.errorsText(validate.errors)).toBeTruthy();
  });

  // ---------------------------------------------------------
  // End-to-End CRUD Workflows
  // ---------------------------------------------------------

  test('CRUD - Product workflow @master @regression @api', async ({ request }) => {
    const createPayload = RandomDataUtil.generateProductPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: createPayload });
    expect(createResponse.status(), 'Product workflow create should return HTTP 201').toBe(201);

    const created = await createResponse.json();
    const productId = created.id;
    expect(productId, 'Created product should include an id').toBeTruthy();

    const updatePayload = RandomDataUtil.generateUpdatedProductPayload();
    const updateRoute = Routes.UPDATE_PRODUCT.replace('{id}', String(productId));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status(), 'Product workflow update should return HTTP 200').toBe(200);

    const updated = await updateResponse.json();
    expect(updated.id, 'Updated product id should match the created id').toBe(productId);
    expect(updated.title, 'Updated product title should match the request').toBe(updatePayload.title);
    expect(updated.price, 'Updated product price should match the request').toBe(updatePayload.price);
    expect(updated.description, 'Updated product description should match the request').toBe(updatePayload.description);
    expect(updated.image, 'Updated product image should match the request').toBe(updatePayload.image);
    expect(updated.category, 'Updated product category should match the request').toBe(updatePayload.category);

    const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(productId));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), 'Product workflow delete should return HTTP 200').toBe(200);
  });

  test('CRUD - User workflow @master @regression @api', async ({ request }) => {
    const createPayload = RandomDataUtil.generateUserPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: createPayload });
    expect(createResponse.status(), 'User workflow create should return HTTP 201').toBe(201);

    const created = await createResponse.json();
    const userId = created.id;
    expect(userId, 'Created user should include an id').toBeTruthy();

    const updatePayload = RandomDataUtil.generateUserUpdatePayload();
    const updateRoute = Routes.UPDATE_USER.replace('{id}', String(userId));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status(), 'User workflow update should return HTTP 200').toBe(200);

    const updated = await updateResponse.json();
    expect(updated.username, 'Updated username should match the request').toBe(updatePayload.username);
    expect(updated.email, 'Updated email should match the request').toBe(updatePayload.email);
    expect(updated.name, 'Updated name should match the request').toEqual(updatePayload.name);
    expect(updated.address, 'Updated address should match the request').toEqual(updatePayload.address);
    expect(updated.phone, 'Updated phone should match the request').toBe(updatePayload.phone);

    const deleteRoute = Routes.DELETE_USER.replace('{id}', String(userId));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), 'User workflow delete should return HTTP 200').toBe(200);
  });

  test('CRUD - Cart workflow @master @regression @api', async ({ request }) => {
    expect(Number.isInteger(USER_ID), 'Set USER_ID to a valid integer in .env').toBeTruthy();
    const createPayload = RandomDataUtil.generateCartPayload(USER_ID);
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: createPayload });
    expect(createResponse.status(), 'Cart workflow create should return HTTP 201').toBe(201);

    const created = await createResponse.json();
    const cartId = created.id;
    expect(cartId, 'Created cart should include an id').toBeTruthy();
    expect(created.userId, 'Created cart user id should match the request').toBe(createPayload.userId);
    expect(created.products, 'Created cart products should match the request').toEqual(createPayload.products);

    const updatePayload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
    updatePayload.products[0].quantity = createPayload.products[0].quantity + 1;
    const updateRoute = Routes.UPDATE_CART.replace('{id}', String(cartId));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status(), 'Cart workflow update should return HTTP 200').toBe(200);

    const updated = await updateResponse.json();
    expect(updated.id, 'Updated cart id should match the created id').toBe(cartId);
    expect(updated.products[0].quantity, 'Cart quantity should match the requested update').toBe(
      updatePayload.products[0].quantity,
    );

    const deleteRoute = Routes.DELETE_CART.replace('{id}', String(cartId));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), 'Cart workflow delete should return HTTP 200').toBe(200);
  });
});
