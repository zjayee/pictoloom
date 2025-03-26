import { Page } from './shared';
import { usePage } from './hooks/usePage';
import { useEffect } from 'react';
import { sendToDevvit } from './utils';
import { useDevvitListener } from './hooks/useDevvitListener';
import { ChainDrawingPreview } from './pages/chain-drawing-preview/ChainDrawingPreview';

const getPage = (page: Page) => {
  switch (page) {
    case 'chain-drawing-preview':
      return <ChainDrawingPreview />;
    case 'canvas':
      return <ChainDrawingPreview />;
    default:
      throw new Error(`Unknown page: ${page satisfies never}`);
  }
};

export const App = () => {
  const page = usePage();
  const initData = useDevvitListener('INIT_RESPONSE');
  useEffect(() => {
    sendToDevvit({ type: 'INIT' });
  }, []);

  return <div className="h-full">{getPage(page)}</div>;
};
