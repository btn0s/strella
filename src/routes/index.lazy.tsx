import { ReactElement, useEffect, useState } from 'react';

import { createLazyFileRoute } from '@tanstack/react-router';
import { motion, animate } from 'framer-motion';

import { Button } from '@/components/ui/button';

const createResizeManager = () => {
  let latestWidth = window.innerWidth;
  let latestHeight = window.innerHeight;
  let hasWidthUpdated = false;
  let hasHeightUpdated = false;

  const updateDimensions = (width = null, height = null) => {
    if (width !== null) {
      latestWidth = width;
      hasWidthUpdated = true;
    }
    if (height !== null) {
      latestHeight = height;
      hasHeightUpdated = true;
    }

    // Check if both dimensions have been updated
    if (hasWidthUpdated && hasHeightUpdated) {
      window.resizeTo(latestWidth, latestHeight);
      // Reset flags
      hasWidthUpdated = false;
      hasHeightUpdated = false;
    }
  };

  return updateDimensions;
};

function Index(): ReactElement {
  const [loading, setLoading] = useState(false);

  const ipcHandle = (): void => {
    setLoading(true);

    const { ipcRenderer } = window.electron;
    const resizeWindow = createResizeManager();

    setTimeout(() => {
      ipcRenderer.send('get-screen-and-window-size');

      ipcRenderer.once(
        'get-screen-and-window-size-reply',
        (
          _event,
          {
            screen: { width: screenWidth, height: screenHeight },
            window: { width: currentWindowWidth, height: currentWindowHeight },
          },
        ) => {
          const targetWidth = screenWidth - 200;
          const targetHeight = screenHeight - 200;

          animate(currentWindowWidth, targetWidth, {
            type: 'spring',
            duration: 1,
            onUpdate: (value) => {
              resizeWindow(value, null);
              ipcRenderer.send('center-window');
            },
          });

          animate(currentWindowHeight, targetHeight, {
            type: 'spring',
            duration: 1,
            onUpdate: (value) => {
              resizeWindow(null, value);
              ipcRenderer.send('center-window');
            },
          });
        },
      );
    }, 750);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (loading) {
      timeout = setTimeout(() => {
        setLoading(false);
      }, 1500);
    }

    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <div className="bg-background dark flex h-svh w-svw items-center justify-center">
      {/*<Component1Icon className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />*/}
      <motion.div
        // fade down when loading
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.2 }}
        initial="visible"
        animate={loading ? 'hidden' : 'visible'}
      >
        <Button onClick={ipcHandle}>Ping</Button>
      </motion.div>
    </div>
  );
}

export const Route = createLazyFileRoute('/')({
  component: Index,
});
