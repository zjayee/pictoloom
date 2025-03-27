import { Devvit, MenuItem } from '@devvit/public-api';

import { MockGameState } from '../utils/mockGame.js';

export const incrementRound: MenuItem = {
  label: '[Pictoloom-Test] Next Round',
  location: 'post',
  postFilter: 'currentApp',
  onPress: async (event, context) => {
    const mockGameState = new MockGameState(context);
    const postId = event.targetId;
    mockGameState.setGameNextRound(postId);
  },
};

export const decrementRound: MenuItem = {
  label: '[Pictoloom-Test] Previous Round',
  location: 'post',
  postFilter: 'currentApp',
  onPress: async (event, context) => {
    const mockGameState = new MockGameState(context);
    const postId = event.targetId;
    mockGameState.setGameDecrementRound(postId);
  },
};
