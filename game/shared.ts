export type Page = 'reference' | 'canvas' | 'landing' | 'end';

export type WebviewToBlocksMessage =
  | { type: 'GET_COUNTDOWN_DURATION' }
  | { type: 'GET_REFERENCE_DRAWINGS' }
  | { type: 'INIT' }
  | { type: 'GET_MOUNT_FN' }
  | { type: 'GET_USER_DRAWING' }
  | { type: 'GET_REFERENCE_PARTICIPANTS'; payload: { round: number } }
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
          user: string;
          blobUrl: string;
        }[];
      };
    }
  | {
      type: 'USER_DRAWING_DATA';
      payload: {
        blobUrl: string;
      };
    }
  | {
      type: 'REFERENCE_PARTICIPANTS_DATA';
      payload: {
        referenceParticipants: number;
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
