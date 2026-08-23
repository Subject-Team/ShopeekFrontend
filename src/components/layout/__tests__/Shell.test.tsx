import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Shell } from '../Shell';
import { AuthProvider } from '../../../context/AuthContext';
import { GuideProvider } from '../../../context/GuideContext';
import { PageContextProvider } from '../../../context/PageContext';
import { ThemeProvider } from '../../../context/ThemeContext';
import { ToastProvider } from '../../../context/ToastContext';

describe('Shell Component', () => {
  it('renders Shell with child contents and layout elements', () => {
    localStorage.setItem('shopeek_token', 'mock-token');
    localStorage.setItem('shopeek_user', JSON.stringify({ id: 'u-1', email: 'test@shopeek.ir' }));

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <PageContextProvider>
                <GuideProvider>
                  <Shell>
                    <div data-testid="dashboard-content">محتوای اصلی داشبورد</div>
                  </Shell>
                </GuideProvider>
              </PageContextProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });
});
