import React from 'react';
import { sendToDevvit } from '../utils';

export type VoteStatus = 'none' | 'upvoted' | 'downvoted';

interface UpvoteDownvoteButtonsProps {
  voteStatus: VoteStatus;
  upvotes: number;
  userId: string;
  currentRound: number;
  // Callback returns new vote status and the delta (change in vote count) for UI updates.
  onVoteChange?: (newStatus: VoteStatus, voteDelta: number) => void;
}

/**
 * UpvoteDownvoteButtons sends vote messages to the backend.
 *
 * Backend behavior:
 * - UPVOTE: increments the counter by 1.
 * - DOWNVOTE: decrements the counter by 1.
 *
 * To handle vote switches correctly:
 * - If the user is currently upvoted and they press downvote, we send:
 *   - One DOWNVOTE message to cancel the upvote (–1),
 *   - A second DOWNVOTE message to register the downvote (–1 more),
 *   resulting in a net change of –2.
 *
 * - If the user is currently downvoted and they press upvote, we send:
 *   - One UPVOTE message to cancel the downvote (+1),
 *   - A second UPVOTE message to register the upvote (+1 more),
 *   resulting in a net change of +2.
 *
 * - Toggling off (clicking the active vote) sends one message to cancel it.
 *   • Toggling off upvote sends one DOWNVOTE (–1).
 *   • Toggling off downvote sends one UPVOTE (+1).
 */
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
      // Toggle off upvote: send one DOWNVOTE to cancel the upvote.
      sendToDevvit({
        type: 'DOWNVOTE',
        payload: { userId, round: currentRound },
      });
      newStatus = 'none';
      voteDelta = -1;
    } else if (voteStatus === 'downvoted') {
      // Switching from downvoted to upvoted:
      // Cancel the downvote with one UPVOTE message,
      // then register the upvote with another UPVOTE.
      sendToDevvit({
        type: 'UPVOTE',
        payload: { userId, round: currentRound },
      });
      sendToDevvit({
        type: 'UPVOTE',
        payload: { userId, round: currentRound },
      });
      newStatus = 'upvoted';
      voteDelta = 2;
    } else {
      // From neutral: simply register upvote.
      sendToDevvit({
        type: 'UPVOTE',
        payload: { userId, round: currentRound },
      });
      newStatus = 'upvoted';
      voteDelta = 1;
    }
    onVoteChange?.(newStatus, voteDelta);
  };

  const handleDownvote = () => {
    let voteDelta = 0;
    let newStatus: VoteStatus = voteStatus;

    if (voteStatus === 'downvoted') {
      // Toggle off downvote: send one UPVOTE to cancel the downvote.
      sendToDevvit({
        type: 'UPVOTE',
        payload: { userId, round: currentRound },
      });
      newStatus = 'none';
      voteDelta = 1;
    } else if (voteStatus === 'upvoted') {
      // Switching from upvoted to downvoted:
      // Cancel the upvote with one DOWNVOTE message,
      // then register the downvote with another DOWNVOTE.
      sendToDevvit({
        type: 'DOWNVOTE',
        payload: { userId, round: currentRound },
      });
      sendToDevvit({
        type: 'DOWNVOTE',
        payload: { userId, round: currentRound },
      });
      newStatus = 'downvoted';
      voteDelta = -2;
    } else {
      // From neutral: simply register downvote.
      sendToDevvit({
        type: 'DOWNVOTE',
        payload: { userId, round: currentRound },
      });
      newStatus = 'downvoted';
      voteDelta = -1;
    }
    onVoteChange?.(newStatus, voteDelta);
  };

  return (
    <div
      className="z-10 flex h-[2em] w-[5em] cursor-pointer items-center justify-center gap-x-[0.3em] rounded-full px-[0.5em] text-white transition-colors select-none"
      style={{ background: 'rgba(0, 0, 0, 0.3)' }}
    >
      {/* Up Arrow */}
      <button
        onClick={handleUpvote}
        className={`flex cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus:outline-none ${
          voteStatus === 'upvoted'
            ? 'text-[#FF4500]'
            : 'text-gray-300 hover:text-[#FF4500]'
        }`}
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
          <path d="M9 20v-8h-3.586a1 1 0 0 1-.707-1.707l6.586-6.586a1 1 0 0 1 1.414 0l6.586 6.586a1 1 0 0 1-.707 1.707h-3.586v8a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
        </svg>
      </button>

      {/* Upvote Count */}
      <span className="mt-[0.2em] flex items-center justify-center font-semibold">
        {upvotes}
      </span>

      {/* Down Arrow */}
      <button
        onClick={handleDownvote}
        className={`flex cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus:outline-none ${
          voteStatus === 'downvoted'
            ? 'text-[#7193FF]'
            : 'text-gray-300 hover:text-[#7193FF]'
        } `}
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
          <path d="M15 4v8h3.586a1 1 0 0 1 .707 1.707l-6.586 6.586a1 1 0 0 1-1.414 0l-6.586-6.586a1 1 0 0 1 .707-1.707h3.586v-8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1z" />
        </svg>
      </button>
    </div>
  );
};

export default UpvoteDownvoteButtons;
