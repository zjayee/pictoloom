import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from "@devvit/public-api";

import type { RedisKeys } from "../types.js";

import { Db } from "../storage/db.js";

import { Devvit } from "@devvit/public-api";

// Contains phrase bank logic. Handles phrase bank creation and phrase bank retrieval.
export class PhraseBankService {
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

  async upsertPhraseBank(name: string, phrases: string[]) {
    this.db.upsertPhraseBank(name, phrases);
  }

  async clearPhraseBank(name: string) {
    this.db.clearPhraseBank(name);
  }
}
