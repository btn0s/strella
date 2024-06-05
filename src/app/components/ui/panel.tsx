import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react';

import { Card } from '@/app/components/ui/card';

const useIsPanelFocusedWithin = (ref: React.RefObject<HTMLDivElement>) => {
  const [isPanelFocusedWithin, setIsPanelFocusedWithin] = useState(false);

  useEffect(() => {
    const onFocusIn = () => setIsPanelFocusedWithin(true);
    const onFocusOut = () => setIsPanelFocusedWithin(false);

    if (ref.current) {
      ref.current.addEventListener('focusin', onFocusIn);
      ref.current.addEventListener('focusout', onFocusOut);
    }

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('focusin', onFocusIn);
        ref.current.removeEventListener('focusout', onFocusOut);
      }
    };
  }, [ref]);

  return isPanelFocusedWithin;
};

const Panel: FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isPanelFocusedWithin = useIsPanelFocusedWithin(ref);

  useEffect(() => {
    if (!ref.current) return;

    const onKeydown = (e: KeyboardEvent) => {
      if (isPanelFocusedWithin) {
        e.stopPropagation();
      }
    };

    ref.current.addEventListener('keydown', onKeydown);

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('keydown', onKeydown);
      }
    };
  }, [isPanelFocusedWithin]);

  return (
    <Card
      ref={ref}
      className="pointer-events-auto min-h-36 overflow-auto border border-white/20 px-3 py-2"
    >
      {children}
    </Card>
  );
};

export default Panel;
