'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { LOADER } from '@/lib/content/home';
import { DURATION } from '@/lib/tokens/motion';

const SESSION_KEY = 'lt.loader.seen';

/**
 * The opening curtain: a 2.4s forest panel that holds for 58% of its duration
 * while the wordmark rises and the script line writes itself on, then lifts.
 *
 * Two changes from the reference, both deliberate:
 *
 *  - First visit per session only. The reference replays the 2.4s hold on every
 *    navigation, which is a direct conflict with the LCP budget. sessionStorage
 *    keeps the intended first impression and stops it becoming a toll booth.
 *  - Removed entirely under prefers-reduced-motion, rather than animated fast.
 *
 * It is aria-hidden and inert: the page beneath is fully rendered and reachable
 * the whole time, so the curtain never delays the accessibility tree.
 */
export function LoaderCurtain() {
  const reduced = useReducedMotion();
  const [state, setState] = useState<'unknown' | 'show' | 'skip'>('unknown');

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      // Private mode or blocked storage — treat as a first visit.
    }

    if (seen) {
      setState('skip');
      return;
    }

    setState('show');
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* nothing to do */
    }

    const timer = setTimeout(() => setState('skip'), DURATION.curtain);
    return () => clearTimeout(timer);
  }, []);

  if (reduced || state !== 'show') return null;

  return (
    <div
      aria-hidden="true"
      data-testid="loader-curtain"
      className="anim-curtain bg-curtain pointer-events-none fixed inset-0 z-[400] grid place-items-center"
    >
      <div className="h-loader-bar-h w-loader-bar-w bg-cream/22 absolute top-[clamp(20.4px,3.57vh,44.2px)] left-1/2 -translate-x-1/2 overflow-hidden rounded-full">
        <div className="anim-loader-bar bg-cream h-full w-full" />
      </div>
      <div className="text-cream text-center">
        <div className="anim-loader-word font-display text-loader-word leading-none font-normal tracking-[-0.01em]">
          {LOADER.word}
        </div>
        <div className="anim-loader-script font-script text-loader-script mt-[--spacing(1)] leading-[1.05]">
          {LOADER.script}
        </div>
      </div>
    </div>
  );
}
