import type { RedisClient, ZMember } from "@devvit/public-api";
import { Db } from "./db.js";

class Cache {
  readonly redis: RedisClient;
  readonly db: Db;

  constructor(redis: RedisClient) {
    this.redis = redis;
    this.db = new Db(redis);
  }

  readonly keys = {
    referenceDrawing: (postId: string, roundNumber: string) =>
      `referenceDrawing:${postId}:${roundNumber}`,
  };

  async setupDrawingReferences(postId: string, roundNumber: number) {
    // Get drawings for round and set up zset for reference counts
    const drawingUserIds = await this.db.getUserIdsForRound(
      postId,
      roundNumber
    );

    // Set up zset for reference counts
    const key = this.keys.referenceDrawing(postId, String(roundNumber));
    for (const userId of drawingUserIds) {
      await this.redis.zAdd(key, { score: 0, member: userId });
    }
  }
}
