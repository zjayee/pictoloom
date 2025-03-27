import { Devvit } from '@devvit/public-api';
import { Service } from './service/service.js';

// Adds a new menu item to the subreddit allowing to create a new post
Devvit.addMenuItem({
  label: '[Pictoloom] Create new game',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'Pictoloom Game',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    const service = new Service(context);
    await service.game.newGame(post.id);
    ui.showToast({ text: 'Created post!' });
    ui.navigateTo(post);
  },
});
