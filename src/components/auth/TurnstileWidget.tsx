import React from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY =
  (import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY as string) || '0x4AAAAAAEZPje7Wc0YAQw6O';

interface TurnstileWidgetProps {
  turnstileRef: React.RefObject<TurnstileInstance | null>;
  onTokenChange: (token: string | null) => void;
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ turnstileRef, onTokenChange }) => (
  <div className="flex justify-center items-center py-2 min-h-[65px] w-full overflow-hidden">
    <Turnstile
      ref={turnstileRef}
      siteKey={TURNSTILE_SITE_KEY}
      onSuccess={(token) => onTokenChange(token)}
      onExpire={() => onTokenChange(null)}
      onError={() => onTokenChange(null)}
      options={{ theme: 'light', language: 'fa', size: 'normal' }}
    />
  </div>
);
