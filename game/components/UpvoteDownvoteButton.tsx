import React from 'react';

export type VoteStatus = 'none' | 'upvoted' | 'downvoted';

interface UpvoteDownvoteButtonsProps {
  voteStatus: VoteStatus;
  upvotes: number;
  onUpvote: () => void;
  onDownvote: () => void;
}

/**
 * A pill-like container with an up arrow, vote count, and down arrow,
 * styled to mimic Reddit's upvote/downvote with hover states.
 */
export const UpvoteDownvoteButtons: React.FC<UpvoteDownvoteButtonsProps> = ({
  voteStatus,
  upvotes,
  onUpvote,
  onDownvote,
}) => {
  return (
    <div
      className="flex h-[2em] w-[5em] items-center justify-center gap-x-[0.5em] rounded-full text-white"
      style={{ background: 'rgba(0, 0, 0, 0.25)' }}
    >
      {/* Up Arrow */}
      <button
        onClick={onUpvote}
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
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-big-up"
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
        onClick={onDownvote}
        className={`flex cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus:outline-none ${
          voteStatus === 'downvoted'
            ? 'text-[#7193FF]'
            : 'text-gray-300 hover:text-[#7193FF]'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={voteStatus !== 'downvoted' ? 'none' : 'currentColor'}
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-big-down"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M15 4v8h3.586a1 1 0 0 1 .707 1.707l-6.586 6.586a1 1 0 0 1 -1.414 0l-6.586 -6.586a1 1 0 0 1 .707 -1.707h3.586v-8a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1z" />
        </svg>
      </button>
    </div>
  );
};
