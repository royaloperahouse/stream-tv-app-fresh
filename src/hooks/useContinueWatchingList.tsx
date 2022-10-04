import { useState, useCallback, useRef, useContext, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import { getListOfUniqueEventId } from '@services/bitMovinPlayer';
import { useAppSelector } from './redux';
import { customerIdSelector } from 'services/store/auth/Selectors';
import { isProductionEvironmentSelector } from 'services/store/settings/Selectors';

import * as Prismic from '@prismicio/client';
import { getVideoDetails } from 'services/prismicApiClient';

export const useContinueWatchingList = (): {
  data: Array<string>;
  ejected: boolean;
} => {
  const customerId = useAppSelector(customerIdSelector);
  const isProduction = useAppSelector(isProductionEvironmentSelector);
  const videoDetailsRetriever = useMemo(
    () => (videoIDs: string[]) =>
      getVideoDetails({
        queryPredicates: [Prismic.Predicates.in('document.id', videoIDs)],
        isProductionEnv: isProduction,
      }),
    [isProduction],
  );

  const ejected = useRef<boolean>(false);
  const [continueWatchingList, setContinueWatchingList] = useState<
    Array<string>
  >([]);
  const mountedRef = useRef<boolean | undefined>(false);
  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;
      if (customerId) {
        getListOfUniqueEventId(customerId, videoDetailsRetriever).then(items => {
          if (mountedRef.current) {
            ejected.current = true;
            setContinueWatchingList(items);
          }
        });
      }
      return () => {
        mountedRef.current = false;
      };
    }, [customerId]),
  );
  return { data: continueWatchingList, ejected: ejected.current };
};
