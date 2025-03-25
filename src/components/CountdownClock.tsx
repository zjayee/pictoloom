import { Devvit, useInterval, useState } from "@devvit/public-api";
import { OffbitFont } from "./OffbitFont.js";

export interface CountdownClockProps {
  startTimeInSeconds: number;
}

export function CountdownClock({ startTimeInSeconds }: CountdownClockProps) {
  const [remainingTime, setRemainingTime] = useState(() => startTimeInSeconds);

  useInterval(() => {
    setRemainingTime((prev: number) => Math.max(prev - 1, 0));
  }, 1000).start();

  const formatTime = (seconds: number) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return <OffbitFont scale={0.25}>{formatTime(remainingTime)}</OffbitFont>;
}
