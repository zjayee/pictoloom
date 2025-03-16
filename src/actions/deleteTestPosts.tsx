import type { MenuItem } from "@devvit/public-api";
import { Devvit } from "@devvit/public-api";

export const deleteTestPosts: MenuItem = {
  label: "[Testing: pictoloom] Delete Test Posts",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    for await (const post of context.reddit.getPostsByUser({
      username: "pictoloom",
    })) {
      await context.reddit.remove(post.id, false);
    }
  },
};
