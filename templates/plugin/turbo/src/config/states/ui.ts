import { atom } from 'jotai';

const loadingCountAtom = atom(0);

/**
 * 何らかの処理が実行中かどうかを示すatom
 */
export const loadingAtom = atom((get) => get(loadingCountAtom) > 0);

export const loadingStartAtom = atom(null, (_, set) => {
  set(loadingCountAtom, (count) => count + 1);
});

export const loadingEndAtom = atom(null, (_, set) => {
  set(loadingCountAtom, (count) => Math.max(count - 1, 0));
});
