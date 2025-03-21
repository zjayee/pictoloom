import { Devvit } from "@devvit/public-api";

export function ChainDrawingMenu() {
  return (
    <zstack width="100%" height="100%" alignment="center middle">
      <image
        url="bg-purple.png"
        imageWidth={701}
        imageHeight={514}
        description="Background Image"
      />
      <hstack width="100%" height="100%" alignment="center middle">
        <spacer width="15px" />
        <image
          url="assets-back.png"
          imageWidth={718}
          imageHeight={514}
          description="Assets Overlay"
        />
      </hstack>
      <hstack height="100%" alignment="center middle">
        <spacer width="15px" />
        <image
          url="assets-front.png"
          imageWidth={718}
          imageHeight={514}
          description="Assets Overlay"
        />
      </hstack>
      <hstack width="100%" height="100%" alignment="center middle">
        <vstack width="421px" height="100%" alignment="end top"></vstack>
        <hstack width="280px" height="100%">
          <zstack width="100%" height="100%">
            <vstack width="100%" height="100%" alignment="end top">
              <spacer height="10px" />
              <image
                url="round-3.gif"
                imageWidth={140}
                imageHeight={140}
                description="Round Number"
              />
            </vstack>
            <vstack width="100%" height="100%" alignment="start bottom">
              <image
                url="start-button.png"
                imageWidth={280}
                imageHeight={60}
                description="Start Drawing"
              />
              <image
                url="tutorial-button.png"
                imageWidth={280}
                imageHeight={60}
                description="How to play"
              />
              <hstack height="56px" alignment="bottom center">
                <spacer width="4px" />
                <vstack
                  width="155px"
                  height="52px"
                  alignment="center middle"
                  backgroundColor="rgba(255, 255, 255, 0.25)"
                  cornerRadius="small"
                ></vstack>
              </hstack>
              <spacer height="18.5px" />
            </vstack>
          </zstack>
          <spacer height="100px" width="100px" />
        </hstack>
      </hstack>
    </zstack>
  );
}

export default ChainDrawingMenu;
