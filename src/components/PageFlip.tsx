import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';

type Direction = 'forward' | 'backward';

interface PageFlipProps {
  pageKey: string;
  direction: Direction;
  children: ReactNode;
}

/**
 * Wraps page content in a realistic 3D book page-turn animation.
 * The outgoing page rotates around its left edge (like a book spine)
 * and fades, while the incoming page rises from a slight depth.
 */
export default function PageFlip({ pageKey, direction, children }: PageFlipProps) {
  const [displayKey, setDisplayKey] = useState(pageKey);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('enter');
  const prevKeyRef = useRef(pageKey);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const beginTurn = useCallback((newKey: string, newChildren: ReactNode, dir: Direction) => {
    setPhase('exit');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDisplayKey(newKey);
      setDisplayChildren(newChildren);
      setPhase('enter');
      timeoutRef.current = setTimeout(() => setPhase('idle'), 780);
    }, 420);
  }, []);

  useEffect(() => {
    if (pageKey !== prevKeyRef.current) {
      beginTurn(pageKey, children, direction);
      prevKeyRef.current = pageKey;
    } else {
      // content refresh on same page (e.g. data reload) — update without animation
      setDisplayChildren(children);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, children]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const animClass =
    phase === 'exit'
      ? direction === 'forward'
        ? 'page-flip-exit-forward'
        : 'page-flip-exit-backward'
      : phase === 'enter'
        ? direction === 'forward'
          ? 'page-flip-enter-forward'
          : 'page-flip-enter-backward'
        : '';

  return (
    <div className="page-flip-scene" key={displayKey}>
      <div className={`page-flip-page ${animClass}`}>
        {displayChildren}
      </div>
    </div>
  );
}
