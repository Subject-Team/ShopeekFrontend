import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { ToastProvider, useToast } from '../ToastContext';
import { PageContextProvider, usePageContext } from '../PageContext';

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  it('initializes with light theme and toggles to dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('shopeek_theme')).toBe('dark');
  });
});

describe('ToastContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>{children}</ToastProvider>
  );

  it('renders and displays toasts of different types', () => {
    const TestComponent = () => {
      const { showToast } = useToast();
      return (
        <div>
          <button onClick={() => showToast('عملیات با موفقیت انجام شد', 'success')}>Success</button>
          <button onClick={() => showToast('خطایی رخ داد', 'error')}>Error</button>
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Success').click();
    });

    expect(screen.getByText('عملیات با موفقیت انجام شد')).toBeInTheDocument();
  });
});

describe('PageContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PageContextProvider>{children}</PageContextProvider>
  );

  it('manages dateRangeDays and isChatOpen', () => {
    const { result } = renderHook(() => usePageContext(), { wrapper });
    expect(result.current.dateRangeDays).toBe(14);
    expect(result.current.isChatOpen).toBe(false);

    act(() => {
      result.current.setDateRangeDays(30);
      result.current.setIsChatOpen(true);
    });

    expect(result.current.dateRangeDays).toBe(30);
    expect(result.current.isChatOpen).toBe(true);
  });
});
