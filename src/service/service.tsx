import type {
  Post,
  RedditAPIClient,
  RedisClient,
  Scheduler,
  ZRangeOptions,
} from "@devvit/public-api";

import { DrawService } from "./drawService.js";
import { Db } from "../storage/db.js";
import { GameService } from "./gameService.js";
import { PhraseBankService } from "./phrasebankService.js";

import { Devvit } from "@devvit/public-api";

// Handles the logic behind the application
export class Service {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;
  readonly db: Db;
  readonly game: GameService;
  readonly phraseBank: PhraseBankService;
  readonly draw: DrawService;

  constructor(context: {
    redis: RedisClient;
    reddit?: RedditAPIClient;
    scheduler?: Scheduler;
  }) {
    this.redis = context.redis;
    this.db = new Db(context.redis);

    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
    this.game = new GameService(context, this.db);
    this.phraseBank = new PhraseBankService(context, this.db);
    this.draw = new DrawService(context, this.db);
  }
}
