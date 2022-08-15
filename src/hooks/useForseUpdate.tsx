import { useState, useCallback } from 'react';
export const useForseUpdate: () => () => void = () => {
  const result = useState<boolean>(false)[1];
  const forseUpdate = useCallback(() => {
    result(prevState => !prevState);
  }, [result]);
  return forseUpdate;
};
