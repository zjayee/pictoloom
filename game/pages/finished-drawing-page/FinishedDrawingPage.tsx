import React, { useEffect, useState } from 'react';
import { CountdownClock } from '../../components/CountdownClock';
import { sendToDevvit } from '../../utils';
import { useDevvitListener } from '../../hooks/useDevvitListener';
import ImageFrame from '../../components/ImageFrame';
import { UpvoteDownvoteButtons } from '../../components/UpvoteDownvoteButton';

type DrawingData = {
  blobUrl: string;
  user: string;
  upvotes: number;
  round: number;
  voteStatus: 'none' | 'upvoted' | 'downvoted';
};

const mockDrawing: DrawingData = {
  blobUrl: '',
  user: 'Hello',
  upvotes: 12,
  round: 2,
  voteStatus: 'none',
};

const mockData: { postType: 'draw' | 'guess'; round: number } = {
  postType: 'draw',
  round: 2,
};

export const FinishedDrawingPage: React.FC = () => {
  const [duration, setDuration] = useState<number | null>(null);
  const [numDrawn, setNumDrawn] = useState(0);
  const [data, setData] = useState<{
    postType: 'draw' | 'guess';
    round: number;
  } | null>(null);
  const [userDrawing, setUserDrawing] = useState<DrawingData | null>(null);
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
    setUserDrawing(userDrawingData);
  }, [userDrawingData]);

  return (
    <div className="relative flex h-full w-full items-center justify-center text-white">
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
            className="absolute top-[0em] left-[-0.4em] z-0"
          />
          <img
            src="/assets/sparkle.svg"
            alt="Sparkle"
            width={30}
            height={30}
            className="absolute top-[2.4em] right-[-0.5em] z-0"
          />
          <img
            src="/assets/sparkle.svg"
            alt="Sparkle"
            width={20}
            height={20}
            className="absolute top-[1em] right-[1.5em] z-0"
          />
        </div>

        {/* Bottom Row */}
        <div className="items-top ml-[1em] flex w-full justify-center gap-x-[2em]">
          <div className="relative">
            {data && data.postType === 'draw' && (
              <img
                src={`/assets/round-${data.round}.gif`}
                alt="Round"
                width={140}
                height={140}
                className="absolute top-[-3em] left-[-3em] z-10"
              />
            )}
            {userDrawing && data && (
              <div className="mb-[0.5em] flex w-[308px] flex-col gap-y-[0.5em]">
                <ImageFrame url={userDrawing.blobUrl} />
                <div className="flex">
                  <UpvoteDownvoteButtons
                    voteStatus={userDrawing.voteStatus}
                    upvotes={userDrawing.upvotes}
                    onVoteChange={(newStatus, voteDelta) => {
                      if (userDrawing) {
                        setUserDrawing({
                          ...userDrawing,
                          voteStatus: newStatus,
                          upvotes: userDrawing.upvotes + voteDelta,
                        });
                      }
                    }}
                    userId={userDrawing.user}
                    currentRound={data.round}
                  />
                </div>
              </div>
            )}
          </div>

          <div
            className="flex h-[266px] w-[250px] flex-col items-center justify-center rounded-[15px] px-[0.5em] pt-[1em]"
            style={{ border: '2px solid rgba(255, 255, 255, 0.25)' }}
          >
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
            <div className="text-center text-[1rem]">
              used your drawing as a reference!
            </div>
            <img
              src="/assets/okay_hand.png"
              width={165}
              alt="Megaphone"
              className="pb-[0.5em]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
