import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiConfig } from '@configs/apiConfig';
import {
  GetSearchHistoryResponse,
  GetTVDataResponse,
  GetWatchStatusResponse,
  GetMyListResponse,
} from '@services/types/tv/responses';
import { TBitMovinPlayerSavedPosition } from '@services/types/models';
import {
  UnableToCheckRentalStatusError,
  NotRentedItemError,
  NonSubscribedStatusError,
} from '@utils/customErrors';
import isAfter from 'date-fns/isAfter';
import { useAppSelector } from 'hooks/redux';
import { customerIdSelector } from 'services/store/auth/Selectors';
export const axiosClient: AxiosInstance = axios.create({
  baseURL: ApiConfig.host,
  timeout: 20 * 1000,
});

axiosClient.interceptors.request.use(
  async (axiosConfig: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    axiosConfig.headers = {
      ...axiosConfig.headers,
      accept: 'application/json',
      ['Content-Type']: 'application/json',
      ['X-Device-ID']: await ApiConfig.deviceId,
    };
    /*     console.log(
      `(REQUEST) ${axiosConfig.method} ${axiosConfig.url}`,
      axiosConfig.headers,
      axiosConfig.data,
    ); */
    return axiosConfig;
  },
);

axiosClient.interceptors.response.use(
  (
    response: AxiosResponse<any>,
  ): AxiosResponse<any> | Promise<AxiosResponse<any>> => {
    /*     console.log(response);
    console.log(
      `(RESPONSE) ${response.config.method} ${response.config.url}`,
      response.headers,
      response.data,
    ); */
    return response;
  },
  error => {
    const { response } = error;
    /*     console.log(error);
    console.log(
      `(ERROR) ${axiosConfig.method} ${axiosConfig.url}`,
      response?.data,
    ); */
    if (response === undefined) {
      return { status: 500 };
    }
    return response;
  },
);

export const verifyDevice = (isProductionEnv: boolean) =>
  axiosClient.get(ApiConfig.routes.verifyDevice, {
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const fetchVideoURL = (id: string, isProductionEnv: boolean) =>
  axiosClient.get(ApiConfig.routes.videoSource, {
    params: {
      id,
    },
    auth: ApiConfig.auth,
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const pinUnlink = (isProductionEnv: boolean) =>
  axiosClient.delete(ApiConfig.routes.pinUnlink, {
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const getSubscribeInfo = (isProductionEnv: boolean) =>
  axiosClient.get(ApiConfig.routes.subscriptionInfo, {
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const getPurchasedStreams = (
  isProductionEnv: boolean,
  customerId: number | null,
) =>
  axiosClient.get(ApiConfig.routes.checkoutPurchasedStreams, {
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
    headers: { ['x-customer-id']: customerId || '' },
  });

export const getAllEvalibleEventsForPPV = (isProductionEnv: boolean) =>
  axiosClient.get(ApiConfig.routes.checkoutPayPerView, {
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const getEventsByFeeIds = (feeIds: string, isProductionEnv: boolean) =>
  axiosClient.get(ApiConfig.routes.digitalEvents, {
    params: { feeIds },
    auth: ApiConfig.auth,
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const activateAvailabilityWindow = (
  feeId,
  orderNo,
  availabilityWindow,
  customerId,
  isProductionEnv,
) => {
  return axiosClient.post(
    ApiConfig.routes.activateAvailabilityWindow,
    {
      feeId: feeId.toString(),
      orderNo,
      duration: availabilityWindow,
    },
    {
      baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
      headers: { ['x-customer-id']: customerId || '' },
    },
  );
};

export const getAccessToWatchVideo = async (
  videoObj: { videoId: string; eventId: string; title?: string },
  isProductionEnv: boolean,
  customerId: number | null,
  checkRentalStateModalCB: () => void,
): Promise<{
  videoId: string;
  eventId: string;
  title?: string;
  feeId?: number;
  orderNo?: number;
  isAvailabilityWindowActivated?: boolean;
  availabilityWindow?: number;
  isPPV?: boolean;
}> => {
  const subscriptionResponse = await getSubscribeInfo(isProductionEnv);
  if (
    subscriptionResponse.status >= 200 &&
    subscriptionResponse.status < 400 &&
    subscriptionResponse?.data?.data?.attributes?.isSubscriptionActive
  ) {
    return videoObj;
  }
  checkRentalStateModalCB();

  const purchasedStreamsResponse = await getPurchasedStreams(
    isProductionEnv,
    customerId,
  );
  if (
    purchasedStreamsResponse.status >= 200 &&
    purchasedStreamsResponse.status < 400 &&
    Array.isArray(purchasedStreamsResponse?.data?.data?.attributes?.streams) &&
    purchasedStreamsResponse.data.data.attributes.streams.length
  ) {
    const ids: Array<string> =
      purchasedStreamsResponse.data.data.attributes.streams
        .map(
          (stream: {
            stream_id: string;
            stream_desc: string;
            purchase_dt: string;
            transaction_status: string;
          }) => {
            if (stream.transaction_status === 'success') {
              return stream.stream_id;
            }
          },
        )
        .filter(item => item);

    if (ids.length) {
      const eventsForPPVPromiseSettledResponse: Array<
        PromiseSettledResult<AxiosResponse<any>>
      > = await eventsOnFeePromiseFill(ids, undefined, isProductionEnv);
      const eventsForPPVData = eventsForPPVPromiseSettledResponse.reduce<{
        data: Array<any>;
        included: Array<any>;
      }>(
        (acc, item) => {
          if (item.status === 'fulfilled') {
            acc.data = acc.data.concat(
              Array.isArray(item.value.data?.data) ? item.value.data.data : [],
            );
            acc.included = acc.included.concat(
              Array.isArray(item.value.data?.included)
                ? item.value.data.included
                : [],
            );
          }
          return acc;
        },
        { data: [], included: [] },
      );
      const ppvEvent = eventsForPPVData.included.find(
        (item: any) =>
          item.type === 'videoInfo' && item.id === videoObj.videoId,
      );
      const purchase =
        purchasedStreamsResponse.data.data.attributes.streams.find(
          item => (item.stream_id = ppvEvent.attributes.fee.Id),
        );
      if (
        ppvEvent && purchase
      ) {
        if (isAfter(new Date(), new Date(purchase.availability_window_end))) {
          throw new NotRentedItemError();
        }
        return {
          ...videoObj,
          feeId: purchase.stream_id,
          orderNo: purchase.order_no,
          isAvailabilityWindowActivated: !!purchase.availability_window_end,
          availabilityWindow: ppvEvent.attributes.ppvAvailabilityWindow,
          isPPV: true,
        };
      }
      throw new NotRentedItemError();
    } else {
      const allAvalibleEventsForPPVResponse = await getAllEvalibleEventsForPPV(
        isProductionEnv,
      );
      if (
        allAvalibleEventsForPPVResponse.status >= 400 ||
        !Array.isArray(
          allAvalibleEventsForPPVResponse.data?.data?.attributes?.fees,
        )
      ) {
        throw new UnableToCheckRentalStatusError();
      }
      const feesIds: Array<string> =
        allAvalibleEventsForPPVResponse.data.data.attributes.fees.reduce(
          (acc: Array<string>, item: any) => {
            if (item.Id !== null && item.Id !== undefined) {
              acc.push(item.Id.toString());
            }
            return acc;
          },
          [],
        );
      if (!feesIds.length) {
        throw new NonSubscribedStatusError();
      }
      const availablePPVEventsWithPrismicRelationPromiseSettledResponse: Array<
        PromiseSettledResult<AxiosResponse<any>>
      > = await eventsOnFeePromiseFill(feesIds, undefined, isProductionEnv);
      const availablePPVEventsWithPrismicRelation =
        availablePPVEventsWithPrismicRelationPromiseSettledResponse.reduce<{
          data: Array<any>;
          included: Array<any>;
        }>(
          (acc, item) => {
            if (item.status === 'fulfilled') {
              acc.data = acc.data.concat(
                Array.isArray(item.value.data?.data)
                  ? item.value.data.data
                  : [],
              );
              acc.included = acc.included.concat(
                Array.isArray(item.value.data?.included)
                  ? item.value.data.included
                  : [],
              );
            }
            return acc;
          },
          { data: [], included: [] },
        );
      if (
        availablePPVEventsWithPrismicRelation.data
          .filter(item => item.type === 'digitalEvent')
          .some(item => item.id === videoObj.videoId)
      ) {
        throw new NotRentedItemError();
      } else {
        throw new NonSubscribedStatusError();
      }
    }
  }
  throw new UnableToCheckRentalStatusError();
};

export function eventsOnFeePromiseFill(
  ids: Array<string>,
  maxCountIdsForResponse: number = 50,
  isProductionEnv: boolean,
): Promise<PromiseSettledResult<AxiosResponse<any>>[]> {
  const maxChunksIndex = Math.ceil(ids.length / maxCountIdsForResponse) - 1;
  const allPromises: Array<Promise<AxiosResponse<any>>> = [];
  for (let i = 0; i <= maxChunksIndex; i++) {
    allPromises.push(
      getEventsByFeeIds(
        ids
          .slice(i * maxCountIdsForResponse, (i + 1) * maxCountIdsForResponse)
          .join(','),
        isProductionEnv,
      ),
    );
  }
  return Promise.allSettled(allPromises);
}

export const addItemToPreviousSearchList = (
  customerId: string,
  item: string,
  isProductionEnv: boolean,
): Promise<void> =>
  axiosClient.post(
    ApiConfig.routes.searchHistory,
    {
      customerId,
      searchTerm: item,
    },
    {
      baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
    },
  );

export const getPreviousSearchList = (
  customerId: number,
  isProductionEnv: boolean,
) =>
  axiosClient.get<GetSearchHistoryResponse>(ApiConfig.routes.searchHistory, {
    params: { customerId },
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const removeItemFromPreviousSearchList = (
  customerId: number,
  item: string,
  isProductionEnv: boolean,
): Promise<void> =>
  axiosClient.delete(ApiConfig.routes.searchHistory, {
    data: {
      customerId,
      searchTerm: item,
    },
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const clearPreviousSearchList = (
  customerId: number,
  isProductionEnv: boolean,
): Promise<void> =>
  axiosClient.delete(ApiConfig.routes.clearSearchHistory, {
    data: { customerId },
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const getListOfWatchedVideosReq = (
  customerId: number,
  isProductionEnv: boolean,
) =>
  axiosClient.get<GetTVDataResponse>(ApiConfig.routes.tvDataStatus, {
    params: { customerId },
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const getBitMovinPosition = async (
  customerId: number,
  id: string,
  isProductionEnv: boolean,
) =>
  axiosClient.get<GetWatchStatusResponse>(ApiConfig.routes.watchStatus, {
    params: {
      customerId,
      videoId: id.replace(/_/g, '-'),
    },
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const saveBitMovinPosition = (
  customerId: number,
  item: TBitMovinPlayerSavedPosition,
  isProductionEnv: boolean,
) =>
  axiosClient.post(
    ApiConfig.routes.watchStatus,
    {
      customerId,
      videoId: item.id.replace(/_/g, '-'),
      position: item.position,
    },
    {
      baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
    },
  );

export const addToMyListReq = (
  customerId: number,
  item: string,
  isProductionEnv: boolean,
) =>
  axiosClient.post(
    ApiConfig.routes.myLsit,
    {
      customerId,
      eventIds: [item],
    },
    { baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv },
  );

export const removeIdFromMyListReq = (
  customerId: number,
  item: string,
  isProductionEnv: boolean,
) =>
  axiosClient.delete(ApiConfig.routes.myLsit, {
    data: {
      customerId,
      eventIds: [item],
    },
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const clearMyListReq = (customerId: number, isProductionEnv: boolean) =>
  axiosClient.delete(ApiConfig.routes.clearMyList, {
    data: { customerId },
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const getMyListReq = (customerId: number, isProductionEnv: boolean) =>
  axiosClient.get<GetMyListResponse>(ApiConfig.routes.myLsit, {
    params: { customerId },
    baseURL: isProductionEnv ? ApiConfig.host : ApiConfig.stagingEnv,
  });

export const sendAnalytics = events =>
  axiosClient.post(ApiConfig.routes.analytics, {
    data: events,
  });
