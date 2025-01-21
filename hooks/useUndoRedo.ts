import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Config for UndoRedo
 */
export interface UndoRedoOptions<T> {
  maxHistory?: number;            // How many states to keep in the past
  skipIfSame?: boolean;           // If new state is identical, skip push
  compareFn?: (a: T, b: T) => boolean; // By default, uses ===
}

/**
 * A generic Undo/Redo class
 */
export class UndoRedo<T> {
  private past: T[] = [];
  private future: T[] = [];
  private options: Required<UndoRedoOptions<T>>;

  constructor(initialState?: T, options?: UndoRedoOptions<T>) {
    this.options = {
      maxHistory: options?.maxHistory ?? 50,
      skipIfSame: options?.skipIfSame ?? true,
      compareFn: options?.compareFn ?? ((a, b) => a === b),
    };

    if (typeof initialState !== 'undefined') {
      this.past.push(initialState);
    }
  }

  getPresent(): T {
    if (this.past.length === 0) {
      throw new Error('No present state: UndoRedo stack is empty.');
    }
    return this.past[this.past.length - 1];
  }

  push(newState: T) {
    if (this.past.length > 0) {
      const current = this.getPresent();
      if (this.options.skipIfSame && this.options.compareFn(current, newState)) {
        // skip
        return;
      }
    }
    this.past.push(newState);
    this.future = [];

    // enforce maxHistory
    if (this.options.maxHistory > 0 && this.past.length > this.options.maxHistory) {
      this.past.splice(0, this.past.length - this.options.maxHistory);
    }
  }

  undo(): T | undefined {
    if (this.past.length <= 1) {
      return undefined; // cannot undo
    }
    const current = this.past.pop() as T;
    this.future.unshift(current);
    return this.getPresent();
  }

  redo(): T | undefined {
    if (this.future.length === 0) {
      return undefined; // cannot redo
    }
    const next = this.future.shift() as T;
    this.past.push(next);
    return next;
  }

  reset(newInitial: T) {
    this.past = [newInitial];
    this.future = [];
  }
}

/**
 * useUndoRedo Hook Options
 */
export interface UseUndoRedoConfig<T> extends UndoRedoOptions<T> {
  initialState: T;      // Required initial
  groupingDebounce?: number; // group multiple pushes into one
}

export function useUndoRedo<T>({
  initialState,
  maxHistory = 50,
  skipIfSame = true,
  compareFn,
  groupingDebounce = 0,
}: UseUndoRedoConfig<T>) {
  const undoRedoRef = useRef<UndoRedo<T> | null>(null);

  const [present, setPresent] = useState<T>(initialState);

  // For grouping consecutive changes
  const [isGrouping, setIsGrouping] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Create the UndoRedo instance
  useEffect(() => {
    if (!undoRedoRef.current) {
      undoRedoRef.current = new UndoRedo<T>(initialState, {
        maxHistory,
        skipIfSame,
        compareFn,
      });
    }
  }, [initialState, maxHistory, skipIfSame, compareFn]);

  // Helper to sync present from the class
  const syncPresent = useCallback(() => {
    if (!undoRedoRef.current) return;
    const newPresent = undoRedoRef.current.getPresent();
    setPresent(newPresent);
  }, []);

  const push = useCallback(
    (newState: T) => {
      if (!undoRedoRef.current) return;

      if (isGrouping) {
        // remove the current state, push new
        undoRedoRef.current.undo();
      }
      undoRedoRef.current.push(newState);
      syncPresent();
    },
    [isGrouping, syncPresent]
  );

  const undo = useCallback(() => {
    if (!undoRedoRef.current) return;
    const prev = undoRedoRef.current.undo();
    if (prev !== undefined) {
      setPresent(prev);
    }
  }, []);

  const redo = useCallback(() => {
    if (!undoRedoRef.current) return;
    const nxt = undoRedoRef.current.redo();
    if (nxt !== undefined) {
      setPresent(nxt);
    }
  }, []);

  const reset = useCallback(
    (fresh: T) => {
      if (!undoRedoRef.current) return;
      undoRedoRef.current.reset(fresh);
      setPresent(fresh);
    },
    []
  );

  const canUndo = undoRedoRef.current
    ? undoRedoRef.current['past'].length > 1
    : false;

  const canRedo = undoRedoRef.current
    ? undoRedoRef.current['future'].length > 0
    : false;

  const startGrouping = useCallback(() => {
    setIsGrouping(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const endGrouping = useCallback(() => {
    setIsGrouping(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // auto-end grouping after certain ms
  useEffect(() => {
    if (groupingDebounce <= 0 || !isGrouping) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      endGrouping();
    }, groupingDebounce);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present]);

  return {
    present,
    canUndo,
    canRedo,
    push,
    undo,
    redo,
    reset,
    startGrouping,
    endGrouping,
  };
}
