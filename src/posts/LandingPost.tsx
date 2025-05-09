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
      const drawings = await service.game.selectReferences(postId, phrase, 3);

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
          duration: duration,
        },
      });
    }

    if (message.type === 'INIT') {
      const round = await service.game.getCurrentRound(postId);
      const gameStatus = await service.game.getGameStatus(postId);
      const canDraw = await service.game.canParticipate(postId);
      console.log('can draw:', canDraw);
      if (!round) {
        throw new Error('Round not found');
      }
      console.log('Round:', round);
      sendMessageToWebview(context, {
        type: 'INIT_RESPONSE',
        payload: {
          postType: round.roundType,
          round: Number(round.roundNumber),
          gameStatus: gameStatus,
          canDraw: canDraw,
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

    if (message.type === 'GUESS_SUBMITTED') {
      console.log('🐷 Received guess:', message.payload.guess);
      await service.guess.submitGuess(postId, message.payload.guess);
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

    if (message.type === 'GET_USER_DRAWING') {
      const drawingInfo = await service.draw.getCurUserDrawing(postId);
      sendMessageToWebview(context, {
        type: 'USER_DRAWING_DATA',
        payload: {
          blobUrl: drawingInfo.blobUrl,
          upvotes: drawingInfo.upvotes,
          round: drawingInfo.round,
          voteStatus: drawingInfo.voteStatus as
            | 'none'
            | 'upvoted'
            | 'downvoted',
          user: drawingInfo.userId,
        },
      });
    }

    if (message.type === 'GET_REFERENCE_PARTICIPANTS') {
      const numRef = await service.draw.getNumberofReferences(
        postId,
        message.payload.round
      );
      sendMessageToWebview(context, {
        type: 'REFERENCE_PARTICIPANTS_DATA',
        payload: {
          referenceParticipants: numRef,
        },
      });
    }

    if (message.type === 'GET_SCORE') {
      const score = await service.guess.getUserGuessScore(postId);
      sendMessageToWebview(context, {
        type: 'SCORE_DATA',
        payload: {
          score: score,
        },
      });
    }

    if (message.type === 'GET_PAGINATED_DRAWINGS') {
      const drawings = await service.gallery.getRankedDrawings(
        postId,
        message.payload.start,
        message.payload.end
      );

      sendMessageToWebview(context, {
        type: 'PAGINATED_DRAWINGS_DATA',
        payload: {
          drawings: drawings,
        },
      });
    }

    if (message.type === 'UPVOTE') {
      const numVotes = 1;
      await service.gallery.upvoteDrawing(
        postId,
        message.payload.round,
        message.payload.userId,
        numVotes
      );
    }

    if (message.type === 'DOWNVOTE') {
      const numVotes = 1;
      await service.gallery.downvoteDrawing(
        postId,
        message.payload.round,
        message.payload.userId,
        numVotes
      );
    }

    if (message.type === 'GET_USER_GUESS') {
      const guess = await service.guess.getUserGuess(postId);
      sendMessageToWebview(context, {
        type: 'USER_GUESS_DATA',
        payload: {
          guess: guess,
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
