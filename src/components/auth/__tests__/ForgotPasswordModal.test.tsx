// @test-type component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordModal } from '../ForgotPasswordModal';
import { ToastProvider } from '../../../context/ToastContext';
import { sendOtpApi, confirmPasswordResetApi } from '../../../services/api';

vi.mock('../../../services/api', () => ({
  sendOtpApi: vi.fn(),
  confirmPasswordResetApi: vi.fn(),
}));

const mockedSendOtp = vi.mocked(sendOtpApi);
const mockedConfirmReset = vi.mocked(confirmPasswordResetApi);

const renderModal = (onClose = vi.fn()) =>
  render(
    <ToastProvider>
      <ForgotPasswordModal open onClose={onClose} />
    </ToastProvider>
  );

const fillPhoneAndSend = async () => {
  fireEvent.change(screen.getByTestId('otp-phone'), { target: { value: '09123456789' } });
  fireEvent.click(screen.getByTestId('forgot-send-btn'));
  await waitFor(() => expect(screen.getByTestId('otp-code')).toBeInTheDocument());
};

describe('[component] ForgotPasswordModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(
      <ToastProvider>
        <ForgotPasswordModal open={false} onClose={vi.fn()} />
      </ToastProvider>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the phone step with turnstile and send button', () => {
    renderModal();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('otp-phone')).toBeInTheDocument();
    expect(screen.getByTestId('mock-turnstile')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-send-btn')).toBeInTheDocument();
  });

  it('sends the OTP and advances to the verify step', async () => {
    mockedSendOtp.mockResolvedValue({ sent: true, registered: true });
    renderModal();

    await fillPhoneAndSend();

    expect(mockedSendOtp).toHaveBeenCalledWith({
      phone: '09123456789',
      turnstile_token: 'mock-turnstile-token',
    });
    expect(screen.getByText(/کد تأیید به/)).toBeInTheDocument();
    expect(screen.getByText('۰۹۱۲۳۴۵۶۷۸۹')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-confirm-btn')).toBeInTheDocument();
    expect(screen.getByLabelText('کلمه عبور جدید')).toBeInTheDocument();
    expect(screen.getByLabelText('تکرار کلمه عبور جدید')).toBeInTheDocument();
  });

  it('shows an error when the phone is not registered', async () => {
    mockedSendOtp.mockResolvedValue({ sent: false, registered: false });
    renderModal();

    fireEvent.change(screen.getByTestId('otp-phone'), { target: { value: '09123456789' } });
    fireEvent.click(screen.getByTestId('forgot-send-btn'));

    await waitFor(() =>
      expect(screen.getByTestId('forgot-error')).toHaveTextContent('این شماره ثبت‌نام نشده است')
    );
    expect(screen.queryByTestId('otp-code')).not.toBeInTheDocument();
  });

  it('surfaces backend error messages verbatim on confirm failure', async () => {
    mockedSendOtp.mockResolvedValue({ sent: true, registered: true });
    mockedConfirmReset.mockRejectedValue(new Error('کد وارد شده نامعتبر است.'));
    renderModal();
    await fillPhoneAndSend();

    fireEvent.change(screen.getByTestId('otp-code'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('کلمه عبور جدید'), {
      target: { value: 'Abcd1234!' },
    });
    fireEvent.change(screen.getByLabelText('تکرار کلمه عبور جدید'), {
      target: { value: 'Abcd1234!' },
    });
    fireEvent.click(screen.getByTestId('forgot-confirm-btn'));

    await waitFor(() =>
      expect(screen.getByTestId('forgot-error')).toHaveTextContent('کد وارد شده نامعتبر است.')
    );
  });

  it('completes the reset and shows the other-sessions notice', async () => {
    mockedSendOtp.mockResolvedValue({ sent: true, registered: true });
    mockedConfirmReset.mockResolvedValue({ message: 'ok', other_sessions_count: 3 });
    renderModal();
    await fillPhoneAndSend();

    fireEvent.change(screen.getByTestId('otp-code'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('کلمه عبور جدید'), {
      target: { value: 'Abcd1234!' },
    });
    fireEvent.change(screen.getByLabelText('تکرار کلمه عبور جدید'), {
      target: { value: 'Abcd1234!' },
    });
    fireEvent.click(screen.getByTestId('forgot-confirm-btn'));

    await waitFor(() => expect(screen.getByTestId('forgot-done')).toBeInTheDocument());
    expect(mockedConfirmReset).toHaveBeenCalledWith({
      phone: '09123456789',
      code: '123456',
      new_password: 'Abcd1234!',
      confirm_new_password: 'Abcd1234!',
    });
    expect(screen.getByTestId('forgot-other-sessions')).toHaveTextContent('۳ نشست فعال دیگر');
    expect(screen.getByTestId('forgot-other-sessions')).toHaveTextContent('تنظیمات > نشست‌ها');
  });

  it('skips the other-sessions notice when the count is zero', async () => {
    mockedSendOtp.mockResolvedValue({ sent: true, registered: true });
    mockedConfirmReset.mockResolvedValue({ message: 'ok', other_sessions_count: 0 });
    renderModal();
    await fillPhoneAndSend();

    fireEvent.change(screen.getByTestId('otp-code'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('کلمه عبور جدید'), {
      target: { value: 'Abcd1234!' },
    });
    fireEvent.change(screen.getByLabelText('تکرار کلمه عبور جدید'), {
      target: { value: 'Abcd1234!' },
    });
    fireEvent.click(screen.getByTestId('forgot-confirm-btn'));

    await waitFor(() => expect(screen.getByTestId('forgot-done')).toBeInTheDocument());
    expect(screen.queryByTestId('forgot-other-sessions')).not.toBeInTheDocument();
  });

  it('closes the modal via the header close button', () => {
    const onClose = vi.fn();
    renderModal(onClose);

    fireEvent.click(screen.getByTestId('forgot-close-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
