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
      <zstack width="100%" height="100%" alignment="center middle">
        <image
          url="bg-purple.png"
          width="100%"
          height="100%"
          imageWidth={800}
          imageHeight={600}
          description="Background Image"
          resizeMode="fill"
        />
        <hstack width="100%" height="100%" alignment="center middle">
          <spacer width="15px" />
          <image
            url="assets.png"
            width="100%"
            height="100%"
            imageWidth={500}
            imageHeight={1000}
            description="Assets Overlay"
            resizeMode="fit"
          />
        </hstack>
        <hstack height="100%" alignment="center middle">
          <spacer width="15px" />
          <image
            url="assets-2.png"
            width="100%"
            height="100%"
            imageWidth={500}
            imageHeight={1000}
            description="Assets Overlay"
            resizeMode="fit"
          />
        </hstack>
        <hstack width="440px" height="100%" alignment="center middle">
          <vstack height="100%" width="60%" alignment="end top"></vstack>
          <vstack width="40%" height="100%" alignment="start bottom">
            <image
              url="start-button.png"
              width="95%"
              height="14.5%"
              imageWidth={500}
              imageHeight={1000}
              description="Start Drawing"
            />
            <image
              url="tutorial-button.png"
              width="95%"
              height="14.5%"
              imageWidth={500}
              imageHeight={1000}
              description="How to play"
            />
            <hstack height="59px" alignment="bottom center">
              <spacer width="4px" />
              <vstack
                width="160px"
                height="55px"
                alignment="center middle"
                backgroundColor="rgba(255, 255, 255, 0.25)"
                cornerRadius="small"
              ></vstack>
            </hstack>
            <spacer height="8px" />
          </vstack>
        </hstack>
      </zstack>
    );
  },
});

export default Devvit;
