import { useState, useRef, useLayoutEffect } from 'react';
import { getListOfWatchedVideos } from '@services/bitMovinPlayer';
import { useAppSelector } from './redux';
import { customerIdSelector } from 'services/store/auth/Selectors';
import {
  getEventsLoadedStatusSelector,
  videoToEventMapSelector,
} from 'services/store/events/Selectors';
import { isProductionEvironmentSelector } from 'services/store/settings/Selectors';

export const useContinueWatchingList = (): {
  data: Array<string>;
  ejected: boolean;
} => {
  const customerId = useAppSelector(customerIdSelector);
  const eventsLoaded = useAppSelector(getEventsLoadedStatusSelector);
  const isProductionEnv = useAppSelector(isProductionEvironmentSelector);

  const createVideoToEventMap = useAppSelector(videoToEventMapSelector);

  const [continueWatchingList, setContinueWatchingList] = useState<
    Array<string>
  >([]);
  const ejected = useRef<boolean>(false);
  const mountedRef = useRef<boolean | undefined>(false);

  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useLayoutEffect(
    () => {
      if (customerId && eventsLoaded) {
        getListOfWatchedVideos(customerId, isProductionEnv).then(items => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customerId, eventsLoaded, isProductionEnv],
  );

  return { data: continueWatchingList, ejected: ejected.current };
};
