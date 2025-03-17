import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from "@devvit/public-api";

import type { RedisKeys } from "../types.js";

import { Devvit } from "@devvit/public-api";

// Contains phrase bank logic. Handles phrase bank creation and phrase bank retrieval.
export class PhraseBankService {
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

  async upsertPhraseBank(name: string, phrases: string[]) {
    // Save phrases to Redis
    const key = this.keys.phraseBank(name);
    const existingJson = await this.redis.get(key);
    const existingWords = existingJson ? JSON.parse(existingJson) : [];

    const unique = new Set([...existingWords, ...phrases]);
    await this.redis.set(key, JSON.stringify(Array.from(unique)));
  }

  async clearPhraseBank(name: string) {
    // Clear phrases from Redis
    await this.redis.del(this.keys.phraseBank(name));
  }
}
