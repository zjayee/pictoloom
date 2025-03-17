import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from "@devvit/public-api";

import type { Game, Round, RoundType } from "../types.js";
import type { RedisKeys } from "../types.js";

import { Devvit } from "@devvit/public-api";

export class GameService {
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

  private async choosePhrases(count: number) {
    /* Chooses count number of phrases from phrase bank */
    const phraseBankKey = this.keys.phraseBank("default");
    const phraseBankJson = await this.redis.get(phraseBankKey);
    const phraseBankWords = phraseBankJson ? JSON.parse(phraseBankJson) : [];
    const idxs = new Set<number>();

    if (phraseBankWords.length < count) {
      return phraseBankWords;
    }

    while (idxs.size < count && phraseBankWords.length > count) {
      const randomIdx = Math.floor(Math.random() * phraseBankWords.length);
      idxs.add(randomIdx);
    }

    const phrases = Array.from(idxs).map((idx) => phraseBankWords[idx]);
    return phrases;
  }
}
