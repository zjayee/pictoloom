import { sendToDevvit } from '../utils';

export const useVote = (userId: string, currentRound: number) => {
  const upvote = () => {
    sendToDevvit({
      type: 'UPVOTE',
      payload: {
        userId,
        round: currentRound,
      },
    });
  };

  const downvote = () => {
    sendToDevvit({
      type: 'DOWNVOTE',
      payload: {
        userId,
        round: currentRound,
      },
    });
  };

  return { upvote, downvote };
};
