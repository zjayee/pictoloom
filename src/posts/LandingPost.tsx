import { Devvit } from '@devvit/public-api';
import { placeholderBlob } from '../utils/mock.js';
import { WebviewToBlocksMessage } from '../shared.js';
import { sendMessageToWebview } from '../utils/sendMessageToWebview.js';
import { Service } from '../service/service.js';

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
  const service = new Service(context);
  const postId = context.postId;
  if (!postId) {
    throw new Error('Post ID is required.');
  }

  const handleMessage = async (message: WebviewToBlocksMessage) => {
    console.log('📩 Received message from webview:', message);

    if (message.type === 'GET_REFERENCE_DRAWINGS') {
      const phrase = await service.game.selectPhraseForRound(postId);
      const drawings = await service.game.selectReferences(postId, phrase, 1);

      sendMessageToWebview(context, {
        type: 'REFERENCE_DRAWINGS_DATA',
        payload: {
          drawings: drawings,
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
