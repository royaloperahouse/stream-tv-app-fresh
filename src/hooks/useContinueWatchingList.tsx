import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import { getListOfWatchedVideos } from '@services/bitMovinPlayer';
import { useAppSelector } from './redux';
import { customerIdSelector } from 'services/store/auth/Selectors';

export const useContinueWatchingList = (): {
  data: Array<string>;
  ejected: boolean;
} => {
  const customerId = useAppSelector(customerIdSelector);
  const { eventsLoaded } = useAppSelector(state => state.events);

  const createVideoToEventMap = useAppSelector(
    state => (dieseVideoIds: string[]) => {
      const dieseVideoIdPrefixes = dieseVideoIds.flatMap(
        id => id.split(/\D/)[0],
      );
      return Object.entries(state.events.allDigitalEventsDetail).reduce<
        Record<string, string>
      >((acc, detail) => {
        const [eventId, eventDetail] = detail;

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
    },
  );

  const [continueWatchingList, setContinueWatchingList] = useState<
    Array<string>
  >([]);
  const ejected = useRef<boolean>(false);
  const mountedRef = useRef<boolean | undefined>(false);

  useFocusEffect(
    useCallback(
      () => {
        mountedRef.current = true;
        if (customerId && eventsLoaded) {
          getListOfWatchedVideos(customerId).then(items => {
            if (mountedRef.current) {
              ejected.current = true;

              const videoToEventMap = createVideoToEventMap(items);
              setContinueWatchingList(
                items.flatMap(videoId =>
                  videoToEventMap[videoId] ? [videoToEventMap[videoId]] : [],
                ),
              );
            }
          });
        }
        return () => {
          mountedRef.current = false;
        };
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [customerId, eventsLoaded],
    ),
  );

  return { data: continueWatchingList, ejected: ejected.current };
};
