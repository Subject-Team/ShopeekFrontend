import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock Element.prototype.scrollIntoView
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = vi.fn();
}

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = MockResizeObserver as any;

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.IntersectionObserver = MockIntersectionObserver as any;

// Polyfill Blob.slice().arrayBuffer() for jsdom environments that lack it.
// This lets FileUploader's magic-byte validation run properly in tests.
if (typeof Blob !== 'undefined' && typeof Blob.prototype.arrayBuffer !== 'function') {
  Blob.prototype.arrayBuffer = function () {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

// Mock Turnstile
(window as any).turnstile = {
  render: vi.fn().mockReturnValue('mock-widget-id'),
  reset: vi.fn(),
  remove: vi.fn(),
  getResponse: vi.fn().mockReturnValue('mock-turnstile-token'),
};

// Mock the Turnstile widget component so the real @marsidev/react-turnstile
// script-polling component never runs in jsdom (it would warn
// "Turnstile has not been loaded" and escape act via its setState-on-poll
// effect). Same shape as the local mock in LoginPage.test.tsx.
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }: any) => {
    React.useEffect(() => {
      onSuccess?.('mock-turnstile-token');
    }, [onSuccess]);
    return React.createElement('div', { 'data-testid': 'mock-turnstile' });
  },
}));

// ResponsiveContainer measures its parent in jsdom and logs a 0x0
// width/height warning; replace it with a fixed-size div so charts render
// without the warning. All other recharts components stay real.
vi.mock('recharts', async () => ({
  ...(await vi.importActual('recharts')),
  ResponsiveContainer: (props: any) =>
    React.createElement('div', { style: { width: 800, height: 400 } }, props.children),
}));
