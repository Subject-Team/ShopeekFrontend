import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubmitButton } from '../SubmitButton';

describe('SubmitButton', () => {
  it('renders children with submit type by default', () => {
    render(
      <SubmitButton disabled={false} submitting={false}>
        <span>ورود به داشبورد</span>
      </SubmitButton>
    );

    const btn = screen.getByRole('button', { name: 'ورود به داشبورد' });
    expect(btn).toHaveAttribute('type', 'submit');
    expect(btn).toBeEnabled();
  });

  it('supports button type, onClick and dataTestId', () => {
    const onClick = vi.fn();
    render(
      <SubmitButton type="button" disabled={false} submitting={false} onClick={onClick} dataTestId="otp-send-btn">
        <span>دریافت کد تأیید</span>
      </SubmitButton>
    );

    const btn = screen.getByTestId('otp-send-btn');
    expect(btn).toHaveAttribute('type', 'button');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <SubmitButton disabled={true} submitting={false}>
        <span>ورود</span>
      </SubmitButton>
    );
    expect(screen.getByRole('button', { name: 'ورود' })).toBeDisabled();
  });

  it('shows a spinner and hides children while submitting', () => {
    render(
      <SubmitButton disabled={false} submitting={true}>
        <span>ورود</span>
      </SubmitButton>
    );

    expect(screen.queryByText('ورود')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders the arrow icon when withArrow is set', () => {
    render(
      <SubmitButton disabled={false} submitting={false} withArrow>
        <span>ایجاد حساب کاربری</span>
      </SubmitButton>
    );

    expect(screen.getByRole('button', { name: 'ایجاد حساب کاربری' })).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});