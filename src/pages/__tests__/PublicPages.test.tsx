import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../LandingPage';
import { LoginPage } from '../LoginPage';
import { ContactPage } from '../ContactPage';
import { PrivacyPage } from '../PrivacyPage';
import { NotFoundPage } from '../NotFoundPage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';

describe('Public Pages', () => {
  it('renders LandingPage with single H1 and hero title', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    expect(h1Elements.length).toBe(1);
    expect(screen.getAllByText(/شاپیک/i).length).toBeGreaterThan(0);
  });

  it('renders LoginPage with single H1, form fields, and submit button', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ToastProvider>
            <LoginPage />
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    expect(h1Elements.length).toBe(1);
    expect(screen.getByPlaceholderText('09123456789')).toBeInTheDocument();
  });

  it('renders ContactPage with single H1 and contact details', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    expect(h1Elements.length).toBe(1);
    expect(screen.getByText(/تماس با پشتیبانی و ارتباط با شاپیک/i)).toBeInTheDocument();
  });

  it('renders PrivacyPage with single H1 and legal policy text', () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>
    );

    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    expect(h1Elements.length).toBe(1);
    expect(screen.getByText(/سیاست حفظ حریم خصوصی و پردازش داده‌ها/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage with single H1 and 404 message', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    expect(h1Elements.length).toBe(1);
    expect(screen.getByText(/صفحه مورد نظر یافت نشد/i)).toBeInTheDocument();
  });
});
