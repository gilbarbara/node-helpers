/* eslint-disable no-restricted-exports,import/no-unresolved */
import { Data, KeyType, TreeChanges } from 'tree-changes';

export { Data, KeyType, TreeChanges, Value, default as treeChanges } from 'tree-changes';

declare function useTreeChanges<T extends Data>(value: T): TreeChanges<KeyType<T, T>>;

export { useTreeChanges as default };
