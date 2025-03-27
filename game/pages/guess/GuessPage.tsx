import React, { useEffect, useState } from 'react';
import { sendToDevvit } from '../../utils';
import { Button } from '../../components/Button';
import { useDevvitListener } from '../../hooks/useDevvitListener';
import { CountdownClock } from '../../components/CountdownClock';
import { useSetPage } from '../../hooks/usePage';

export const GuessPage: React.FC = () => {
  const [duration, setDuration] = useState<number | null>(null);
  const [guess, setGuess] = useState('');
  const countdownData = useDevvitListener('COUNTDOWN_DATA');

  const setPage = useSetPage();

  useEffect(() => {
    sendToDevvit({ type: 'GET_COUNTDOWN_DURATION' });
  }, []);

  useEffect(() => {
    if (!countdownData) return;
    setDuration(countdownData.duration);
  }, [countdownData]);

  const submitGuess = () => {
    if (!guess.trim()) return;

    sendToDevvit({
      type: 'GUESS_SUBMITTED',
      payload: { guess },
    });
    setPage('end');
  };

  return (
    <div className="guess-page__container flex h-full w-full flex-col items-center justify-center gap-y-[1em] text-white">
      <div className="guess-page__timer">
        {duration && (
          <CountdownClock startTimeInSeconds={duration} fontSize="3rem" />
        )}
      </div>

      <input
        type="text"
        placeholder="I think the mystery word is..."
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        className="mb-[1em] w-[25em] rounded-full border border-[#876ACE] bg-white px-6 py-3 text-black placeholder-gray-300 shadow-[0_5px_0_0_#80EED3] focus:outline-none"
      />

      <Button
        text="SUBMIT"
        iconSrc="../public/icons/star.svg"
        onClick={submitGuess}
        width="12em"
      />
    </div>
  );
};
