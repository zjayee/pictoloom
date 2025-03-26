import React, { useEffect, useState } from 'react';

export interface CountdownClockProps {
  startTimeInSeconds: number;
}

export const CountdownClock: React.FC<CountdownClockProps> = ({
  startTimeInSeconds,
}) => {
  const [remainingTime, setRemainingTime] = useState(startTimeInSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="countdown-clock z-1 ml-[0.9em] flex w-[100%] items-center">
      {formatTime(remainingTime)}
    </div>
  );
};
