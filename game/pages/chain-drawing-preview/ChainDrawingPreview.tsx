import React, { useEffect, useState } from 'react';
import { sendToDevvit } from '../../utils';
import { Button } from '../../components/Button';
import { useSetPage } from '../../hooks/usePage';
import './ChainDrawingPreview.css';
import { useDevvitListener } from '../../hooks/useDevvitListener';
import { CountdownClock } from '../../components/CountdownClock';

type DrawingData = {
  user: string;
  blobUrl: string;
};

export const ChainDrawingPreview: React.FC = () => {
  const [drawingData, setDrawingData] = useState<DrawingData[] | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const countdownData = useDevvitListener('COUNTDOWN_DATA');
  const referenceDrawingData = useDevvitListener('REFERENCE_DRAWINGS_DATA');
  const [currDrawing, setCurrDrawing] = useState<DrawingData | null>(null);

  const setPage = useSetPage();

  useEffect(() => {
    sendToDevvit({ type: 'GET_COUNTDOWN_DURATION' });
    sendToDevvit({ type: 'GET_REFERENCE_DRAWINGS' });
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

      <div className="chain-preview__caption">
        {currDrawing?.user} drew this based off a mystery word!
      </div>

      <div className="chain-preview__gradient-block">
        <div className="chain-preview__image-container">
          <img
            src={currDrawing?.blobUrl ?? ''}
            alt="Drawing Placeholder"
            width={294}
            height={252}
          />
        </div>
      </div>

      <Button
        text="DRAW IT!"
        iconSrc="/icons/pencil.svg"
        onClick={() => setPage('canvas')}
        width="13em"
      />
    </div>
  );
};
