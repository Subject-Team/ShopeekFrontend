import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { GuideProvider } from '../context/GuideContext';
import { PageContextProvider } from '../context/PageContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';

interface RenderWithProvidersOptions {
  initialEntries?: string[];
  withTheme?: boolean;
  withGuide?: boolean;
  withPageContext?: boolean;
  withToast?: boolean;
}

const DEFAULT_OPTIONS: Required<RenderWithProvidersOptions> = {
  initialEntries: ['/dashboard'],
  withTheme: false,
  withGuide: true,
  withPageContext: true,
  withToast: true,
};

const createWrapper = (options: RenderWithProvidersOptions = {}) => {
  const { initialEntries, withTheme, withGuide, withPageContext, withToast } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let tree = children;
    if (withToast) tree = <ToastProvider>{tree}</ToastProvider>;
    if (withPageContext) tree = <PageContextProvider>{tree}</PageContextProvider>;
    if (withGuide) tree = <GuideProvider>{tree}</GuideProvider>;
    if (withTheme) tree = <ThemeProvider>{tree}</ThemeProvider>;
    tree = <AuthProvider>{tree}</AuthProvider>;
    return <MemoryRouter initialEntries={initialEntries}>{tree}</MemoryRouter>;
  };

  return Wrapper;
};

/**
 * Renders `ui` inside the standard provider tree (MemoryRouter + AuthProvider +
 * optional Theme/Guide/PageContext/Toast providers) and flushes the
 * AuthProvider mount effect (its `fetchMeApi` continuation resolves in a later
 * microtask, which would otherwise escape `act`). Must be awaited.
 */
export const renderWithProviders = async (
  ui: React.ReactElement,
  options: RenderWithProvidersOptions = {}
) => {
  const result = render(ui, { wrapper: createWrapper(options) });
  await act(async () => {});
  return result;
};

/**
 * Same as `renderWithProviders` but for `renderHook`-based tests.
 */
export const renderHookWithProviders = async <T,>(
  hook: () => T,
  options: RenderWithProvidersOptions = {}
) => {
  const result = renderHook(hook, { wrapper: createWrapper(options) });
  await act(async () => {});
  return result;
};