import "./createPost.js";

import { Devvit } from "@devvit/public-api";

import { appUpgradeSetup } from "./actions/installGame.js";
import { dailyPostTrigger } from "./jobs/dailyPost.js";
import { nextRoundTrigger } from "./jobs/startNextRound.js";
import { deleteTestPosts } from "./actions/deleteTestPosts.js";
import ChainDrawingPost from "./posts/ChainDrawingPost.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
});

/* Custom Post Type */
// TODO: integrate with router
// Devvit.addCustomPostType({
//   name: "Pixelary",
//   description: "Draw, Guess, Laugh!",
//   height: "tall",
//   render: Router,
// });

/* Subreddit Menu Item */
Devvit.addMenuItem(deleteTestPosts);

/* Triggers */
Devvit.addTrigger(appUpgradeSetup);
Devvit.addTrigger(dailyPostTrigger);
Devvit.addTrigger(nextRoundTrigger);

/* QUICKSTART CODE */
// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: "Web View Example",
  height: "tall",
  render: ChainDrawingPost,
});

export default Devvit;
