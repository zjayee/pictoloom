import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from "@devvit/public-api";

import { Db } from "../storage/db.js";
import { Drawing } from "../types.js";

// Contains logic for drawing rounds.
export class DrawService {
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;

  readonly db: Db;

  constructor(
    context: {
      redis: RedisClient;
      reddit?: RedditAPIClient;
      scheduler?: Scheduler;
    },
    db: Db
  ) {
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
    this.db = db;
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

    const drawingObj: Drawing = {
      gameId: postId,
      userId: userId,
      roundNumber: currentRoundNum,
      drawing: drawing,
    };

    await this.db.saveDrawing(drawingObj);
  }

  async selectReferences(postId: string, number_of_references: number) {}
}
