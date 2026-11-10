import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(async () => {
    if (window.sessionStorage.getItem('uw-e2e-initialized') === '1') return;
    window.localStorage.clear();
    window.localStorage.setItem('uw-next-splash-shown', '1');
    window.sessionStorage.setItem('uw-e2e-initialized', '1');
    await new Promise<void>((resolve) => {
      const request = window.indexedDB.deleteDatabase('unlimited-works-canvas');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  });
});

test('creates, drags, and restores a canvas node', async ({ page }) => {
  await page.goto('/canvas');
  const result = await page.evaluate(async () => {
    const sleep = (milliseconds: number) =>
      new Promise((resolve) => window.setTimeout(resolve, milliseconds));
    let surface: HTMLElement | null = null;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      surface = document.querySelector<HTMLElement>('[data-canvas-surface]');
      if (surface) break;
      await sleep(50);
    }
    if (!surface) throw new Error('Canvas surface was not rendered');

    const surfaceRect = surface.getBoundingClientRect();
    surface.dispatchEvent(
      new MouseEvent('dblclick', {
        bubbles: true,
        clientX: surfaceRect.x + 520,
        clientY: surfaceRect.y + 300,
      }),
    );
    await sleep(80);
    const createButton = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === '文本生成',
    );
    if (!createButton) throw new Error('Node creation menu did not open');
    createButton.click();

    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (document.querySelector('[data-canvas-node-id]')) break;
      await sleep(30);
    }
    const node = document.querySelector<HTMLElement>('[data-canvas-node-id]');
    const handle = document.querySelector<HTMLElement>(
      '[data-canvas-node-drag-handle]',
    );
    if (!node || !handle) throw new Error('Canvas node was not created');

    const before = Number.parseFloat(node.style.left);
    const handleRect = handle.getBoundingClientRect();
    handle.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        clientX: handleRect.x + 12,
        clientY: handleRect.y + 10,
      }),
    );
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        button: 0,
        buttons: 1,
        clientX: handleRect.x + 162,
        clientY: handleRect.y + 120,
      }),
    );
    await sleep(80);
    const midDrag = Number.parseFloat(node.style.left);
    window.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        button: 0,
        clientX: handleRect.x + 162,
        clientY: handleRect.y + 120,
      }),
    );
    await sleep(80);
    const afterDrag = Number.parseFloat(node.style.left);

    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        key: 'z',
        ctrlKey: true,
      }),
    );
    await sleep(80);
    const afterUndo = Number.parseFloat(node.style.left);
    const runButton = Array.from(node.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'RUN',
    );
    if (!runButton) throw new Error('Canvas node run button was not rendered');
    runButton?.click();
    let executionFinished = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      executionFinished = Boolean(
        node.textContent?.includes('这是本地模拟生成的文本结果'),
      );
      if (executionFinished) break;
      await sleep(50);
    }
    await sleep(400);
    return {
      before,
      midDrag,
      afterDrag,
      afterUndo,
      executionFinished,
      executionText: node.textContent,
    };
  });

  expect(result.midDrag).toBeGreaterThan(result.before + 100);
  expect(result.afterDrag).toBeGreaterThan(result.before + 100);
  expect(result.afterUndo).toBeLessThan(result.afterDrag - 80);
  expect(result.executionFinished).toBe(true);

  await page.reload();
  const restoredLeft = await page.evaluate(async () => {
    const sleep = (milliseconds: number) =>
      new Promise((resolve) => window.setTimeout(resolve, milliseconds));
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const node = document.querySelector<HTMLElement>('[data-canvas-node-id]');
      if (node) return Number.parseFloat(node.style.left);
      await sleep(50);
    }
    return null;
  });
  expect(restoredLeft).not.toBeNull();
  expect(Math.abs(restoredLeft! - result.afterUndo)).toBeLessThan(2);
});

test('migrates a legacy canvas document into IndexedDB', async ({ page }) => {
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem('uw-legacy-seeded') === '1') return;
    window.sessionStorage.setItem('uw-legacy-seeded', '1');
    window.localStorage.setItem(
      'uw-next-canvas-document',
      JSON.stringify({
        id: 'legacy-canvas',
        name: 'Legacy Canvas',
        nodes: [
          {
            id: 'legacy-node',
            type: 'text',
            title: 'Legacy Node',
            x: 160,
            y: 120,
            width: 420,
            height: 280,
            prompt: 'legacy',
            content: 'legacy',
            model: 'GPT 5.5',
            status: 'idle',
            fixedText: false,
            createdAt: Date.now(),
          },
        ],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        updatedAt: Date.now(),
      }),
    );
  });

  await page.goto('/canvas');
  await expect(
    page.locator('[data-canvas-node-id="legacy-node"]'),
  ).toHaveCount(1, { timeout: 30_000 });
  await page.evaluate(() => {
    window.localStorage.removeItem('uw-next-canvas-document');
  });
  await page.waitForTimeout(400);
  await page.reload();
  await expect(
    page.locator('[data-canvas-node-id="legacy-node"]'),
  ).toHaveCount(1, { timeout: 30_000 });
});

test('opens every settings section without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const openedSections = await page.evaluate(async () => {
    const sleep = (milliseconds: number) =>
      new Promise((resolve) => window.setTimeout(resolve, milliseconds));
    await sleep(300);
    const settingsButton = document.querySelector<HTMLButtonElement>(
      'button[aria-label="设置"]',
    );
    if (!settingsButton) throw new Error('Settings button was not rendered');
    settingsButton.click();

    let dialog: HTMLElement | null = null;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      if (dialog) break;
      await sleep(30);
    }
    if (!dialog) throw new Error('Settings dialog did not open');

    const sections = [
      '通用',
      'UW Harness',
      '资产库',
      'API 配置',
      '代理设置',
      '性能',
      '日志',
      'UW Pro',
      '关于',
    ];
    const opened: string[] = [];
    for (const section of sections) {
      const button = Array.from(dialog.querySelectorAll('button')).find(
        (item) => item.textContent?.trim() === section,
      );
      if (!button) continue;
      button.click();
      opened.push(section);
      await sleep(20);
    }
    return opened;
  });

  expect(openedSections).toEqual([
    '通用',
    'UW Harness',
    '资产库',
    'API 配置',
    '代理设置',
    '性能',
    '日志',
    'UW Pro',
    '关于',
  ]);
  expect(errors).toEqual([]);
});
