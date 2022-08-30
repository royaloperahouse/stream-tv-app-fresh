import React, { createContext, useState, useCallback, useMemo } from 'react';
import { TouchableHighlight } from 'react-native';
export type TNavMenuNodesRefsContextValue = {
  navMenuNodesRefs: {
    [key: string]: React.RefObject<TouchableHighlight>;
  };
  exitOfAppButtonRef: React.RefObject<TouchableHighlight> | null;
  setNavMenuNodesRefs: (obj: {
    [key: string]: React.RefObject<TouchableHighlight>;
  }) => void;
  setExitOfAppButtonRef: (ref: React.RefObject<TouchableHighlight>) => void;
  isFirstRun: boolean;
  setIsFirstRun: (isFirstRun: boolean) => void;
};
const Context = createContext<TNavMenuNodesRefsContextValue>({} as any);
type TNavMenuNodesRefsProviderProps = {
  children: React.ReactElement;
};
export const NavMenuNodesRefsContext = Context;
export const NavMenuNodesRefsProvider: React.FC<
  TNavMenuNodesRefsProviderProps
> = ({ children }) => {
  const [isInit, setIsInit] = useState<boolean>(true);
  const [nodesRefsMapping, setNodesRefsMapping] = useState<
    TNavMenuNodesRefsContextValue['navMenuNodesRefs']
  >({});
  const [exitOfAppButtonRef, setExitOfAppButtonRefCB] =
    useState<TNavMenuNodesRefsContextValue['exitOfAppButtonRef']>(null);
  const setNavMenuNodesRefs = useCallback<
    TNavMenuNodesRefsContextValue['setNavMenuNodesRefs']
  >(obj => {
    setNodesRefsMapping(obj);
  }, []);
  const setExitOfAppButtonRef = useCallback<
    TNavMenuNodesRefsContextValue['setExitOfAppButtonRef']
  >(ref => {
    setExitOfAppButtonRefCB(ref);
  }, []);
  const setIsFirstRun = useCallback<
    TNavMenuNodesRefsContextValue['setIsFirstRun']
  >(isFirstRun => {
    setIsInit(isFirstRun);
  }, []);
  const ctx = useMemo<TNavMenuNodesRefsContextValue>(
    () => ({
      isFirstRun: isInit,
      setNavMenuNodesRefs,
      setExitOfAppButtonRef,
      navMenuNodesRefs: nodesRefsMapping,
      exitOfAppButtonRef,
      setIsFirstRun,
    }),
    [
      isInit,
      setIsFirstRun,
      setNavMenuNodesRefs,
      nodesRefsMapping,
      exitOfAppButtonRef,
      setExitOfAppButtonRef,
    ],
  );
  return <Context.Provider value={ctx}>{children}</Context.Provider>;
};
