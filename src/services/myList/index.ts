import { logError } from '@utils/loger';
import { axiosClient } from 'services/apiClient';
import { GetMyListResponse } from 'services/types/tv/responses';

export const addToMyList = async (
  customerId: string,
  item: string,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  try {
    await axiosClient.post('/user/tv/my-list', {
      customerId,
      eventIds: [item],
    });
  } catch (error: any) {
    logError('Something went wrong with saving to MyList', error);
  } finally {
    if (typeof cb === 'function') {
      cb();
    }
  }
};

export const removeIdFromMyList = async (
  customerId: string,
  item: string,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  try {
    await axiosClient.delete('/user/tv/my-list', {
      data: {
        customerId,
        eventIds: [item],
      },
    });
  } catch (error: any) {
    logError('Something went wrong with removing from MyList', error);
  } finally {
    if (typeof cb === 'function') {
      cb();
    }
  }
};

export const removeIdsFromMyList = async (
  customerId: string,
  items: Array<string>,
  cb?: (...args: any[]) => void,
): Promise<void> => {
  if (!Array.isArray(items) || !items.length) {
    return;
  }
  try {
    await axiosClient.delete('/user/tv/my-list', {
      data: {
        customerId,
        eventIds: items,
      },
    });
  } catch (error: any) {
    logError('Something went wrong with removing from MyList', error);
  } finally {
    if (typeof cb === 'function') {
      cb();
    }
  }
};

export const clearMyList = async (customerId: string): Promise<void> => {
  try {
    await axiosClient.delete('/user/tv/my-list/clear', {
      data: { customerId },
    });
  } catch (error: any) {
    logError('Something went wrong with clearing MyList', error);
  }
};

export const getMyList = async (customerId: string): Promise<Array<string>> => {
  try {
    const { data } = await axiosClient.get<GetMyListResponse>(
      '/user/tv/my-list',
      {
        params: { customerId },
      },
    );
    const { myList } = data.data.attributes;
    return myList.map(item => item.id);
  } catch (error: any) {
    logError('Something went wrong with getting MyList', error);
    return [];
  }
};

export const hasMyListItem = async (
  customerId: string,
  item: string,
): Promise<boolean> => {
  try {
    const myList = await getMyList(customerId);
    return myList.includes(item);
  } catch (error: any) {
    logError('Something went wrong with getting MyList', error);
    return false;
  }
};
