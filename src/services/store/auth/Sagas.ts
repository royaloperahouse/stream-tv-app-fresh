import { ActionCreatorWithoutPayload } from '@reduxjs/toolkit/src/createAction';
import {
  startLoginLoop,
  endLoginLoop,
  checkDeviceSuccess,
  checkDeviceError,
  checkDeviceStart,
  switchOnIntroScreen,
  startFullSubscriptionLoop,
  endFullSubscriptionLoop,
  updateSubscriptionMode,
} from '@services/store/auth/Slices';
import {
  getEventListLoopStart,
  setPPVEventsIds,
  clearPPVEventsIds,
  setAvailablePPVEventsIds,
  clearAvailablePPVEventsIds,
  //getEventListLoopStop, // fire on logout
} from '@services/store/events/Slices';

import {
  customerIdSelector,
  subscribedModeSelector,
  subscribedModeUpdateDateSelector,
} from '@services/store/auth/Selectors';
import {
  ppvEventsIdsSelector,
  availablePPVEventsDateOfUpdateSelector,
} from '@services/store/events/Selectors';
import { isProductionEvironmentSelector } from '@services/store/settings/Selectors';
import { Task } from 'redux-saga';
import {
  all,
  call,
  cancel,
  delay,
  fork,
  put,
  take,
  select,
} from 'redux-saga/effects';
import {
  verifyDevice,
  getSubscribeInfo,
  getPurchasedStreams,
  getAllEvalibleEventsForPPV,
  eventsOnFeePromiseFill,
} from '@services/apiClient';
import { logError } from '@utils/loger';
import { TAuthResponseError } from '@services/types/authReqResp';
import { AxiosResponse } from 'axios';
import { bigDelay } from '@utils/bigDelay';
import isequal from 'lodash.isequal';
import formatISO from 'date-fns/formatISO';
import isValid from 'date-fns/isValid';
import format from 'date-fns/format';

export default function* authRootSagas() {
  yield all([call(loginLoopWatcher), call(fullSubscriptionLoopWatcher)]);
}

function* loginLoopWatcher(): any {
  let task: null | Task = null;
  while (true) {
    const action: ActionCreatorWithoutPayload<string> = yield take([
      startLoginLoop.toString(),
      endLoginLoop.toString(),
    ]);
    if (
      action.type === startLoginLoop.toString() &&
      (!task || !task.isRunning())
    ) {
      task = yield fork(loginLoopWorker);
      continue;
    }

    if (action.type === endLoginLoop.toString() && task) {
      yield cancel(task);
      task = null;
    }
  }
}

function* fullSubscriptionLoopWatcher(): any {
  let task: null | Task = null;
  while (true) {
    const action: ActionCreatorWithoutPayload<string> = yield take([
      startFullSubscriptionLoop.toString(),
      endFullSubscriptionLoop.toString(),
    ]);
    if (
      action.type === startFullSubscriptionLoop.toString() &&
      (!task || !task.isRunning())
    ) {
      task = yield fork(fullSubscriptionLoopWorker);
      continue;
    }

    if (action.type === endFullSubscriptionLoop.toString() && task) {
      yield cancel(task);
      task = null;
    }
  }
}

function* loginLoopWorker(): any {
  const delayTimeInMS = 5000; // 5 sec
  let runLoop: boolean = true;
  while (runLoop) {
    try {
      const isProductionEnv = yield select(isProductionEvironmentSelector);
      const response: any = yield call(verifyDevice, isProductionEnv);
      if (response?.data?.data?.attributes?.customerId) {
        runLoop = false;
        yield put(checkDeviceSuccess(response.data));
        const subscriptionResponse = yield call(
          getSubscribeInfo,
          isProductionEnv,
        );
        if (
          subscriptionResponse.status >= 200 &&
          subscriptionResponse.status < 400 &&
          subscriptionResponse?.data?.data?.attributes?.isSubscriptionActive !==
            undefined
        ) {
          yield put(
            updateSubscriptionMode({
              fullSubscription:
                subscriptionResponse.data.data.attributes.isSubscriptionActive,
              fullSubscriptionUpdateDate: formatISO(new Date()),
            }),
          );
        }
      } else if (response?.data?.errors?.length) {
        const errObj: TAuthResponseError = response.data.errors[0];
        yield put(checkDeviceError(errObj));
      } else {
        throw Error();
      }
    } catch (err: any) {
      logError('something went wrong', JSON.stringify(err, null, 4));
      yield put(
        checkDeviceError({ status: 500, title: 'something went wrong' }),
      );
    }
    yield delay(delayTimeInMS);
  }
}

function* fullSubscriptionLoopWorker(): any {
  const delayTimeInMS = 10 * 60 * 1000;
  let getAvailablePPVEventsDateOfUpdateTask: null | Task = null;
  while (true) {
    const fullSubscription = yield select(subscribedModeSelector);
    const fullSubscriptionUpdateDate = yield select(
      subscribedModeUpdateDateSelector,
    );
    const isProductionEnv = yield select(isProductionEvironmentSelector);
    const customerId = yield select(customerIdSelector);
    if (
      !fullSubscription ||
      !isValid(fullSubscriptionUpdateDate) ||
      format(new Date(fullSubscriptionUpdateDate), 'DDD') !==
        format(new Date(), 'DDD') ||
      format(new Date(fullSubscriptionUpdateDate), 'yyyy') !==
        format(new Date(), 'yyyy')
    ) {
      try {
        const subscriptionResponse = yield call(
          getSubscribeInfo,
          isProductionEnv,
        );
        if (
          subscriptionResponse.status >= 200 &&
          subscriptionResponse.status < 400 &&
          subscriptionResponse?.data?.data?.attributes?.isSubscriptionActive !==
            undefined
        ) {
          yield put(
            updateSubscriptionMode({
              fullSubscription:
                subscriptionResponse.data.data.attributes.isSubscriptionActive,
              fullSubscriptionUpdateDate: formatISO(new Date()),
            }),
          );
        }
      } catch (err: any) {
        logError('something went wrong with subscription');
      }
    }
    if (!(yield select(subscribedModeSelector))) {
      try {
        if (
          !getAvailablePPVEventsDateOfUpdateTask ||
          !getAvailablePPVEventsDateOfUpdateTask.isRunning()
        ) {
          getAvailablePPVEventsDateOfUpdateTask = yield fork(
            downloadListOfAvailablePPVEvents,
          );
        }
        const purchasedStreamsResponse = yield call(
          getPurchasedStreams,
          isProductionEnv,
          customerId,
        );
        if (
          purchasedStreamsResponse.status >= 200 &&
          purchasedStreamsResponse.status < 400 &&
          Array.isArray(
            purchasedStreamsResponse?.data?.data?.attributes?.streams,
          ) &&
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
          if (!ids.length) {
            throw Error();
          }
          const eventsForPPVPromiseSettledResponse: Array<
            PromiseSettledResult<AxiosResponse<any>>
          > = yield call(
            eventsOnFeePromiseFill,
            ids,
            undefined,
            isProductionEnv,
          );
          const eventsForPPVData = eventsForPPVPromiseSettledResponse.reduce<{
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
          const currentPpvEventsIds = yield select(ppvEventsIdsSelector);
          const takkenPpvEventsIds = eventsForPPVData.data
            .filter(item => item.type === 'digitalEvent')
            .map(item => item.id);
          if (!isequal(currentPpvEventsIds, takkenPpvEventsIds)) {
            yield put(
              setPPVEventsIds({
                ppvEventsIds: takkenPpvEventsIds,
              }),
            );
          }
        }
      } catch (err: any) {
        logError(
          'something went wrong with getting data about payPeerView events',
        );
        const currentPpvEventsIds: Array<string> = yield select(
          ppvEventsIdsSelector,
        );
        if (currentPpvEventsIds.length) {
          yield put(clearPPVEventsIds());
        }
      }
    }
    yield call(bigDelay, delayTimeInMS);
  }
}

function* downloadListOfAvailablePPVEvents(): any {
  const downloadedDate = yield select(availablePPVEventsDateOfUpdateSelector);
  const isProductionEnv = yield select(isProductionEvironmentSelector);
  const nowDate = new Date();
  if (
    isValid(downloadedDate) &&
    format(new Date(downloadedDate), 'DDD yyyy') === format(nowDate, 'DDD yyyy')
  ) {
    return;
  }
  try {
    const availablePPVEventsResponse: AxiosResponse<any> = yield call(
      getAllEvalibleEventsForPPV,
      isProductionEnv,
    );
    if (
      availablePPVEventsResponse.status >= 400 ||
      !Array.isArray(availablePPVEventsResponse.data?.data?.attributes?.fees)
    ) {
      throw Error('Something went wrong with available PPVEvents response');
    }
    const feesIds: Array<string> =
      availablePPVEventsResponse.data.data.attributes.fees.reduce(
        (acc: Array<string>, item: any) => {
          if (item.Id !== null && item.Id !== undefined) {
            acc.push(item.Id.toString());
          }
          return acc;
        },
        [],
      );
    if (!feesIds.length) {
      throw Error('has no feesIds for list of available PPVEvents');
    }
    const availablePPVEventsWithPrismicRelationPromiseSettledResponse: Array<
      PromiseSettledResult<AxiosResponse<any>>
    > = yield call(eventsOnFeePromiseFill, feesIds, undefined, isProductionEnv);
    const availablePPVEventsWithPrismicRelation =
      availablePPVEventsWithPrismicRelationPromiseSettledResponse.reduce<{
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
    const takkenAvailablePpvEventsIds =
      availablePPVEventsWithPrismicRelation.data
        .filter(item => item.type === 'digitalEvent')
        .map(item => item.id);
    yield put(
      setAvailablePPVEventsIds({
        availablePPVEventsIds: takkenAvailablePpvEventsIds,
        availablePPVEventsDateOfUpdate: nowDate.toISOString(), // What do we need to set if we will have no events as empty array (takkenAvailablePpvEventsIds);
      }),
    );
  } catch (err: any) {
    logError(err.message);
    yield put(clearAvailablePPVEventsIds());
  }
}
