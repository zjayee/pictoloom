export type Game = {
  id: string;
  phrases: string[];
  status: "draw" | "guess" | "end";
  rounds: Round[];
};

export type Round = {};
