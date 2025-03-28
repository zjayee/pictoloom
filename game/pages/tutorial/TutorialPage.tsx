import React from 'react';
import { useSetPage } from '../../hooks/usePage';
import { Button } from '../../components/Button';

export const TutorialPage: React.FC = () => {
  const setPage = useSetPage();

  const instructions = `
1. Daily Game: A new game starts every day at 7 AM PST.
2. Drawing Rounds: 
      • In the first round, draw an image for the given phrase.
      • In later rounds, copy another user's drawing from the previous round.
      • Each game has multiple phrases, and you are given a new phrase each round.
      • The timer shows the countdown until the next round.
3. Guessing Round: 
      • In the final 24-hour round, guess the original phrase based on final drawings.
4. Gallery & Upvotes:
      • After the game, view and upvote your favorite drawings.`;

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-black text-white">
      <img
        src="/assets/bg-purple.png"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="z-10 flex max-w-xl flex-col items-center justify-center gap-y-[0.7em]">
        <p className="text-lg whitespace-pre-line">{instructions}</p>
        <Button
          text="BACK"
          iconSrc="/icons/back.svg"
          width="8em"
          onClick={() => setPage('landing')}
        />
      </div>
    </div>
  );
};

export default TutorialPage;
