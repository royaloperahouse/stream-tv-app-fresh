import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiConfig } from '@configs/apiConfig';
import {
  UnableToCheckRentalStatusError,
  NotRentedItemError,
  NonSubscribedStatusError,
} from '@utils/customErrors';
const axiosClient: AxiosInstance = axios.create({
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

export const getAccessToWatchVideo = async (
  videoObj: { videoId: string; eventId: string; title?: string },
  isProductionEnv: boolean,
  customerId: number | null,
): Promise<{ videoId: string; eventId: string; title?: string }> => {
  const subscriptionResponse = await getSubscribeInfo(isProductionEnv);
  if (
    subscriptionResponse.status >= 200 &&
    subscriptionResponse.status < 400 &&
    subscriptionResponse?.data?.data?.attributes?.isSubscriptionActive
  ) {
    return videoObj;
  }
  if (isProductionEnv) {
    throw new NonSubscribedStatusError(); //temporary, while  ppv is not working
  }
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
      purchasedStreamsResponse.data.data.attributes.streams.map(
        (stream: {
          stream_id: string;
          stream_desc: string;
          purchase_dt: string;
        }) => stream.stream_id,
      );
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
      if (
        eventsForPPVData.included.some(
          (item: any) =>
            item.type === 'videoInfo' && item.id === videoObj.videoId,
        )
      ) {
        return videoObj;
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
