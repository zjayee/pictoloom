import { useEffect, useState } from 'react';

/**
 * Format seconds into HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * React countdown hook
 * @returns [formattedTime, startCountdown]
 */
export function useCountdown(): [string, (seconds: number) => void] {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining]);

  const start = (seconds: number) => {
    setRemaining(seconds);
  };

  return [formatTime(remaining), start];
}
