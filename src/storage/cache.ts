import type { RedisClient, ZMember } from "@devvit/public-api";
import { Db } from "./db.js";

export class Cache {
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

  async getReferenceDrawings(
    postId: string,
    roundNumber: number,
    count: number
  ) {
    /* Returns the count reference drawings for the round */
    const referenceDrawingUserIds = await this.redis.zRange(
      this.keys.referenceDrawing(postId, String(roundNumber)),
      0,
      count - 1
    );

    // Increment reference count for each drawing and get the drawing
    const drawings = [];
    for (const drawing of referenceDrawingUserIds) {
      await this.redis.zIncrBy(
        this.keys.referenceDrawing(postId, String(roundNumber)),
        drawing.member,
        1
      );

      const drawingObj = await this.db.getDrawing(
        postId,
        roundNumber,
        drawing.member
      );
      if (drawingObj) {
        drawings.push(drawingObj);
      }
    }

    return drawings;
  }
}
