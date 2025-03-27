import React, { useEffect, useState } from 'react';
import { CountdownClock } from '../../components/CountdownClock';
import { sendToDevvit } from '../../utils';
import { useDevvitListener } from '../../hooks/useDevvitListener';

export const FinishedDrawingPage: React.FC = () => {
  const [duration, setDuration] = useState<number | null>(null);
  const [numDrawn, setNumDrawn] = useState(0);
  const [data, setData] = useState<{
    postType: 'draw' | 'guess';
    round: number;
  } | null>(null);
  const countdownData = useDevvitListener('COUNTDOWN_DATA');
  const initData = useDevvitListener('INIT_RESPONSE');
  const referenceDrawingData = useDevvitListener('REFERENCE_DRAWINGS_DATA');

  useEffect(() => {
    sendToDevvit({ type: 'INIT' });
    sendToDevvit({ type: 'GET_COUNTDOWN_DURATION' });
    sendToDevvit({ type: 'GET_REFERENCE_DRAWINGS' });
  }, []);

  useEffect(() => {
    if (!countdownData) return;
    setDuration(countdownData.duration);
  }, [countdownData]);

  useEffect(() => {
    if (!initData) return;
    setData(initData);
  }, [initData]);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-red-300 text-white">
      {/* Background */}
      <img
        src="/assets/bg-purple.png"
        alt="Background"
        className="absolute inset-0 z-0 h-full w-full"
      />

      {/* Foreground UI */}
      <div className="relative z-30 flex h-full w-full items-center justify-center">
        {/* Left Column */}
        <div className="relative mt-[2em] ml-[1.1em] flex h-full w-[60%] max-w-[417px] flex-col items-end justify-start">
          <div className="flex w-[100%] justify-start pl-[3.7em]">
            {duration && <CountdownClock startTimeInSeconds={duration} />}
          </div>

          <img
            src="/assets/clock.svg"
            alt="Countdown clock"
            width={91.14}
            height={91.14}
            className="absolute top-[1.1em] left-[-0.2em] z-0"
          />
        </div>

        {/* Right Column */}
        <div className="flex h-full w-[40%] max-w-[284px] flex-col justify-between pr-[1em]">
          {/* Top: Round Image */}
          <div className="flex justify-end pt-[1em]">
            {/* {data && data.postType === 'draw' && (
              <img
                src={`/assets/round-${data.round}.gif`}
                alt="Round"
                width={140}
                height={140}
              />
            )} */}
            <img
              src={`/assets/round-1.gif`}
              alt="Round"
              width={140}
              height={140}
            />
          </div>

          {/* Bottom UI */}
          <div className="flex flex-col items-end gap-y-[0.9em] pr-[1.3em] pb-[1.4em]">
            {/* Users drawn */}
            <div className="relative w-[250px]">
              <div className="absolute top-0 left-0 flex h-[53px] w-[250px] items-center justify-center gap-x-[0.5em]">
                <img
                  src="/assets/megaphone.png"
                  width={35.65}
                  height={30}
                  alt="Megaphone"
                />
                <span className="mt-[0.3em] text-[1.3rem]">
                  {numDrawn} USERS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
