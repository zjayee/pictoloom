import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from '@devvit/public-api';

import {
  dancingDuckBlob,
  fluffyDogBlob,
  bananaDJBlob,
  RobotLoveBlob,
  screamingPigBlob,
} from './mock.js';

import { Service } from '../service/service.js';

// Logic for setting game state for testing
export class MockGameState {
  readonly redis: RedisClient;
  readonly service: Service;

  constructor(context: {
    redis: RedisClient;
    reddit?: RedditAPIClient;
    scheduler?: Scheduler;
  }) {
    this.redis = context.redis;
    this.service = new Service(context);
  }

  async setGameNextRound(postId: string) {
    // Get current round number
    const currentRound = await this.redis.hGet(
      `game:${postId}`,
      'currentRound'
    );
    if (!currentRound) {
      throw new Error('Game not found');
    }

    // Go to next round
    if (currentRound == '4') {
      await this.service.game.endGame(postId);
    } else {
      const roundType = currentRound == '3' ? 'guess' : 'draw';
      await this.service.game.newRound(postId, roundType);
    }
  }

  async setGameDecrementRound(postId: string) {
    // Get current round number
    const currentRound = await this.redis.hGet(
      `game:${postId}`,
      'currentRound'
    );
    if (!currentRound) {
      throw new Error('Game not found');
    }
    const roundNumber = Number(currentRound) - 1;
    // Set round number
    await this.redis.hSet(`game:${postId}`, {
      currentRound: String(roundNumber),
    });
  }
}

export const mockPhraseBlobs = {
  'dancing duck': dancingDuckBlob,
  'fluffy dog': fluffyDogBlob,
  'banana DJ': bananaDJBlob,
  'Robot falling in love': RobotLoveBlob,
  'Screaming pig': screamingPigBlob,
};
