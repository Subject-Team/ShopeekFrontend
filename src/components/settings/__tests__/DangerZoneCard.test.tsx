import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DangerZoneCard } from '../DangerZoneCard';

describe('DangerZoneCard', () => {
  it('renders the danger zone title and description', () => {
    render(<DangerZoneCard onDeleteClick={vi.fn()} />);

    expect(screen.getByText('بخش حساس (منطقه خطر)')).toBeInTheDocument();
    expect(screen.getByText(/عملیات‌های دارای تأثیر دائمی/)).toBeInTheDocument();
    expect(screen.getAllByText('حذف حساب کاربری')).toHaveLength(2);
    expect(screen.getByText(/با حذف حساب، دسترسی شما به سامانه قطع خواهد شد/)).toBeInTheDocument();
  });

  it('calls onDeleteClick when the delete button is clicked', () => {
    const onDeleteClick = vi.fn();
    render(<DangerZoneCard onDeleteClick={onDeleteClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'حذف حساب کاربری' }));
    expect(onDeleteClick).toHaveBeenCalledTimes(1);
  });

  it('disables the delete button when disabled is true', () => {
    const onDeleteClick = vi.fn();
    render(<DangerZoneCard onDeleteClick={onDeleteClick} disabled />);

    const btn = screen.getByRole('button', { name: 'حذف حساب کاربری' });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onDeleteClick).not.toHaveBeenCalled();
  });
});