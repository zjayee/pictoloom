import { Devvit, AppUpgradeDefinition } from '@devvit/public-api';
import { Service } from '../service/service.js';
import { Cache } from '../storage/cache.js';

export const dailyPostJob = Devvit.addSchedulerJob({
  name: 'dailyPost',
  onRun: async (event, context) => {
    if (event.data) {
      try {
        const subreddit = await context.reddit.getCurrentSubreddit();
        const cache = new Cache(context.redis);
        const service = new Service(context);
        const post = await context.reddit.submitPost({
          subredditName: subreddit.name,
          title: 'Daily Pictoloom Game',
          preview: (
            <vstack>
              <text>Loading...</text>
            </vstack>
          ),
        });
        console.log('Posted to Reddit:', post.id);
        await cache.addGamesToStatus([post.id], 'draw');
        await service.game.newGame(post.id);
      } catch (error) {
        console.error('', error);
      }
    }
  },
});

export const dailyPostTrigger: AppUpgradeDefinition = {
  event: 'AppUpgrade',
  onEvent: async (_, context) => {
    try {
      // Schedule daily post job
      const jobId = await context.scheduler.runJob({
        cron: '0 14 * * *',
        name: 'dailyPost',
        data: {},
      });

      console.log('Scheduled dailyPost job with id:', jobId);
    } catch (e) {
      console.log('error was not able to schedule:', e);
      throw e;
    }
  },
};
