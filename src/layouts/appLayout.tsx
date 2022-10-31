import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import {
  introScreenShowSelector,
  deviceAuthenticatedSelector,
  deviceAuthenticatedInfoLoadedSelector,
} from '@services/store/auth/Selectors';
import {
  checkDeviceSuccess,
  checkDeviceError,
} from '@services/store/auth/Slices';
import { isProductionEvironmentSelector } from '@services/store/settings/Selectors';
import IntroScreen from '@screens/introScreen';
import LoginScreen from '@screens/loginScreen';
import MainLayout from '@layouts/mainLayout';
import LoginWithoutQRCodeScreen from '@screens/LoginWithoutQRCodeScreen';
import {
  AppState,
  AppStateStatus,
  Platform,
  TVEventControl,
} from 'react-native';
import {
  getEventListLoopStart,
  getEventListLoopStop,
} from '@services/store/events/Slices';
import RNBootSplash from 'react-native-bootsplash';
import { verifyDevice } from '@services/apiClient';
import { useFeature } from 'flagged';
import { TVEventManager } from '@services/tvRCEventListener';
import { isTVOS } from 'configs/globalConfig';

type TAppLayoutProps = {};
const AppLayout: React.FC<TAppLayoutProps> = () => {
  const dispatch = useAppDispatch();
  const appState = useRef(AppState.currentState);
  const showIntroScreen = useAppSelector(introScreenShowSelector);
  const isAuthenticated = useAppSelector(deviceAuthenticatedSelector);
  const deviceAuthInfoLoaded = useAppSelector(
    deviceAuthenticatedInfoLoadedSelector,
  );
  const isProductionEnv = useAppSelector(isProductionEvironmentSelector);
  const hasQRCode = useFeature('hasQRCode');
  useEffect(() => {
    const _handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isAuthenticated
      ) {
        if (isTVOS) {
          TVEventControl.enableTVMenuKey();
        }
        dispatch(getEventListLoopStart());
      }
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/) &&
        isAuthenticated
      ) {
        if (isTVOS) {
          TVEventControl.disableTVMenuKey();
        }
        dispatch(getEventListLoopStop());
      }
      appState.current = nextAppState;
    };
    const unsubscribe = AppState.addEventListener(
      'change',
      _handleAppStateChange,
    );

    return unsubscribe.remove;
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getEventListLoopStart());
    }
  }, [isAuthenticated, dispatch]);

  useLayoutEffect(() => {
    // we need to setup splashscreen for tvOS(iOS)
    if (Platform.OS === 'android') {
      RNBootSplash.getVisibilityStatus().then(status => {
        if (status !== 'hidden') {
          RNBootSplash.hide({ fade: true });
        }
      });
    }
  });

  useEffect(() => {
    if (!deviceAuthInfoLoaded) {
      verifyDevice(isProductionEnv).then(response => {
        if (response?.data?.data?.attributes?.customerId) {
          dispatch(getEventListLoopStart());
          dispatch(checkDeviceSuccess(response.data));
          TVEventManager.init();
        } else if (response?.data?.errors?.length) {
          const errObj = response.data.errors[0];
          dispatch(checkDeviceError(errObj));
        }
      });
    }
  }, [deviceAuthInfoLoaded, dispatch, isProductionEnv]);

  useLayoutEffect(
    () => () => {
      if (isTVOS) {
        TVEventControl.disableTVMenuKey();
      }
      TVEventManager.unmount();
    },
    [],
  );

  if (
    !deviceAuthInfoLoaded ||
    (deviceAuthInfoLoaded && !isAuthenticated && showIntroScreen)
  ) {
    return <IntroScreen />;
  }
  if (!isAuthenticated) {
    return hasQRCode ? <LoginScreen /> : <LoginWithoutQRCodeScreen />;
  }
  return <MainLayout />;
};

export default AppLayout;
