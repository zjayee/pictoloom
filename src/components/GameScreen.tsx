import { useState, useWebView, Devvit } from "@devvit/public-api";

export function GameScreen() {
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
}

export default GameScreen;
