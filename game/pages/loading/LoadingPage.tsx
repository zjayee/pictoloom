import React, { useEffect } from 'react';
import { sendToDevvit } from '../../utils';
import { useDevvitListener } from '../../hooks/useDevvitListener';
import { useSetPage } from '../../hooks/usePage';

export const LoadingPage: React.FC = () => {
  const setPage = useSetPage();
  const initData = useDevvitListener('INIT_RESPONSE');

  useEffect(() => {
    sendToDevvit({ type: 'INIT' });
  }, []);

  useEffect(() => {
    if (!initData) return;
    if (!initData.canDraw && initData.postType === 'draw') {
      setPage('end');
    } else if (!initData.canDraw && initData.postType === 'guess') {
      setPage('score');
    } else {
      setPage('landing');
    }
  }, [initData, setPage]);

  return (
    <div className="flex h-full w-full items-center justify-center text-white">
      <span className="text-2xl">Loading...</span>
    </div>
  );
};

export default LoadingPage;
