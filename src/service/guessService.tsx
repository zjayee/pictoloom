import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from '@devvit/public-api';

import { Cache } from '../storage/cache.js';
import { Db } from '../storage/db.js';
import { Guess } from '../types.js';
import levenshtein from 'fast-levenshtein';

// Contains logic for guessing rounds.
export class GuessService {
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

  async submitGuess(postId: string, guess: string) {
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
    this.cache.setRoundParticipantStatus(
      postId,
      currentRoundNum,
      userId,
      'played'
    );

    const guessObj: Guess = {
      gameId: postId,
      userId: userId,
      roundNumber: currentRoundNum,
      phrase: phrase,
      guess: guess,
      score: this.generateScore(phrase, guess),
    };

    await this.db.saveGuess(guessObj);
  }

  async getUserGuessScore(postId: string) {
    const userId = await this.reddit?.getCurrentUsername();
    if (!userId) {
      throw new Error('User not found');
    }
    return await this.db.getUserGuessScore(postId, userId);
  }

  async getUserGuess(postId: string) {
    const userId = await this.reddit?.getCurrentUsername();
    if (!userId) {
      throw new Error('User not found');
    }
    return (await this.db.getUserGuess(postId, userId)) ?? '';
  }

  private generateScore(phrase: string, guess: string): number {
    // TODO: Implement vector encoding and cosine similarity
    const distance = levenshtein.get(phrase, guess);
    const maxLength = Math.max(phrase.length, guess.length);

    return Math.round((1 - distance / maxLength) * 10000); // Normalize to [0,100]
  }
}
