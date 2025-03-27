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
  voteStatus: VoteStatus;
  round: number;
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

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center text-white">
      <h1 className="p-4 text-2xl font-bold">EXPLORE</h1>
      <div className="flex w-full flex-col overflow-y-auto pb-4">
        <div className="flex w-full flex-col items-center justify-center gap-y-[3em]">
          {drawings.map((drawing, index) => (
            <div
              key={index}
              className="flex w-[308px] flex-col items-center justify-center gap-y-[0.5em]"
            >
              <ImageFrame url={drawing.blobUrl} />
              <div className="flex w-full items-center justify-between">
                <UpvoteDownvoteButtons
                  voteStatus={drawing.voteStatus}
                  upvotes={drawing.upvotes}
                  onVoteChange={(newStatus, voteDelta) => {
                    setDrawings((prev) => {
                      const newDrawings = [...prev];
                      newDrawings[index] = {
                        ...newDrawings[index],
                        voteStatus: newStatus,
                        upvotes: newDrawings[index].upvotes + voteDelta,
                      };
                      return newDrawings;
                    });
                  }}
                  userId={drawing.user}
                  currentRound={drawing.round}
                />
                <div className="mt-2 font-bold">{drawing.user}</div>
              </div>
            </div>
          ))}
        </div>
        {loading && (
          <div className="mt-4 flex items-center justify-center">
            Loading...
          </div>
        )}
        {hasMore && !loading && (
          <div ref={observerRef} className="h-4 w-full bg-transparent" />
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
