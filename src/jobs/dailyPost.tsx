import { Devvit, AppInstallDefinition } from "@devvit/public-api";

export const dailyPostJob = Devvit.addSchedulerJob({
  name: "dailyPost",
  onRun: async (event, context) => {
    if (event.data) {
      try {
        const subreddit = await context.reddit.getCurrentSubreddit();
        const post = await context.reddit.submitPost({
          subredditName: subreddit.name,
          title: "Daily Pictoloom Game",
          preview: (
            <vstack>
              <text>Loading...</text>
            </vstack>
          ),
        });
        console.log("Posted to Reddit:", post.id);
        // TODO: Setup the game
        await context.redis.set("dailyPostId", post.id);
      } catch (error) {
        console.error("", error);
      }
    }
  },
});

export const dailyPostTrigger: AppInstallDefinition = {
  event: "AppInstall",
  onEvent: async (_, context) => {
    try {
      const jobId = await context.scheduler.runJob({
        cron: "0 14 * * *",
        name: "dailyPost",
        data: {},
      });
      await context.redis.set("jobId", jobId);
      console.log("Scheduled dailyPost job with id:", jobId);
    } catch (e) {
      console.log("error was not able to schedule:", e);
      throw e;
    }
  },
};
