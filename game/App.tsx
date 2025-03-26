import { Page } from './shared';
import { usePage } from './hooks/usePage';
import { useEffect } from 'react';
import { sendToDevvit } from './utils';
import { useDevvitListener } from './hooks/useDevvitListener';
import { ChainDrawingPreview } from './pages/chain-drawing-preview/ChainDrawingPreview';
import { CanvasPage } from './pages/canvas/CanvasPage';
import { DrawingLanding } from './pages/landing/DrawingLanding';

const getPage = (page: Page) => {
  switch (page) {
    case 'landing':
      return <DrawingLanding />;
    case 'chain-drawing-preview':
      return <ChainDrawingPreview />;
    case 'canvas':
      return <CanvasPage />;
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
