import { test, expect } from '@playwright/test';

function generateEmail() {
	return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

test.describe('specs management', () => {
	test.beforeEach(async ({ page }) => {
		// Register and login before each test
		const email = generateEmail();
		await page.goto('/register');
		await page.fill('input[name="email"]', email);
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/specs');
	});

	test('should show empty state for new user', async ({ page }) => {
		await expect(page.locator('text=You haven\'t created any specs yet.')).toBeVisible();
		await expect(page.locator('text=Create your first spec')).toBeVisible();
	});

	test('should create a new spec', async ({ page }) => {
		await page.click('button:has-text("+ New Spec")');

		// Should redirect to spec page
		await expect(page).toHaveURL(/\/specs\/[a-z0-9]+/);
		await expect(page.locator('text=Untitled Spec')).toBeVisible();
		await expect(page.locator('text=Draft')).toBeVisible();
	});

	test('should create spec from empty state button', async ({ page }) => {
		await page.click('button:has-text("Create your first spec")');

		await expect(page).toHaveURL(/\/specs\/[a-z0-9]+/);
	});

	test('should rename a spec', async ({ page }) => {
		// Create a spec
		await page.click('button:has-text("+ New Spec")');
		await expect(page).toHaveURL(/\/specs\/[a-z0-9]+/);

		// Click edit button
		await page.click('button:has-text("Edit")');

		// Fill in new name
		await page.fill('input[name="title"]', 'My New Spec Title');
		await page.click('button:has-text("Save")');

		// Verify title changed
		await expect(page.locator('h1:has-text("My New Spec Title")')).toBeVisible();
	});

	test('should delete a spec', async ({ page }) => {
		// Create a spec
		await page.click('button:has-text("+ New Spec")');
		await expect(page).toHaveURL(/\/specs\/[a-z0-9]+/);

		// Delete the spec
		await page.click('button:has-text("Delete")');

		// Should redirect back to specs list
		await expect(page).toHaveURL('/specs');
		await expect(page.locator('text=You haven\'t created any specs yet.')).toBeVisible();
	});

	test('should show spec in list after creation', async ({ page }) => {
		// Create a spec
		await page.click('button:has-text("+ New Spec")');
		await expect(page).toHaveURL(/\/specs\/[a-z0-9]+/);

		// Rename it
		await page.click('button:has-text("Edit")');
		await page.fill('input[name="title"]', 'Listed Spec');
		await page.click('button:has-text("Save")');

		// Go back to list
		await page.click('a:has-text("My Specs")');

		// Verify spec is in the list
		await expect(page.locator('.spec-card:has-text("Listed Spec")')).toBeVisible();
	});

	test('should navigate to spec detail from list', async ({ page }) => {
		// Create a spec with a unique name
		await page.click('button:has-text("+ New Spec")');
		await page.click('button:has-text("Edit")');
		await page.fill('input[name="title"]', 'Navigate Test Spec');
		await page.click('button:has-text("Save")');

		// Go back to list
		await page.click('a:has-text("My Specs")');

		// Click on the spec card
		await page.click('.spec-card:has-text("Navigate Test Spec")');

		// Should be on detail page
		await expect(page).toHaveURL(/\/specs\/[a-z0-9]+/);
		await expect(page.locator('h1:has-text("Navigate Test Spec")')).toBeVisible();
	});

	test('should show correct mode badge', async ({ page }) => {
		// Create a spec (default mode is specz)
		await page.click('button:has-text("+ New Spec")');
		await expect(page).toHaveURL(/\/specs\/[a-z0-9]+/);

		// Verify mode badge
		await expect(page.locator('.mode:has-text("Specz")')).toBeVisible();
	});

	test('should cancel rename without saving', async ({ page }) => {
		// Create a spec
		await page.click('button:has-text("+ New Spec")');

		// Start editing
		await page.click('button:has-text("Edit")');
		await page.fill('input[name="title"]', 'Should Not Save');

		// Cancel
		await page.click('button:has-text("Cancel")');

		// Should still show original title
		await expect(page.locator('h1:has-text("Untitled Spec")')).toBeVisible();
	});
});

test.describe('specs isolation', () => {
	test('should not see other users specs', async ({ page, context }) => {
		// Create first user and a spec
		const email1 = generateEmail();
		await page.goto('/register');
		await page.fill('input[name="email"]', email1);
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/specs');

		await page.click('button:has-text("+ New Spec")');
		await page.click('button:has-text("Edit")');
		await page.fill('input[name="title"]', 'User 1 Private Spec');
		await page.click('button:has-text("Save")');

		// Logout
		await page.click('button:has-text("Log out")');

		// Create second user
		const email2 = generateEmail();
		await page.goto('/register');
		await page.fill('input[name="email"]', email2);
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL('/specs');

		// Second user should see empty state
		await expect(page.locator('text=You haven\'t created any specs yet.')).toBeVisible();
		await expect(page.locator('text=User 1 Private Spec')).not.toBeVisible();
	});
});
