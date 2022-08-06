import React, { memo } from 'react';
import {
  NavigationContainer,
  CommonActions,
  StackActions,
  DefaultTheme,
  Route,
  createNavigationContainerRef,
} from '@react-navigation/native';
import type {
  TRootStackScreensParamList,
  TContentScreenReverseNames,
} from '@configs/screensConfig';
const navigationRef =
  createNavigationContainerRef<TRootStackScreensParamList>();
const customTheme: typeof DefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};
type TROHNavigationContainerProps = {
  children: any;
  onReady?: () => void;
};
const ROHNavigationContainer: React.FC<TROHNavigationContainerProps> = ({
  children,
  onReady = () => {},
}) => {
  return (
    <NavigationContainer
      onReady={onReady}
      theme={customTheme}
      ref={navigationRef}>
      {children}
    </NavigationContainer>
  );
};

export function navigate(
  name: keyof TRootStackScreensParamList,
  params: { [key: string]: any; screen?: TContentScreenReverseNames },
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.navigate({ name, params }));
  }
}

export function push(
  name: keyof TRootStackScreensParamList,
  params: { [key: string]: any; screen?: TContentScreenReverseNames },
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

export function resetStackCacheAndNavigate(
  routesProps: Array<{
    name: keyof TRootStackScreensParamList;
    params?: { [key: string]: any; screen?: TContentScreenReverseNames };
  }>,
  stateIndex: number = 0,
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        routes: routesProps,
        index: stateIndex,
      }),
    );
  }
}

export function getCurrentRoute():
  | Route<string, object | undefined>
  | undefined {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
}

export default memo(ROHNavigationContainer);
