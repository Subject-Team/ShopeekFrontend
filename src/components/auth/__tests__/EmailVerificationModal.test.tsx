import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailVerificationModal } from '../EmailVerificationModal';
import { AuthProvider } from '../../../context/AuthContext';
import { ToastProvider } from '../../../context/ToastContext';
import * as api from '../../../services/api';

vi.mock('../../../services/api', () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  verifyEmailApi: vi.fn(),
  resendVerificationApi: vi.fn(),
  fetchMeApi: vi.fn(),
}));

describe('EmailVerificationModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderModal = (props: {
    isOpen: boolean;
    email: string;
    onClose?: () => void;
    onSuccess?: () => void;
    onEditEmail?: () => void;
  }) => {
    return render(
      <AuthProvider>
        <ToastProvider>
          <EmailVerificationModal
            isOpen={props.isOpen}
            email={props.email}
            onClose={props.onClose || vi.fn()}
            onSuccess={props.onSuccess || vi.fn()}
            onEditEmail={props.onEditEmail || vi.fn()}
          />
        </ToastProvider>
      </AuthProvider>
    );
  };

  it('renders correctly with 6 digit inputs and target email', () => {
    renderModal({ isOpen: true, email: 'user@example.com' });

    expect(screen.getByText('تایید نشانی ایمیل')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('ویرایش ایمیل')).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('does not render when isOpen is false', () => {
    renderModal({ isOpen: false, email: 'user@example.com' });
    expect(screen.queryByText('تایید نشانی ایمیل')).not.toBeInTheDocument();
  });

  it('handles paste of a 6-digit code across all boxes and submits', async () => {
    const onSuccess = vi.fn();
    (api.verifyEmailApi as any).mockResolvedValue({
      access_token: 'valid-token',
      token_type: 'bearer',
      user: { id: 'u-1', email: 'user@example.com', is_email_verified: true },
    });

    renderModal({ isOpen: true, email: 'user@example.com', onSuccess });

    const inputs = screen.getAllByRole('textbox');
    const container = inputs[0].closest('div');

    fireEvent.paste(container!, {
      clipboardData: {
        getData: () => '654321',
      },
    });

    await waitFor(() => {
      expect(api.verifyEmailApi).toHaveBeenCalledWith({
        email: 'user@example.com',
        code: '654321',
      });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('allows manual typing of 6 digits and submits', async () => {
    const onSuccess = vi.fn();
    (api.verifyEmailApi as any).mockResolvedValue({
      access_token: 'valid-token',
      token_type: 'bearer',
      user: { id: 'u-1', email: 'user@example.com', is_email_verified: true },
    });

    renderModal({ isOpen: true, email: 'user@example.com', onSuccess });

    const inputs = screen.getAllByRole('textbox');
    ['1', '2', '3', '4', '5', '6'].forEach((char, i) => {
      fireEvent.change(inputs[i], { target: { value: char } });
    });

    const submitBtn = screen.getByText('تایید نشانی ایمیل و ورود');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.verifyEmailApi).toHaveBeenCalledWith({
        email: 'user@example.com',
        code: '123456',
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onEditEmail when edit button is clicked', () => {
    const onEditEmail = vi.fn();
    renderModal({ isOpen: true, email: 'user@example.com', onEditEmail });

    const editBtn = screen.getByText('ویرایش ایمیل');
    fireEvent.click(editBtn);

    expect(onEditEmail).toHaveBeenCalled();
  });
});
