export type Game = {
  id: string;
  phrases: string[];
  status: "draw" | "guess" | "end";
  currentRound: number;
};

export type Round = {
  roundType: RoundType;
  roundNumber: number;
  startTime: string;
  endTime: string;
};

export type Drawing = {
  postId: string;
  currentRound: number;
  userId: string;
  drawing: string;
};

export type RoundType = "draw" | "guess";

export type CommentId = `t1_${string}`;
export type UserId = `t2_${string}`;
export type PostId = `t3_${string}`;
export type SubredditId = `t5_${string}`;

export type RedisKeys = {
  [key: string]: (...params: string[]) => string;
};
