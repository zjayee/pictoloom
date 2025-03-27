import React, { useEffect, useState } from 'react';
import { CountdownClock } from '../../components/CountdownClock';
import { sendToDevvit } from '../../utils';
import { useSetPage } from '../../hooks/usePage';
import { Button } from '../../components/Button';
import { useDevvitListener } from '../../hooks/useDevvitListener';

export const DrawingLanding: React.FC = () => {
  const [duration, setDuration] = useState<number | null>(null);
  const [numDrawn, setNumDrawn] = useState(0);
  const [data, setData] = useState<{ postType: number; round: number } | null>(
    null
  );
  const [currDrawing, setCurrDrawing] = useState<{
    user: string;
    blobUrl: string;
  } | null>(null);
  const countdownData = useDevvitListener('COUNTDOWN_DATA');
  const initData = useDevvitListener('INIT_RESPONSE');
  const participantsData = useDevvitListener('PARTICIPANTS_DATA');
  const referenceDrawingData = useDevvitListener('REFERENCE_DRAWINGS_DATA');

  useEffect(() => {
    sendToDevvit({ type: 'INIT' });
    sendToDevvit({ type: 'GET_COUNTDOWN_DURATION' });
    sendToDevvit({ type: 'GET_REFERENCE_DRAWINGS' });
    sendToDevvit({ type: 'GET_PARTICIPANTS' });
  }, []);

  useEffect(() => {
    if (!countdownData) return;
    setDuration(countdownData.duration);
  }, [countdownData]);

  useEffect(() => {
    if (!participantsData) return;
    setNumDrawn(participantsData.participants);
  }, [participantsData]);

  useEffect(() => {
    if (!initData) return;
    setData(initData);
  }, [initData]);

  useEffect(() => {
    if (!referenceDrawingData) return;
    if (
      referenceDrawingData.drawings &&
      referenceDrawingData.drawings.length > 0
    ) {
      setCurrDrawing(referenceDrawingData.drawings[0]);
    }
  }, [referenceDrawingData]);

  const setPage = useSetPage();

  const handleStartDrawingPress = () => {
    setPage('reference');
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-red-300 text-white">
      {/* Background */}
      <img
        src="/assets/bg-purple.png"
        alt="Background"
        className="absolute inset-0 z-0 h-full w-full"
      />

      {/* BACK overlay */}
      <div className="absolute top-0 left-0 z-10 ml-[15px] flex h-full items-center">
        <img
          src="/assets/assets-back.png"
          alt="Assets Back"
          width={718}
          height={514}
        />
      </div>

      {/* FRONT overlay */}
      <div className="absolute top-0 left-0 z-20 ml-[15px] flex h-full items-center">
        <img
          src="/assets/assets-front.png"
          alt="Assets Front"
          width={718}
          height={514}
        />
      </div>

      {/* Foreground UI */}
      <div className="relative z-30 flex h-full w-full">
        {/* Left Column */}
        <div className="relative mt-[1.875em] ml-[0.9em] flex w-[60%] max-w-[417px] items-start justify-end">
          {duration ? (
            <CountdownClock startTimeInSeconds={duration} />
          ) : (
            <CountdownClock startTimeInSeconds={30 * 60} />
          )}
          <img
            src="/assets/clock.svg"
            alt="Countdown clock"
            width={91.14}
            height={91.14}
            className="absolute top-[0.8em] left-[0.5em] z-0"
          />
        </div>

        {/* Right Column */}
        <div className="flex h-full w-[40%] max-w-[284px] flex-col justify-between">
          {/* Top: Round Image */}
          <div className="flex justify-end pt-[7px]">
            <img
              src="/assets/round-3.gif"
              alt="Round"
              width={140}
              height={140}
            />
          </div>

          {/* Bottom UI */}
          <div className="flex flex-col items-end gap-y-[0.9em] pr-[.5em] pb-[2em]">
            {/* Start Button */}
            <Button
              text="START DRAWING"
              iconSrc="/icons/pencil.svg"
              width="15.6em"
              onClick={handleStartDrawingPress}
            />

            {/* Tutorial Button */}
            <Button
              text="HOW TO PLAY"
              iconSrc="/icons/pencil.svg"
              width="15.6em"
            />

            {/* Users drawn */}
            <div className="flex items-end">
              <div className="relative w-[250px]">
                <img
                  src="/assets/have_drawn_this_round.png"
                  width={250}
                  height={84}
                  alt="Have drawn"
                />
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
    </div>
  );
};
