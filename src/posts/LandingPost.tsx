import { Devvit, useWebView } from '@devvit/public-api';
import { placeholderBlob } from '../utils/mock.js';
import { WebviewToBlocksMessage } from '../shared.js';

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

export function LandingPost() {
  const handleMessage = (message: WebviewToBlocksMessage) => {
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

    if (message.type === 'INIT') {
      postMessage({
        type: 'INIT_RESPONSE',
        data: {
          postType: 1,
          participants: 398,
        },
      });
    }

    if (message.type === 'GET_MOUNT_FN') {
      mount();
      postMessage({
        type: 'MOUNT_FN_READY',
      });
    }

    if (message.type === 'DRAWING_SUBMITTED') {
      console.log('🖼️ Received drawing:', message.payload.imageBlob);
      unmount();
    }
  };

  const { mount, postMessage, unmount } = useWebView({
    onMessage: handleMessage,
    onUnmount: () => {
      console.log('🧼 WebView closed');
    },
  });

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
