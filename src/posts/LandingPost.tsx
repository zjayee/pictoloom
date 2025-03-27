import { Devvit } from '@devvit/public-api';
import { placeholderBlob } from '../utils/mock.js';
import { WebviewToBlocksMessage } from '../shared.js';
import { sendMessageToWebview } from '../utils/sendMessageToWebview.js';

function getPlaceholderTimeInSeconds() {
  return 3 * 60 * 60;
}

function getReferenceDrawings() {
  return [
    {
      user: 'Greedy-Ad-6376',
      blobUrl: placeholderBlob,
    },
  ];
}

export function LandingPost(context: Devvit.Context) {
  const handleMessage = (message: WebviewToBlocksMessage) => {
    console.log('📩 Received message from webview:', message);

    if (message.type === 'GET_REFERENCE_DRAWINGS') {
      sendMessageToWebview(context, {
        type: 'REFERENCE_DRAWINGS_DATA',
        payload: {
          drawings: getReferenceDrawings(),
        },
      });
    }

    if (message.type === 'GET_COUNTDOWN_DURATION') {
      sendMessageToWebview(context, {
        type: 'COUNTDOWN_DATA',
        payload: {
          duration: getPlaceholderTimeInSeconds(),
        },
      });
    }

    if (message.type === 'INIT') {
      sendMessageToWebview(context, {
        type: 'INIT_RESPONSE',
        payload: {
          postType: 1,
          round: 3,
        },
      });
    }

    if (message.type === 'GET_PARTICIPANTS') {
      sendMessageToWebview(context, {
        type: 'PARTICIPANTS_DATA',
        payload: {
          participants: 398,
        },
      });
    }

    if (message.type === 'DRAWING_SUBMITTED') {
      console.log('🖼️ Received drawing:', message.payload.imageBlob);
    }
  };

  return (
    <vstack height="100%" width="100%" alignment="center middle">
      <webview
        id="webview"
        url="index.html"
        width="100%"
        height="100%"
        onMessage={handleMessage as Devvit.Blocks.OnWebViewEventHandler}
      />
    </vstack>
  );
}
