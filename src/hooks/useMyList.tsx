import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import { getMyList } from '@services/myList';
import { useAppSelector } from './redux';
import { customerIdSelector } from 'services/store/auth/Selectors';

export const useMyList = (): { data: Array<string>; ejected: boolean } => {
  const customerId = useAppSelector(customerIdSelector);

  const ejected = useRef<boolean>(false);
  const [myList, setMyList] = useState<Array<string>>([]);
  const mountedRef = useRef<boolean | undefined>(false);
  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;
      if (customerId) {
        getMyList(customerId).then(items => {
          if (mountedRef && mountedRef.current) {
            ejected.current = true;
            setMyList(items);
          }
        });
      }
      return () => {
        if (mountedRef && mountedRef.current) {
          mountedRef.current = false;
        }
      };
    }, [customerId]),
  );
  return { data: myList, ejected: ejected.current };
};
