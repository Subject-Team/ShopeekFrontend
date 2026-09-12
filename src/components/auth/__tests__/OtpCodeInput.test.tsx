import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OtpCodeInput } from '../OtpCodeInput';

// Enable the WebOTP branch (WEB_OTP_NOT_SUPPORTED is computed at module load,
// so navigator.credentials must exist before the component module is imported).
const { mockCredentialsGet } = vi.hoisted(() => {
  const mockCredentialsGet = vi.fn();
  Object.defineProperty(navigator, 'credentials', {
    configurable: true,
    value: { get: mockCredentialsGet },
  });
  return { mockCredentialsGet };
});

describe('OtpCodeInput', () => {
  beforeEach(() => {
    mockCredentialsGet.mockReset();
    mockCredentialsGet.mockResolvedValue(null);
  });

  it('renders label and numeric input with maxLength 6', () => {
    render(<OtpCodeInput value="" onChange={vi.fn()} />);

    expect(screen.getByLabelText('کد تأیید')).toBeInTheDocument();
    const input = screen.getByTestId('otp-code') as HTMLInputElement;
    expect(input).toHaveAttribute('maxLength', '6');
    expect(input).toHaveAttribute('inputMode', 'numeric');
    expect(input).toHaveAttribute('placeholder', '123456');
  });

  it('strips non-digit characters and caps at 6 digits', () => {
    const onChange = vi.fn();
    render(<OtpCodeInput value="" onChange={onChange} />);
    const input = screen.getByTestId('otp-code');

    fireEvent.change(input, { target: { value: '12a34' } });
    expect(onChange).toHaveBeenLastCalledWith('1234');

    fireEvent.change(input, { target: { value: '123456789' } });
    expect(onChange).toHaveBeenLastCalledWith('123456');
  });

  it('auto-verifies when a WebOTP credential arrives', async () => {
    mockCredentialsGet.mockResolvedValue({ code: '654321' });
    const onChange = vi.fn();
    const onAutoVerify = vi.fn();

    render(<OtpCodeInput value="" onChange={onChange} onAutoVerify={onAutoVerify} />);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('654321');
      expect(onAutoVerify).toHaveBeenCalledTimes(1);
    });
  });

  it('ignores a WebOTP credential without a code', async () => {
    mockCredentialsGet.mockResolvedValue({});
    const onChange = vi.fn();
    const onAutoVerify = vi.fn();

    render(<OtpCodeInput value="" onChange={onChange} onAutoVerify={onAutoVerify} />);

    await waitFor(() => {
      expect(mockCredentialsGet).toHaveBeenCalled();
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(onAutoVerify).not.toHaveBeenCalled();
  });

  it('swallows WebOTP errors and keeps manual entry working', async () => {
    mockCredentialsGet.mockRejectedValue(new Error('aborted'));
    const onChange = vi.fn();

    render(<OtpCodeInput value="" onChange={onChange} />);

    await waitFor(() => {
      expect(mockCredentialsGet).toHaveBeenCalled();
    });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(screen.getByTestId('otp-code'), { target: { value: '111222' } });
    expect(onChange).toHaveBeenCalledWith('111222');
  });

  it('cleans up the WebOTP request on unmount', async () => {
    mockCredentialsGet.mockResolvedValue({ code: '123456' });
    const onChange = vi.fn();
    const onAutoVerify = vi.fn();

    const { unmount } = render(<OtpCodeInput value="" onChange={onChange} onAutoVerify={onAutoVerify} />);
    unmount();

    // Cleanup aborts the controller; the resolved credential must be ignored.
    await new Promise((r) => setTimeout(r, 0));
    expect(onChange).not.toHaveBeenCalled();
    expect(onAutoVerify).not.toHaveBeenCalled();
  });
});