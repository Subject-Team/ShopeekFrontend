import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const cleanHash = (): void => {
  const { pathname, search } = window.location;
  window.history.replaceState(null, '', pathname + search);
};

export const GoTrueCallbackHandler: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const rawHash = window.location.hash;
    if (!rawHash || rawHash === '#') return;

    const params = new URLSearchParams(rawHash.slice(1));

    const errorDescription = params.get('error_description');
    if (errorDescription) {
      handled.current = true;
      cleanHash();
      showToast(errorDescription, 'error');
      return;
    }

    const accessToken = params.get('access_token');
    if (!accessToken) return;

    // Prevent StrictMode double-run and replay across navigations.
    handled.current = true;
    cleanHash();

    const refreshToken = params.get('refresh_token');
    localStorage.setItem('shopeek_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('shopeek_refresh_token', refreshToken);
    }

    // The verification-link redirect carries a GoTrue refresh token. Exchange it
    // through /auth/refresh so the backend returns a canonical session with the
    // business user (and email_verified synced by the backend).
    refreshAccessToken().then((outcome) => {
      if (outcome === 'ok') {
        showToast('حساب شما با موفقیت تأیید شد.', 'success');
        navigate('/dashboard', { replace: true });
        return;
      }
      if (outcome === 'invalid') {
        showToast('نشست تأیید ایمیل منقضی شده است؛ لطفاً مجدداً وارد شوید.', 'error');
        return;
      }
      // 'unavailable': transient network failure — the stored session stays.
      showToast('ارتباط با سرور برقرار نشد؛ لطفاً دوباره تلاش کنید.', 'error');
    });
  }, [navigate, showToast]);

  return null;
};