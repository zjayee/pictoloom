import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from '@devvit/public-api';

import { Service } from '../service/service.js';
import { RoundType } from '../types.js';

// Logic for setting game state for testing
class mockGameState {
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

  async setGameNextRound(postId: string, roundType: RoundType) {
    // Go to next round
    await this.service.game.newRound(postId, roundType);
  }

  async setGameRoundNumber(postId: string, roundNumber: number) {
    // Set round number
    await this.redis.hSet(`game:${postId}`, {
      currentRound: String(roundNumber),
    });
  }
}
