import React, { useEffect, useState } from 'react';
import { sendToDevvit } from '../../utils';
import { Button } from '../../components/Button';
import { useSetPage } from '../../hooks/usePage';
import './ChainDrawingPreview.css';
import { useDevvitListener } from '../../hooks/useDevvitListener';
import { CountdownClock } from '../../components/CountdownClock';
import ImageFrame from '../../components/ImageFrame';

type DrawingData = {
  user: string;
  blobUrl: string;
};

export const ChainDrawingPreview: React.FC = () => {
  const [drawingData, setDrawingData] = useState<DrawingData[] | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [currDrawing, setCurrDrawing] = useState<DrawingData | null>(null);
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

  return (
    <div className="chain-preview__container">
      <img
        className="chain-preview__deco"
        src="/assets/torus.png"
        alt="torus"
        width={420}
      />

      <div className="chain-preview__timer-container">
        <img src="/assets/sparkle.svg" alt="Sparkle" width={30} height={30} />
        {duration ? (
          <CountdownClock startTimeInSeconds={duration} fontSize="4rem" />
        ) : (
          <CountdownClock startTimeInSeconds={30 * 60} fontSize="4rem" />
        )}
        <img src="/assets/sparkle.svg" alt="Sparkle" width={20} height={20} />
      </div>

      {data && data.round !== 1 ? (
        <>
          <div className="chain-preview__caption">
            {currDrawing?.user} drew this based off a mystery word!
          </div>

          {currDrawing ? (
            <ImageFrame url={currDrawing.blobUrl} />
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

      <Button
        text="DRAW IT!"
        iconSrc="/icons/pencil.svg"
        onClick={() => setPage('canvas')}
        width="13em"
      />
    </div>
  );
};
