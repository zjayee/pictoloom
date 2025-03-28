import type {
  RedditAPIClient,
  RedisClient,
  Scheduler,
} from '@devvit/public-api';

import type {
  DrawingVoteStatus,
  Game,
  GameStatus,
  Round,
  RoundType,
} from '../types.js';

import { Db } from '../storage/db.js';
import { Cache } from '../storage/cache.js';
import { placeholderBlob } from '../utils/mock.js';
import { mockPhraseBlobs } from '../utils/mockGame.js';

import { Devvit } from '@devvit/public-api';

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
    const phrases = await this.choosePhrases(4);
    await this.cache.setNumberPhrasesForGame(postId, phrases.length);

    console.log('chose phrases: ' + phrases);
    const game: Game = {
      id: postId,
      phrases: phrases,
      status: 'draw',
      currentRound: 0,
    };

    // Save game to Redis
    await this.db.saveGame(game);

    // Start a new round
    await this.newRound(postId, 'draw');
  }

  async newRound(
    postId: string,
    roundType: RoundType,
    roundLength: number = 5
  ) {
    /* Creates a new round object that's roundLength hours long */
    const start_time = new Date();
    start_time.setMinutes(0, 0, 0);
    const end_time = new Date(
      start_time.getTime() + roundLength * 60 * 60 * 1000
    );
    const roundNum = await this.db.getGameCurrentRound(postId);

    const round: Round = {
      roundType: roundType,
      roundNumber: Number(roundNum) + 1,
      startTime: start_time.toISOString(),
      endTime: end_time.toISOString(),
      participantNum: 0,
    };

    // Increment round number
    await this.db.incrementRound(postId);

    // Setup cache for round
    await this.cache.setupPhraseAssignment(postId, round.roundNumber);
    await this.cache.setupDrawingReferences(postId, round.roundNumber);
    await this.cache.setupRoundReferenceGallery(postId, round.roundNumber);

    // Setup round
    // Set up drawing references
    if (round.roundNumber > 1) {
      await this.cache.setupDrawingReferences(postId, round.roundNumber - 1);
    }

    // Save round to Redis
    await this.db.saveRound(postId, round);
  }

  async endGame(postId: string) {
    /* Ends the game */
    await this.db.setGameStatus(postId, 'end');
  }

  async getGameStatus(postId: string): Promise<GameStatus> {
    /* Returns the status of the game */
    return await this.db.getGameStatus(postId);
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
    const phraseBankWords = await this.db.getPhraseBank('default');
    const idxs = new Set<number>();

    if (phraseBankWords.length <= count) {
      return phraseBankWords;
    }

    while (idxs.size < count && phraseBankWords.length > count) {
      const randomIdx = Math.floor(Math.random() * phraseBankWords.length);
      idxs.add(randomIdx);
    }

    const phrases = Array.from(idxs).map((idx) => phraseBankWords[idx]);
    return phrases;
  }

  async selectPhraseForRound(postId: string) {
    const currentRoundNum = await this.db.getGameCurrentRound(postId);
    const userId = await this.reddit?.getCurrentUsername();
    if (!userId) {
      throw new Error('User not found');
    }
    const phrase = await this.cache.assignPhraseForRound(
      postId,
      currentRoundNum,
      userId
    );
    console.log(currentRoundNum, '| assigned phrase:', phrase);
    return phrase;
  }

  async selectReferences(
    postId: string,
    phrase: string,
    number_of_references: number
  ): Promise<
    {
      user: string;
      blobUrl: string;
      voteStatus: 'upvoted' | 'downvoted' | 'none';
      upvotes: number;
      round: number;
    }[]
  > {
    const currentRoundNum = await this.db.getGameCurrentRound(postId);
    const userId = await this.reddit?.getCurrentUsername();
    if (!userId) {
      throw new Error('User not found');
    }
    const references = await this.cache.getReferenceDrawings(
      postId,
      currentRoundNum,
      userId,
      phrase,
      number_of_references
    );

    for (const ref of references) {
      const status = await this.cache.getDrawingVoteStatus(
        postId,
        userId,
        ref.user,
        currentRoundNum - 1
      );
      const upvotes = await this.cache.getDrawingUpvotes(
        postId,
        ref.user,
        currentRoundNum - 1
      );
      Object.assign(ref, { voteStatus: status });
      Object.assign(ref, { upvotes: upvotes });
    }

    if (references.length == 0) {
      const mockRef = [
        {
          user: 'Greedy-Ad-6376',
          blobUrl: mockPhraseBlobs[phrase as keyof typeof mockPhraseBlobs],
          voteStatus: 'none' as 'upvoted' | 'downvoted' | 'none',
          upvotes: 1,
          round: currentRoundNum - 1,
        },
      ];
      return mockRef;
    }
    return references as {
      user: string;
      blobUrl: string;
      voteStatus: 'upvoted' | 'downvoted' | 'none';
      upvotes: number;
      round: number;
    }[];
  }

  async canParticipate(postId: string) {
    const currentRound = await this.db.getGameCurrentRound(postId);
    const userId = await this.reddit?.getCurrentUsername();
    if (!userId) {
      return false;
    }
    if (currentRound === 0) {
      return false;
    }

    return await this.cache.canUserPlayRound(postId, currentRound, userId);
  }

  async getUserRoundStatus(postId: string) {
    const currentRound = await this.db.getGameCurrentRound(postId);
    const userId = await this.reddit?.getCurrentUsername();
    if (!userId) {
      return 'none';
    }
    if (currentRound === 0) {
      return 'none';
    }

    return await this.cache.getUserRoundStatus(postId, currentRound, userId);
  }
}
