import { MyList } from '.';

export interface GetMyListResponse {
  data: {
    id: string;
    type: string;
    attributes: { myList: MyList };
    relationships: Record<string, unknown>;
  };
  included: [];
}
