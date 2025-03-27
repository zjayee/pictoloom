import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from '@devvit/public-api';

import type { Game, GameStatus, Round, RoundType } from '../types.js';

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

  async upvoteDrawing(postId: string, roundNumber: number, userId: string) {
    await this.cache.upvoteDrawing(postId, userId, roundNumber);
  }

  async downvoteDrawing(postId: string, roundNumber: number, userId: string) {
    await this.cache.downvoteDrawing(postId, userId, roundNumber);
  }

  async getRankedDrawings(postId: string, start: number, end: number) {
    return await this.cache.getDrawingsForVote(postId, start, end);
  }
}
