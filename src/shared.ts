export type Page = 'reference' | 'canvas' | 'landing';

export type WebviewToBlocksMessage =
  | { type: 'GET_COUNTDOWN_DURATION' }
  | { type: 'GET_REFERENCE_DRAWINGS' }
  | { type: 'INIT' }
  | { type: 'GET_MOUNT_FN' }
  | {
      type: 'DRAWING_SUBMITTED';
      payload: {
        imageBlob: string;
      };
    }
  | { type: 'GET_PARTICIPANTS' };

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
      type: 'INIT_RESPONSE';
      payload: {
        postType: 'draw' | 'guess';
        round: number;
      };
    }
  | {
      type: 'PARTICIPANTS_DATA';
      payload: {
        participants: number;
      };
    };

export type DevvitMessage = {
  type: 'devvit-message';
  data: { message: BlocksToWebviewMessage };
};
