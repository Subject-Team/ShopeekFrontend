import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvisoryHistoryModal } from '../AdvisoryHistoryModal';
import { AIAdvisory } from '../../../types';

const HISTORY: AIAdvisory[] = [
  {
    id: 'adv-1',
    summary: 'افزایش قیمت محصول پرفروش',
    recommendation_text: 'با توجه به تقاضای بالا، افزایش ۵ درصدی قیمت پیشنهاد می‌شود.',
    trigger_type: 'MANUAL',
    generated_at: '2026-08-01T10:00:00',
  },
  {
    id: 'adv-2',
    summary: 'جایگزینی کالای کم‌فروش',
    recommendation_text: 'کالای X فروش نزولی دارد؛ جایگزینی با محصول مکمل بررسی شود.',
    trigger_type: 'SCHEDULED_3H',
    generated_at: '2026-08-02T13:30:00',
  },
] as unknown as AIAdvisory[];

const renderModal = (history: AIAdvisory[] = HISTORY) => {
  const onClose = vi.fn();
  render(<AdvisoryHistoryModal isOpen onClose={onClose} history={history} />);
  return { onClose };
};

describe('AdvisoryHistoryModal Component', () => {
  it('renders nothing when closed', () => {
    render(<AdvisoryHistoryModal isOpen={false} onClose={vi.fn()} history={HISTORY} />);
    expect(screen.queryByText(/پیشنهادات قبلی هوش مصنوعی/i)).not.toBeInTheDocument();
  });

  it('shows the empty-state message when history is empty', () => {
    renderModal([]);
    expect(screen.getByText(/هیچ پیشنهادی در ۳ روز گذشته ثبت نشده است/i)).toBeInTheDocument();
  });

  it('lists summaries with trigger badges', () => {
    renderModal();
    expect(screen.getByText('افزایش قیمت محصول پرفروش')).toBeInTheDocument();
    expect(screen.getByText('جایگزینی کالای کم‌فروش')).toBeInTheDocument();
    // Trigger badges only render in expanded content
    const firstHeader = screen.getAllByRole('button')[1];
    fireEvent.click(firstHeader);
    expect(screen.getByText('تولید دستی')).toBeInTheDocument();
    const secondHeader = screen.getAllByRole('button')[2];
    fireEvent.click(secondHeader);
    expect(screen.getByText('تولید خودکار ۳ ساعته')).toBeInTheDocument();
  });

  it('expands an item on click showing its body, then collapses it again', () => {
    renderModal();

    const toggleBtn = screen.getAllByRole('button')[1]; // first accordion header (after close button)
    fireEvent.click(toggleBtn);

    expect(
      screen.getByText('با توجه به تقاضای بالا، افزایش ۵ درصدی قیمت پیشنهاد می‌شود.')
    ).toBeInTheDocument();
    expect(screen.getByText(/زمان تولید:/i)).toBeInTheDocument();

    // Clicking the same header collapses the item
    fireEvent.click(toggleBtn);
    expect(
      screen.queryByText('با توجه به تقاضای بالا، افزایش ۵ درصدی قیمت پیشنهاد می‌شود.')
    ).not.toBeInTheDocument();
  });

  it('falls back to default titles when summary is missing', () => {
    renderModal([{ ...HISTORY[0], summary: '' } as any]);
    expect(screen.getByText('پیشنهاد هوشمند')).toBeInTheDocument();
  });

  it('closes via the header close button', () => {
    const { onClose } = renderModal();
    fireEvent.click(screen.getByTitle('بستن'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking the backdrop', () => {
    const { onClose } = renderModal();
    // The backdrop is the second fixed inset-0 div (first is the outer wrapper)
    const backdrops = document.querySelectorAll('.fixed.inset-0');
    const backdrop = backdrops[1] as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
