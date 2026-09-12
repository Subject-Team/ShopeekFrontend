import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TurnstileWidget } from '../TurnstileWidget';

// Override the global Turnstile mock so onExpire/onError callbacks are reachable.
const { mockTurnstileCallbacks } = vi.hoisted(() => {
  const callbacks: Record<string, ((token?: string) => void) | undefined> = {};
  return { mockTurnstileCallbacks: callbacks };
});

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: (props: any) => {
    mockTurnstileCallbacks.onSuccess = props.onSuccess;
    mockTurnstileCallbacks.onExpire = props.onExpire;
    mockTurnstileCallbacks.onError = props.onError;
    return React.createElement('div', { 'data-testid': 'mock-turnstile' });
  },
}));

describe('TurnstileWidget', () => {
  it('renders the turnstile widget and reports the token', async () => {
    const onTokenChange = vi.fn();
    const ref = React.createRef<any>();

    render(<TurnstileWidget turnstileRef={ref} onTokenChange={onTokenChange} />);

    expect(screen.getByTestId('mock-turnstile')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockTurnstileCallbacks.onSuccess).toBeDefined();
    });
  });

  it('clears the token when the challenge expires', () => {
    const onTokenChange = vi.fn();
    render(<TurnstileWidget turnstileRef={React.createRef<any>()} onTokenChange={onTokenChange} />);

    mockTurnstileCallbacks.onExpire?.();
    expect(onTokenChange).toHaveBeenCalledWith(null);
  });

  it('clears the token when the challenge errors', () => {
    const onTokenChange = vi.fn();
    render(<TurnstileWidget turnstileRef={React.createRef<any>()} onTokenChange={onTokenChange} />);

    mockTurnstileCallbacks.onError?.();
    expect(onTokenChange).toHaveBeenCalledWith(null);
  });
});