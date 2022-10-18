import { logError } from '@utils/loger';
import {
  bitMovinPlayerSelectedBitrateKey,
  defaultPlayerBitrateKey,
} from '@configs/bitMovinPlayerConfig';
import { TBitMovinPlayerSavedPosition } from '@services/types/models';
import { SessionStorage } from '@services/sessionStorage';
import {
  getBitMovinPosition,
  getListOfWatchedVideosReq,
  saveBitMovinPosition,
} from 'services/apiClient';

export const savePosition = async (
  customerId: number,
  item: TBitMovinPlayerSavedPosition,
  isProductionEnv: boolean,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  try {
    if (!item.id || !item.position) {
      throw Error(
        `Something went wrong with id ${item.id} etheir position ${item.position}`,
      );
    }
    await saveBitMovinPosition(customerId, item, isProductionEnv);
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

export const getBitMovinSavedPosition = async (
  customerId: number,
  id: string,
  eventId: string,
  isProductionEnv: boolean,
): Promise<TBitMovinPlayerSavedPosition | null> => {
  try {
    const { data } = await getBitMovinPosition(customerId, id, isProductionEnv);

    const { position } = data?.data?.attributes?.watchStatus || {};

    if (!position || position === '0' || position === '0:00') {
      return null;
    }

    return {
      id,
      eventId,
      position,
    };
  } catch (error: any) {
    logError(
      'Something went wrong with getting BitMovinPlayerSavedPosition',
      error,
    );
    return null;
  }
};

export const removeBitMovinSavedPositionByIdAndEventId = async (
  customerId: number,
  id: string,
  eventId: string,
  isProductionEnv: boolean,
  cb?: (...args: any[]) => void,
): Promise<void> =>
  savePosition(
    customerId,
    { eventId, id, position: '0:00' },
    isProductionEnv,
    cb,
  );

export const getListOfWatchedVideos = async (
  customerId: number,
  isProductionEnv: boolean,
): Promise<Array<string>> => {
  try {
    const { data } = await getListOfWatchedVideosReq(
      customerId,
      isProductionEnv,
    );
    const { watchStatus } = data.data.attributes.tv;

    return Object.entries(watchStatus).flatMap(entry => {
      const [videoId, watchStatusItem] = entry;

      if (!watchStatusItem) {
        return [];
      }

      if (['0', '0:00', null].includes(watchStatusItem.position)) {
        return [];
      }

      return [videoId];
    });
  } catch (error: any) {
    logError(
      'Something went wrong with getting the list of unique EventId with a saved position of playing',
      error,
    );
    return [];
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
