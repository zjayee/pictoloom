import type { RedisClient } from '@devvit/public-api';

import type {
  Game,
  GameStatus,
  Round,
  RoundType,
  Drawing,
  Guess,
} from '../types.js';
import { g } from 'motion/react-client';
import { J } from 'vitest/dist/chunks/reporters.QZ837uWx.js';

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
    guess: (postId: string) => `guess:${postId}`,
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
    await this.redis.hIncrBy(this.keys.game(gameId), 'currentRound', 1);
  }

  async setGameStatus(gameId: string, status: GameStatus) {
    await this.redis.hSet(this.keys.game(gameId), { status });
  }

  async getGameStatus(gameId: string): Promise<GameStatus> {
    const status = await this.redis.hGet(this.keys.game(gameId), 'status');
    return status ? (status as GameStatus) : 'end';
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

  async getPhrasesForGame(gameId: string): Promise<string[]> {
    const game = await this.redis.hGet(this.keys.game(gameId), 'phrases');
    return game ? JSON.parse(game) : [];
  }

  async getGameCurrentRound(gameId: string): Promise<number> {
    const currentRound = await this.redis.hGet(
      this.keys.game(gameId),
      'currentRound'
    );
    return currentRound ? Number(currentRound) : 0;
  }

  async saveRound(postId: string, round: Round) {
    await this.redis.hSet(this.keys.round(postId, String(round.roundNumber)), {
      roundType: round.roundType,
      roundNumber: String(round.roundNumber),
      startTime: round.startTime,
      endTime: round.endTime,
      participantNum: String(round.participantNum),
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
      participantNum: Number(round.participantNum),
    };
  }

  async incrRoundParticipantNum(postId: string, roundNumber: number) {
    await this.redis.hIncrBy(
      this.keys.round(postId, String(roundNumber)),
      'participantNum',
      1
    );
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

  async getSubmittedUserIdsForRound(postId: string, roundNumber: number) {
    const drawings = await this.redis.hGetAll(
      this.keys.drawing(postId, String(roundNumber))
    );

    // extract keys from hash
    const userIds = Object.keys(drawings);
    return userIds;
  }

  async getDrawingObj(
    postId: string,
    roundNumber: number,
    phrase: string,
    userId: string
  ): Promise<Drawing | null> {
    const drawing = await this.redis.hGet(
      this.keys.drawing(postId, String(roundNumber)),
      userId
    );
    if (!drawing) {
      return null;
    }
    const drawingObj: Drawing = {
      gameId: postId,
      userId: userId,
      roundNumber: roundNumber,
      drawing: drawing,
      phrase: phrase,
    };
    return drawingObj;
  }

  async getDrawingContent(
    postId: string,
    roundNumber: number,
    userId: string
  ): Promise<string | null> {
    const drawing = await this.redis.hGet(
      this.keys.drawing(postId, String(roundNumber)),
      userId
    );
    return drawing ?? null;
  }

  async saveGuess(guess: Guess) {
    const info = {
      guess: guess.guess,
      score: String(guess.score),
    };
    await this.redis.hSet(this.keys.guess(guess.gameId), {
      [guess.userId]: JSON.stringify(info),
    });
  }

  async getUserGuessScore(postId: string, userId: string): Promise<number> {
    const guess = await this.redis.hGet(this.keys.guess(postId), userId);
    if (!guess) {
      return 0;
    }
    return JSON.parse(guess).score;
  }

  async getUserGuess(postId: string, userId: string): Promise<string | null> {
    const guess = await this.redis.hGet(this.keys.guess(postId), userId);
    if (!guess) {
      return null;
    }
    return JSON.parse(guess).guess;
  }

  async getDrawingsForGame(
    postId: string,
    start?: number,
    end?: number
  ): Promise<Drawing[]> {
    /* Returns all drawings for game sorted by popularity. If start and end are set returns that range. */
    return [];
  }
}
