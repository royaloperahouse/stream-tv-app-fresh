import { ActionCreatorWithoutPayload } from '@reduxjs/toolkit';
import * as prismicT from '@prismicio/types';
import {
  getEventListLoopStart,
  getEventListSuccess,
  getEventListLoopStop,
  saveSearchResultQuery,
} from '@services/store/events/Slices';
import { searchQuerySelector } from '@services/store/events/Selectors';
import { Task } from 'redux-saga';
import {
  all,
  call,
  cancel,
  fork,
  put,
  select,
  take,
  takeEvery,
} from 'redux-saga/effects';
import { logError } from '@utils/loger';
import {
  getDigitalEventDetails,
  getPrismicisedRails,
} from '@services/prismicApiClient';
import { addItemToPrevSearchList } from '@services/previousSearch';
import { bigDelay } from '@utils/bigDelay';
import {
  TVSVideo,
  TStreamHomePageRail,
  TStreamHomePageData,
  TStreamHomePageElement,
} from '@services/types/models';
import { isProductionEvironmentSelector } from '../settings/Selectors';
import { customerIdSelector } from '../auth/Selectors';

export default function* eventRootSagas() {
  yield all([
    call(getEventListLoopWatcher),
    call(saveSearchResultQueryWatcher),
  ]);
}

function* getEventListLoopWatcher() {
  let task: null | Task = null;
  while (true) {
    const action: ActionCreatorWithoutPayload<string> = yield take([
      getEventListLoopStart.toString(),
      getEventListLoopStop.toString(),
    ]);
    if (
      action.type === getEventListLoopStart.toString() &&
      (!task || !task.isRunning())
    ) {
      task = yield fork(getEventListLoopWorker);
      continue;
    }

    if (action.type === getEventListLoopStop.toString() && task) {
      yield cancel(task);
      task = null;
    }
  }
}

function* saveSearchResultQueryWatcher() {
  yield takeEvery(
    saveSearchResultQuery.toString(),
    saveSearchResultQueryWorker,
  );
}

function* getEventListLoopWorker(): any {
  while (true) {
    const result = [];
    const isProductionEnv = yield select(isProductionEvironmentSelector);
    try {
      const initialResponse: prismicT.Query<prismicT.PrismicDocument> =
        yield call(getDigitalEventDetails, { isProductionEnv });

      result.push(...initialResponse.results);
      if (initialResponse.total_pages !== initialResponse.page) {
        const allPagesRequestsResult: Array<
          PromiseSettledResult<prismicT.Query<prismicT.PrismicDocument>>
        > = yield call(
          eventPromiseFill,
          initialResponse.page + 1,
          initialResponse.total_pages,
          isProductionEnv,
        );
        result.push(
          ...allPagesRequestsResult.reduce<Array<any>>( //todo create type for prismicResult
            (
              acc,
              pageRequestsResult: PromiseSettledResult<
                prismicT.Query<prismicT.PrismicDocument>
              >,
            ) => {
              if (pageRequestsResult.status === 'fulfilled') {
                acc.push(...pageRequestsResult.value.results);
              }
              return acc;
            },
            [],
          ),
        );
      }
    } catch (err: any) {
      logError('something went wrong with prismic request', err);
    }
    if (result.length) {
      let prismicisedRails: {
        exploreAllTrays: Array<TStreamHomePageRail>;
        operaAndMusicTopTrays: Array<TStreamHomePageRail>;
        operaAndMusicBottomTrays: Array<TStreamHomePageRail>;
        balletAndDanceTopTrays: Array<TStreamHomePageRail>;
        balletAndDanceBottomTrays: Array<TStreamHomePageRail>;
        propositionPageElements: Array<TStreamHomePageRail>;
      } = {
        exploreAllTrays: [],
        operaAndMusicTopTrays: [],
        operaAndMusicBottomTrays: [],
        balletAndDanceTopTrays: [],
        balletAndDanceBottomTrays: [],
        propositionPageElements: [],
      };
      try {
        const initialResponse: prismicT.Query<prismicT.PrismicDocument> =
          yield call(getPrismicisedRails, { isProductionEnv });
        prismicisedRails = retrievePrismicisedRails(
          initialResponse.results[0].data as TStreamHomePageData,
        );
      } catch (err: any) {
        logError('something went wrong with PrismicisedRails request', err);
      }
      const resultForDigitalEventsDetailUpdate = groupDigitalEvents(result);
      yield put(
        getEventListSuccess({
          digitalEventDetailsList: {
            ...resultForDigitalEventsDetailUpdate,
            ...prismicisedRails,
          },
        }),
      );
    }
    yield call(bigDelay, 30 * 60 * 1000);
  }
}

function* saveSearchResultQueryWorker(): any {
  const customerId = yield select(customerIdSelector);
  const searchQueryString = yield select(searchQuerySelector);
  const isProductionEnv = yield select(isProductionEvironmentSelector);
  yield call(
    addItemToPrevSearchList,
    customerId,
    searchQueryString,
    isProductionEnv,
  );
}

function eventPromiseFill(
  from: number,
  to: number,
  isProductionEnv: boolean,
): Promise<PromiseSettledResult<prismicT.Query<prismicT.PrismicDocument>>[]> {
  const allPromises: Array<Promise<prismicT.Query<prismicT.PrismicDocument>>> =
    [];
  for (let i = from; i <= to; i++) {
    allPromises.push(
      getDigitalEventDetails({ queryOptions: { page: i }, isProductionEnv }),
    );
  }
  return Promise.allSettled(allPromises);
}

function groupDigitalEvents(digitalEventsDetail: Array<any>): any {
  return digitalEventsDetail.reduce<any>(
    (acc, digitalEventDetail) => {
      acc.allDigitalEventsDetail[digitalEventDetail.id] = {
        id: digitalEventDetail.id,
        last_publication_date: digitalEventDetail.last_publication_date,
        data: {
          ...digitalEventDetail.data,
          vs_videos: digitalEventDetail.data.vs_videos.filter(
            (videoObj: TVSVideo) => videoObj?.video?.isBroken === false,
          ),
        },
      };
      const tags: Array<any> =
        Array.isArray(digitalEventDetail?.data?.tags) &&
        digitalEventDetail.data.tags.length &&
        digitalEventDetail.data.tags.some((item: any) => !!item.tag)
          ? digitalEventDetail.data.tags
          : Array.isArray(
              digitalEventDetail?.data?.vs_event_details?.tags, // can be null. need to improve it later
            )
          ? digitalEventDetail.data.vs_event_details.tags
          : [];
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].tag === null) {
          continue;
        }
        const groupKey = (tags[i].tag || tags[i].attributes.title)
          .toLowerCase()
          .trim()
          .replace(/\s/g, '_');
        if (groupKey in acc.eventGroups) {
          acc.eventGroups[groupKey].ids.push(digitalEventDetail.id);
        } else {
          acc.eventGroups[groupKey] = {
            title: tags[i].tag || tags[i].attributes.title,
            ids: [digitalEventDetail.id],
          };
        }
      }
      return acc;
    },
    {
      allDigitalEventsDetail: {},
      eventGroups: {},
    },
  );
}

function retrievePrismicisedRails(data: TStreamHomePageData): {
  exploreAllTrays: Array<TStreamHomePageRail>;
  operaAndMusicTopTrays: Array<TStreamHomePageRail>;
  operaAndMusicBottomTrays: Array<TStreamHomePageRail>;
  balletAndDanceTopTrays: Array<TStreamHomePageRail>;
  balletAndDanceBottomTrays: Array<TStreamHomePageRail>;
  propositionPageElements: Array<TStreamHomePageRail>;
} {
  const prismicisedRails: {
    exploreAllTrays: Array<TStreamHomePageRail>;
    operaAndMusicTopTrays: Array<TStreamHomePageRail>;
    operaAndMusicBottomTrays: Array<TStreamHomePageRail>;
    balletAndDanceTopTrays: Array<TStreamHomePageRail>;
    balletAndDanceBottomTrays: Array<TStreamHomePageRail>;
    propositionPageElements: Array<TStreamHomePageRail>;
  } = {
    exploreAllTrays: [],
    operaAndMusicTopTrays: [],
    operaAndMusicBottomTrays: [],
    balletAndDanceTopTrays: [],
    balletAndDanceBottomTrays: [],
    propositionPageElements: [],
  };

  if (Array.isArray(data.proposition_page_elements)) {
    prismicisedRails.propositionPageElements.push(
      ...filterPrismicisedRail(data.proposition_page_elements),
    );
  }
  if (Array.isArray(data.explore_all_elements)) {
    prismicisedRails.exploreAllTrays.push(
      ...filterPrismicisedRail(data.explore_all_elements),
    );
  }
  if (Array.isArray(data.opera_and_music_top_elements)) {
    prismicisedRails.operaAndMusicTopTrays.push(
      ...filterPrismicisedRail(data.opera_and_music_top_elements),
    );
  }
  if (Array.isArray(data.opera_and_music_bottom_elements)) {
    prismicisedRails.operaAndMusicBottomTrays.push(
      ...filterPrismicisedRail(data.opera_and_music_bottom_elements),
    );
  }
  if (Array.isArray(data.ballet_and_dance_top_elements)) {
    prismicisedRails.balletAndDanceTopTrays.push(
      ...filterPrismicisedRail(data.ballet_and_dance_top_elements),
    );
  }
  if (Array.isArray(data.ballet_and_dance_bottom_elements)) {
    prismicisedRails.balletAndDanceBottomTrays.push(
      ...filterPrismicisedRail(data.ballet_and_dance_bottom_elements),
    );
  }
  return prismicisedRails;
}

function filterPrismicisedRail(
  data: Array<TStreamHomePageElement>,
): Array<TStreamHomePageRail> {
  return data
    .filter(
      slice =>
        slice.slice_type === 'events_tray' &&
        slice.items.some(
          item =>
            item?.element.type === 'digital_event_details' &&
            item?.element.isBroken !== true,
        ),
    )
    .map(slice => ({
      title: slice.primary?.title || '',
      isVisible: slice.primary?.show_tray || false,
      ids: Array.from(
        slice.items.reduce((acc: any, item) => {
          if (
            item?.element.type === 'digital_event_details' &&
            item?.element.isBroken !== true
          ) {
            acc.add(item.element.id);
          }
          return acc;
        }, new Set()),
      ),
    }));
}
