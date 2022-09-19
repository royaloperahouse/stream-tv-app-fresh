import { logError } from '@utils/loger';
import {
  bitMovinPlayerKey,
  bitMovinPlayerSelectedBitrateKey,
  defaultPlayerBitrateKey,
} from '@configs/bitMovinPlayerConfig';
import { TBitMovinPlayerSavedPosition } from '@services/types/models';
import { SessionStorage } from '@services/sessionStorage';

export const savePosition = async (
  item: TBitMovinPlayerSavedPosition,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  try {
    const savedPositions: string | null = await SessionStorage.getItem(
      bitMovinPlayerKey,
    );
    const parsedSavedPositionList: Array<TBitMovinPlayerSavedPosition> =
      !savedPositions ? [] : JSON.parse(savedPositions);
    const existedIndex = parsedSavedPositionList.findIndex(
      listItem => listItem.id === item.id && listItem.eventId === item.eventId,
    );
    if (existedIndex === -1) {
      parsedSavedPositionList.push(item);
    } else {
      parsedSavedPositionList[existedIndex] = item;
    }
    await SessionStorage.setItem(
      bitMovinPlayerKey,
      JSON.stringify(parsedSavedPositionList),
    );
  } catch (error: any) {
    logError(
      'Something went wrong with saving to BitMovinPlayerSavedPositionList',
      error,
    );
  } finally {
    if (typeof cb === 'function') {
      cb();
    }
  }
};

export const removeItemsFromSavedPositionList = async (
  items: Array<TBitMovinPlayerSavedPosition>,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  if (!Array.isArray(items) || !items.length) {
    return;
  }
  try {
    const savedPositions: string | null = await SessionStorage.getItem(
      bitMovinPlayerKey,
    );
    const parsedSavedPositionList: Array<TBitMovinPlayerSavedPosition> =
      !savedPositions ? [] : JSON.parse(savedPositions);
    const filteredSavedPositionList = parsedSavedPositionList.filter(
      listItem =>
        !items.some(
          item => item.id === listItem.id && item.eventId === listItem.eventId,
        ),
    );
    await SessionStorage.setItem(
      bitMovinPlayerKey,
      JSON.stringify(filteredSavedPositionList),
    );
  } catch (error: any) {
    logError(
      'Something went wrong with removing from BitMovinPlayerSavedPositionList',
      error,
    );
  } finally {
    if (typeof cb === 'function') {
      cb();
    }
  }
};

export const clearListOfBitmovinSavedPosition = (): Promise<void> =>
  SessionStorage.removeItem(bitMovinPlayerKey);

export const getBitMovinSavedPosition = async (
  id: string,
  eventId: string,
): Promise<TBitMovinPlayerSavedPosition | null> => {
  try {
    const savedPositions: string | null = await SessionStorage.getItem(
      bitMovinPlayerKey,
    );
    const parsedSavedPositionList: Array<TBitMovinPlayerSavedPosition> =
      !savedPositions ? [] : JSON.parse(savedPositions);
    return (
      parsedSavedPositionList.find(
        listItem => listItem.id === id && listItem.eventId === eventId,
      ) || null
    );
  } catch (error: any) {
    logError(
      'Something went wrong with getting BitMovinPlayerSavedPosition',
      error,
    );
    return null;
  }
};

export const removeBitMovinSavedPositionByIdAndEventId = async (
  id: string,
  eventId: string,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  try {
    const savedPositions: string | null = await SessionStorage.getItem(
      bitMovinPlayerKey,
    );
    const parsedSavedPositionList: Array<TBitMovinPlayerSavedPosition> =
      !savedPositions ? [] : JSON.parse(savedPositions);
    const existedIndex = parsedSavedPositionList.findIndex(
      listItem => listItem.id === id && listItem.eventId === eventId,
    );
    if (existedIndex !== -1) {
      parsedSavedPositionList.splice(existedIndex, 1);
      await SessionStorage.setItem(
        bitMovinPlayerKey,
        JSON.stringify(parsedSavedPositionList),
      );
    }
  } catch (error: any) {
    logError(
      `Something went wrong with removing position\`s item with id: ${id} of a video`,
      error,
    );
  } finally {
    if (typeof cb === 'function') {
      cb();
    }
  }
};

export const getListOfUniqueEventId = async (): Promise<Array<string>> => {
  try {
    const savedPositions: string | null = await SessionStorage.getItem(
      bitMovinPlayerKey,
    );
    const parsedSavedPositionList: Array<TBitMovinPlayerSavedPosition> =
      !savedPositions ? [] : JSON.parse(savedPositions);
    return Object.keys(
      parsedSavedPositionList.reduce<{ [key: string]: boolean }>(
        (acc, positionItem) => {
          if (!acc[positionItem.eventId]) {
            acc[positionItem.eventId] = true;
          }
          return acc;
        },
        {},
      ),
    );
  } catch (error: any) {
    logError(
      'Something went wrong with getting the list of unique EventId with a saved position of playing',
      error,
    );
    return [];
  }
};

export const removeItemsFromSavedPositionListByEventIds = async (
  ids: Array<string>,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  if (!Array.isArray(ids) || !ids.length) {
    return;
  }
  try {
    const savedPositions: string | null = await SessionStorage.getItem(
      bitMovinPlayerKey,
    );
    const parsedSavedPositionList: Array<TBitMovinPlayerSavedPosition> =
      !savedPositions ? [] : JSON.parse(savedPositions);
    const filteredSavedPositionList = parsedSavedPositionList.filter(
      listItem => !ids.some(id => id === listItem.eventId),
    );
    await SessionStorage.setItem(
      bitMovinPlayerKey,
      JSON.stringify(filteredSavedPositionList),
    );
  } catch (error: any) {
    logError(
      'Something went wrong with removing from BitMovinPlayerSavedPositionList by event ids',
      error,
    );
  } finally {
    if (typeof cb === 'function') {
      cb();
    }
  }
};

export const saveSelectedBitrateId = async (
  bitrateId: string,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  try {
    await SessionStorage.setItem(bitMovinPlayerSelectedBitrateKey, bitrateId);
    if (typeof cb === 'function') {
      cb(bitrateId);
    }
  } catch (err: any) {
    logError('Something went wrong with saving selectedBitrateId', err.message);
  }
};

export const getSelectedBitrateId = async (): Promise<
  'high' | 'medium' | 'normal'
> => {
  try {
    const savedBitrateId: 'high' | 'medium' | 'normal' | null =
      (await SessionStorage.getItem(bitMovinPlayerSelectedBitrateKey)) as
        | 'high'
        | 'medium'
        | 'normal'
        | null;
    return savedBitrateId || defaultPlayerBitrateKey;
  } catch (err: any) {
    logError(
      'Something went wrong with getting selectedBitrateId',
      err.message,
    );
    return defaultPlayerBitrateKey;
  }
};

export const clearSelectedBitrate = async (): Promise<void> => {
  try {
    await SessionStorage.removeItem(bitMovinPlayerSelectedBitrateKey);
  } catch (err: any) {
    logError('Something went wrong with clearing selectedBitrate', err.message);
  }
};
