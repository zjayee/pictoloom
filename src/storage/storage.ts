import type { RedisClient } from "@devvit/public-api";

import type { Game, GameStatus, Round, RoundType, Drawing } from "../types.js";

// File contains logic for saving and retrieving data from Redis.
export class Storage {
  readonly redis: RedisClient;

  constructor(context: { redis: RedisClient }) {
    this.redis = context.redis;
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

  async saveDrawing(drawing: Drawing) {
    await this.redis.hSet(
      this.keys.drawing(drawing.postId, String(drawing.currentRound)),
      {
        [drawing.userId]: drawing.drawing,
      }
    );
  }
}
