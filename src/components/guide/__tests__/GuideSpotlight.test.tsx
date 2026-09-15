// @test-type component
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import { GuideSpotlight } from '../GuideSpotlight';
import { useGuide } from '../../../context/GuideContext';
import { renderWithProviders } from '../../../test/testUtils';

const { MOCK_USER } = vi.hoisted(() => ({
  MOCK_USER: { id: 'u-1', email: 'test@shopeek.ir', full_name: 'Test User' },
}));

vi.mock('../../../services/api', () => ({
  loginApi: vi.fn(),
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

describe('[component] GuideSpotlight Component', () => {
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
    await renderWithProviders(<TestApp />);

    act(() => {
      screen.getByText('Launch Guide').click();
    });

    expect(screen.getByText(/خوش‌آمدید به داشبورد تحلیلی شاپیک/i)).toBeInTheDocument();
    expect(screen.getByText('بعدی')).toBeInTheDocument();
  });

  it('advances through steps on clicking next button', async () => {
    await renderWithProviders(<TestApp />);

    act(() => {
      screen.getByText('Launch Guide').click();
    });

    const nextBtn = screen.getByText('بعدی');
    act(() => {
      fireEvent.click(nextBtn);
    });

    expect(await screen.findByText(/پیشنهادات اختصاصی هوش مصنوعی/i)).toBeInTheDocument();
    expect(screen.getByText('قبلی')).toBeInTheDocument();
  });

  it('closes guide when clicking close button', async () => {
    await renderWithProviders(<TestApp />);

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
    await renderWithProviders(<TestApp />);

    act(() => {
      screen.getByText('Launch Guide').click();
    });

    expect(await screen.findByText(/از منوی سمت راست برای دسترسی سریع/i)).toBeInTheDocument();
  });

  it('hides the previous button on the first step', async () => {
    await renderWithProviders(<TestApp />);

    act(() => {
      screen.getByText('Launch Guide').click();
    });

    expect(screen.queryByText('قبلی')).not.toBeInTheDocument();
    // Step counter shows 1 of 9
    expect(screen.getByText(/گام/i)).toBeInTheDocument();
  });

  it('navigates via progress dots and shows the back button afterwards', async () => {
    await renderWithProviders(<TestApp />);

    act(() => {
      screen.getByText('Launch Guide').click();
    });

    const secondDot = screen.getByLabelText('رفتن به گام ۲');
    act(() => {
      fireEvent.click(secondDot);
    });

    expect(await screen.findByText(/پیشنهادات اختصاصی هوش مصنوعی/i)).toBeInTheDocument();
    expect(screen.getByText('قبلی')).toBeInTheDocument();
  });

  it('shows the finish label on the last step', async () => {
    await renderWithProviders(<TestApp />);

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
    await renderWithProviders(<TestApp />);

    act(() => {
      screen.getByText('Launch Guide').click();
    });

    act(() => {
      fireEvent.click(screen.getByText('انصراف و بستن'));
    });

    expect(screen.queryByText(/خوش‌آمدید به داشبورد تحلیلی شاپیک/i)).not.toBeInTheDocument();
  });

  it('flips mobile modal position between top and bottom based on target coordinates', async () => {
    window.innerWidth = 480;
    window.innerHeight = 800;

    const MobileTestApp: React.FC<{ isBottom: boolean }> = ({ isBottom }) => {
      const { startGuide } = useGuide();
      return (
        <div>
          <div
            data-guide="dashboard-welcome"
            ref={(el) => {
              if (el) {
                vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
                  top: isBottom ? 620 : 60,
                  bottom: isBottom ? 760 : 160,
                  left: 20,
                  right: 460,
                  width: 440,
                  height: 100,
                  x: 20,
                  y: isBottom ? 620 : 60,
                  toJSON: () => {},
                });
              }
            }}
          >
            Target Element
          </div>
          <button onClick={() => startGuide('dashboard')}>Start</button>
          <GuideSpotlight />
        </div>
      );
    };

    const { unmount } = await renderWithProviders(<MobileTestApp isBottom={true} />);

    act(() => {
      screen.getByText('Start').click();
    });

    await waitFor(() => {
      const closeBtn = screen.getByTitle('بستن راهنما');
      const modalContainer = closeBtn.closest('.pointer-events-auto');
      expect(modalContainer?.className).toContain('top-4');
    });

    unmount();
    window.innerWidth = 1024; // restore
  });
});
