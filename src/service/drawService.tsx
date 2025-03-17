import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from "@devvit/public-api";

import type { RedisKeys } from "../types.js";

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
}
