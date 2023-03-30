import { PayloadAction, ActionCreatorWithPayload } from '@reduxjs/toolkit';
import * as prismicT from '@prismicio/types';
import {
  getEventListLoopStart,
  getEventListSuccess,
  getEventListLoopStop,
  saveSearchResultQuery,
} from '@services/store/events/Slices';
import {
  getEventById,
  getEventsLoadedStatusSelector,
  isEventExist,
  searchQuerySelector,
} from '@services/store/events/Selectors';
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
  delay,
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
  contentScreenNames,
  rootStackScreensNames,
} from '@services/types/models';
import { isProductionEvironmentSelector } from '../settings/Selectors';
import { customerIdSelector, introScreenShowSelector } from '../auth/Selectors';
import {
  switchOffIntroScreen,
  turnOffDeepLinkingFlow,
  turnOnDeepLinkingFlow,
} from '../auth/Slices';
import { globalModalManager } from '@components/GlobalModals';
import {
  getCurrentRoute,
  getCurrentState,
  getRootState,
  isNavigationReady,
  navigate,
  replace,
  resetEventDetailsScreenFromDeepLink,
  resetStackCacheAndNavigate,
} from 'navigations/navigationContainer';
import { ErrorModal } from 'components/GlobalModals/variants';
import { navMenuManager } from 'components/NavMenu';

export default function* eventRootSagas() {
  yield all([
    call(getEventListLoopWatcher),
    call(saveSearchResultQueryWatcher),
    call(deepLinkingFlowWatcher),
  ]);
}

function* getEventListLoopWatcher() {
  let task: null | Task = null;
  while (true) {
    const action: ActionCreatorWithPayload<string> = yield take([
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

function* deepLinkingFlowWatcher() {
  let task: null | Task = null;
  let currentTaskName: null | string = null;
  while (true) {
    const action: PayloadAction<{
      eventId: string | null;
      isRegularFlow?: boolean;
    }> = yield take([
      turnOffDeepLinkingFlow.toString(),
      turnOnDeepLinkingFlow.toString(),
    ]);
    if (
      action.type === turnOffDeepLinkingFlow.toString() &&
      !action.payload.isRegularFlow
    ) {
      continue;
    }
    if (
      task &&
      task.isRunning() &&
      action.type !== turnOffDeepLinkingFlow.toString()
    ) {
      yield cancel(task);
    }
    if (task && !task.isRunning()) {
      task = null;
      currentTaskName = null;
    }
    if (
      currentTaskName === null &&
      action.type === turnOffDeepLinkingFlow.toString() &&
      action.payload.isRegularFlow &&
      (!task || !task.isRunning())
    ) {
      task = yield fork(regularFlowWorker);
      currentTaskName = action.type;
      continue;
    }
    if (
      currentTaskName === null &&
      action.type === turnOnDeepLinkingFlow.toString() &&
      action.payload.eventId !== null &&
      (!task || !task.isRunning())
    ) {
      task = yield fork(deepLinkingWorker, action);
      currentTaskName = action.type;
    }
  }
}

function* regularFlowWorker(): any {
  let eventsLoaded = yield select(getEventsLoadedStatusSelector);
  if (eventsLoaded) {
    yield put(switchOffIntroScreen());
    return;
  }
  yield take(getEventListSuccess.toString());
  yield put(switchOffIntroScreen());
}

function* deepLinkingWorker(
  action: PayloadAction<{ eventId: string | null }>,
): any {
  const { eventId } = action.payload;
  const eventsLoaded = yield select(getEventsLoadedStatusSelector);
  if (eventsLoaded) {
    yield call(openEventByDeepLink, eventId);
  }

  while (!eventsLoaded) {
    if (!(yield select(getEventsLoadedStatusSelector))) {
      yield delay(500);
      continue;
    }
    yield call(openEventByDeepLink, eventId);
    break;
  }
  yield put(turnOffDeepLinkingFlow({ isRegularFlow: false }));
}

function* openEventByDeepLink(eventId: string | null): any {
  if (eventId && (yield select(isEventExist(eventId)))) {
    if (globalModalManager.isModalOpen()) {
      globalModalManager.closeModal();
    }
    const isIntroScreenOpen = yield select(introScreenShowSelector);
    if (isIntroScreenOpen) {
      yield put(switchOffIntroScreen());
    }
    while (true) {
      if (!isNavigationReady()) {
        yield delay(500);
        continue;
      }
      const rootState = getRootState() ? { ...getRootState() } : null;

      const isContentRoute =
        rootState &&
        rootState?.routeNames?.findIndex(
          routeItem => routeItem === rootStackScreensNames.content,
        ) === rootState?.index;

      const isEventDetailsRoute =
        isContentRoute &&
        rootState?.routes?.[rootState?.index || 0]?.state?.routes[
          rootState?.routes[rootState?.index || 0]?.state?.index || 0
        ]?.name === contentScreenNames.eventDetails;

      if (isEventDetailsRoute) {
        navigate(rootStackScreensNames.content, {
          screen: contentScreenNames.eventDetails,
          params: {
            eventId,
            screenNameFrom: contentScreenNames.home,
            sectionIndex: 0,
            selectedItemIndex: 0,
          },
        });
      } else {
        navMenuManager.hideNavMenu(() => {
          navigate(rootStackScreensNames.content, {
            screen: contentScreenNames.eventDetails,
            params: {
              eventId,
              screenNameFrom: contentScreenNames.home,
              sectionIndex: 0,
              selectedItemIndex: 0,
            },
          });
        });
      }
      break;
    }
  } else {
    yield put(switchOffIntroScreen());
    while (true) {
      if (!isNavigationReady()) {
        yield delay(500);
        continue;
      }
      break;
    }
    globalModalManager.openModal({
      contentComponent: ErrorModal,
      contentProps: {
        confirmActionHandler: () => {
          globalModalManager.closeModal();
          navigate(rootStackScreensNames.content, {
            screen: contentScreenNames.home,
            params: {
              fromErrorModal: true,
            },
          });
        },
        title: 'Performance no longer available',
        subtitle: 'Sorry, the performance you are looking for is no longer available.\nPlease return to the Explore page.',
        fromDeepLink: true,
      },
    });
  }
}

function* getEventListLoopWorker(): any {
  while (true) {
    const result = [];
    const isProductionEnv = yield select(isProductionEvironmentSelector);
    try {
      const initialResponse: prismicT.Query<prismicT.PrismicDocument> =
        yield call(getDigitalEventDetails, { isProductionEnv, queryOptions: { fetchLinks: 'digital_event_video.video'} });
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
      getDigitalEventDetails({ queryOptions: { page: i, fetchLinks: 'digital_event_video.video' }, isProductionEnv }),
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
