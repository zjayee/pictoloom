export type Page = 'chain-drawing-preview' | 'canvas';

export type WebviewToBlocksMessage =
  | { type: 'GET_COUNTDOWN_DURATION' }
  | {
      type: 'GET_REFERENCE_DRAWINGS';
    }
  | {
      type: 'INIT';
    }
  | {
      type: 'DRAWING_SUBMITTED';
      payload: {
        imageBlob: string;
      };
    };

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
        postType: number;
      };
    };

export type DevvitMessage = {
  type: 'devvit-message';
  data: { message: BlocksToWebviewMessage };
};
