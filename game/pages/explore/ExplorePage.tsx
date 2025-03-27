import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDevvitListener } from '../../hooks/useDevvitListener';
import { sendToDevvit } from '../../utils';
import ImageFrame from '../../components/ImageFrame';
import './ExplorePage.css';

type Drawing = {
  blobUrl: string;
  user: string;
  upvotes: number;
};

type VoteStatus = 'none' | 'upvoted' | 'downvoted';

type DrawingWithVote = Drawing & {
  voteStatus: VoteStatus;
};

export const ExplorePage: React.FC = () => {
  // State for drawings including vote status
  const [drawings, setDrawings] = useState<DrawingWithVote[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const limit = 12;
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Listen for paginated drawings data from backend
  const paginatedData = useDevvitListener('PAGINATED_DRAWINGS_DATA');

  useEffect(() => {
    if (paginatedData && paginatedData.drawings) {
      // Map incoming drawings to include a voteStatus property (default "none")
      const newDrawings: DrawingWithVote[] = (
        paginatedData.drawings as Drawing[]
      ).map((d) => ({ ...d, voteStatus: 'none' }));
      // If fewer than expected items returned, assume no more drawings.
      if (newDrawings.length < limit) {
        setHasMore(false);
      }
      setDrawings((prev) => [...prev, ...newDrawings]);
      setStartIndex((prev) => prev + newDrawings.length);
      setLoading(false);
    }
  }, [paginatedData]);

  // Function to request more drawings
  const fetchDrawings = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    sendToDevvit({
      type: 'GET_PAGINATED_DRAWINGS',
      payload: {
        start: startIndex,
        end: startIndex + limit - 1,
      },
    });
  }, [loading, hasMore, startIndex]);

  // IntersectionObserver to trigger fetch on scroll
  const observerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchDrawings();
        }
      },
      { threshold: 1.0 }
    );
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [fetchDrawings]);

  // Placeholder values (replace with your own logic)
  const currentRound = 1;
  const userId = 'currentUserId';

  // Handler for toggling upvote on a drawing
  const handleUpvote = (index: number) => {
    setDrawings((prev) => {
      const newDrawings = [...prev];
      const drawing = newDrawings[index];
      if (drawing.voteStatus === 'upvoted') {
        // Toggle off upvote: decrement upvotes
        newDrawings[index] = {
          ...drawing,
          voteStatus: 'none',
          upvotes: drawing.upvotes - 1,
        };
        // (Optional: send a cancel vote message)
      } else {
        // If it was downvoted, remove that vote first (no upvote count change since downvote isn’t counted)
        let newUpvotes = drawing.upvotes;
        if (drawing.voteStatus === 'downvoted') {
          // Removing downvote does not affect upvote count (assuming downvotes are not counted)
          newUpvotes = drawing.upvotes; // no change
        } else {
          // Currently "none"
          newUpvotes = drawing.upvotes + 1;
        }
        newDrawings[index] = {
          ...drawing,
          voteStatus: 'upvoted',
          upvotes: newUpvotes,
        };
        // Send UPVOTE message
        sendToDevvit({
          type: 'UPVOTE',
          payload: {
            userId,
            round: currentRound,
          },
        });
      }
      return newDrawings;
    });
  };

  // Handler for toggling downvote on a drawing
  const handleDownvote = (index: number) => {
    setDrawings((prev) => {
      const newDrawings = [...prev];
      const drawing = newDrawings[index];
      if (drawing.voteStatus === 'downvoted') {
        // Toggle off downvote: set to none
        newDrawings[index] = { ...drawing, voteStatus: 'none' };
        // (Optional: send cancel vote message)
      } else {
        // If it was upvoted, remove upvote (decrement upvotes) then set to downvoted
        let newUpvotes = drawing.upvotes;
        if (drawing.voteStatus === 'upvoted') {
          newUpvotes = drawing.upvotes - 1;
        }
        newDrawings[index] = {
          ...drawing,
          voteStatus: 'downvoted',
          upvotes: newUpvotes,
        };
        // Send DOWNVOTE message
        sendToDevvit({
          type: 'DOWNVOTE',
          payload: {
            userId,
            round: currentRound,
          },
        });
      }
      return newDrawings;
    });
  };

  return (
    <div className="explore-page-container flex flex-col items-center gap-4 text-white">
      <h1 className="text-2xl font-bold">Explore</h1>
      <div className="grid w-full grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-3">
        {drawings.map((drawing, index) => (
          <div
            key={index}
            className="flex flex-col items-center rounded bg-gray-800 p-4"
          >
            <ImageFrame url={drawing.blobUrl} />
            <div className="mt-2 font-bold">{drawing.user}</div>
            <div className="mt-1 flex items-center gap-4">
              {/* Upvote button */}
              <button
                onClick={() => handleUpvote(index)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                  drawing.voteStatus === 'upvoted'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-gray-500 text-gray-500'
                }`}
              >
                ▲
              </button>
              <span>{drawing.upvotes}</span>
              {/* Downvote button */}
              <button
                onClick={() => handleDownvote(index)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                  drawing.voteStatus === 'downvoted'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-gray-500 text-gray-500'
                }`}
              >
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>
      {loading && <div className="mt-4">Loading...</div>}
      {hasMore && !loading && <div ref={observerRef} className="h-4"></div>}
      {!hasMore && <div className="mt-4">No more drawings.</div>}
    </div>
  );
};

export default ExplorePage;
