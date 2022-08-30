import { useLayoutEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

export const useFocusLayoutEffect: (cb: () => any) => void = cb => {
  const focused = useIsFocused();

  useLayoutEffect(() => {
    let subscribe: any;
    if (focused) {
      subscribe = cb();
    }
    return () => {
      if (typeof subscribe === 'function') {
        subscribe();
      }
    };
  }, [focused, cb]);
};
