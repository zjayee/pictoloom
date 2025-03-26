import React, { useEffect, useState } from 'react';
import { sendToDevvit } from '../../utils';
import { useCountdown } from '../../hooks/useCountdown';
import { Button } from '../../components/Button';

type DrawingData = {
  user: string;
  blobUrl: string;
};

export const ChainDrawingPreview: React.FC = () => {
  const [caption, setCaption] = useState('');
  const [drawing, setDrawing] = useState<DrawingData | null>(null);
  const [formattedTime, startCountdown] = useCountdown();

  useEffect(() => {
    const handleMessage = (ev: MessageEvent) => {
      if (ev.data.type !== 'devvit-message') return;
      const { message } = ev.data.data;

      if (message.type === 'COUNTDOWN_DATA') {
        startCountdown(message.data.duration);
      }

      if (message.type === 'REFERENCE_DRAWINGS_DATA') {
        const firstDrawing = message.data?.drawings?.[0];
        if (firstDrawing) {
          setDrawing(firstDrawing);
          setCaption(
            `${firstDrawing.user} drew this based off a mystery word!`
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);
    sendToDevvit({ type: 'GET_COUNTDOWN_DURATION' });
    sendToDevvit({ type: 'GET_REFERENCE_DRAWINGS' });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [startCountdown]);

  return (
    <div className="chain-preview__container">
      <img
        className="chain-preview__deco"
        src="../public/torus.png"
        alt="torus"
        width={420}
      />

      <div className="chain-preview__timer-container">
        <img src="../public/sparkle.svg" alt="Sparkle" width={30} height={30} />
        <div className="chain-preview__timer">{formattedTime}</div>
        <img src="../public/sparkle.svg" alt="Sparkle" width={20} height={20} />
      </div>

      <div className="chain-preview__caption">{caption}</div>

      <div className="chain-preview__gradient-block">
        <div className="chain-preview__image-container">
          <img
            src={drawing?.blobUrl ?? ''}
            alt="Drawing Placeholder"
            width={294}
            height={252}
          />
        </div>
      </div>

      <Button
        text="DRAW IT!"
        iconSrc="../public/icons/pencil.svg"
        onClick={() => (window.location.href = '../canvas/Canvas.html')}
      />
    </div>
  );
};
