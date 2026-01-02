import { test, expect } from '@playwright/test';

function generateEmail() {
	return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

test.describe('authentication', () => {
	test('should register a new user', async ({ page }) => {
		const email = generateEmail();

		await page.goto('/register');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL('/specs');
		await expect(page.locator('text=Your Specs')).toBeVisible();
	});

	test('should reject duplicate email registration', async ({ page }) => {
		const email = generateEmail();

		// Register first user
		await page.goto('/register');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/specs');

		// Logout
		await page.click('button:has-text("Log out")');

		// Try to register with same email
		await page.goto('/register');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');

		await expect(page.locator('.error')).toBeVisible();
	});

	test('should login with valid credentials', async ({ page }) => {
		const email = generateEmail();

		// Register first
		await page.goto('/register');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/specs');

		// Logout
		await page.click('button:has-text("Log out")');
		await expect(page).toHaveURL('/');

		// Go to login
		await page.goto('/login');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL('/specs');
		await expect(page.locator(`text=${email}`)).toBeVisible();
	});

	test('should reject invalid password', async ({ page }) => {
		const email = generateEmail();

		// Register first
		await page.goto('/register');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/specs');

		// Logout
		await page.click('button:has-text("Log out")');
		await expect(page).toHaveURL('/');

		// Try to login with wrong password
		await page.goto('/login');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', 'wrongpassword');
		await page.click('button[type="submit"]');

		await expect(page.locator('.error')).toBeVisible();
		await expect(page).toHaveURL('/login');
	});

	test('should logout and redirect to home', async ({ page }) => {
		const email = generateEmail();

		// Register and login
		await page.goto('/register');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/specs');

		// Logout
		await page.click('button:has-text("Log out")');

		await expect(page).toHaveURL('/');
		await expect(page.locator('text=Log in')).toBeVisible();
	});

	test('should redirect unauthenticated users from protected routes', async ({ page }) => {
		await page.goto('/specs');
		await expect(page).toHaveURL('/login');
	});

	test('should persist session across page reloads', async ({ page }) => {
		const email = generateEmail();

		// Register
		await page.goto('/register');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/specs');

		// Reload page
		await page.reload();

		// Should still be logged in
		await expect(page).toHaveURL('/specs');
		await expect(page.locator(`text=${email}`)).toBeVisible();
	});

	test('should redirect logged-in users from login page to specs', async ({ page }) => {
		const email = generateEmail();

		// Register
		await page.goto('/register');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/specs');

		// Try to visit login page
		await page.goto('/login');

		// Should redirect to specs
		await expect(page).toHaveURL('/specs');
	});
});
