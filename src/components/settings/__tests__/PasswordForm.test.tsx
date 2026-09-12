import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PasswordForm } from '../PasswordForm';
import { ToastProvider } from '../../../context/ToastContext';
import * as api from '../../../services/api';

vi.mock('../../../services/api', () => ({
  changePassword: vi.fn(),
}));

const renderForm = (readOnly = false) => {
  return render(
    <ToastProvider>
      <PasswordForm readOnly={readOnly} />
    </ToastProvider>
  );
};

const getInputs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('input')) as HTMLInputElement[];

const fillValidForm = (container: HTMLElement) => {
  const inputs = getInputs(container);
  fireEvent.change(inputs[0], { target: { value: 'OldPass123!' } });
  fireEvent.change(inputs[1], { target: { value: 'NewPass123!' } });
  fireEvent.change(inputs[2], { target: { value: 'NewPass123!' } });
};

describe('PasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the card title and description', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: 'تغییر کلمه عبور' })).toBeInTheDocument();
    expect(screen.getByText(/برای حفظ امنیت حساب/)).toBeInTheDocument();
  });

  it('shows a read-only notice and no form when readOnly is true', () => {
    const { container } = renderForm(true);

    expect(
      screen.getByText(/حساب‌های با دسترسی فقط‌خواندنی نمی‌توانند کلمه عبور خود را تغییر دهند/)
    ).toBeInTheDocument();
    expect(getInputs(container)).toHaveLength(0);
  });

  it('renders three password fields and a submit button', () => {
    const { container } = renderForm();

    expect(screen.getByText('کلمه عبور فعلی')).toBeInTheDocument();
    expect(screen.getByText('کلمه عبور جدید')).toBeInTheDocument();
    expect(screen.getByText('تکرار کلمه عبور جدید')).toBeInTheDocument();
    expect(getInputs(container)).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'تغییر کلمه عبور' })).toBeInTheDocument();
  });

  it('toggles visibility of all three password fields', () => {
    const { container } = renderForm();

    const inputs = getInputs(container);
    expect(inputs.every((i) => i.type === 'password')).toBe(true);

    const toggleButtons = screen.getAllByLabelText('نمایش کلمه عبور');
    expect(toggleButtons).toHaveLength(3);

    fireEvent.click(toggleButtons[0]);
    expect(inputs[0].type).toBe('text');

    fireEvent.click(toggleButtons[1]);
    expect(inputs[1].type).toBe('text');

    fireEvent.click(toggleButtons[2]);
    expect(inputs[2].type).toBe('text');

    fireEvent.click(screen.getAllByLabelText('پنهان کردن کلمه عبور')[0]);
    expect(inputs[0].type).toBe('password');
  });

  it('shows the strength meter once a new password is typed', () => {
    const { container } = renderForm();

    expect(screen.queryByText('میزان امنیت کلمه عبور:')).not.toBeInTheDocument();

    const inputs = getInputs(container);
    fireEvent.change(inputs[1], { target: { value: 'NewPass123!' } });

    expect(screen.getByText('میزان امنیت کلمه عبور:')).toBeInTheDocument();
  });

  it('rejects an invalid submit with a toast and does not call the API', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'تغییر کلمه عبور' }));

    await waitFor(() => {
      expect(api.changePassword).not.toHaveBeenCalled();
    });
    expect(screen.getByText('لطفاً همه فیلدها را به درستی تکمیل کنید.')).toBeInTheDocument();
  });

  it('changes the password successfully and clears the fields', async () => {
    (api.changePassword as any).mockResolvedValue({ message: 'کلمه عبور شما با موفقیت تغییر کرد.' });

    const { container } = renderForm();
    fillValidForm(container);
    fireEvent.click(screen.getByRole('button', { name: 'تغییر کلمه عبور' }));

    await waitFor(() => {
      expect(api.changePassword).toHaveBeenCalledWith({
        current_password: 'OldPass123!',
        new_password: 'NewPass123!',
        confirm_new_password: 'NewPass123!',
      });
    });

    expect(screen.getByText('کلمه عبور شما با موفقیت تغییر کرد.')).toBeInTheDocument();
    expect(getInputs(container).every((i) => i.value === '')).toBe(true);
  });

  it('shows the server error message when the change fails', async () => {
    (api.changePassword as any).mockRejectedValue(new Error('کلمه عبور فعلی صحیح نیست.'));

    const { container } = renderForm();
    fillValidForm(container);
    fireEvent.click(screen.getByRole('button', { name: 'تغییر کلمه عبور' }));

    await waitFor(() => {
      expect(screen.getByText('کلمه عبور فعلی صحیح نیست.')).toBeInTheDocument();
    });
  });

  it('shows a generic error when the failure is not an Error instance', async () => {
    (api.changePassword as any).mockRejectedValue('server exploded');

    const { container } = renderForm();
    fillValidForm(container);
    fireEvent.click(screen.getByRole('button', { name: 'تغییر کلمه عبور' }));

    await waitFor(() => {
      expect(screen.getByText('خطا در تغییر کلمه عبور')).toBeInTheDocument();
    });
  });
});