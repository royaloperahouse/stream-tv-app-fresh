import React, { createContext } from 'react';
import type { TEventDetailsScreensParamContextProps } from '@configs/screensConfig';

export const SectionsParamsContext = createContext<
  Partial<TEventDetailsScreensParamContextProps>
>({} as any);

export const SectionsParamsComtextProvider: React.FC<{
  params: Partial<TEventDetailsScreensParamContextProps>;
  children: JSX.Element[] | JSX.Element;
}> = ({ children, params }) => {
  return (
    <SectionsParamsContext.Provider value={params}>
      {children}
    </SectionsParamsContext.Provider>
  );
};
