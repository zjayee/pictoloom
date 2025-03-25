import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from "@devvit/public-api";

import { Cache } from "../storage/cache.js";
import { Db } from "../storage/db.js";
import { Guess } from "../types.js";

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

  async submitGuess(postId: string, phrase: string, guess: string) {
    const userId = await this.reddit?.getCurrentUsername();
    if (!userId) {
      throw new Error("User not found");
    }
    const currentRoundNum = await this.db.getGameCurrentRound(postId);
    if (currentRoundNum === 0) {
      throw new Error("Invalid round number");
    }

    this.db.incrRoundParticipantNum(postId, currentRoundNum);

    // TODO: Generate score

    const guessObj: Guess = {
      gameId: postId,
      userId: userId,
      roundNumber: currentRoundNum,
      phrase: phrase,
      guess: guess,
      score: this.generateScore(phrase, guess),
    };

    await this.db.saveGuess(guessObj, phrase);
  }

  private generateScore(phrase: string, guess: string): number {
    // TODO: Implement scoring logic
    return 0;
  }
}
