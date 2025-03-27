import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from '@devvit/public-api';

import type {
  DrawingVoteStatus,
  Game,
  GameStatus,
  Round,
  RoundType,
} from '../types.js';

import { Db } from '../storage/db.js';
import { Cache } from '../storage/cache.js';
import { placeholderBlob } from '../utils/mock.js';
import { mockPhraseBlobs } from '../utils/mockGame.js';

import { Devvit } from '@devvit/public-api';

// Contains game setup logic. Handles game creation and round creation.
export class GalleryService {
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;
  readonly db: Db;
  readonly cache: Cache;

  constructor(
    context: {
      redis: RedisClient;
      reddit?: RedditAPIClient;
      scheduler?: Scheduler;
    },
    db: Db,
    cache: Cache
  ) {
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
    this.db = db;
    this.cache = cache;
  }

  async upvoteDrawing(
    postId: string,
    roundNumber: number,
    userId: string,
    numVotes: number
  ) {
    const votingUserId = await this.reddit?.getCurrentUsername();
    if (!votingUserId) {
      throw new Error('User not found');
    }
    await this.cache.upvoteDrawing(
      postId,
      votingUserId,
      userId,
      roundNumber,
      numVotes
    );
  }

  async downvoteDrawing(
    postId: string,
    roundNumber: number,
    userId: string,
    numVotes: number
  ) {
    const votingUserId = await this.reddit?.getCurrentUsername();
    if (!votingUserId) {
      throw new Error('User not found');
    }
    await this.cache.downvoteDrawing(
      postId,
      votingUserId,
      userId,
      roundNumber,
      numVotes
    );
  }

  async getDrawingVoteStatus(
    postId: string,
    roundNumber: number,
    userId: string
  ): Promise<DrawingVoteStatus> {
    const votingUserId = await this.reddit?.getCurrentUsername();
    if (!votingUserId) {
      throw new Error('User not found');
    }
    return await this.cache.getDrawingVoteStatus(
      postId,
      votingUserId,
      userId,
      roundNumber
    );
  }

  async getRankedDrawings(postId: string, start: number, end: number) {
    const drawings = await this.cache.getDrawingsForVote(postId, start, end);
    for (const drawing of drawings) {
      const status = await this.getDrawingVoteStatus(
        postId,
        drawing.round,
        drawing.user
      );
      Object.assign(drawing, { voteStatus: status });
    }
    return drawings as {
      user: string;
      blobUrl: string;
      voteStatus: DrawingVoteStatus;
      upvotes: number;
      round: number;
    }[];
  }
}
