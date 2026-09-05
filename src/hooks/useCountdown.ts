import { useState, useEffect } from 'react';

export const useCountdown = (active: boolean, seconds: number) => {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (active) {
      setRemaining(seconds);
    }
  }, [active, seconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [remaining > 0]);

  return remaining;
};
