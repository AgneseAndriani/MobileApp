import React, { createContext, useContext, useEffect, useState } from 'react';

type StoryState = 'start' | 'stop' | 'continue';

type Ctx = {
  state: StoryState;
  setState: (s: StoryState) => void;
  toggle: () => void;  // alterna ⏸/▶
  reset: () => void;   // torna a start
};

const StoryStateCtx = createContext<Ctx | null>(null);

export function StoryStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoryState>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('storyState');
      if (saved === 'stop' || saved === 'continue') return saved;
    }
    return 'start';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('storyState', state);
    }
  }, [state]);

  const toggle = () =>
    setState(prev => (prev === 'stop' ? 'continue' : prev === 'continue' ? 'stop' : prev));

  const reset = () => setState('start');

  return (
    <StoryStateCtx.Provider value={{ state, setState, toggle, reset }}>
      {children}
    </StoryStateCtx.Provider>
  );
}

export const useStoryState = () => {
  const ctx = useContext(StoryStateCtx);
  if (!ctx) throw new Error('useStoryState must be used within StoryStateProvider');
  return ctx;
};
