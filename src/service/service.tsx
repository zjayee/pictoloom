import type {
  Post,
  RedditAPIClient,
  RedisClient,
  Scheduler,
  ZRangeOptions,
} from "@devvit/public-api";
import type { Game, Round, RoundType } from "../types.js";
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
    const phrases = await this.choosePhrases(3);
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

    // Start a new round
    await this.newRound(postId, "draw");
  }

  async newRound(
    postId: string,
    roundType: RoundType,
    roundLength: number = 3
  ) {
    /* Creates a new round object that's roundLength hours long */
    const start_time = new Date();
    start_time.setMinutes(0, 0, 0);
    const end_time = new Date(
      start_time.getTime() + roundLength * 60 * 60 * 1000
    );

    const round: Round = {
      roundType: roundType,
      roundNumber: 1,
      startTime: start_time.toISOString(),
      endTime: end_time.toISOString(),
    };

    // Save round to Redis
    const gameKey = this.keys.game(postId);
    const roundsJson = await this.redis.hGet(gameKey, "rounds");
    const rounds = roundsJson ? JSON.parse(roundsJson) : [];
    rounds.push(round);
    await this.redis.hSet(gameKey, { rounds: JSON.stringify(rounds) });
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

  private async choosePhrases(count: number) {
    /* Chooses count number of phrases from phrase bank */
    const phraseBankKey = this.keys.phraseBank("default");
    const phraseBankJson = await this.redis.get(phraseBankKey);
    const phraseBankWords = phraseBankJson ? JSON.parse(phraseBankJson) : [];
    const idxs = new Set<number>();

    while (idxs.size < count && phraseBankWords.length > count) {
      const randomIdx = Math.floor(Math.random() * phraseBankWords.length);
      idxs.add(randomIdx);
    }

    const phrases = Array.from(idxs).map((idx) => phraseBankWords[idx]);
    return phrases;
  }
}
