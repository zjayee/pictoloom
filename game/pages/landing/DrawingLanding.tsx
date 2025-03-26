import React, { useEffect, useState } from 'react';
import { CountdownClock } from '../../components/CountdownClock';

export const DrawingLanding: React.FC = () => {
  const [duration, setDuration] = useState<number | null>(null);
  const [numDrawn, setNumDrawn] = useState('...');
  const [mountFn, setMountFn] = useState<(() => void) | null>(null);
  const [referenceDrawings, setReferenceUsernames] = useState<string[]>([]);

  useEffect(() => {
    postMessageToDevvit({ type: 'MOUNT_WEBVIEW' });

    postMessageToDevvit({ type: 'GET_COUNTDOWN_DURATION' });
    postMessageToDevvit({ type: 'GET_REFERENCE_DRAWINGS' });

    const handleMessage = (event: MessageEvent) => {
      const { type, data } = event.data;

      if (type === 'COUNTDOWN_DATA') {
        setDuration(data.duration);
      }

      if (type === 'INIT_RESPONSE') {
        setNumDrawn(data.participants);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const postMessageToDevvit = (msg: unknown) => {
    window.parent?.postMessage(
      { type: 'devvit-message', data: { message: msg } },
      '*'
    );
  };

  return (
    <div className="relative h-full w-full overflow-hidden text-white">
      {/* Background */}
      <img
        src="/assets/bg-purple.png"
        alt="Background"
        className="absolute inset-0 z-0 h-full w-full object-cover"
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
        <div className="flex w-[417px] items-start justify-end pt-[30px]">
          <CountdownClock startTimeInSeconds={duration ?? 0} />
        </div>

        {/* Right Column */}
        <div className="flex h-full w-[284px] flex-col justify-between">
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
          <div className="flex flex-col items-start">
            {/* Start Button */}
            <div className="flex items-center">
              <button onClick={() => mountFn && mountFn()}>
                <img
                  src="/assets/start-button.png"
                  width={275}
                  height={64.5}
                  alt="Start Drawing"
                />
              </button>
              <div className="w-[17px]" />
            </div>

            <div className="h-[3.5px]" />

            {/* Tutorial Button */}
            <div className="flex items-center">
              <img
                src="/assets/tutorial-button.png"
                width={275}
                height={64.5}
                alt="How to Play"
              />
              <div className="w-[17px]" />
            </div>

            <div className="h-[8.5px]" />

            {/* Users drawn */}
            <div className="flex items-end">
              <div className="relative w-[250px]">
                <img
                  src="/assets/have_drawn_this_round.png"
                  width={250}
                  height={84}
                  alt="Have drawn"
                />
                <div className="absolute top-0 left-0 flex h-[53px] w-[250px] items-center justify-center">
                  <img
                    src="/assets/megaphone.png"
                    width={35.65}
                    height={30}
                    alt="Megaphone"
                  />
                  <div className="w-[6px]" />
                  {numDrawn}
                  <div className="w-[4px]" />
                  <div className="flex flex-col justify-end">
                    <div className="h-[4px]" />
                    <img
                      src="/assets/users.png"
                      width={72}
                      height={32}
                      alt="Users"
                    />
                  </div>
                </div>
              </div>
              <div className="w-[30px]" />
            </div>

            <div className="h-[29px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
