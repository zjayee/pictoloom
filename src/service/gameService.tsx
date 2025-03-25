import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from "@devvit/public-api";

import type { Game, Round, RoundType } from "../types.js";

import { Db } from "../storage/db.js";
import { Cache } from "../storage/cache.js";

import { Devvit } from "@devvit/public-api";

// Contains game setup logic. Handles game creation and round creation.
export class GameService {
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;
  readonly db: Db;
  readonly cache: Cache;

  constructor(
    context: {
      redis: RedisClient;
      reddit?: RedditAPIClient;
      scheduler?: Scheduler;
    },
    db: Db,
    cache: Cache
  ) {
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
    this.db = db;
    this.cache = cache;
  }

  // Set up a new game
  async newGame(postId: string) {
    const phrases = await this.choosePhrases(3);
    const game: Game = {
      id: postId,
      phrases: phrases,
      status: "draw",
      currentRound: 0,
    };

    // Save game to Redis
    await this.db.saveGame(game);

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
      participantNum: 0,
    };

    // Increment round number
    await this.db.incrementRound(postId);

    // Setup round
    if (roundType === "guess") {
      await this.db.setGameStatus(postId, "guess");
    } else {
      // Set up drawing references
      if (round.roundNumber > 1) {
        await this.cache.setupDrawingReferences(postId, round.roundNumber - 1);
      }
    }

    // Save round to Redis
    await this.db.saveRound(postId, round);
  }

  async getCurrentRound(postId: string): Promise<Round | null> {
    /* Returns the current round for the game */
    const currentRoundNum = await this.db.getGameCurrentRound(postId);
    if (currentRoundNum === 0) {
      return null;
    }

    return await this.db.getRound(postId, currentRoundNum);
  }

  private async choosePhrases(count: number) {
    /* Chooses count number of phrases from phrase bank */
    const phraseBankWords = await this.db.getPhraseBank("default");
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

  async selectReferences(postId: string, number_of_references: number) {
    const currentRoundNum = await this.db.getGameCurrentRound(postId);
    return await this.cache.getReferenceDrawings(
      postId,
      currentRoundNum,
      number_of_references
    );
  }
}
