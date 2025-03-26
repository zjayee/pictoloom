import { Devvit, useWebView } from '@devvit/public-api';
import { placeholderBlob } from '../utils/mock.js';
import { WebviewToBlocksMessage } from '../shared.js';

function getPlaceholderTimeInSeconds() {
  // TODO
  return 3 * 60 * 60;
}

function getNumUsersAlreadyDrawn() {
  // TODO
  return '398';
}

function getReferenceDrawings() {
  // TODO
  return [
    {
      user: 'Greedy-Ad-6376',
      blobUrl: placeholderBlob,
    },
  ];
}

export function LandingPost() {
  const { mount, postMessage, unmount } = useWebView({
    onMessage: (message: WebviewToBlocksMessage) => {
      console.log('📩 Received message from webview:', message);

      if (message.type === 'GET_REFERENCE_DRAWINGS') {
        postMessage({
          type: 'REFERENCE_DRAWINGS_DATA',
          data: {
            drawings: getReferenceDrawings(),
          },
        });
      }

      if (message.type === 'GET_COUNTDOWN_DURATION') {
        postMessage({
          type: 'COUNTDOWN_DATA',
          data: {
            duration: getPlaceholderTimeInSeconds(),
          },
        });
      }

      if (message.type === 'DRAWING_SUBMITTED') {
        console.log('🖼️ Received drawing:', message.payload.imageBlob);
        unmount();
      }
    },

    onUnmount: () => {
      console.log('🧼 WebView closed');
    },
  });

  return (
    <vstack height="100%" width="100%" alignment="center middle">
      <webview id="webview" url="index.html" width={'100%'} height={'100%'} />
    </vstack>
  );
}
