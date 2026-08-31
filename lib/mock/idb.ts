// Minimal IndexedDB wrapper for the visitor's mock store.
//
// The whole store is one record. It is small (tens of KB), it is always read
// and written as a unit, and keeping it in a single record makes "reset"
// trivially atomic. No dependency, no schema migrations.
//
// Every function rejects rather than silently degrading: the caller decides
// what to do when storage is unavailable (Safari private mode, disabled
// storage, quota), because pretending state is durable when it is not would
// make the UI lie to the learner.

import type { MockStore } from "./seed";

const DB_NAME = "apier-mock";
const DB_VERSION = 1;
const STORE_NAME = "store";
const RECORD_KEY = "current";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const idb = typeof indexedDB !== "undefined" ? indexedDB : undefined;
    if (!idb) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = idb.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onblocked = () => reject(new Error("IndexedDB blocked"));
  });
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE_NAME, mode);
        const req = run(t.objectStore(STORE_NAME));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));
        t.oncomplete = () => db.close();
        t.onabort = () => {
          db.close();
          reject(t.error ?? new Error("IndexedDB transaction aborted"));
        };
      }),
  );
}

export function loadStore(): Promise<MockStore | undefined> {
  return tx<MockStore | undefined>("readonly", (s) => s.get(RECORD_KEY) as IDBRequest<MockStore | undefined>);
}

export function saveStore(store: MockStore): Promise<unknown> {
  return tx("readwrite", (s) => s.put(store, RECORD_KEY));
}

export function clearStore(): Promise<unknown> {
  return tx("readwrite", (s) => s.delete(RECORD_KEY));
}
