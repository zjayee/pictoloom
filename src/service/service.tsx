import type {
  Post,
  RedditAPIClient,
  RedisClient,
  Scheduler,
  ZRangeOptions,
} from "@devvit/public-api";

import { DrawService } from "./drawService.js";
import { GameService } from "./gameService.js";
import { PhraseBankService } from "./phrasebankService.js";

import { Devvit } from "@devvit/public-api";

// Handles the logic behind the application
export class Service {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;
  readonly game: GameService;
  readonly phraseBank: PhraseBankService;
  readonly draw: DrawService;

  constructor(context: {
    redis: RedisClient;
    reddit?: RedditAPIClient;
    scheduler?: Scheduler;
  }) {
    this.redis = context.redis;
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
    this.game = new GameService(context, this.keys);
    this.phraseBank = new PhraseBankService(context, this.keys);
    this.draw = new DrawService(context, this.keys);
  }

  // Redis key formats
  readonly keys = {
    game: (gameId: string) => `game:${gameId}`,
    phraseBank: (name: string) => `phraseBank:${name}`,
  };
}
