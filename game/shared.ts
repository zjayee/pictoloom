export type Page =
  | 'reference'
  | 'canvas'
  | 'landing'
  | 'end'
  | 'guess'
  | 'explore'
  | 'score'
  | 'loading'
  | 'tutorial';

export type WebviewToBlocksMessage =
  | { type: 'GET_COUNTDOWN_DURATION' }
  | { type: 'GET_REFERENCE_DRAWINGS' }
  | { type: 'INIT' }
  | { type: 'GET_MOUNT_FN' }
  | { type: 'GET_USER_DRAWING' }
  | { type: 'GET_USER_GUESS' }
  | { type: 'GET_SCORE' }
  | {
      type: 'GET_PAGINATED_DRAWINGS';
      payload: {
        start: number;
        end: number;
      };
    }
  | {
      type: 'GET_REFERENCE_PARTICIPANTS';
      payload: {
        round: number;
      };
    }
  | {
      type: 'GUESS_SUBMITTED';
      payload: {
        guess: string;
      };
    }
  | {
      type: 'DRAWING_SUBMITTED';
      payload: {
        imageBlob: string;
      };
    }
  | {
      type: 'UPVOTE';
      payload: {
        userId: string;
        round: number;
      };
    }
  | {
      type: 'DOWNVOTE';
      payload: {
        userId: string;
        round: number;
      };
    }
  | { type: 'GET_PARTICIPANTS' }
  | { type: 'GET_WORD' };

export type BlocksToWebviewMessage =
  | {
      type: 'COUNTDOWN_DATA';
      payload: {
        duration: number;
      };
    }
  | {
      type: 'REFERENCE_DRAWINGS_DATA';
      payload: {
        drawings: {
          blobUrl: string;
          user: string;
          upvotes: number;
          round: number;
          voteStatus: 'none' | 'upvoted' | 'downvoted';
        }[];
      };
    }
  | {
      type: 'USER_DRAWING_DATA';
      payload: {
        blobUrl: string;
        user: string;
        upvotes: number;
        round: number;
        voteStatus: 'none' | 'upvoted' | 'downvoted';
      };
    }
  | {
      type: 'USER_GUESS_DATA';
      payload: {
        guess: string;
      };
    }
  | {
      type: 'REFERENCE_PARTICIPANTS_DATA';
      payload: {
        referenceParticipants: number;
      };
    }
  | {
      type: 'SCORE_DATA';
      payload: {
        score: number;
      };
    }
  | {
      type: 'PAGINATED_DRAWINGS_DATA';
      payload: {
        drawings: {
          blobUrl: string;
          user: string;
          upvotes: number;
          round: number;
          voteStatus: 'none' | 'upvoted' | 'downvoted';
        }[];
      };
    }
  | {
      type: 'INIT_RESPONSE';
      payload: {
        postType: 'draw' | 'guess';
        round: number;
        gameStatus: 'draw' | 'guess' | 'end';
        canDraw: boolean;
      };
    }
  | {
      type: 'PARTICIPANTS_DATA';
      payload: {
        participants: number;
      };
    }
  | {
      type: 'WORD_DATA';
      payload: {
        word: string;
      };
    };

export type DevvitMessage = {
  type: 'devvit-message';
  data: { message: BlocksToWebviewMessage };
};
