import "./createPost.js";

import { Devvit, useState, useWebView } from "@devvit/public-api";

import type { DevvitMessage, WebViewMessage } from "./message.js";

import { appUpgradeSetup } from "./actions/installGame.js";
import { dailyPostTrigger } from "./jobs/dailyPost.js";
import { deleteTestPosts } from "./actions/deleteTestPosts.js";

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
  render: (context) => {
    // Load username with `useAsync` hook
    const [username] = useState(async () => {
      return (await context.reddit.getCurrentUsername()) ?? "anon";
    });

    // Load latest counter from redis with `useAsync` hook
    const [counter, setCounter] = useState(async () => {
      const redisCount = await context.redis.get(`counter_${context.postId}`);
      return Number(redisCount ?? 0);
    });

    const webView = useWebView<WebViewMessage, DevvitMessage>({
      // URL of your web view content
      url: "page.html",

      // Handle messages sent from the web view
      async onMessage(message, webView) {
        switch (message.type) {
          case "webViewReady":
            webView.postMessage({
              type: "initialData",
              data: {
                username: username,
                currentCounter: counter,
              },
            });
            break;
          case "setCounter":
            await context.redis.set(
              `counter_${context.postId}`,
              message.data.newCounter.toString()
            );
            setCounter(message.data.newCounter);

            webView.postMessage({
              type: "updateCounter",
              data: {
                currentCounter: message.data.newCounter,
              },
            });
            break;
          default:
            throw new Error(`Unknown message type: ${message satisfies never}`);
        }
      },
      onUnmount() {
        context.ui.showToast("Web view closed!");
      },
    });

    return (
      <zstack width="100%" height="100%">
        <image
          url="bg-purple.png"
          width="100%"
          height="100%"
          imageWidth={800}
          imageHeight={600}
          description="Background Image"
          resizeMode="fill"
        />

        <vstack width="100%" height="100%" alignment="center middle">
          <text size="large" weight="bold" color="white">
            Content goes here
          </text>
        </vstack>
      </zstack>
    );
  },
});

export default Devvit;
