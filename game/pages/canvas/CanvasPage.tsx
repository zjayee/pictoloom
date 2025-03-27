import React, { useEffect, useRef, useState } from 'react';
import { sendToDevvit } from '../../utils';
import './CanvasPage.css';
import { Button } from '../../components/Button';
import { useDevvitListener } from '../../hooks/useDevvitListener';
import { CountdownClock } from '../../components/CountdownClock';
import { useSetPage } from '../../hooks/usePage';

const COLORS = [
  '#000000',
  '#FF5C5C',
  '#FFA600',
  '#FFD93D',
  '#6BCB77',
  '#4D96FF',
  '#9D4EDD',
];

export const CanvasPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const countdownData = useDevvitListener('COUNTDOWN_DATA');

  const setPage = useSetPage();

  // Drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const client = 'touches' in e ? e.touches[0] : e;
      return {
        x: (client.clientX - rect.left) * (canvas.width / rect.width),
        y: (client.clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const start = (e: MouseEvent | TouchEvent) => {
      setIsDrawing(true);
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    };

    const end = () => {
      setIsDrawing(false);
      ctx.closePath();
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseout', end);

    canvas.addEventListener('touchstart', start);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', end);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', end);
      canvas.removeEventListener('mouseout', end);

      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', end);
    };
  }, [isDrawing, selectedColor]);

  useEffect(() => {
    sendToDevvit({ type: 'GET_COUNTDOWN_DURATION' });
  }, []);

  useEffect(() => {
    if (!countdownData) return;
    setDuration(countdownData.duration);
  }, [countdownData]);

  const submitDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        sendToDevvit({
          type: 'DRAWING_SUBMITTED',
          payload: { imageBlob: base64 as string },
        });
        setPage('end');
      };
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="canvas-page__container">
      <img
        src="/assets/banana-peek.png"
        alt="Banana peek"
        width={281}
        height={248}
        className="absolute right-0 bottom-0 z-0"
      />

      <div className="canvas-page__timer">
        {duration && (
          <CountdownClock startTimeInSeconds={duration} fontSize="3rem" />
        )}
      </div>

      <div className="canvas-page__color-picker">
        {COLORS.map((color) => (
          <div
            key={color}
            className={`canvas-page__color ${
              color === selectedColor ? 'canvas-page__color--active' : ''
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>

      <canvas
        id="drawing-canvas"
        ref={canvasRef}
        width={300}
        height={300}
        className="z-1"
      ></canvas>

      <div id="custom-button-container" className="z-1">
        <Button
          text="DONE"
          iconSrc="../public/icons/star.svg"
          onClick={submitDrawing}
          width="10em"
        />
      </div>
    </div>
  );
};
