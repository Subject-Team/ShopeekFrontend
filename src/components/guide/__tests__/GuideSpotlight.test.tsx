import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GuideSpotlight } from '../GuideSpotlight';
import { GuideProvider, useGuide } from '../../../context/GuideContext';
import { AuthProvider } from '../../../context/AuthContext';

const TestApp: React.FC = () => {
  const { startGuide } = useGuide();
  return (
    <div>
      <div data-guide="dashboard-welcome">Welcome Target</div>
      <button onClick={() => startGuide('dashboard')}>Launch Guide</button>
      <GuideSpotlight />
    </div>
  );
};

describe('GuideSpotlight Component', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shopeek_token', 'mock-valid-token');
    localStorage.setItem(
      'shopeek_user',
      JSON.stringify({ id: 'u-1', email: 'test@shopeek.ir', full_name: 'Test User' })
    );
    vi.clearAllMocks();
  });

  it('renders spotlight and tooltip card when guide is opened', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <GuideProvider>
            <TestApp />
          </GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    act(() => {
      screen.getByText('Launch Guide').click();
    });

    expect(screen.getByText(/خوش‌آمدید به داشبورد تحلیلی شاپیک/i)).toBeInTheDocument();
    expect(screen.getByText('بعدی')).toBeInTheDocument();
  });

  it('advances through steps on clicking next button', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <GuideProvider>
            <TestApp />
          </GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    act(() => {
      screen.getByText('Launch Guide').click();
    });

    const nextBtn = screen.getByText('بعدی');
    act(() => {
      fireEvent.click(nextBtn);
    });

    expect(screen.getByText(/شاخص‌های کلیدی عملکرد/i)).toBeInTheDocument();
    expect(screen.getByText('قبلی')).toBeInTheDocument();
  });

  it('closes guide when clicking close button', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <GuideProvider>
            <TestApp />
          </GuideProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    act(() => {
      screen.getByText('Launch Guide').click();
    });

    const closeBtn = screen.getByTitle('بستن راهنما');
    act(() => {
      fireEvent.click(closeBtn);
    });

    expect(screen.queryByText(/خوش‌آمدید به داشبورد تحلیلی شاپیک/i)).not.toBeInTheDocument();
  });
});
