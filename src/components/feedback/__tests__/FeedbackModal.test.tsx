// @test-type component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeedbackModal } from '../FeedbackModal';
import * as api from '../../../services/api';

vi.mock('../../../services/api', () => ({
  submitFeedbackApi: vi.fn(),
}));

describe('[component] FeedbackModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<FeedbackModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByText('ارسال بازخورد و گزارش باگ')).not.toBeInTheDocument();
  });

  it('renders modal with title, categories, and inputs when open', () => {
    render(<FeedbackModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('ارسال بازخورد و گزارش باگ')).toBeInTheDocument();
    expect(screen.getByText('گزارش باگ و خطا')).toBeInTheDocument();
    expect(screen.getByText('درخواست قابلیت جدید')).toBeInTheDocument();
    expect(screen.getByText('پیشنهاد بهبود یا انتقاد')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/عدم بارگذاری نمودار/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/مشکل چگونه رخ داد/)).toBeInTheDocument();
    expect(screen.getByText('عکس‌برداری از صفحه')).toBeInTheDocument();
    expect(screen.getByText('انتخاب فایل تصویر')).toBeInTheDocument();
  });

  it('allows switching feedback category', () => {
    render(<FeedbackModal isOpen={true} onClose={onClose} />);

    const featureBtn = screen.getByText('درخواست قابلیت جدید');
    fireEvent.click(featureBtn);
    expect(featureBtn.closest('button')).toHaveClass('text-brand-600');
  });

  it('shows validation error when title or description is missing', async () => {
    render(<FeedbackModal isOpen={true} onClose={onClose} />);

    const submitBtn = screen.getByRole('button', { name: 'ارسال بازخورد' });
    fireEvent.click(submitBtn);

    expect(screen.getByText('لطفاً عنوان و توضیحات بازخورد را وارد نمایید.')).toBeInTheDocument();
    expect(api.submitFeedbackApi).not.toHaveBeenCalled();
  });

  it('submits feedback successfully with payload and displays confirmation', async () => {
    vi.mocked(api.submitFeedbackApi).mockResolvedValueOnce({
      id: 'fb-123',
      type: 'feature_request',
      title: 'افزودن خروجی اکسل پیشرفته',
      description: 'لطفاً امکان سفارشی‌سازی ستون‌ها اضافه شود.',
      status: 'pending',
      reward_amount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    render(<FeedbackModal isOpen={true} onClose={onClose} />);

    // Select category
    fireEvent.click(screen.getByText('درخواست قابلیت جدید'));

    // Fill title
    fireEvent.change(screen.getByPlaceholderText(/عدم بارگذاری نمودار/), {
      target: { value: 'افزودن خروجی اکسل پیشرفته' },
    });

    // Fill description
    fireEvent.change(screen.getByPlaceholderText(/مشکل چگونه رخ داد/), {
      target: { value: 'لطفاً امکان سفارشی‌سازی ستون‌ها اضافه شود.' },
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'ارسال بازخورد' }));

    await waitFor(() => {
      expect(api.submitFeedbackApi).toHaveBeenCalledWith({
        type: 'feature_request',
        title: 'افزودن خروجی اکسل پیشرفته',
        description: 'لطفاً امکان سفارشی‌سازی ستون‌ها اضافه شود.',
        page_url: window.location.pathname,
        screenshot_data: undefined,
      });
    });

    expect(await screen.findByText('بازخورد شما با موفقیت ثبت شد')).toBeInTheDocument();
  });

  it('closes on close button click', () => {
    render(<FeedbackModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('بستن'));
    expect(onClose).toHaveBeenCalled();
  });
});
