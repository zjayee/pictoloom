import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from '@devvit/public-api';

import { Cache } from '../storage/cache.js';
import { Db } from '../storage/db.js';
import { Drawing } from '../types.js';
import { placeholderBlob } from '../utils/mock.js';
import { blob } from 'stream/consumers';

// Contains logic for drawing rounds.
export class DrawService {
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;

  readonly cache: Cache;
  readonly db: Db;

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

  async submitDrawing(postId: string, drawing: string) {
    const userId = await this.reddit?.getCurrentUsername();
    if (!userId) {
      throw new Error('User not found');
    }
    const currentRoundNum = await this.db.getGameCurrentRound(postId);
    if (currentRoundNum === 0) {
      throw new Error('Invalid round number');
    }

    const phrase = await this.cache.getUserAssignedPhrase(
      postId,
      currentRoundNum,
      userId
    );
    if (!phrase) {
      throw new Error('Phrase not found');
    }

    this.db.incrRoundParticipantNum(postId, currentRoundNum);
    this.cache.addDrawingForVote(postId, userId, currentRoundNum);
    this.cache.setRoundParticipantStatus(
      postId,
      currentRoundNum,
      userId,
      'played'
    );

    const drawingObj: Drawing = {
      gameId: postId,
      userId: userId,
      roundNumber: currentRoundNum,
      drawing: drawing,
      phrase: phrase,
    };

    await this.db.saveDrawing(drawingObj);
  }

  async getCurUserDrawing(postId: string) {
    const userId = await this.reddit?.getCurrentUsername();
    if (!userId) {
      throw new Error('User not found');
    }
    const currentRoundNum = await this.db.getGameCurrentRound(postId);
    if (currentRoundNum === 0) {
      throw new Error('Invalid round number');
    }

    const drawing = await this.db.getDrawingObj(
      postId,
      currentRoundNum,
      '',
      userId
    );
    const upvotes = await this.cache.getDrawingUpvotes(
      postId,
      userId,
      currentRoundNum
    );

    if (!drawing) {
      return {
        blobUrl: placeholderBlob,
        upvotes: upvotes,
        voteStatus: 'none',
        round: currentRoundNum,
        userId: userId,
      };
    } else {
      const drawingVoteStatus = await this.cache.getDrawingVoteStatus(
        postId,
        userId,
        drawing.userId,
        currentRoundNum
      );
      return {
        blobUrl: drawing.drawing,
        upvotes: upvotes,
        voteStatus: drawingVoteStatus,
        round: currentRoundNum,
        userId: userId,
      };
    }
  }

  async getNumberofReferences(postId: string, roundNumber: number) {
    const userId = await this.reddit?.getCurrentUsername();
    if (!userId) {
      throw new Error('User not found');
    }
    const references = await this.cache.getNumberOfReferenceDrawings(
      postId,
      roundNumber,
      userId
    );
    return references;
  }
}
