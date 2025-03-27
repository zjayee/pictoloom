import React from 'react';
import { sendToDevvit } from '../utils';

export type VoteStatus = 'none' | 'upvoted' | 'downvoted';

interface UpvoteDownvoteButtonsProps {
  voteStatus: VoteStatus;
  upvotes: number;
  userId: string;
  currentRound: number;
  onVoteChange?: (newStatus: VoteStatus, voteDelta: number) => void;
}

export const UpvoteDownvoteButtons: React.FC<UpvoteDownvoteButtonsProps> = ({
  voteStatus,
  upvotes,
  userId,
  currentRound,
  onVoteChange,
}) => {
  const handleUpvote = () => {
    let voteDelta = 0;
    let newStatus: VoteStatus = voteStatus;

    if (voteStatus === 'upvoted') {
      newStatus = 'none';
      voteDelta = -1;
    } else {
      newStatus = 'upvoted';
      voteDelta = voteStatus === 'downvoted' ? 1 : 1;
      sendToDevvit({
        type: 'UPVOTE',
        payload: { userId, round: currentRound },
      });
    }
    onVoteChange?.(newStatus, voteDelta);
  };

  const handleDownvote = () => {
    let voteDelta = 0;
    let newStatus: VoteStatus = voteStatus;

    if (voteStatus === 'downvoted') {
      newStatus = 'none';
      voteDelta = 0;
    } else {
      newStatus = 'downvoted';
      voteDelta = voteStatus === 'upvoted' ? -1 : 0;
      sendToDevvit({
        type: 'DOWNVOTE',
        payload: { userId, round: currentRound },
      });
    }
    onVoteChange?.(newStatus, voteDelta);
  };

  return (
    <div
      className="z-10 flex h-[2em] items-center justify-center gap-x-[0.3em] rounded-full px-[0.5em] text-white transition-colors select-none"
      style={{ background: 'rgba(0, 0, 0, 0.25)' }}
    >
      {/* Up Arrow */}
      <button
        onClick={handleUpvote}
        className={`flex cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus:outline-none ${voteStatus === 'upvoted' ? 'text-[#FF4500]' : 'text-gray-300 hover:text-[#FF4500]'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={voteStatus !== 'upvoted' ? 'none' : 'currentColor'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M9 20v-8h-3.586a1 1 0 0 1 -.707 -1.707l6.586 -6.586a1 1 0 0 1 1.414 0l6.586 6.586a1 1 0 0 1 -.707 1.707h-3.586v8a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
        </svg>
      </button>

      {/* Upvote Count */}
      <span className="mt-[0.2em] flex items-center justify-center font-semibold">
        {upvotes}
      </span>

      {/* Down Arrow */}
      <button
        onClick={handleDownvote}
        className={`flex cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus:outline-none ${voteStatus === 'downvoted' ? 'text-[#7193FF]' : 'text-gray-300 hover:text-[#7193FF]'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={voteStatus !== 'downvoted' ? 'none' : 'currentColor'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M15 4v8h3.586a1 1 0 0 1 .707 1.707l-6.586 6.586a1 1 0 0 1 -1.414 0l-6.586 -6.586a1 1 0 0 1 .707 -1.707h3.586v-8a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1z" />
        </svg>
      </button>
    </div>
  );
};
