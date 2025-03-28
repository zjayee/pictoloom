import { Devvit, AppUpgradeDefinition } from '@devvit/public-api';
import { Service } from '../service/service.js';
import { GameService } from '../service/gameService.js';
import { Cache } from '../storage/cache.js';
import { Db } from '../storage/db.js';

/* Scheduled job to start next round. Rounds at 7am (start game), 12pm, 5pm and 10pm(start guess) PST.*/
export const startNextRoundJob = Devvit.addSchedulerJob({
  name: 'startNextRound',
  onRun: async (event, context) => {
    if (event.data) {
      try {
        console.log('Starting next round job');
        const cache = new Cache(context.redis);
        const db = new Db(context.redis);
        const gameService = new GameService(context, db, cache);

        // Get all games that are in the draw phase
        const games = await cache.getGamesByStatus('draw');
        console.log('Games:', games);

        // Start a new round for each game
        for (const game of games) {
          console.log('Starting new draw round for game:', game);
          if (game) {
            await gameService.newRound(game, 'draw');
          }
        }
      } catch (e) {
        console.log('error was not able to schedule:', e);
      }
    }
  },
});

// Runs at 10pm PST to start the guess phase
export const startGuessRoundJob = Devvit.addSchedulerJob({
  name: 'startGuessRound',
  onRun: async (event, context) => {
    const cache = new Cache(context.redis);
    const db = new Db(context.redis);
    const gameService = new GameService(context, db, cache);
    console.log('Starting guess round job');
    // Complete previous guess rounds
    // Get all games that are in the guess phase
    const guessGames = await cache.getGamesByStatus('guess');
    await cache.clearGamesForStatus('guess');

    console.log('Guess games:', guessGames);
    // Complete the game
    for (const game of guessGames) {
      console.log('Ending game:', game);
      if (game) await gameService.endGame(game);
    }

    // Get all games that are in the draw phase
    const games = await cache.getGamesByStatus('draw');
    await cache.clearGamesForStatus('draw');
    console.log('Draw games:', games);
    // Add to guess phase
    await cache.addGamesToStatus(games, 'guess');

    // Start a new round for each game
    for (const game of games) {
      console.log('Starting new guess round for game:', game);
      if (game) {
        await gameService.newRound(game, 'guess');
      }
    }
  },
});

export const nextRoundTrigger: AppUpgradeDefinition = {
  event: 'AppUpgrade',
  onEvent: async (_, context) => {
    try {
      // Schedule next draw round job
      const drawJobId = await context.scheduler.runJob({
        cron: '0 19,0 * * *',
        name: 'startNextRound',
        data: {},
      });

      // Schedule next guess round job
      const guessJobId = await context.scheduler.runJob({
        cron: '0 5 * * *',
        name: 'startGuessRound',
        data: {},
      });

      console.log('Scheduled next round job with id:', drawJobId, guessJobId);
    } catch (e) {
      console.log('error was not able to schedule:', e);
      throw e;
    }
  },
};
