import React, { useEffect, useRef, useState } from 'react';
import { sendToDevvit } from '../../utils';
import { useCountdown } from '../../hooks/useCountdown';
import './CanvasPage.css';
import { Button } from '../../components/Button';

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
  const [formattedTime, startCountdown] = useCountdown();

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

  // Countdown message listener
  useEffect(() => {
    const handleMessage = (ev: MessageEvent) => {
      if (ev.data.type !== 'devvit-message') return;
      const { message } = ev.data.data;
      if (message.type === 'countdownData') {
        startCountdown(message.data.duration);
      }
    };

    window.addEventListener('message', handleMessage);
    sendToDevvit({ type: 'GET_COUNTDOWN_DURATION' });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [startCountdown]);

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
      };
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="canvas-page__container">
      <div className="canvas-page__timer">{formattedTime}</div>

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
      ></canvas>

      <div id="custom-button-container">
        <Button
          text="DONE"
          iconSrc="../public/icons/star.svg"
          onClick={submitDrawing}
        />
      </div>
    </div>
  );
};
