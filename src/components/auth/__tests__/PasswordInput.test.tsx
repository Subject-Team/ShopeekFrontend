import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from '../PasswordInput';

const baseProps = {
  id: 'auth-password',
  name: 'password',
  label: 'کلمه عبور',
  value: '',
  onChange: vi.fn(),
  showPassword: false,
  onToggleShow: vi.fn(),
  autoComplete: 'current-password',
  hasError: false,
  toggleAriaLabel: 'نمایش کلمه عبور',
};

describe('PasswordInput', () => {
  it('renders label, password input and toggle button', () => {
    render(<PasswordInput {...baseProps} />);

    expect(screen.getByLabelText('کلمه عبور')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('id', 'auth-password');
    expect(input).toHaveAttribute('name', 'password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByLabelText('نمایش کلمه عبور')).toBeInTheDocument();
  });

  it('shows text when showPassword is true and calls onToggleShow', () => {
    const onToggleShow = vi.fn();
    render(<PasswordInput {...baseProps} showPassword={true} onToggleShow={onToggleShow} toggleAriaLabel="مخفی‌سازی کلمه عبور" />);

    const input = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByLabelText('مخفی‌سازی کلمه عبور'));
    expect(onToggleShow).toHaveBeenCalledTimes(1);
  });

  it('forwards value changes to onChange', () => {
    const onChange = vi.fn();
    render(<PasswordInput {...baseProps} onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'Secret123!' } });
    expect(onChange).toHaveBeenCalledWith('Secret123!');
  });

  it('applies error styling when hasError is true', () => {
    const { rerender } = render(<PasswordInput {...baseProps} hasError={true} />);
    expect(screen.getByPlaceholderText('••••••••').className).toContain('border-rose-400');

    rerender(<PasswordInput {...baseProps} hasError={false} />);
    expect(screen.getByPlaceholderText('••••••••').className).not.toContain('border-rose-400');
  });

  it('uses borderClass override when provided', () => {
    render(<PasswordInput {...baseProps} borderClass="border border-emerald-300" />);
    expect(screen.getByPlaceholderText('••••••••').className).toContain('border-emerald-300');
  });

  it('renders children below the input', () => {
    render(
      <PasswordInput {...baseProps}>
        <p>راهنمای کلمه عبور</p>
      </PasswordInput>
    );
    expect(screen.getByText('راهنمای کلمه عبور')).toBeInTheDocument();
  });
});