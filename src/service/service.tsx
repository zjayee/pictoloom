import type {
  Post,
  RedditAPIClient,
  RedisClient,
  Scheduler,
  ZRangeOptions,
} from "@devvit/public-api";
import type { Game } from "../types.js";
import { Devvit } from "@devvit/public-api";

// Handles the logic behind the application
export class Service {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;

  constructor(context: {
    redis: RedisClient;
    reddit?: RedditAPIClient;
    scheduler?: Scheduler;
  }) {
    this.redis = context.redis;
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
  }

  // Redis key formats
  readonly keys = {
    game: (gameId: string) => `game:${gameId}`,
    phraseBank: (name: string) => `phraseBank:${name}`,
  };

  // Set up a new game
  async newGame(postId: string) {
    const phrases = this.choosePhrases(3);
    const game: Game = {
      id: postId,
      phrases: phrases,
      status: "draw",
      rounds: [],
    };

    // Save game to Redis
    await this.redis.hSet(this.keys.game(postId), {
      id: game.id,
      phrases: JSON.stringify(game.phrases),
      status: game.status,
      rounds: JSON.stringify(game.rounds),
    });
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

  private choosePhrases(count: number) {
    /* Chooses count number of phrases from phrase bank */
    // TODO: Implement
    let phrases = [];
    for (let i = 0; i < count; i++) {
      phrases.push("majjie");
    }
    return phrases;
  }
}
