import React, { useEffect, useState } from 'react';
import { sendToDevvit } from '../../utils';
import { Button } from '../../components/Button';
import { useSetPage } from '../../hooks/usePage';
import './ChainDrawingPreview.css';
import { useDevvitListener } from '../../hooks/useDevvitListener';
import { CountdownClock } from '../../components/CountdownClock';
import ImageFrame from '../../components/ImageFrame';
import { UpvoteDownvoteButtons } from '../../components/UpvoteDownvoteButton';

type DrawingData = {
  blobUrl: string;
  user: string;
  upvotes: number;
  round: number;
  voteStatus: 'none' | 'upvoted' | 'downvoted';
};

const mockDrawings: DrawingData[] = [
  {
    blobUrl: 'https://via.placeholder.com/300x250.png?text=Drawing+1',
    user: 'ArtistOne',
    upvotes: 10,
    round: 2,
    voteStatus: 'none',
  },
  {
    blobUrl: 'https://via.placeholder.com/300x250.png?text=Drawing+2',
    user: 'ArtistTwo',
    upvotes: 20,
    round: 2,
    voteStatus: 'upvoted',
  },
  {
    blobUrl: 'https://via.placeholder.com/300x250.png?text=Drawing+3',
    user: 'ArtistThree',
    upvotes: 5,
    round: 2,
    voteStatus: 'downvoted',
  },
];

const mockData: { postType: 'draw' | 'guess'; round: number } = {
  postType: 'draw',
  round: 2,
};

export const ChainDrawingPreview: React.FC = () => {
  const [drawingData, setDrawingData] = useState<DrawingData[] | null>(null);
  const [currDrawing, setCurrDrawing] = useState<DrawingData | null>(
    drawingData ? drawingData[0] : null
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [mysteryWord, setMysteryWord] = useState('');
  const [data, setData] = useState<{
    postType: 'draw' | 'guess';
    round: number;
  } | null>(null);

  const countdownData = useDevvitListener('COUNTDOWN_DATA');
  const referenceDrawingData = useDevvitListener('REFERENCE_DRAWINGS_DATA');
  const initData = useDevvitListener('INIT_RESPONSE');
  const mysteryWordData = useDevvitListener('WORD_DATA');

  const setPage = useSetPage();

  useEffect(() => {
    sendToDevvit({ type: 'GET_COUNTDOWN_DURATION' });
    sendToDevvit({ type: 'GET_REFERENCE_DRAWINGS' });
    sendToDevvit({ type: 'GET_WORD' });
    sendToDevvit({ type: 'INIT' });
  }, []);

  useEffect(() => {
    if (!countdownData) return;
    setDuration(countdownData.duration);
  }, [countdownData]);

  useEffect(() => {
    if (!referenceDrawingData) return;
    setDrawingData(referenceDrawingData.drawings);
    if (
      referenceDrawingData.drawings &&
      referenceDrawingData.drawings.length > 0
    ) {
      setCurrentIndex(0);
      setCurrDrawing(referenceDrawingData.drawings[0]);
    }
  }, [referenceDrawingData]);

  useEffect(() => {
    if (!initData) return;
    setData(initData);
  }, [initData]);

  useEffect(() => {
    if (!mysteryWordData) return;
    setMysteryWord(mysteryWordData.word);
  }, [mysteryWordData]);

  // Carousel navigation functions.
  const handlePrev = () => {
    if (drawingData && drawingData.length > 0) {
      const newIndex =
        (currentIndex - 1 + drawingData.length) % drawingData.length;
      setCurrentIndex(newIndex);
      setCurrDrawing(drawingData[newIndex]);
    }
  };

  const handleNext = () => {
    if (drawingData && drawingData.length > 0) {
      const newIndex = (currentIndex + 1) % drawingData.length;
      setCurrentIndex(newIndex);
      setCurrDrawing(drawingData[newIndex]);
    }
  };

  return (
    <div className="chain-preview__container relative">
      <img
        className="chain-preview__deco"
        src="/assets/torus.png"
        alt="torus"
        width={420}
      />

      <div className="chain-preview__timer-container">
        <img src="/assets/sparkle.svg" alt="Sparkle" width={30} height={30} />
        {duration && (
          <CountdownClock startTimeInSeconds={duration} fontSize="4rem" />
        )}
        <img src="/assets/sparkle.svg" alt="Sparkle" width={20} height={20} />
      </div>

      {data && (data.postType === 'guess' || data.round !== 1) ? (
        <>
          <div className="chain-preview__caption">
            {currDrawing?.user} drew this based off a mystery word!
          </div>

          {currDrawing ? (
            <div className="mb-[0.5em] flex w-[308px] flex-col gap-y-[0.5em]">
              <div className="relative flex items-center justify-center">
                {/* Left carousel button */}
                <button
                  onClick={handlePrev}
                  className="absolute left-[-2.5em] z-10 flex aspect-square w-[2em] transform cursor-pointer items-center justify-center rounded-full text-white"
                  style={{ background: 'rgba(0, 0, 0, 0.3)' }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M15 6l-6 6l6 6" />
                  </svg>
                </button>

                <ImageFrame url={currDrawing.blobUrl} />

                {/* Right carousel button */}
                <button
                  onClick={handleNext}
                  className="absolute right-[-2.5em] z-10 flex aspect-square w-[2em] transform cursor-pointer items-center justify-center rounded-full text-white"
                  style={{ background: 'rgba(0, 0, 0, 0.3)' }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 6l6 6l-6 6" />
                  </svg>
                </button>
              </div>
              <div className="flex">
                <UpvoteDownvoteButtons
                  voteStatus={currDrawing.voteStatus}
                  upvotes={currDrawing.upvotes}
                  onVoteChange={(newStatus, voteDelta) => {
                    if (currDrawing) {
                      setCurrDrawing({
                        ...currDrawing,
                        voteStatus: newStatus,
                        upvotes: currDrawing.upvotes + voteDelta,
                      });
                    }
                  }}
                  userId={currDrawing.user}
                  currentRound={currDrawing.round}
                />
              </div>
            </div>
          ) : (
            'Loading...'
          )}
        </>
      ) : mysteryWord ? (
        <div className="z-10 my-[1em] flex flex-col gap-y-[2em]">
          <div>The mystery word is...</div>
          <div
            style={{ background: 'rgba(0, 0, 0, 0.3)' }}
            className="rounded-[15px] px-[0.75em] pt-[0.3em] pb-[0.15em] text-[4rem]"
          >
            {mysteryWord}
          </div>
        </div>
      ) : (
        'Loading...'
      )}

      {data && (
        <Button
          text={data.postType === 'draw' ? 'DRAW IT!' : 'GUESS!'}
          iconSrc={
            data.postType === 'draw'
              ? '/icons/pencil.svg'
              : '/icons/message.svg'
          }
          onClick={() => setPage(data.postType === 'draw' ? 'canvas' : 'guess')}
          width="13em"
        />
      )}
    </div>
  );
};

export default ChainDrawingPreview;
