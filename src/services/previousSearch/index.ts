import { logError } from '@utils/loger';
import {
  prevSearchListKey,
  maxPrevSearchListSize,
} from '@configs/previousSearchesConfig';

export const addItemToPrevSearchList = async (item: string): Promise<void> => {
  try {
    const alreadySavedPrevSearchList: string | null = null;
    const prevSearchSetCollection = !alreadySavedPrevSearchList
      ? new Set<string>()
      : new Set<string>(JSON.parse(alreadySavedPrevSearchList));
    prevSearchSetCollection.add(item);
    if (prevSearchSetCollection.size > maxPrevSearchListSize) {
      prevSearchSetCollection.delete(
        Array.from<string>(prevSearchSetCollection).shift() || '',
      );
    }
  } catch (err: any) {
    logError('AddItemToPrevSearchList', err);
  }
};

export const getPrevSearchList = async (): Promise<Array<string>> => {
  try {
    const alreadySavedPrevSearchList: string | null = null;
    const prevSearchSetCollection = !alreadySavedPrevSearchList
      ? []
      : JSON.parse(alreadySavedPrevSearchList);
    return prevSearchSetCollection;
  } catch (err: any) {
    logError('getPrevSearchList', err);
    return [];
  }
};

export const removeItemFromPrevSearchList = async (
  item: string,
): Promise<void> => {
  try {
    const alreadySavedPrevSearchList: string | null = null;
    const prevSearchSetCollection = !alreadySavedPrevSearchList
      ? new Set()
      : new Set(JSON.parse(alreadySavedPrevSearchList));
    prevSearchSetCollection.delete(item);
  } catch (err: any) {
    logError('removeItemFromPrevSearchList', err);
  }
};

export const clearPrevSearchList = async (): Promise<void> => {
  try {
    Promise.resolve();
  } catch (err: any) {
    logError('clearPrevSearchList', err);
  }
};
