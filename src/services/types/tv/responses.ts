import { MyList, SearchHistory, WatchStatus, WatchStatusItem } from '.';

export interface GetMyListResponse {
  data: {
    id: string;
    type: string;
    attributes: { myList: MyList };
    relationships: Record<string, unknown>;
  };
  included: [];
}

export interface GetTVDataResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      tv: {
        myList: MyList[];
        watchStatus: WatchStatus;
        searchHistory: SearchHistory[];
      };
    };
    relationships: Record<string, unknown>;
  };
  included: [];
}

export interface GetWatchStatusResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      watchStatus: WatchStatusItem;
    };
    relationships: Record<string, unknown>;
  };
  included: [];
}

export interface GetSearchHistoryResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      searchHistory: SearchHistory;
    };
    relationships: Record<string, unknown>;
  };
  included: [];
}
