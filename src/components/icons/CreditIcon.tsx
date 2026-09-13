import type { FC, SVGProps } from 'react';

export interface CreditIconProps extends Omit<SVGProps<SVGSVGElement>, 'viewBox'> {
  size?: number;
}

/**
 * Shopeek Credit brand icon (custom mark replacing the lucide Asterisk).
 * Fill defaults to currentColor so Tailwind text-* classes tint it.
 */
export const CreditIcon: FC<CreditIconProps> = ({ size = 24, className, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 173.3 198.4"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...rest}
  >
    <path d="M101.9,89.3l69.3-40c.5-.3,1-.6,1.4-1l-43.4-25.3-36.1,20.8c-2.7,1.6-4.4,4.5-4.4,7.6v30.3c0,6.7,7.3,11,13.1,7.6h.1Z" />
    <path d="M86.2,81.7V1.7c0-.6,0-1.2-.2-1.7l-43.6,24.9v41.7c0,3.1,1.7,6.1,4.3,7.6l26.2,15.1c5.8,3.4,13.2-.8,13.1-7.5h0l.2-.1Z" />
    <path d="M71.1,91.4L1.8,51.4c-.5-.3-1-.6-1.6-.7l-.2,50.2,36.1,20.9c2.7,1.5,6.1,1.6,8.8,0l26.2-15.1c5.8-3.4,5.9-11.8,0-15.1h0v-.2Z" />
    <path d="M87.7,116.7v80c0,.6,0,1.2.2,1.7l43.6-24.9v-41.7c0-3.1-1.7-6.1-4.3-7.6l-26.2-15.1c-5.8-3.4-13.2.8-13.1,7.5h0l-.2.1Z" />
    <path d="M72.1,109.3L2.8,149.3c-.5.3-1,.6-1.4,1l43.4,25.3,36.1-20.8c2.7-1.6,4.4-4.5,4.4-7.6v-30.3c0-6.7-7.3-11-13.1-7.6h-.1Z" />
    <path d="M102.2,107l69.3,40c.5.3,1,.6,1.6.7l.2-50.2-36.1-20.9c-2.7-1.5-6.1-1.6-8.8,0l-26.2,15.2c-5.8,3.4-5.9,11.8,0,15.1h0v.1Z" />
  </svg>
);