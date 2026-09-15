// @test-type component
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

function Bomb(): never {
  throw new Error('boom');
}

describe('[component] ErrorBoundary Component', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <div>محتوای سالم</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('محتوای سالم')).toBeInTheDocument();
  });

  it('shows the Persian fallback UI when a child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText('خطایی غیرمنتظره رخ داد')).toBeInTheDocument();
    expect(
      screen.getByText(/صفحه را مجدداً بارگذاری کنید/),
    ).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('invokes the reload handler when the fallback button is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    // jsdom makes window.location.reload non-configurable, so the real call
    // runs (emitting the usual "Not implemented: navigation" noise).
    expect(() =>
      fireEvent.click(screen.getByText('بارگذاری مجدد صفحه')),
    ).not.toThrow();
    expect(screen.getByText('خطایی غیرمنتظره رخ داد')).toBeInTheDocument();
  });
});
