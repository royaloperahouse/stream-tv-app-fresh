import { logError } from '@utils/loger';
import {
  addToMyListReq,
  clearMyListReq,
  getMyListReq,
  removeIdFromMyListReq,
} from 'services/apiClient';

export const addToMyList = async (
  customerId: number | null,
  item: string,
  isProductionEnv: boolean,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  try {
    if (customerId === null || !item) {
      throw new Error(
        `Something went wrong with customerId ${customerId} etheir eventId ${item}`,
      );
    }
    await addToMyListReq(customerId, item, isProductionEnv);
  } catch (error: any) {
    logError('Something went wrong with saving to MyList', error);
  } finally {
    if (typeof cb === 'function') {
      cb();
    }
  }
};

export const removeIdFromMyList = async (
  customerId: number | null,
  item: string,
  isProductionEnv: boolean,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  try {
    if (customerId === null || !item) {
      throw new Error(
        `Something went wrong with customerId ${customerId} etheir eventId ${item}`,
      );
    }
    await removeIdFromMyListReq(customerId, item, isProductionEnv);
  } catch (error: any) {
    logError('Something went wrong with removing from MyList', error);
  } finally {
    if (typeof cb === 'function') {
      cb();
    }
  }
};

export const clearMyList = async (
  customerId: number | null,
  isProductionEnv: boolean,
): Promise<void> => {
  try {
    if (customerId === null) {
      throw new Error(`Something went wrong with customerId ${customerId}`);
    }
    await clearMyListReq(customerId, isProductionEnv);
  } catch (error: any) {
    logError('Something went wrong with clearing MyList', error);
  }
};

export const getMyList = async (
  customerId: number | null,
  isProductionEnv: boolean,
): Promise<Array<string>> => {
  try {
    if (customerId === null) {
      throw new Error(`Something went wrong with customerId ${customerId}`);
    }
    const { data } = await getMyListReq(customerId, isProductionEnv);
    const { myList } = data.data.attributes;
    return myList.map(item => item.id);
  } catch (error: any) {
    logError('Something went wrong with getting MyList', error);
    return [];
  }
};

export const hasMyListItem = async (
  customerId: number | null,
  item: string,
  isProductionEnv: boolean,
): Promise<boolean> => {
  try {
    if (customerId === undefined || customerId === null) {
      throw Error(`Something went wrong with customerId ${customerId}`);
    }
    const myList = await getMyList(customerId, isProductionEnv);
    return myList.includes(item);
  } catch (error: any) {
    logError('Something went wrong with getting MyList', error);
    return false;
  }
};
