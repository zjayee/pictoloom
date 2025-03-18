import "./createPost.js";

import { Devvit, useState, useWebView } from "@devvit/public-api";

import type { DevvitMessage, WebViewMessage } from "./message.js";

import { appUpgradeSetup } from "./actions/installGame.js";
import { dailyPostTrigger } from "./jobs/dailyPost.js";
import { deleteTestPosts } from "./actions/deleteTestPosts.js";
import GameScreen from "./components/GameScreen.js";

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

/* QUICKSTART CODE */
// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: "Web View Example",
  height: "tall",
  render: GameScreen,
});

export default Devvit;
