import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react';

import { Card } from '@/app/components/ui/card';
import { cn } from '@/app/lib/utils';

const useIsPanelHoveredOrFocusedWithin = (
  ref: React.RefObject<HTMLDivElement>,
) => {
  const [isPanelHoveredOrFocusedWithin, setIsPanelHoveredOrFocusedWithin] =
    useState(false);

  useEffect(() => {
    const onMouseEnter = () => setIsPanelHoveredOrFocusedWithin(true);
    const onMouseLeave = () => setIsPanelHoveredOrFocusedWithin(false);
    const onFocusIn = () => setIsPanelHoveredOrFocusedWithin(true);
    const onFocusOut = () => setIsPanelHoveredOrFocusedWithin(false);

    if (ref.current) {
      ref.current.addEventListener('mouseenter', onMouseEnter);
      ref.current.addEventListener('mouseleave', onMouseLeave);
      ref.current.addEventListener('focusin', onFocusIn);
      ref.current.addEventListener('focusout', onFocusOut);
    }

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('mouseenter', onMouseEnter);
        ref.current.removeEventListener('mouseleave', onMouseLeave);
        ref.current.removeEventListener('focusin', onFocusIn);
        ref.current.removeEventListener('focusout', onFocusOut);
      }
    };
  }, [ref]);

  return isPanelHoveredOrFocusedWithin;
};

const Panel: FC<
  PropsWithChildren<{
    className?: string;
  }>
> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isPanelHoveredOrFocusedWithin = useIsPanelHoveredOrFocusedWithin(ref);

  useEffect(() => {
    if (!ref.current) return;

    const stopPropagation = (e: Event) => {
      if (isPanelHoveredOrFocusedWithin) {
        e.stopPropagation();
      }
    };

    ref.current.addEventListener('keydown', stopPropagation);
    ref.current.addEventListener('mousedown', stopPropagation);
    ref.current.addEventListener('mouseup', stopPropagation);
    ref.current.addEventListener('click', stopPropagation);
    ref.current.addEventListener('wheel', stopPropagation);

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('keydown', stopPropagation);
        ref.current.removeEventListener('mousedown', stopPropagation);
        ref.current.removeEventListener('mouseup', stopPropagation);
        ref.current.removeEventListener('click', stopPropagation);
        ref.current.removeEventListener('wheel', stopPropagation);
      }
    };
  }, [isPanelHoveredOrFocusedWithin]);

  return (
    <Card
      ref={ref}
      className={cn(
        'pointer-events-auto min-h-36 overflow-auto border border-white/20 px-3 py-2',
        className,
      )}
    >
      {children}
    </Card>
  );
};

export default Panel;
