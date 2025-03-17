import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from "@devvit/public-api";

import type { Drawing, RedisKeys } from "../types.js";

// Contains logic for drawing rounds.
export class DrawService {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;
  readonly keys: RedisKeys;

  constructor(
    context: {
      redis: RedisClient;
      reddit?: RedditAPIClient;
      scheduler?: Scheduler;
    },
    keys: RedisKeys
  ) {
    this.redis = context.redis;
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
    this.keys = keys;
  }

  async submitDrawing(postId: string, drawing: string) {
    const userId = await this.reddit?.getCurrentUsername();
    if (!userId) {
      throw new Error("User not found");
    }
    const currentRoundJson = await this.redis.hGet(
      this.keys.game(postId),
      "currentRound"
    );
    if (!currentRoundJson) {
      throw new Error("No current round found");
    }
    const currentRound = JSON.parse(currentRoundJson);
    if (currentRound.type !== "draw") {
      throw new Error("Current round is not a draw round");
    }

    const drawingObj: Drawing = {
      postId,
      roundNumber: currentRound.roundNumber,
      userId,
      drawing,
    };

    // Save drawing to Redis
    await this.redis.hSet(this.keys.drawing(postId, currentRound.roundNumber), {
      userId: drawing,
    });
  }
}
