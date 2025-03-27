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
    <div className="mt-3 flex items-center gap-2 rounded-full bg-[#272729] px-4 py-2 text-white">
      {/* Up Arrow */}
      <button
        onClick={onUpvote}
        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus:outline-none ${
          voteStatus === 'upvoted'
            ? 'text-[#FF4500]'
            : 'text-gray-300 hover:text-[#FF4500]'
        } hover:bg-[#3a3a3c]`}
      >
        ▲
      </button>

      {/* Upvote Count */}
      <span className="font-semibold">{upvotes}</span>

      {/* Down Arrow */}
      <button
        onClick={onDownvote}
        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus:outline-none ${
          voteStatus === 'downvoted'
            ? 'text-[#7193FF]'
            : 'text-gray-300 hover:text-[#7193FF]'
        } hover:bg-[#3a3a3c]`}
      >
        ▼
      </button>
    </div>
  );
};
