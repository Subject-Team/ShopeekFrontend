import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhoneInput } from '../PhoneInput';

describe('PhoneInput', () => {
  it('renders label, input and placeholder', () => {
    render(<PhoneInput value="" onChange={vi.fn()} hasError={false} />);

    expect(screen.getByLabelText('شماره موبایل')).toBeInTheDocument();
    const input = screen.getByTestId('otp-phone') as HTMLInputElement;
    expect(input).toHaveAttribute('placeholder', '09123456789');
    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toHaveAttribute('dir', 'ltr');
  });

  it('normalizes +98 / 0098 / Persian digits to 09 format on change', () => {
    const onChange = vi.fn();
    render(<PhoneInput value="" onChange={onChange} hasError={false} />);
    const input = screen.getByTestId('otp-phone');

    fireEvent.change(input, { target: { value: '+989123456789' } });
    expect(onChange).toHaveBeenLastCalledWith('09123456789');

    fireEvent.change(input, { target: { value: '00989123456789' } });
    expect(onChange).toHaveBeenLastCalledWith('09123456789');

    fireEvent.change(input, { target: { value: '+۹۸۹۱۲۳۴۵۶۷۸۹' } });
    expect(onChange).toHaveBeenLastCalledWith('09123456789');
  });

  it('clears a dangling + or +9 prefix on blur', () => {
    const onChange = vi.fn();
    const { rerender } = render(<PhoneInput value="+" onChange={onChange} hasError={false} />);
    const input = screen.getByTestId('otp-phone');

    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith('');

    rerender(<PhoneInput value="+9" onChange={onChange} hasError={false} />);
    fireEvent.blur(screen.getByTestId('otp-phone'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('does not clear a complete phone number on blur', () => {
    const onChange = vi.fn();
    render(<PhoneInput value="09123456789" onChange={onChange} hasError={false} />);

    fireEvent.blur(screen.getByTestId('otp-phone'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies error styling when hasError is true', () => {
    const { rerender } = render(<PhoneInput value="" onChange={vi.fn()} hasError={true} />);
    expect(screen.getByTestId('otp-phone').className).toContain('border-rose-400');

    rerender(<PhoneInput value="" onChange={vi.fn()} hasError={false} />);
    expect(screen.getByTestId('otp-phone').className).not.toContain('border-rose-400');
  });
});