import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDevvitListener } from '../../hooks/useDevvitListener';
import { sendToDevvit } from '../../utils';
import ImageFrame from '../../components/ImageFrame';
import { Button } from '../../components/Button';
import './ExplorePage.css';

type Drawing = {
  blobUrl: string;
  user: string;
  upvotes: number;
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
      const newDrawings = paginatedData.drawings as Drawing[];
      // If fewer than expected items returned, assume there are no more drawings
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

  const currentRound = 1;
  const userId = 'currentUserId';

  // Handlers for upvote and downvote
  const handleUpvote = (index: number) => {
    setDrawings((prev) => {
      const newDrawings = [...prev];
      newDrawings[index] = {
        ...newDrawings[index],
        upvotes: newDrawings[index].upvotes + 1,
      };
      return newDrawings;
    });
    sendToDevvit({
      type: 'UPVOTE',
      payload: {
        userId,
        round: currentRound,
      },
    });
  };

  const handleDownvote = (_: number) => {
    sendToDevvit({
      type: 'DOWNVOTE',
      payload: {
        userId,
        round: currentRound,
      },
    });
  };

  return (
    <div className="explore-page-container flex flex-col items-center gap-4 text-white">
      <h1>Check out what other users drew this round</h1>
      <div className="grid w-full grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-3">
        {drawings.map((drawing, index) => (
          <div
            key={index}
            className="flex flex-col items-center rounded bg-gray-800 p-4"
          >
            <ImageFrame url={drawing.blobUrl} />
            <div className="mt-2 font-bold">{drawing.user}</div>
            <div className="mt-1 flex items-center gap-2">
              <Button
                text="Upvote"
                onClick={() => handleUpvote(index)}
                width="8em"
                iconSrc="/icons/upvote.svg"
              />
              <span>{drawing.upvotes}</span>
              <Button
                text="Downvote"
                onClick={() => handleDownvote(index)}
                width="8em"
                iconSrc="/icons/downvote.svg"
              />
            </div>
          </div>
        ))}
      </div>
      {loading && <div>Loading...</div>}
      {hasMore && !loading && <div ref={observerRef} className="h-4"></div>}
      {!hasMore && <div>No more drawings.</div>}
    </div>
  );
};

export default ExplorePage;
