import Fuse from 'fuse.js';
import { detailEventsSearchOptions } from '@configs/fuseConfig';
import { TEventContainer } from '@services/types/models';
import { myListTitle } from '@configs/myListConfig';
import {
  homePageWhiteList,
  operaAndMusicWhiteList,
  balletAndDanceWhiteList,
  currentRentalsRailTitle,
  availableToRentRailTitle,
} from '@configs/eventListScreensConfig';
import get from 'lodash.get';
import { continueWatchingRailTitle } from '@configs/bitMovinPlayerConfig';
import difference from 'lodash.difference';
import includes from 'lodash.includes';
import type { TRootState } from '../index';

export const digitalEventDetailsSearchSelector = (
  store: TRootState,
): Array<TEventContainer> =>
  new Fuse(
    Object.values(store.events.allDigitalEventsDetail),
    detailEventsSearchOptions,
  )
    .search<any>(`${store.events.searchQueryString}`)
    .map(({ item }) => item);

export const searchQuerySelector = (store: TRootState) =>
  store.events.searchQueryString;

export const digitalEventsForHomePageSelector =
  (myList: Array<string>, continueWatchingList: Array<string>) =>
  (store: TRootState) => {
    const eventGroupsArray = Object.entries<{
      title: string;
      ids: Array<string>;
    }>(store.events.eventGroups).filter(([key]) => key in homePageWhiteList);
    const combinedExploreAllTraysAndPropositionPage: Array<
      [string, { title: string; ids: Array<string> }]
    > = [];
    for (let i = 0; i < store.events.exploreAllTrays.length; i++) {
      if (
        store.events.showOnlyVisisbleEvents &&
        store.events.exploreAllTrays[i].isVisible === false
      ) {
        continue;
      }
      combinedExploreAllTraysAndPropositionPage.push([
        '',
        {
          title: store.events.exploreAllTrays[i].title || '',
          ids: store.events.exploreAllTrays[i].ids,
        },
      ]);
    }
    for (let i = 0; i < store.events.propositionPageElements.length; i++) {
      if (
        store.events.showOnlyVisisbleEvents &&
        store.events.propositionPageElements[i].isVisible === false
      ) {
        continue;
      }

      const existingTitleIndex =
        combinedExploreAllTraysAndPropositionPage.findIndex(
          item =>
            item[1].title === store.events.propositionPageElements[i].title,
        );

      if (existingTitleIndex > -1) {
        console.log();
        const concatenatedIds = [
          ...combinedExploreAllTraysAndPropositionPage[existingTitleIndex][1].ids,
          ...store.events.propositionPageElements[i].ids,
        ];
        combinedExploreAllTraysAndPropositionPage[existingTitleIndex][1].ids = concatenatedIds.filter((item, pos) => concatenatedIds.indexOf(item) === pos);
        continue;
      }
      combinedExploreAllTraysAndPropositionPage.push([
        '',
        {
          title: store.events.propositionPageElements[i].title || '',
          ids: store.events.propositionPageElements[i].ids,
        },
      ]);
    }
    eventGroupsArray.unshift(...combinedExploreAllTraysAndPropositionPage);

    if (eventGroupsArray.length) {
      if (store.auth.fullSubscription) {
        eventGroupsArray.unshift([
          '',
          { title: currentRentalsRailTitle, ids: store.events.ppvEventsIds },
        ]);
        eventGroupsArray.unshift([
          '',
          {
            title: availableToRentRailTitle,
            ids: difference(
              store.events.availablePPVEventsIds,
              store.events.ppvEventsIds,
            ),
          },
        ]);
      }
      eventGroupsArray.unshift(['', { title: myListTitle, ids: myList }]);
      eventGroupsArray.unshift([
        '',
        { title: continueWatchingRailTitle, ids: continueWatchingList },
      ]);
    }

    const eventSections = eventGroupsArray.reduce<
      Array<{
        sectionIndex: number;
        title: string;
        data: Array<TEventContainer>;
      }>
    >((acc, [_, groupInfo], index) => {
      const rail = {
        sectionIndex: index,
        title: groupInfo.title,
        data: groupInfo.ids.reduce<Array<TEventContainer>>((accEvents, id) => {
          if (id in store.events.allDigitalEventsDetail) {
            accEvents.push(store.events.allDigitalEventsDetail[id]);
          }
          return accEvents;
        }, []),
      };
      if (rail.data.length) {
        acc.push(rail);
      }
      return acc;
    }, []);

    return { data: eventSections, eventsLoaded: store.events.eventsLoaded };
  };

export const digitalEventsForMyListScreenSelector =
  (myList: Array<string>) => (store: TRootState) => {
    const eventListForMyList = myList.reduce<Array<TEventContainer>>(
      (acc, id) => {
        if (id in store.events.allDigitalEventsDetail) {
          acc.push(store.events.allDigitalEventsDetail[id]);
        }
        return acc;
      },
      [],
    );
    return eventListForMyList;
  };

export const digitalEventsForBalletAndDanceSelector = (store: TRootState) => {
  const eventGroupsArray = Object.entries<{
    title: string;
    ids: Array<string>;
  }>(store.events.eventGroups).filter(
    ([key]) => key in balletAndDanceWhiteList,
  );

  const balletAndDanceTopTrays: Array<{
    sectionIndex: number;
    title: string;
    data: Array<TEventContainer>;
  }> = [];
  for (let i = 0, j = 0; i < store.events.balletAndDanceTopTrays.length; i++) {
    if (
      store.events.showOnlyVisisbleEvents &&
      store.events.balletAndDanceTopTrays[i].isVisible === false
    ) {
      continue;
    }
    balletAndDanceTopTrays.push({
      title: store.events.balletAndDanceTopTrays[i].title || '',
      data: store.events.balletAndDanceTopTrays[i].ids.reduce(
        (acc: Array<TEventContainer>, id) => {
          if (id in store.events.allDigitalEventsDetail) {
            acc.push(store.events.allDigitalEventsDetail[id]);
          }
          return acc;
        },
        [],
      ),
      sectionIndex: j++,
    });
  }

  let sectionIndex = balletAndDanceTopTrays.length;
  const eventsWithoutSubtags: {
    sectionIndex: number;
    title: string;
    data: Array<TEventContainer>;
  } = {
    sectionIndex,
    title: '',
    data: [],
  };
  const eventSections = Array.from(
    new Set(
      eventGroupsArray.reduce<Array<string>>((acc, [_, groupInfo]) => {
        acc.push(...groupInfo.ids);
        return acc;
      }, []),
    ),
  ).reduce<{
    [key: string]: {
      sectionIndex: number;
      title: string;
      data: Array<TEventContainer>;
    };
  }>((acc, id) => {
    const event = store.events.allDigitalEventsDetail[id];
    const subtags: Array<{ tag: string }> = get(event.data, 'vs_subtags', []);
    if (!subtags.length) {
      eventsWithoutSubtags.data.push(store.events.allDigitalEventsDetail[id]);
      return acc;
    }
    for (let i = 0; i < subtags.length; i++) {
      const subtag = subtags[i].tag;

      if (!subtag) {
        const isIncludes = includes(
          eventsWithoutSubtags.data,
          store.events.allDigitalEventsDetail[id],
        );
        if (!isIncludes) {
          eventsWithoutSubtags.data.push(
            store.events.allDigitalEventsDetail[id],
          );
        }
        continue;
      }

      if (subtag in acc) {
        acc[subtag].data.push(store.events.allDigitalEventsDetail[id]);
      } else {
        acc[subtag] = {
          sectionIndex: sectionIndex++,
          title: subtag,
          data: [store.events.allDigitalEventsDetail[id]],
        };
      }
    }
    return acc;
  }, {});

  const balletAndDanceBottomTrays: Array<{
    sectionIndex: number;
    title: string;
    data: Array<TEventContainer>;
  }> = [];
  for (
    let i = 0,
      j = !eventsWithoutSubtags.data.length ? sectionIndex : sectionIndex + 1;
    i < store.events.balletAndDanceBottomTrays.length;
    i++
  ) {
    if (
      store.events.showOnlyVisisbleEvents &&
      store.events.balletAndDanceBottomTrays[i].isVisible === false
    ) {
      continue;
    }
    balletAndDanceBottomTrays.push({
      title: store.events.balletAndDanceBottomTrays[i].title || '',
      data: store.events.balletAndDanceBottomTrays[i].ids.reduce(
        (acc: Array<TEventContainer>, id) => {
          if (id in store.events.allDigitalEventsDetail) {
            acc.push(store.events.allDigitalEventsDetail[id]);
          }
          return acc;
        },
        [],
      ),
      sectionIndex: ++j,
    });
  }

  if (!eventsWithoutSubtags.data.length) {
    return {
      data: [
        ...balletAndDanceTopTrays,
        ...Object.values(eventSections),
        ...balletAndDanceBottomTrays,
      ],
      eventsLoaded: store.events.eventsLoaded,
    };
  }
  const sections = Object.values(eventSections).map(eventSection => ({
    ...eventSection,
    sectionIndex: ++eventSection.sectionIndex,
  }));
  return {
    data: [
      ...balletAndDanceTopTrays,
      eventsWithoutSubtags,
      ...sections,
      ...balletAndDanceBottomTrays,
    ],
    eventsLoaded: store.events.eventsLoaded,
  };
};

export const digitalEventsForOperaAndMusicSelector = (store: TRootState) => {
  const eventGroupsArray = Object.entries<{
    title: string;
    ids: Array<string>;
  }>(store.events.eventGroups).filter(([key]) => key in operaAndMusicWhiteList);

  const operaAndMusicTopTrays: Array<{
    sectionIndex: number;
    title: string;
    data: Array<TEventContainer>;
  }> = [];
  for (let i = 0, j = 0; i < store.events.operaAndMusicTopTrays.length; i++) {
    if (
      store.events.showOnlyVisisbleEvents &&
      store.events.operaAndMusicTopTrays[i].isVisible === false
    ) {
      continue;
    }
    operaAndMusicTopTrays.push({
      title: store.events.operaAndMusicTopTrays[i].title || '',
      data: store.events.operaAndMusicTopTrays[i].ids.reduce(
        (acc: Array<TEventContainer>, id) => {
          if (id in store.events.allDigitalEventsDetail) {
            acc.push(store.events.allDigitalEventsDetail[id]);
          }
          return acc;
        },
        [],
      ),
      sectionIndex: j++,
    });
  }

  let sectionIndex = operaAndMusicTopTrays.length;
  const eventsWithoutSubtags: {
    sectionIndex: number;
    title: string;
    data: Array<TEventContainer>;
  } = {
    sectionIndex,
    title: '',
    data: [],
  };
  const eventSections = Array.from(
    new Set(
      eventGroupsArray.reduce<Array<string>>((acc, [_, groupInfo]) => {
        acc.push(...groupInfo.ids);
        return acc;
      }, []),
    ),
  ).reduce<{
    [key: string]: {
      sectionIndex: number;
      title: string;
      data: Array<TEventContainer>;
    };
  }>((acc, id) => {
    const event = store.events.allDigitalEventsDetail[id];
    const subtags: Array<{ tag: string }> = get(event.data, 'vs_subtags', []);
    if (!subtags.length) {
      eventsWithoutSubtags.data.push(store.events.allDigitalEventsDetail[id]);
      return acc;
    }
    for (let i = 0; i < subtags.length; i++) {
      const subtag = subtags[i].tag;

      if (!subtag) {
        const isIncludes = includes(
          eventsWithoutSubtags.data,
          store.events.allDigitalEventsDetail[id],
        );

        if (!isIncludes) {
          eventsWithoutSubtags.data.push(
            store.events.allDigitalEventsDetail[id],
          );
        }
        continue;
      }

      if (subtag in acc) {
        acc[subtag].data.push(store.events.allDigitalEventsDetail[id]);
      } else {
        acc[subtag] = {
          sectionIndex: sectionIndex++,
          title: subtag,
          data: [store.events.allDigitalEventsDetail[id]],
        };
      }
    }
    return acc;
  }, {});

  const operaAndMusicBottomTrays: Array<{
    sectionIndex: number;
    title: string;
    data: Array<TEventContainer>;
  }> = [];
  for (
    let i = 0,
      j = !eventsWithoutSubtags.data.length ? sectionIndex : sectionIndex + 1;
    i < store.events.operaAndMusicBottomTrays.length;
    i++
  ) {
    if (
      store.events.showOnlyVisisbleEvents &&
      store.events.operaAndMusicBottomTrays[i].isVisible === false
    ) {
      continue;
    }
    operaAndMusicBottomTrays.push({
      title: store.events.operaAndMusicBottomTrays[i].title || '',
      data: store.events.operaAndMusicBottomTrays[i].ids.reduce(
        (acc: Array<TEventContainer>, id) => {
          if (id in store.events.allDigitalEventsDetail) {
            acc.push(store.events.allDigitalEventsDetail[id]);
          }
          return acc;
        },
        [],
      ),
      sectionIndex: ++j,
    });
  }
  if (!eventsWithoutSubtags.data.length) {
    return {
      data: [
        ...operaAndMusicTopTrays,
        ...Object.values(eventSections),
        ...operaAndMusicBottomTrays,
      ],
      eventsLoaded: store.events.eventsLoaded,
    };
  }
  const sections = Object.values(eventSections).map(eventSection => ({
    ...eventSection,
    sectionIndex: ++eventSection.sectionIndex,
  }));
  return {
    data: [
      ...operaAndMusicTopTrays,
      eventsWithoutSubtags,
      ...sections,
      ...operaAndMusicBottomTrays,
    ],
    eventsLoaded: store.events.eventsLoaded,
  };
};

export const ppvEventsIdsSelector = (store: TRootState) =>
  store.events.ppvEventsIds;

export const availablePPVEventsDateOfUpdateSelector = (store: TRootState) =>
  store.events.availablePPVEventsDateOfUpdate;

export const availblePpvEventsIdsSelector = (store: TRootState) =>
  store.events.availablePPVEventsIds;

export const getEventById = (eventId: string) => (store: TRootState) => ({
  event: store.events.allDigitalEventsDetail[eventId]?.data || {},
  lastPublicationDate:
    store.events.allDigitalEventsDetail[eventId]?.last_publication_date || '',
});

export const showOnlyVisisbleEventsSelector = (store: TRootState) =>
  store.events.showOnlyVisisbleEvents;

export const getEventsLoadedStatusSelector = (store: TRootState) =>
  store.events.eventsLoaded;

export const videoToEventMapSelector =
  (store: TRootState) => (dieseVideoIds: string[]) => {
    const dieseVideoIdPrefixes = dieseVideoIds.flatMap(id => id.split(/\D/)[0]);
    return Object.entries(store.events.allDigitalEventsDetail).reduce<
      Record<string, string>
    >((acc, [eventId, eventDetail]) => {
      if (!eventDetail.data.diese_activity) {
        return acc;
      }

      const { activity_id: dieseId } = eventDetail.data.diese_activity;
      const dieseVideoIdIndex = dieseVideoIdPrefixes.findIndex(
        id => id && id === dieseId.toString(),
      );
      if (dieseVideoIdIndex === -1) {
        return acc;
      }

      const foundDieseVideoId = dieseVideoIds[dieseVideoIdIndex];
      return {
        ...acc,
        [foundDieseVideoId]: eventId,
      };
    }, {});
  };

export const isEventExist = (eventId: string) => (store: TRootState) => {
  console.log(eventId in store.events.allDigitalEventsDetail, 'event in store');
  console.log(!!store.events.allDigitalEventsDetail[eventId]?.data, 'has data');
  return !!(
    eventId in store.events.allDigitalEventsDetail &&
    store.events.allDigitalEventsDetail[eventId]?.data
  );
};
