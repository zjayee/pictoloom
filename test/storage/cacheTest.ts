import { Cache } from "../../src/storage/cache";
import type { RedisClient } from "@devvit/public-api";
import { Db } from "../../src/storage/db";
import { MockRedis } from "../mock/mockRedis";

jest.mock("../../src/storage/db");

const mockRedisClient = new MockRedis() as unknown as RedisClient;
const mockDb = new Db(mockRedisClient);
const cache = new Cache(mockRedisClient);

describe("Cache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("addUserPhraseAssignment should add a phrase if not already assigned", async () => {
    const result = await cache.addUserPhraseAssignment(
      "post1",
      1,
      "user1",
      "phrase1"
    );

    expect(mockRedisClient.hGet).toHaveBeenCalledWith(
      "phraseUser:post1:1:user1",
      "phrase1"
    );
    expect(mockRedisClient.hSet).toHaveBeenCalledWith(
      "phraseUser:post1:1:user1",
      {
        phrase1: "1",
      }
    );
    expect(result).toBe(true);
  });

  test("assignPhraseForRound should assign a new phrase if user doesn't have one", async () => {
    const phrase = await cache.assignPhraseForRound("post1", 1, "user1");

    expect(mockRedisClient.hGetAll).toHaveBeenCalled();
    expect(mockRedisClient.zRange).toHaveBeenCalled();
    expect(mockRedisClient.hSet).toHaveBeenCalled();
    expect(phrase).toBe("phrase1");
  });

  test("getUserAssignedPhrase should return assigned phrase", async () => {
    const phrase = await cache.getUserAssignedPhrase("post1", 1, "user1");

    expect(mockRedisClient.hGetAll).toHaveBeenCalled();
    expect(phrase).toBe("phrase1");
  });

  test("canUserPlayRound should return false if user has no phrases left", async () => {
    const result = await cache.canUserPlayRound("post1", 1, "user1");
    expect(result).toBe(false);
  });

  test("upvoteDrawing should increase the vote count", async () => {
    await cache.upvoteDrawing("post1", "user1", 1);
    expect(mockRedisClient.zIncrBy).toHaveBeenCalledWith(
      "voteTracking:post1",
      "1:user1",
      1
    );
  });

  test("downvoteDrawing should decrease the vote count", async () => {
    await cache.downvoteDrawing("post1", "user1", 1);
    expect(mockRedisClient.zIncrBy).toHaveBeenCalledWith(
      "voteTracking:post1",
      "1:user1",
      -1
    );
  });
});
