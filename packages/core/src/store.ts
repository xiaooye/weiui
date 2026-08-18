export type StoreListener<T> = (state: Readonly<T>) => void;
export type StoreUpdater<T> = T | ((previous: Readonly<T>) => T);

export interface WeiStore<T> {
  getState(): Readonly<T>;
  setState(next: StoreUpdater<T>): void;
  subscribe(listener: StoreListener<T>): () => void;
}

export function createStore<T>(initialState: T): WeiStore<T> {
  let state = initialState;
  const listeners = new Set<StoreListener<T>>();
  return {
    getState: () => state,
    setState(next) {
      const resolved = typeof next === "function" ? (next as (value: Readonly<T>) => T)(state) : next;
      if (Object.is(resolved, state)) return;
      state = resolved;
      for (const listener of listeners) listener(state);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
