import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import { getListOfUniqueEventId } from '@services/bitMovinPlayer';
import { useAppSelector } from './redux';
import { customerIdSelector } from 'services/store/auth/Selectors';

export const useContinueWatchingList = (): {
  data: Array<string>;
  ejected: boolean;
} => {
  const customerId = useAppSelector(customerIdSelector);

  const ejected = useRef<boolean>(false);
  const [continueWatchingList, setContinueWatchingList] = useState<
    Array<string>
  >([]);
  const mountedRef = useRef<boolean | undefined>(false);
  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;
      if (customerId) {
        getListOfUniqueEventId(customerId).then(items => {
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
