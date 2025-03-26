import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from "@devvit/public-api";

import { Cache } from "../storage/cache.js";
import { Db } from "../storage/db.js";
import { Drawing } from "../types.js";

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
      throw new Error("User not found");
    }
    const currentRoundNum = await this.db.getGameCurrentRound(postId);
    if (currentRoundNum === 0) {
      throw new Error("Invalid round number");
    }

    const phrase = await this.cache.getUserAssignedPhrase(
      postId,
      currentRoundNum,
      userId
    );
    if (!phrase) {
      throw new Error("Phrase not found");
    }

    this.db.incrRoundParticipantNum(postId, currentRoundNum);

    const drawingObj: Drawing = {
      gameId: postId,
      userId: userId,
      roundNumber: currentRoundNum,
      drawing: drawing,
      phrase: phrase,
    };

    await this.db.saveDrawing(drawingObj, phrase);
  }
}
