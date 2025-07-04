import type {
  Game,
  GameStatus,
  Round,
  RoundType,
  Drawing,
  Guess,
} from '../types.js';

// File contains logic for saving and retrieving data from Supabase tables.
export class Db {
  readonly supabase: any;

  constructor(context: { supabase: any }) {
    this.supabase = context.supabase;
  }

  async saveGame(game: Game) {
    await this.supabase.from('game').upsert({
      id: game.id,
      phrases: game.phrases,
      status: game.status,
      current_round: game.currentRound,
    });
  }

  async incrementRound(gameId: number) {
    // Increment current_round in game table
    await this.supabase.rpc('increment_game_round', { game_id: gameId });
  }

  async setGameStatus(gameId: number, status: GameStatus) {
    await this.supabase.from('game').update({ status }).eq('id', gameId);
  }

  async getGameStatus(gameId: number): Promise<GameStatus> {
    const { data, error } = await this.supabase
      .from('game')
      .select('status')
      .eq('id', gameId)
      .single();
    if (error || !data) return 'end';
    return data.status as GameStatus;
  }

  async getGame(gameId: number): Promise<Game | null> {
    const { data, error } = await this.supabase
      .from('game')
      .select('*')
      .eq('id', gameId)
      .single();
    if (error || !data) return null;
    return {
      id: String(data.id),
      phrases: data.phrases,
      status: data.status as GameStatus,
      currentRound: Number(data.current_round),
    };
  }

  async getPhrasesForGame(gameId: number): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('game')
      .select('phrases')
      .eq('id', gameId)
      .single();
    return data && data.phrases ? data.phrases : [];
  }

  async getGameCurrentRound(gameId: number): Promise<number> {
    const { data, error } = await this.supabase
      .from('game')
      .select('current_round')
      .eq('id', gameId)
      .single();
    return data && data.current_round ? Number(data.current_round) : 0;
  }

  async saveRound(gameId: number, round: Round) {
    await this.supabase.from('round').upsert({
      round_type: round.roundType,
      round_number: round.roundNumber,
      start_time: round.startTime,
      end_time: round.endTime,
      participant_num: round.participantNum,
      game_id: gameId,
    });
  }

  async getRound(gameId: number, roundNumber: number): Promise<Round | null> {
    const { data, error } = await this.supabase
      .from('round')
      .select('*')
      .eq('game_id', gameId)
      .eq('round_number', roundNumber)
      .single();
    if (error || !data) return null;
    return {
      roundType: data.round_type as RoundType,
      roundNumber: Number(data.round_number),
      startTime: data.start_time,
      endTime: data.end_time,
      participantNum: Number(data.participant_num),
    };
  }

  async incrRoundParticipantNum(gameId: number, roundNumber: number) {
    // Increment participant_num in round table
    await this.supabase.rpc('increment_round_participant_num', {
      game_id: gameId,
      round_number: roundNumber,
    });
  }

  async getPhraseBank(name: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('phrase_bank')
      .select('phrases')
      .eq('name', name)
      .single();
    return data && data.phrases ? data.phrases : [];
  }

  async upsertPhraseBank(name: string, phrases: string[]) {
    // Merge with existing
    const { data } = await this.supabase
      .from('phrase_bank')
      .select('phrases')
      .eq('name', name)
      .single();
    const existingWords = data && data.phrases ? data.phrases : [];
    const unique = Array.from(new Set([...existingWords, ...phrases]));
    await this.supabase.from('phrase_bank').upsert({
      name,
      phrases: unique,
      updated_at: new Date().toISOString(),
    });
  }

  async clearPhraseBank(name: string) {
    await this.supabase.from('phrase_bank').delete().eq('name', name);
  }

  async saveDrawing(drawing: Drawing) {
    await this.supabase.from('drawing').upsert({
      phrase: drawing.phrase,
      game_id: drawing.gameId,
      user_id: drawing.userId,
      round_id: drawing.roundId,
      data: drawing.drawing,
    });
  }

  async getSubmittedUserIdsForRound(roundId: number) {
    const { data, error } = await this.supabase
      .from('drawing')
      .select('user_id')
      .eq('round_id', roundId);
    if (error || !data) return [];
    return data.map((row: any) => row.user_id);
  }

  async getDrawingObj(
    roundId: number,
    userId: string
  ): Promise<Drawing | null> {
    const { data, error } = await this.supabase
      .from('drawing')
      .select('*')
      .eq('round_id', roundId)
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data;
  }

  async getDrawingContent(
    roundId: number,
    userId: string
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('drawing')
      .select('data')
      .eq('round_id', roundId)
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data.data ?? null;
  }

  async saveGuess(guess: Guess) {
    await this.supabase.from('guess').upsert({
      game_id: guess.gameId,
      round_id: guess.roundId,
      user_id: guess.userId,
      phrase: guess.phrase,
      guess: guess.guess,
      score: guess.score,
    });
  }

  async getUserGuessScore(roundId: number, userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('guess')
      .select('score')
      .eq('round_id', roundId)
      .eq('user_id', userId)
      .single();
    if (error || !data) return 0;
    return Number(data.score);
  }

  async getUserGuess(roundId: number, userId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('guess')
      .select('guess')
      .eq('round_id', roundId)
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data.guess ?? null;
  }

  async getDrawingsForGame(
    gameId: number,
    start?: number,
    end?: number
  ): Promise<Drawing[]> {
    let query = this.supabase.from('drawing').select('*').eq('game_id', gameId);
    if (start !== undefined && end !== undefined) {
      query = query.range(start, end);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data;
  }
}
