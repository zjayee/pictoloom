import { Devvit } from "@devvit/public-api";
import { CountdownClock } from "../components/CountdownClock.js";

const IMAGE_WIDTH = 718;
const IMAGE_HEIGHT = 514;
const SPACER_15 = "15px";
const SPACER_17 = "17px";
const SPACER_3_5 = "3.5px";
const SPACER_8_5 = "8.5px";
const SPACER_10 = "10px";
const SPACER_29 = "29px";
const SPACER_30 = "30px";
const BUTTON_WIDTH = 275;
const BUTTON_HEIGHT = 64.5;
const DRAWN_IMAGE_WIDTH = 250;
const DRAWN_IMAGE_HEIGHT = 84;
const ROUND_IMAGE_SIZE = 140;
const RIGHT_COLUMN_WIDTH = "284px";
const LEFT_COLUMN_WIDTH = "417px";

// TODO: replace with real countdown time
function getPlaceholderTimeInSeconds() {
  return 3 * 60 * 60;
}

export function ChainDrawingPost() {
  return (
    <zstack width="100%" height="100%" alignment="center middle">
      <image
        url="bg-purple.png"
        imageWidth={701}
        imageHeight={514}
        description="Background Image"
      />

      <hstack width="100%" height="100%" alignment="center middle">
        <spacer width={SPACER_15} />
        <image
          url="assets-back.png"
          imageWidth={IMAGE_WIDTH}
          imageHeight={IMAGE_HEIGHT}
          description="Assets Overlay"
        />
      </hstack>

      <hstack height="100%" alignment="center middle">
        <spacer width={SPACER_15} />
        <image
          url="assets-front.png"
          imageWidth={IMAGE_WIDTH}
          imageHeight={IMAGE_HEIGHT}
          description="Assets Overlay"
        />
      </hstack>

      <hstack width="100%" height="100%" alignment="center middle">
        <vstack width={LEFT_COLUMN_WIDTH} height="100%" alignment="end top">
          <CountdownClock startTimeInSeconds={getPlaceholderTimeInSeconds()} />
        </vstack>

        <hstack width={RIGHT_COLUMN_WIDTH} height="100%">
          <zstack width="100%" height="100%">
            <vstack width="100%" height="100%" alignment="end top">
              <spacer height={SPACER_10} />
              <image
                url="round-3.gif"
                imageWidth={ROUND_IMAGE_SIZE}
                imageHeight={ROUND_IMAGE_SIZE}
                description="Round Number"
              />
            </vstack>

            <vstack width="100%" height="100%" alignment="end bottom">
              <hstack>
                <image
                  url="start-button.png"
                  imageWidth={BUTTON_WIDTH}
                  imageHeight={BUTTON_HEIGHT}
                  description="Start Drawing"
                />
                <spacer width={SPACER_17} />
              </hstack>

              <spacer height={SPACER_3_5} />

              <hstack>
                <image
                  url="tutorial-button.png"
                  imageWidth={BUTTON_WIDTH}
                  imageHeight={BUTTON_HEIGHT}
                  description="How to play"
                />
                <spacer width={SPACER_17} />
              </hstack>

              <spacer height={SPACER_8_5} />

              <hstack alignment="bottom start">
                <image
                  url="have_drawn_this_round.png"
                  imageWidth={DRAWN_IMAGE_WIDTH}
                  imageHeight={DRAWN_IMAGE_HEIGHT}
                  description="Have drawn this round"
                />
                <spacer width={SPACER_30} />
              </hstack>

              <spacer height={SPACER_29} />
            </vstack>
          </zstack>

          <spacer height="100px" width="100px" />
        </hstack>
      </hstack>
    </zstack>
  );
}

export default ChainDrawingPost;
