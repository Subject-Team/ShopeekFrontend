import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteAccountModal } from '../DeleteAccountModal';

const renderModal = (props: Partial<React.ComponentProps<typeof DeleteAccountModal>> = {}) => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  render(
    <DeleteAccountModal
      isOpen={true}
      onClose={onClose}
      onConfirm={onConfirm}
      {...props}
    />
  );
  return { onClose, onConfirm };
};

describe('DeleteAccountModal', () => {
  it('renders nothing when closed', () => {
    render(<DeleteAccountModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog with title and description', () => {
    renderModal();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('آیا از حذف حساب کاربری خود اطمینان دارید؟')).toBeInTheDocument();
    expect(screen.getByText(/پس از حذف در سامانه نگهداری می‌شود/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'خیر، انصراف' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'بله، حذف حساب' })).toBeInTheDocument();
  });

  it('focuses the cancel button when opened', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'خیر، انصراف' })).toHaveFocus();
  });

  it('closes via the close button', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'بستن' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes via the cancel button', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'خیر، انصراف' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes via the backdrop click', () => {
    const { onClose } = renderModal();

    const backdrop = screen.getByRole('dialog').firstElementChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('confirms deletion', () => {
    const { onConfirm } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'بله، حذف حساب' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables all buttons and ignores backdrop clicks while submitting', () => {
    const { onClose, onConfirm } = renderModal({ isSubmitting: true });

    expect(screen.getByRole('button', { name: 'بستن' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'خیر، انصراف' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'بله، حذف حساب' })).toBeDisabled();

    const backdrop = screen.getByRole('dialog').firstElementChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});