import { logError } from '@utils/loger';
import { myListKey } from '@configs/myListConfig';
import { SessionStorage } from '@services/sessionStorage';

export const addToMyList = async (
  item: string,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  try {
    const savedMyList: string | null = await SessionStorage.getItem(myListKey);
    const parsedMyList: Array<string> = !savedMyList
      ? []
      : JSON.parse(savedMyList);
    const existedIndex = parsedMyList.findIndex(listItem => listItem === item);
    if (existedIndex === -1) {
      parsedMyList.push(item);
      await SessionStorage.setItem(myListKey, JSON.stringify(parsedMyList));
    }
  } catch (error: any) {
    logError('Something went wromg with saving to MyList', error);
  } finally {
    if (typeof cb === 'function') {
      cb();
    }
  }
};

export const removeIdFromMyList = async (
  item: string,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  try {
    const savedMyList: string | null = await SessionStorage.getItem(myListKey);
    const parsedMyList: Array<string> = !savedMyList
      ? []
      : JSON.parse(savedMyList);
    const existedIndex = parsedMyList.findIndex(listItem => listItem === item);
    if (existedIndex !== -1) {
      parsedMyList.splice(existedIndex, 1);
      await SessionStorage.setItem(myListKey, JSON.stringify(parsedMyList));
    }
  } catch (error: any) {
    logError('Something went wromg with removing from MyList', error);
  } finally {
    if (typeof cb === 'function') {
      cb();
    }
  }
};

export const removeIdsFromMyList = async (
  items: Array<string>,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  if (!Array.isArray(items) || !items.length) {
    return;
  }
  try {
    const savedMyList: string | null = await SessionStorage.getItem(myListKey);
    const parsedMyList: Array<string> = !savedMyList
      ? []
      : JSON.parse(savedMyList);
    const filteredMyList = parsedMyList.filter(
      listItem => !items.some(item => item === listItem),
    );
    await SessionStorage.setItem(myListKey, JSON.stringify(filteredMyList));
  } catch (error: any) {
    logError('Something went wromg with removing from MyList', error);
  } finally {
    if (typeof cb === 'function') {
      cb();
    }
  }
};

export const clearMyList = (): Promise<void> =>
  SessionStorage.removeItem(myListKey);

export const getMyList = async (): Promise<Array<string>> => {
  try {
    const savedMyList: string | null = await SessionStorage.getItem(myListKey);
    const parsedMyList: Array<string> = !savedMyList
      ? []
      : JSON.parse(savedMyList);
    return parsedMyList;
  } catch (error: any) {
    logError('Something went wrong with getting MyList', error);
    return [];
  }
};

export const hasMyListItem = async (item: string): Promise<boolean> => {
  let result: boolean = false;
  try {
    const savedMyList: string | null = await SessionStorage.getItem(myListKey);
    const parsedMyList: Array<string> = !savedMyList
      ? []
      : JSON.parse(savedMyList);
    const existedIndex = parsedMyList.findIndex(listItem => listItem === item);
    if (existedIndex !== -1) {
      result = true;
    }
  } catch (error: any) {
    logError('Something went wromg with getting MyList', error);
  } finally {
    return result;
  }
};
