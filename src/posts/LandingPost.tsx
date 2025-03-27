import { Devvit } from '@devvit/public-api';
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
          duration: 5 * 60 * 60,
        },
      });
    }

    if (message.type === 'INIT') {
      const round = await service.game.getCurrentRound(postId);
      if (!round) {
        throw new Error('Round not found');
      }
      console.log('Round:', round);
      sendMessageToWebview(context, {
        type: 'INIT_RESPONSE',
        payload: {
          postType: round.roundType,
          round: Number(round.roundNumber),
        },
      });
    }

    if (message.type === 'GET_PARTICIPANTS') {
      const round = await service.game.getCurrentRound(postId);
      sendMessageToWebview(context, {
        type: 'PARTICIPANTS_DATA',
        payload: {
          participants: round?.participantNum ?? 398,
        },
      });
    }

    if (message.type === 'DRAWING_SUBMITTED') {
      console.log('🖼️ Received drawing');
      await service.draw.submitDrawing(postId, message.payload.imageBlob);
    }

    if (message.type === 'GET_WORD') {
      const phrase = await service.game.selectPhraseForRound(postId);
      sendMessageToWebview(context, {
        type: 'WORD_DATA',
        payload: {
          word: phrase,
        },
      });
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
