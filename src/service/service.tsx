import type {
  Post,
  RedditAPIClient,
  RedisClient,
  Scheduler,
  ZRangeOptions,
} from '@devvit/public-api';

import { DrawService } from './drawService.js';
import { Cache } from '../storage/cache.js';
import { Db } from '../storage/db.js';
import { GameService } from './gameService.js';
import { PhraseBankService } from './phrasebankService.js';
import { GuessService } from './guessService.js';
import { GalleryService } from './galleryService.js';

import { Devvit } from '@devvit/public-api';

// Handles the logic behind the application
export class Service {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;
  readonly cache: Cache;
  readonly db: Db;
  readonly game: GameService;
  readonly phraseBank: PhraseBankService;
  readonly draw: DrawService;
  readonly guess: GuessService;
  readonly gallery: GalleryService;

  constructor(context: {
    redis: RedisClient;
    reddit?: RedditAPIClient;
    scheduler?: Scheduler;
  }) {
    this.redis = context.redis;
    this.db = new Db(context.redis);
    this.cache = new Cache(context.redis);

    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
    this.game = new GameService(context, this.db, this.cache);
    this.phraseBank = new PhraseBankService(context, this.db);
    this.draw = new DrawService(context, this.db, this.cache);
    this.guess = new GuessService(context, this.db, this.cache);
    this.gallery = new GalleryService(context, this.db, this.cache);
  }
}
