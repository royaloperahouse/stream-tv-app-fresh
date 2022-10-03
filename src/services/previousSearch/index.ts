import { logError } from '@utils/loger';
import { maxPrevSearchListSize } from '@configs/previousSearchesConfig';
import { axiosClient } from 'services/apiClient';
import { GetSearchHistoryResponse } from 'services/types/tv/responses';

export const addItemToPrevSearchList = async (
  customerId: string,
  item: string,
): Promise<void> => {
  try {
    await axiosClient.post('/user/tv/search-history', {
      customerId,
      searchTerm: item,
    });
  } catch (err: any) {
    logError('AddItemToPrevSearchList', err);
  }
};

export const getPrevSearchList = async (
  customerId: number,
): Promise<Array<string>> => {
  try {
    const { data } = await axiosClient.get<GetSearchHistoryResponse>(
      '/user/tv/search-history',
      {
        params: { customerId },
      },
    );
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
): Promise<void> => {
  try {
    await axiosClient.delete('/user/tv/search-history', {
      data: {
        customerId,
        searchTerm: item,
      },
    });
  } catch (err: any) {
    logError('removeItemFromPrevSearchList', err);
  }
};

export const clearPrevSearchList = async (
  customerId: number,
): Promise<void> => {
  try {
    await axiosClient.delete('/user/tv/search-history/clear', {
      data: { customerId },
    });
  } catch (err: any) {
    logError('clearPrevSearchList', err);
  }
};
