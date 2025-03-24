import type { RedisClient } from "@devvit/public-api";

import type { Game, GameStatus, Round, RoundType, Drawing } from "../types.js";

// File contains logic for saving and retrieving data from Redis.
export class Db {
  readonly redis: RedisClient;

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  readonly keys = {
    game: (gameId: string) => `game:${gameId}`,
    phraseBank: (name: string) => `phraseBank:${name}`,
    round: (postId: string, roundNumber: string) =>
      `round:${postId}:${roundNumber}`,
    drawing: (postId: string, roundNumber: string) =>
      `drawing:${postId}:${roundNumber}`,
  };

  async saveGame(game: Game) {
    await this.redis.hSet(this.keys.game(game.id), {
      id: game.id,
      phrases: JSON.stringify(game.phrases),
      status: game.status,
      currentRound: String(game.currentRound),
    });
  }

  async incrementRound(gameId: string) {
    await this.redis.hIncrBy(this.keys.game(gameId), "currentRound", 1);
  }

  async setGameStatus(gameId: string, status: GameStatus) {
    await this.redis.hSet(this.keys.game(gameId), { status });
  }

  async getGame(gameId: string): Promise<Game | null> {
    const game = await this.redis.hGetAll(this.keys.game(gameId));
    if (!game) {
      return null;
    }
    return {
      id: game.id,
      phrases: JSON.parse(game.phrases),
      status: game.status as GameStatus,
      currentRound: Number(game.currentRound),
    };
  }

  async getGameCurrentRound(gameId: string): Promise<number> {
    const currentRound = await this.redis.hGet(
      this.keys.game(gameId),
      "currentRound"
    );
    return currentRound ? Number(currentRound) : 0;
  }

  async saveRound(postId: string, round: Round) {
    await this.redis.hSet(this.keys.round(postId, String(round.roundNumber)), {
      roundType: round.roundType,
      roundNumber: String(round.roundNumber),
      startTime: round.startTime,
      endTime: round.endTime,
    });
  }

  async getRound(postId: string, roundNumber: number): Promise<Round | null> {
    const round = await this.redis.hGetAll(
      this.keys.round(postId, String(roundNumber))
    );
    if (!round) {
      return null;
    }
    return {
      roundType: round.roundType as RoundType,
      roundNumber: Number(round.roundNumber),
      startTime: round.startTime,
      endTime: round.endTime,
    };
  }

  async getPhraseBank(name: string): Promise<string[]> {
    const phraseBankJson = await this.redis.get(this.keys.phraseBank(name));
    return phraseBankJson ? JSON.parse(phraseBankJson) : [];
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
    await this.redis.del(this.keys.phraseBank(name));
  }

  async saveDrawing(drawing: Drawing) {
    await this.redis.hSet(
      this.keys.drawing(drawing.gameId, String(drawing.roundNumber)),
      {
        [drawing.userId]: drawing.drawing,
      }
    );
  }

  async getUserIdsForRound(postId: string, roundNumber: number) {
    const drawings = await this.redis.hGetAll(
      this.keys.drawing(postId, String(roundNumber))
    );

    // extract keys from hash
    const userIds = Object.keys(drawings);
    return userIds;
  }

  async getDrawing(postId: string, roundNumber: number, userId: string) {
    const drawing = await this.redis.hGet(
      this.keys.drawing(postId, String(roundNumber)),
      userId
    );
    return drawing;
  }
}
