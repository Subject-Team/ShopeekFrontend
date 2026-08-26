import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GuideSpotlight } from '../GuideSpotlight';
import { GuideProvider, useGuide } from '../../../context/GuideContext';
import { AuthProvider } from '../../../context/AuthContext';

const { MOCK_USER } = vi.hoisted(() => ({
  MOCK_USER: { id: 'u-1', email: 'test@shopeek.ir', full_name: 'Test User' },
}));

vi.mock('../../../services/api', () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  fetchMeApi: vi.fn().mockResolvedValue(MOCK_USER),
  uploadSalesFile: vi.fn(),
  previewSalesFile: vi.fn(),
  getSampleCSV: vi.fn(),
}));

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

  it('renders tip boxes when a step provides tips', async () => {
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

    expect(await screen.findByText(/برای جابجایی بین بخش‌ها، از منوی سمت راست استفاده کنید/i)).toBeInTheDocument();
  });

  it('hides the previous button on the first step', async () => {
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

    expect(screen.queryByText('قبلی')).not.toBeInTheDocument();
    // Step counter shows 1 of 9
    expect(screen.getByText(/گام/i)).toBeInTheDocument();
  });

  it('navigates via progress dots and shows the back button afterwards', async () => {
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

    const secondDot = screen.getByLabelText('رفتن به گام ۲');
    act(() => {
      fireEvent.click(secondDot);
    });

    expect(await screen.findByText(/شاخص‌های کلیدی عملکرد/i)).toBeInTheDocument();
    expect(screen.getByText('قبلی')).toBeInTheDocument();
  });

  it('shows the finish label on the last step', async () => {
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

    const dotButtons = screen
      .getAllByRole('button')
      .filter(btn => btn.getAttribute('aria-label')?.startsWith('رفتن به گام'));
    const lastDot = dotButtons[dotButtons.length - 1];
    act(() => {
      fireEvent.click(lastDot);
    });

    expect(await screen.findByText('اتمام این بخش')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByText('اتمام این بخش'));
    });
    expect(screen.queryByText('اتمام این بخش')).not.toBeInTheDocument();
  });

  it('closes the guide from the cancel button', async () => {
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

    act(() => {
      fireEvent.click(screen.getByText('انصراف و بستن'));
    });

    expect(screen.queryByText(/خوش‌آمدید به داشبورد تحلیلی شاپیک/i)).not.toBeInTheDocument();
  });
});
