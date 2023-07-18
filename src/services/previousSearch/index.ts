import { logError } from '@utils/loger';
import { maxPrevSearchListSize } from '@configs/previousSearchesConfig';
import {
  addItemToPreviousSearchList,
  getPreviousSearchList,
  removeItemFromPreviousSearchList,
  clearPreviousSearchList,
} from '@services/apiClient';

export const addItemToPrevSearchList = async (
  customerId: string,
  item: string,
  isProductionEnv: boolean,
): Promise<void> => {
  try {
    await addItemToPreviousSearchList(customerId, item, isProductionEnv);
  } catch (err: any) {
    logError('AddItemToPrevSearchList', err);
  }
};

export const getPrevSearchList = async (
  customerId: number | null,
  isProductionEnv: boolean,
): Promise<Array<string>> => {
  try {
    if (customerId === null || customerId === undefined) {
      return [];
    }
    const { data } = await getPreviousSearchList(customerId, isProductionEnv);
    const { searchHistory } = data.data.attributes;
    const searchTerms = new Set(searchHistory.map(item => item.text));

    if (searchTerms.size > maxPrevSearchListSize) {
      searchTerms.delete(Array.from<string>(searchTerms).shift() || '');
    }
    return [...searchTerms];
  } catch (err: any) {
    logError('getPrevSearchList', err);
    return [];
  }
};

export const removeItemFromPrevSearchList = async (
  customerId: number,
  item: string,
  isProductionEnv: boolean,
): Promise<void> => {
  try {
    await removeItemFromPreviousSearchList(customerId, item, isProductionEnv);
  } catch (err: any) {
    logError('removeItemFromPrevSearchList', err);
  }
};

export const clearPrevSearchList = async (
  customerId: number,
  isProductionEnv: boolean,
): Promise<void> => {
  try {
    await clearPreviousSearchList(customerId, isProductionEnv);
  } catch (err: any) {
    logError('clearPrevSearchList', err);
  }
};
