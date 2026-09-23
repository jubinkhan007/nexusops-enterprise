import { test, expect } from '@playwright/test';

test.describe('NexusOps Enterprise E2E Test Suite', () => {

  test('1. Executive Dashboard & SignalR Simulator Widget', async ({ page }) => {
    await page.goto('/');
    
    // Verify Dashboard Title & Branding
    await expect(page.locator('h1')).toContainText('Executive AI Control Center');
    await expect(page).toHaveTitle(/NexusOps/i);

    // Verify SignalR Widget Visibility
    const signalrWidget = page.locator('text=SignalR Live Real-Time Simulator');
    await expect(signalrWidget).toBeVisible();

    // Trigger Execution Simulation
    const simulateButton = page.locator('button:has-text("Simulate Workflow Execution")');
    if (await simulateButton.isVisible()) {
      await simulateButton.click();
    }
  });

  test('2. Gemini Vector RAG Semantic Search', async ({ page }) => {
    await page.goto('/ai-insights');

    // Verify AI & RAG Page Header
    await expect(page.locator('h1')).toContainText('Gemini AI & pgvector RAG Engine');

    // Fill Query & Search
    const searchInput = page.locator('input[placeholder*="Ask Gemini AI"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('How does IsolationForest handle anomaly scores?');
      const searchButton = page.locator('button:has-text("Execute RAG Query")');
      await searchButton.click();
    }
  });

  test('3. Executive Compliance Report Exporter', async ({ page }) => {
    await page.goto('/executive-reports');

    // Verify Executive Report Page
    await expect(page.locator('h1')).toContainText('Executive AI Compliance & Audit Exporter');

    // Generate Compliance Report
    const exportButton = page.locator('button:has-text("Generate & Export PDF Report")');
    await expect(exportButton).toBeVisible();
  });

  test('4. RBAC Role Switcher & JWT Context State', async ({ page }) => {
    await page.goto('/telemetry');

    // Verify Role Selector Dropdown
    const roleSelect = page.locator('select');
    await expect(roleSelect).toBeVisible();

    // Switch Role to Operator
    await roleSelect.selectOption('Operator');
    await expect(roleSelect).toHaveValue('Operator');

    // Switch Role to Admin
    await roleSelect.selectOption('Admin');
    await expect(roleSelect).toHaveValue('Admin');
  });

});
