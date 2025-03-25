import { Devvit, useWebView } from "@devvit/public-api";
import { CountdownClock } from "../components/CountdownClock.js";
import { OffbitFont } from "../components/OffbitFont.js";

const IMAGE_WIDTH = 718;
const IMAGE_HEIGHT = 514;

const MARGIN_15 = "15px";
const MARGIN_17 = "17px";
const MARGIN_3_5 = "3.5px";
const MARGIN_4 = "4px";
const MARGIN_6 = "6px";
const MARGIN_8_5 = "8.5px";
const MARGIN_29 = "29px";
const MARGIN_30 = "30px";
const HEIGHT_53 = "53px";
const HEIGHT_100 = "100px";
const WIDTH_100 = "100px";

const BUTTON_WIDTH = 275;
const BUTTON_HEIGHT = 64.5;

const DRAWN_IMAGE_WIDTH = 250;
const DRAWN_IMAGE_HEIGHT = 84;

const ROUND_IMAGE_SIZE = 140;

const MEGAPHONE_WIDTH = 35.65;
const MEGAPHONE_HEIGHT = 30;

const USERS_WIDTH = 72;
const USERS_HEIGHT = 32;

const RIGHT_COLUMN_WIDTH = "284px";
const LEFT_COLUMN_WIDTH = "417px";

function getPlaceholderTimeInSeconds() {
  // TODO
  return 3 * 60 * 60;
}

function getNumUsersAlreadyDrawn() {
  // TODO
  return "398";
}

export function ChainDrawingPost() {
  const { mount, postMessage } = useWebView({
    url: "chain-drawing-preview/ChainDrawingPreview.html",

    onMessage: (message: { type: string }) => {
      console.log("Received from web view:", message);

      if (message && message.type === "webViewReady") {
        postMessage({
          type: "initialData",
          data: {
            duration: getPlaceholderTimeInSeconds(),
          },
        });
      }
    },

    onUnmount: () => {
      console.log("Web view closed");
    },
  });

  return (
    <zstack width="100%" height="100%" alignment="center middle">
      <image
        url="bg-purple.png"
        imageWidth={IMAGE_WIDTH}
        imageHeight={IMAGE_HEIGHT}
        description="Background Image"
        resizeMode="fill"
        width="100%"
        height="100%"
      />

      <hstack width="100%" height="100%" alignment="center middle">
        <spacer width={MARGIN_15} />
        <image
          url="assets-back.png"
          imageWidth={IMAGE_WIDTH}
          imageHeight={IMAGE_HEIGHT}
          description="Assets Overlay"
        />
      </hstack>

      <hstack height="100%" alignment="center middle">
        <spacer width={MARGIN_15} />
        <image
          url="assets-front.png"
          imageWidth={IMAGE_WIDTH}
          imageHeight={IMAGE_HEIGHT}
          description="Assets Overlay"
        />
      </hstack>

      <hstack width="100%" height="100%" alignment="center middle">
        <vstack width={LEFT_COLUMN_WIDTH} height="100%" alignment="end top">
          <spacer height={MARGIN_30} />
          <CountdownClock startTimeInSeconds={getPlaceholderTimeInSeconds()} />
        </vstack>

        <hstack width={RIGHT_COLUMN_WIDTH} height="100%">
          <zstack width="100%" height="100%">
            <vstack width="100%" height="100%" alignment="end top">
              {/* <spacer height={MARGIN_7} /> */}
              <image
                url="round-3.gif"
                imageWidth={ROUND_IMAGE_SIZE}
                imageHeight={ROUND_IMAGE_SIZE}
                description="Round Number"
              />
            </vstack>

            <vstack width="100%" height="100%" alignment="end bottom">
              <hstack>
                <hstack onPress={mount}>
                  <image
                    url="start-button.png"
                    imageWidth={`${BUTTON_WIDTH}px`}
                    imageHeight={`${BUTTON_HEIGHT}px`}
                    description="Start Drawing"
                  />
                </hstack>
                <spacer width={MARGIN_17} />
              </hstack>

              <spacer height={MARGIN_3_5} />

              <hstack>
                <image
                  url="tutorial-button.png"
                  imageWidth={BUTTON_WIDTH}
                  imageHeight={BUTTON_HEIGHT}
                  description="How to play"
                />
                <spacer width={MARGIN_17} />
              </hstack>

              <spacer height={MARGIN_8_5} />

              <hstack alignment="bottom start">
                <zstack width={DRAWN_IMAGE_WIDTH}>
                  <image
                    url="have_drawn_this_round.png"
                    imageWidth={DRAWN_IMAGE_WIDTH}
                    imageHeight={DRAWN_IMAGE_HEIGHT}
                    description="Have drawn this round"
                  />
                  <hstack
                    width={`${DRAWN_IMAGE_WIDTH}px`}
                    height={HEIGHT_53}
                    alignment="center middle"
                  >
                    <image
                      url="megaphone.png"
                      imageWidth={MEGAPHONE_WIDTH}
                      imageHeight={MEGAPHONE_HEIGHT}
                      description="Megaphone"
                    />
                    <spacer width={MARGIN_6} />
                    <OffbitFont scale={0.066}>
                      {getNumUsersAlreadyDrawn()}
                    </OffbitFont>
                    <spacer width={MARGIN_4} />
                    <vstack>
                      <spacer height={MARGIN_4} />
                      <image
                        url="users.png"
                        imageWidth={USERS_WIDTH}
                        imageHeight={USERS_HEIGHT}
                        description="USERS"
                      />
                    </vstack>
                  </hstack>
                </zstack>
                <spacer width={MARGIN_30} />
              </hstack>

              <spacer height={MARGIN_29} />
            </vstack>
          </zstack>

          <spacer height={HEIGHT_100} width={WIDTH_100} />
        </hstack>
      </hstack>
    </zstack>
  );
}

export default ChainDrawingPost;
