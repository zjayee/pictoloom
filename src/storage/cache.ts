import type { RedisClient, ZMember } from '@devvit/public-api';
import { Db } from './db.js';

export class Cache {
  readonly redis: RedisClient;
  readonly db: Db;

  constructor(redis: RedisClient) {
    this.redis = redis;
    this.db = new Db(redis);
  }

  readonly keys = {
    numPhrases: (postId: string) => `numPhrases:${postId}`,
    referenceDrawing: (postId: string, roundNumber: string, phrase: string) =>
      `referenceDrawing:${postId}:${roundNumber}:${phrase}`,
    phraseRoundAssignment: (postId: string, roundNumber: string) =>
      `phraseRound:${postId}:${roundNumber}`,
    phraseUserAssignment: (
      postId: string,
      roundNumber: string,
      userId: string
    ) => `phraseUser:${postId}:${roundNumber}:${userId}`,
    referenceUserAssignment: (postId: string, roundNumber: string) =>
      `referenceUser:${postId}:${roundNumber}`,
    // Maps userid to drawings that used them as reference. Stores list of userids.
    referenceDrawings: (postId: string, roundNumber: string) =>
      `referenceDrawings:${postId}:${roundNumber}`,
    roundParticipantStatus: (
      postId: string,
      roundNumber: string // Status can be "played" or "no_phrases" or "assigned"
    ) => `roundParticipantStatus:${postId}:${roundNumber}`,
    voteTracking: (postId: string) => `voteTracking:${postId}`,
    // Maps "Draw" and "Guess" to comma seperated list of postIds
    gameStatus: `gameStatus`,
  };

  async addUserPhraseAssignment(
    postId: string,
    roundNumber: number,
    userId: string,
    phrase: string
  ): Promise<boolean> {
    /* Sets up the user phrase assignment check */
    const assigned = await this.redis.hGet(
      this.keys.phraseUserAssignment(postId, String(roundNumber), userId),
      phrase
    );
    if (assigned) {
      return false;
    }
    await this.redis.hSet(
      this.keys.phraseUserAssignment(postId, String(roundNumber), userId),
      {
        [phrase]: String(roundNumber),
      }
    );
    return true;
  }

  async setupPhraseAssignment(postId: string, roundNumber: number) {
    // Get phrases for game
    const phrases = await this.db.getPhrasesForGame(postId);

    // Set up phrase assignment counts
    const key = this.keys.phraseRoundAssignment(postId, String(roundNumber));
    for (const phrase of phrases) {
      console.log('Phrase:', phrase);
      await this.redis.zAdd(key, { score: 0, member: phrase });
    }
  }

  async assignPhraseForRound(
    postId: string,
    roundNumber: number,
    userId: string
  ): Promise<string> {
    /* Assigns a phrase for the round */

    // Check if user has already been assigned a phrase
    const assignedPhrases = await this.redis.hGetAll(
      this.keys.phraseUserAssignment(postId, String(roundNumber), userId)
    );
    if (assignedPhrases) {
      for (const phrase in assignedPhrases) {
        if (assignedPhrases[phrase] === String(roundNumber)) {
          return phrase;
        }
      }
    }

    // Assign new phrase to user
    let i = 0;
    let phrase;
    let assigned = false;
    do {
      phrase = await this.redis.zRange(
        this.keys.phraseRoundAssignment(postId, String(roundNumber)),
        i,
        i + 1
      );
      i++;
      assigned = await this.addUserPhraseAssignment(
        postId,
        roundNumber,
        userId,
        phrase[0].member
      );
    } while (!assigned);

    // Increment reference count for phrase
    await this.redis.zIncrBy(
      this.keys.phraseRoundAssignment(postId, String(roundNumber)),
      phrase[0].member,
      1
    );

    // Assign phrase to user
    await this.redis.hSet(
      this.keys.roundParticipantStatus(postId, String(roundNumber)),
      {
        [userId]: 'assigned',
      }
    );

    return phrase[0].member;
  }

  async setNumberPhrasesForGame(postId: string, numPhrases: number) {
    /* Sets the number of phrases for the game */
    await this.redis.set(this.keys.numPhrases(postId), String(numPhrases));
  }

  async canUserPlayRound(
    postId: string,
    roundNumber: number,
    userId: string
  ): Promise<boolean> {
    // Check if user played round
    const status = await this.redis.hGet(
      this.keys.roundParticipantStatus(postId, String(roundNumber)),
      userId
    );
    if (status === 'played' || status === 'no_phrases') {
      return false;
    } else if (status === 'assigned') {
      return true;
    }

    // Check if user has submitted drawing for all phrases
    const numPhrases = await this.redis.get(this.keys.numPhrases(postId));
    const drawnPhrases = await this.redis.hLen(
      this.keys.phraseUserAssignment(postId, String(roundNumber), userId)
    );
    if (drawnPhrases >= Number(numPhrases)) {
      await this.redis.hSet(
        this.keys.roundParticipantStatus(postId, String(roundNumber)),
        {
          [userId]: 'no_phrases',
        }
      );
      return false;
    }
    return true;
  }

  async getUserAssignedPhrase(
    postId: string,
    roundNumber: number,
    userId: string
  ): Promise<string | null> {
    const assignedPhrases = await this.redis.hGetAll(
      this.keys.phraseUserAssignment(postId, String(roundNumber), userId)
    );
    for (const phrase in assignedPhrases) {
      if (assignedPhrases[phrase] === String(roundNumber)) {
        return phrase;
      }
    }
    return null;
  }

  async getUserRoundStatus(
    postId: string,
    roundNumber: number,
    userId: string
  ): Promise<string> {
    const result = await this.redis.hGet(
      this.keys.roundParticipantStatus(postId, String(roundNumber)),
      userId
    );
    return result ?? 'none';
  }

  async getUserIdsForPhraseRound(
    postId: string,
    roundNumber: number,
    phrase: string
  ) {
    const getSubmittedUserIdsForRound =
      await this.db.getSubmittedUserIdsForRound(postId, roundNumber);

    const userIds = [];
    for (const userId of getSubmittedUserIdsForRound) {
      if (
        (await this.getUserAssignedPhrase(postId, roundNumber, userId)) ===
        phrase
      ) {
        userIds.push(userId);
      }
    }

    return userIds;
  }

  async setupDrawingReferences(postId: string, roundNumber: number) {
    const phrases = await this.db.getPhrasesForGame(postId);
    // Get drawings for round and set up zset for reference counts

    for (const phrase of phrases) {
      const drawingUserIds = await this.getUserIdsForPhraseRound(
        postId,
        roundNumber,
        phrase
      );
      console.log(phrase, '| Drawing UserIds:', drawingUserIds);

      const key = this.keys.referenceDrawing(
        postId,
        String(roundNumber),
        phrase
      );
      for (const userId of drawingUserIds) {
        await this.redis.zAdd(key, { score: 0, member: userId });
      }
    }
  }

  async getNumberOfReferenceDrawings(
    postId: string,
    roundNumber: number,
    userId: string
  ): Promise<number> {
    const phrase = await this.getUserAssignedPhrase(
      postId,
      roundNumber,
      userId
    );
    if (!phrase) {
      return 0;
    }

    const key = this.keys.referenceDrawing(postId, String(roundNumber), phrase);
    return await this.redis.zCard(key);
  }

  async getReferenceDrawings(
    postId: string,
    roundNumber: number,
    userId: string,
    phrase: string,
    count: number
  ): Promise<{ user: string; blobUrl: string }[]> {
    /* Returns the count reference drawings for the round */
    const userIdsall = await this.redis.zRange(
      this.keys.referenceDrawing(postId, String(roundNumber), phrase),
      0,
      -1
    );
    console.log('phrase:', phrase);
    console.log('UserIds:', userIdsall);
    const referenceDrawingUserIds = await this.redis.zRange(
      this.keys.referenceDrawing(postId, String(roundNumber), phrase),
      0,
      count - 1
    );

    // Increment reference count for each drawing and get the drawing
    const drawings = [];
    for (const drawing of referenceDrawingUserIds) {
      await this.redis.zIncrBy(
        this.keys.referenceDrawing(postId, String(roundNumber), phrase),
        drawing.member,
        1
      );

      const drawingObj = await this.db.getDrawingObj(
        postId,
        roundNumber - 1,
        phrase,
        drawing.member
      );
      if (drawingObj) {
        drawings.push({ user: drawing.member, blobUrl: drawingObj.drawing });
      }
    }

    this.assignReferenceForUser(
      postId,
      roundNumber,
      userId,
      referenceDrawingUserIds.map((d) => d.member)
    );

    return drawings;
  }

  async assignReferenceForUser(
    postId: string,
    roundNumber: number,
    userId: string,
    references: string[] // List of userIds
  ) {
    const key = this.keys.referenceUserAssignment(postId, String(roundNumber));

    await this.redis.hSet(key, {
      [userId]: JSON.stringify(references),
    });
  }

  async getAssignedReferences(
    postId: string,
    roundNumber: number,
    userId: string
  ): Promise<string[]> {
    const key = this.keys.referenceUserAssignment(postId, String(roundNumber));
    const references = await this.redis.hGet(key, userId);
    if (!references) {
      return [];
    }
    return JSON.parse(references);
  }

  async setupRoundReferenceGallery(postId: string, roundNumber: number) {
    const key = this.keys.referenceDrawings(postId, String(roundNumber));

    const assignedRefKey = this.keys.referenceUserAssignment(
      postId,
      String(roundNumber)
    );
    const assignedReferences = await this.redis.hGetAll(assignedRefKey);
    const referenceMap: Record<string, string[]> = {};

    for (const [userId, references] of Object.entries(assignedReferences)) {
      const referenceList: string[] = JSON.parse(references);
      for (const referenceUserId of referenceList) {
        if (!referenceMap[referenceUserId]) {
          referenceMap[referenceUserId] = [];
        }
        referenceMap[referenceUserId].push(userId);
      }
    }

    for (const [userId, references] of Object.entries(referenceMap)) {
      await this.redis.hSet(key, {
        [userId]: JSON.stringify(references),
      });
    }
  }

  async getRoundReferenceGalleryIds(
    postId: string,
    roundNumber: number,
    userId: string
  ): Promise<string[]> {
    const key = this.keys.referenceDrawings(postId, String(roundNumber));
    const referenceGallery = await this.redis.hGet(key, userId);
    if (!referenceGallery) {
      return [];
    }
    return JSON.parse(referenceGallery);
  }

  async addDrawingForVote(postId: string, userId: string, roundNumber: number) {
    await this.redis.zAdd(this.keys.voteTracking(postId), {
      score: 0,
      member: roundNumber + ':' + userId,
    });
  }

  async upvoteDrawing(postId: string, userId: string, roundNumber: number) {
    await this.redis.zIncrBy(
      this.keys.voteTracking(postId),
      roundNumber + ':' + userId,
      1
    );
  }

  async downvoteDrawing(postId: string, userId: string, roundNumber: number) {
    await this.redis.zIncrBy(
      this.keys.voteTracking(postId),
      roundNumber + ':' + userId,
      -1
    );
  }

  async getDrawingsForVote(postId: string, start: number, end: number) {
    const drawingzMembers = await this.redis.zRange(
      this.keys.voteTracking(postId),
      start,
      end
    );

    let drawings = [];
    for (const drawing of drawingzMembers) {
      const [roundNumber, userId] = drawing.member.split(':');
      const drawingObj = await this.db.getDrawingObj(
        postId,
        Number(roundNumber),
        '',
        userId
      );
      if (drawingObj) {
        drawings.push({
          blobUrl: drawingObj.drawing,
          user: userId,
          upvotes: drawing.score,
          round: Number(roundNumber),
        });
      }
    }
    return drawings;
  }

  async addGameStatus(postId: string, status: string) {
    const statusKey = this.keys.gameStatus;
    let postIds = await this.redis.hGet(statusKey, status);
    if (!postIds) {
      postIds = '';
    }
    postIds += postId + ',';
    await this.redis.hSet(statusKey, {
      [status]: postIds,
    });
  }

  async addGamesToStatus(postIds: string[], status: string) {
    const statusKey = this.keys.gameStatus;
    let postIdsStr = await this.redis.hGet(statusKey, status);
    if (!postIdsStr) {
      postIdsStr = '';
    }
    postIdsStr += postIds.join(',') + ',';
    await this.redis.hSet(statusKey, {
      [status]: postIdsStr,
    });
  }

  async getGamesByStatus(status: string) {
    const statusKey = this.keys.gameStatus;
    const postIds = await this.redis.hGet(statusKey, status);
    if (!postIds) {
      return [];
    }
    return postIds.split(',');
  }

  async clearGamesForStatus(status: string) {
    const statusKey = this.keys.gameStatus;
    await this.redis.hDel(statusKey, [status]);
  }
}
