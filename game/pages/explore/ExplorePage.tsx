import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDevvitListener } from '../../hooks/useDevvitListener';
import { sendToDevvit } from '../../utils';
import ImageFrame from '../../components/ImageFrame';
import './ExplorePage.css';
import {
  UpvoteDownvoteButtons,
  VoteStatus,
} from '../../components/UpvoteDownvoteButton';

type Drawing = {
  blobUrl: string;
  user: string;
  upvotes: number;
  voteStatus: VoteStatus; // 'none' | 'upvoted' | 'downvoted'
};

export const ExplorePage: React.FC = () => {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const limit = 12;
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const paginatedData = useDevvitListener('PAGINATED_DRAWINGS_DATA');

  useEffect(() => {
    if (paginatedData && paginatedData.drawings) {
      const newDrawings: Drawing[] = paginatedData.drawings.map(
        (d: Omit<Drawing, 'voteStatus'>) => ({
          ...d,
          voteStatus: 'none',
        })
      );

      if (newDrawings.length < limit) {
        setHasMore(false);
      }

      setDrawings((prev) => [...prev, ...newDrawings]);
      setStartIndex((prev) => prev + newDrawings.length);
      setLoading(false);
    }
  }, [paginatedData]);

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

  const observerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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

  const currentRound = 1;
  const userId = 'currentUserId';

  const handleUpvote = (index: number) => {
    setDrawings((prev) => {
      const newDrawings = [...prev];
      const drawing = newDrawings[index];

      if (drawing.voteStatus === 'upvoted') {
        newDrawings[index] = {
          ...drawing,
          voteStatus: 'none',
          upvotes: drawing.upvotes - 1,
        };
      } else {
        let newUpvotes = drawing.upvotes;
        if (drawing.voteStatus === 'downvoted') {
          newUpvotes = drawing.upvotes + 1;
        }
        if (drawing.voteStatus === 'none') {
          newUpvotes = drawing.upvotes + 1;
        }
        newDrawings[index] = {
          ...drawing,
          voteStatus: 'upvoted',
          upvotes: newUpvotes,
        };
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

  const handleDownvote = (index: number) => {
    setDrawings((prev) => {
      const newDrawings = [...prev];
      const drawing = newDrawings[index];

      if (drawing.voteStatus === 'downvoted') {
        newDrawings[index] = {
          ...drawing,
          voteStatus: 'none',
        };
      } else {
        let newUpvotes = drawing.upvotes;
        if (drawing.voteStatus === 'upvoted') {
          newUpvotes = drawing.upvotes - 1;
        }
        newDrawings[index] = {
          ...drawing,
          voteStatus: 'downvoted',
          upvotes: newUpvotes,
        };
        // Send downvote message
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
    <div className="flex flex-col items-center gap-4 p-[1em] text-white">
      <h1 className="text-2xl font-bold">Explore</h1>

      <div className="grid w-full grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-3">
        {drawings.map((drawing, index) => (
          <div key={index} className="flex flex-col items-center">
            <ImageFrame url={drawing.blobUrl} />
            <div className="mt-2 font-bold">{drawing.user}</div>

            <UpvoteDownvoteButtons
              voteStatus={drawing.voteStatus}
              upvotes={drawing.upvotes}
              onUpvote={() => handleUpvote(index)}
              onDownvote={() => handleDownvote(index)}
            />
          </div>
        ))}
      </div>

      {loading && <div className="mt-4">Loading...</div>}
      {hasMore && !loading && <div ref={observerRef} className="h-4" />}
      {!hasMore && <div className="mt-4">No more drawings.</div>}
    </div>
  );
};

export default ExplorePage;
