import React, { useEffect, useState } from 'react';
import { CountdownClock } from '../../components/CountdownClock';
import { sendToDevvit } from '../../utils';
import { useDevvitListener } from '../../hooks/useDevvitListener';
import ImageFrame from '../../components/ImageFrame';

export const FinishedDrawingPage: React.FC = () => {
  const [duration, setDuration] = useState<number | null>(null);
  const [numDrawn, setNumDrawn] = useState(0);
  const [data, setData] = useState<{
    postType: 'draw' | 'guess';
    round: number;
  } | null>(null);
  const [userDrawing, setUserDrawing] = useState<string | null>(null);
  const countdownData = useDevvitListener('COUNTDOWN_DATA');
  const referenceParticipantsData = useDevvitListener(
    'REFERENCE_PARTICIPANTS_DATA'
  );
  const initData = useDevvitListener('INIT_RESPONSE');
  const userDrawingData = useDevvitListener('USER_DRAWING_DATA');

  useEffect(() => {
    sendToDevvit({ type: 'GET_COUNTDOWN_DURATION' });
    sendToDevvit({ type: 'GET_USER_DRAWING' });
    sendToDevvit({ type: 'INIT' });
  }, []);

  useEffect(() => {
    if (!countdownData) return;
    setDuration(countdownData.duration);
  }, [countdownData]);

  useEffect(() => {
    if (!referenceParticipantsData) return;
    setNumDrawn(referenceParticipantsData.referenceParticipants);
  }, [referenceParticipantsData]);

  useEffect(() => {
    if (!initData) return;
    setData(initData);
    sendToDevvit({
      type: 'GET_REFERENCE_PARTICIPANTS',
      payload: { round: initData.round },
    });
  }, [initData]);

  useEffect(() => {
    if (!userDrawingData) return;
    setUserDrawing(userDrawingData.blobUrl);
  }, [userDrawingData]);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-red-300 text-white">
      {/* Background */}
      <img
        src="/assets/bg-purple.png"
        alt="Background"
        className="absolute inset-0 z-0 h-full w-full"
      />

      {/* Foreground UI */}
      <div className="relative z-30 flex h-full w-full flex-col items-center justify-center gap-y-[1.4em]">
        {/* Top Row */}
        <div className="relative flex w-full max-w-[417px] flex-col items-center justify-center">
          {duration && <CountdownClock startTimeInSeconds={duration} />}
          <img
            src="/assets/clock.svg"
            alt="Countdown clock"
            width={91.14}
            height={91.14}
            className="absolute top-[1.1em] left-[-0.4em] z-0"
          />
          <img
            src="/assets/sparkle.svg"
            alt="Sparkle"
            width={30}
            height={30}
            className="absolute right-0 bottom-[2.5em] z-0"
          />
          <img
            src="/assets/sparkle.svg"
            alt="Sparkle"
            width={20}
            height={20}
            className="absolute right-[1.75em] bottom-[0.8em] z-0"
          />
        </div>

        {/* Bottom Row */}
        <div className="mb-[2.5em] ml-[1em] flex w-full items-center justify-center gap-x-[2em]">
          <div className="relative">
            {data && data.postType === 'draw' && (
              <img
                src={`/assets/round-${data.round}.gif`}
                alt="Round"
                width={140}
                height={140}
                className="absolute right-[-3em] bottom-[-3em]"
              />
            )}
            {userDrawing && <ImageFrame url={userDrawing} />}
          </div>

          <div className="flex w-[250px] flex-col items-center justify-center">
            <div className="mr-[0.5em] flex gap-x-[0.5em]">
              <div>
                <img
                  src="/assets/megaphone.png"
                  width={35.65}
                  height={30}
                  alt="Megaphone"
                />
              </div>
              <span className="mt-[0.3em] text-[1.3rem]">{numDrawn} USERS</span>
            </div>
            <div className="mt-[0.1em] text-center text-[1.1rem]">
              used your drawing as a reference!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
