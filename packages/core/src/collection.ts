export interface CollectionItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CollectionStore {
  readonly items: readonly CollectionItem[];
  setItems(items: readonly CollectionItem[]): void;
  nextEnabled(fromIndex: number, direction: 1 | -1): number;
  findByPrefix(query: string, fromIndex?: number): number;
}

export function createCollection(initial: readonly CollectionItem[] = []): CollectionStore {
  let items = [...initial];
  return {
    get items() {
      return items;
    },
    setItems(next) {
      items = [...next];
    },
    nextEnabled(fromIndex, direction) {
      if (items.length === 0) return -1;
      for (let offset = 1; offset <= items.length; offset += 1) {
        const index = (fromIndex + direction * offset + items.length) % items.length;
        if (!items[index]?.disabled) return index;
      }
      return -1;
    },
    findByPrefix(query, fromIndex = -1) {
      const normalized = query.trim().toLocaleLowerCase();
      if (!normalized || items.length === 0) return -1;
      for (let offset = 1; offset <= items.length; offset += 1) {
        const index = (fromIndex + offset + items.length) % items.length;
        const item = items[index];
        if (item && !item.disabled && item.label.toLocaleLowerCase().startsWith(normalized)) return index;
      }
      return -1;
    },
  };
}
