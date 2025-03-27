import { Devvit } from '@devvit/public-api';
import { placeholderBlob } from '../utils/mock.js';
import { WebviewToBlocksMessage } from '../shared.js';
import { sendMessageToWebview } from '../utils/sendMessageToWebview.js';
import { Service } from '../service/service.js';

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
      const round = await service.game.getCurrentRound(postId);
      console.log('Round:', round);
      if (!round) {
        throw new Error('Round not found');
      }
      const duration = Math.floor(
        (new Date(round.endTime).getTime() - Date.now()) / 1000
      );
      console.log('Duration:', duration);
      sendMessageToWebview(context, {
        type: 'COUNTDOWN_DATA',
        payload: {
          duration: duration,
        },
      });
    }

    if (message.type === 'INIT') {
      sendMessageToWebview(context, {
        type: 'INIT_RESPONSE',
        payload: {
          postType: 'draw',
          round: 2,
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
