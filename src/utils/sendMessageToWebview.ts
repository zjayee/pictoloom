import { Devvit } from '@devvit/public-api';
import { BlocksToWebviewMessage } from '../shared.js';

export const sendMessageToWebview = (
  context: Devvit.Context,
  message: BlocksToWebviewMessage
) => {
  context.ui.webView.postMessage('webview', message);
};
