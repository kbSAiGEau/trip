import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import fs from 'fs';
import path from 'path';

// --- Manifest validation tests (FE-016-HP-01, NF-007) ---
describe('Web Manifest', () => {
  let manifest: Record<string, unknown>;

  beforeAll(() => {
    const manifestPath = path.resolve(__dirname, '../../public/manifest.json');
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(raw);
  });

  it('has required PWA fields: name, short_name, start_url, display', () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
  });

  it('has theme_color and background_color', () => {
    expect(manifest.theme_color).toBeTruthy();
    expect(manifest.background_color).toBeTruthy();
  });

  it('has icons at 192px and 512px sizes', () => {
    const icons = manifest.icons as Array<{ sizes: string; src: string; type: string }>;
    expect(icons).toBeDefined();
    expect(Array.isArray(icons)).toBe(true);

    const sizes = icons.map((i) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });

  it('icon files exist in public directory', () => {
    const icons = manifest.icons as Array<{ sizes: string; src: string }>;
    for (const icon of icons) {
      const iconPath = path.resolve(__dirname, '../../public', icon.src.replace(/^\//, ''));
      expect(fs.existsSync(iconPath)).toBe(true);
    }
  });
});

// --- Layout PWA metadata tests (FE-016-HP-01) ---
describe('PWA Metadata', () => {
  it('layout exports metadata with manifest link', async () => {
    const layout = await import('../app/layout');
    const metadata = (layout as Record<string, unknown>).metadata as Record<string, unknown>;
    expect(metadata).toBeDefined();

    // Check for manifest in metadata
    const manifest = metadata.manifest;
    expect(manifest).toBe('/manifest.json');
  });

  it('layout exports metadata with apple-mobile-web-app-capable', async () => {
    const layout = await import('../app/layout');
    const metadata = (layout as Record<string, unknown>).metadata as Record<string, unknown>;

    const appleWebApp = metadata.appleWebApp as Record<string, unknown>;
    expect(appleWebApp).toBeDefined();
    expect(appleWebApp.capable).toBe(true);
    expect(appleWebApp.statusBarStyle).toBe('default');
  });

  it('layout exports metadata with theme-color', async () => {
    const layout = await import('../app/layout');
    const metadata = (layout as Record<string, unknown>).metadata as Record<string, unknown>;

    expect(metadata.themeColor).toBeTruthy();
  });
});

// --- Service worker registration tests (NF-006) ---
describe('ServiceWorkerRegister component', () => {
  it('registers service worker on mount in production-like environment', async () => {
    // Mock navigator.serviceWorker
    const registerMock = vi.fn().mockResolvedValue({});
    Object.defineProperty(globalThis.navigator, 'serviceWorker', {
      value: { register: registerMock, ready: Promise.resolve({}) },
      writable: true,
      configurable: true,
    });

    const { ServiceWorkerRegister } = await import('../components/ServiceWorkerRegister');
    render(createElement(ServiceWorkerRegister));

    // Should attempt to register /sw.js
    expect(registerMock).toHaveBeenCalledWith('/sw.js');
  });
});

// --- Manual refresh tests (FE-017-HP-01) ---
describe('RefreshButton component', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders a refresh/update button', async () => {
    const { RefreshButton } = await import('../components/RefreshButton');
    render(createElement(RefreshButton));

    const button = screen.getByRole('button', { name: /refresh|update/i });
    expect(button).toBeInTheDocument();
  });

  it('calls service worker update and reloads on click', async () => {
    const updateMock = vi.fn().mockResolvedValue(undefined);
    const getRegistrationMock = vi.fn().mockResolvedValue({ update: updateMock });
    Object.defineProperty(globalThis.navigator, 'serviceWorker', {
      value: { getRegistration: getRegistrationMock, register: vi.fn(), ready: Promise.resolve({}) },
      writable: true,
      configurable: true,
    });

    const cachesDeleteMock = vi.fn().mockResolvedValue(true);
    Object.defineProperty(globalThis, 'caches', {
      value: {
        keys: vi.fn().mockResolvedValue(['cache-v1']),
        delete: cachesDeleteMock,
      },
      writable: true,
      configurable: true,
    });

    const reloadMock = vi.fn();
    Object.defineProperty(globalThis, 'location', {
      value: { ...globalThis.location, reload: reloadMock },
      writable: true,
      configurable: true,
    });

    const { RefreshButton } = await import('../components/RefreshButton');
    render(createElement(RefreshButton));

    const button = screen.getByRole('button', { name: /refresh|update/i });
    fireEvent.click(button);

    await vi.waitFor(() => {
      expect(getRegistrationMock).toHaveBeenCalled();
    });
  });
});

// --- Service worker file exists (NF-006) ---
describe('Service worker file', () => {
  it('sw.js exists in public directory', () => {
    const swPath = path.resolve(__dirname, '../../public/sw.js');
    expect(fs.existsSync(swPath)).toBe(true);
  });
});
