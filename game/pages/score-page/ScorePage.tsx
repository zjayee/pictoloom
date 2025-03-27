import React, { useEffect, useState } from 'react';
import { sendToDevvit } from '../../utils';
import { Button } from '../../components/Button';
import { useSetPage } from '../../hooks/usePage';
import { useDevvitListener } from '../../hooks/useDevvitListener';
import './ScorePage.css';

export const ScorePage: React.FC = () => {
  const [mysteryWord, setMysteryWord] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState<number | null>(null);

  const mysteryWordData = useDevvitListener('WORD_DATA');
  const scoreData = useDevvitListener('SCORE_DATA');
  const guessData = useDevvitListener('USER_GUESS_DATA');

  const setPage = useSetPage();

  useEffect(() => {
    sendToDevvit({ type: 'GET_WORD' });
    sendToDevvit({ type: 'GET_SCORE' });
    sendToDevvit({ type: 'GET_USER_GUESS' });
  }, []);

  useEffect(() => {
    if (mysteryWordData) {
      setMysteryWord(mysteryWordData.word);
    }
  }, [mysteryWordData]);

  useEffect(() => {
    if (scoreData) {
      setScore(scoreData.score);
    }
  }, [scoreData]);

  useEffect(() => {
    if (guessData) {
      setUserGuess(guessData.guess);
    }
  }, [guessData]);

  return (
    <div className="chain-preview__container">
      <div>
        <div className="text-[1.3rem]">SCORE</div>
        <div className="relative flex">
          <img
            src="/assets/sparkle.svg"
            alt="Sparkle"
            width={30}
            height={30}
            className="absolute top-0 left-[-3em]"
          />
          <div className="text-[4em]">{score ?? '...'}</div>
          <img
            src="/assets/sparkle.svg"
            alt="Sparkle"
            width={20}
            height={20}
            className="absolute right-[-3em] bottom-[1em]"
          />
        </div>
      </div>

      <div className="z-10 my-[1em] flex flex-col gap-y-[1em]">
        <div>The mystery word was...</div>
        <div
          style={{ background: 'rgba(0, 0, 0, 0.3)' }}
          className="rounded-[15px] px-[0.75em] pt-[0.3em] pb-[0.15em] text-[4rem]"
        >
          {mysteryWord || '...'}
        </div>
      </div>

      <div>Your guess: {userGuess || '...'}</div>

      <Button
        text={'CONTINUE'}
        iconSrc={'/icons/star.svg'}
        onClick={() => setPage('explore')}
        width="13em"
      />
    </div>
  );
};
