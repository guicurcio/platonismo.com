// utils/undoRedo.ts (extended)
export interface UndoRedoOptions<T> {
  maxHistory?: number;
  skipIfSame?: boolean;
  compareFn?: (a: T, b: T) => boolean;
  // groupingDebounce in the hook (below), so not stored in the class
}

export class UndoRedo<T> {
  private past: T[] = [];
  private future: T[] = [];
  private options: UndoRedoOptions<T> = {
    maxHistory: 50,
    skipIfSame: true,
    compareFn: undefined
  };

  private compare(a: T, b: T) {
    if (this.options.compareFn) return this.options.compareFn(a, b);
    // Default: reference equality
    return a === b;
  }

  constructor(initialState?: T, options?: UndoRedoOptions<T>) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
    if (typeof initialState !== 'undefined') {
      this.past.push(initialState);
    }
  }

  /**
   * Push a new state, clearing the future.
   */
  push(newState: T) {
    const current = this.getPresent();
    // skipIfSame => do not push if identical to present
    if (this.options.skipIfSame && this.compare(newState, current)) {
      return;
    }

    // Add current present to `past`, then set newState
    this.past.push(newState);
    this.future = [];

    // Enforce maxHistory if needed
    if (
      this.options.maxHistory &&
      this.options.maxHistory > 0 &&
      this.past.length > this.options.maxHistory
    ) {
      // remove oldest
      const overflow = this.past.length - this.options.maxHistory;
      this.past.splice(0, overflow); // remove from the front
    }
  }

  /**
   * Return the current present state (the top of `past`).
   */
  getPresent(): T {
    if (this.past.length === 0) {
      throw new Error('UndoRedo stack is empty; no present state available.');
    }
    return this.past[this.past.length - 1];
  }

  /**
   * Undo => pop from `past`, move it to `future`, return the new present or undefined.
   */
  undo(): T | undefined {
    if (this.past.length <= 1) {
      return undefined;
    }
    const current = this.past.pop(); // remove present
    if (current) {
      this.future.unshift(current);
    }
    return this.getPresent();
  }

  /**
   * Redo => take the first from `future`, push to `past`.
   */
  redo(): T | undefined {
    if (this.future.length === 0) {
      return undefined;
    }
    const next = this.future.shift();
    if (next) {
      this.past.push(next);
      return next;
    }
    return undefined;
  }

  /**
   * Reset everything with a new initial state.
   */
  reset(newInitial: T) {
    this.past = [newInitial];
    this.future = [];
  }
}
