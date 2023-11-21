import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import { introScreenShowSelector } from '@services/store/auth/Selectors';
import {
  checkDeviceSuccess,
  checkDeviceError,
  updateSubscriptionMode,
  turnOnDeepLinkingFlow,
  turnOffDeepLinkingFlow,
} from '@services/store/auth/Slices';
import { isProductionEvironmentSelector } from '@services/store/settings/Selectors';
import IntroScreen from '@screens/introScreen';
import MainLayout from '@layouts/mainLayout';
import {
  AppState,
  AppStateStatus,
  Platform,
  TVEventControl,
  Linking,
} from 'react-native';
import {
  getEventListLoopStart,
  getEventListLoopStop,
} from '@services/store/events/Slices';
import RNBootSplash from 'react-native-bootsplash';
import { getSubscribeInfo, verifyDevice } from '@services/apiClient';
import { TVEventManager } from '@services/tvRCEventListener';
import { isTVOS } from 'configs/globalConfig';
import formatISO from 'date-fns/formatISO';
import { globalModalManager } from 'components/GlobalModals';
import { ErrorModal } from 'components/GlobalModals/variants';
import ExitApp from 'components/ExitApp';
import { addEventListener } from '@react-native-community/netinfo';

type TAppLayoutProps = {};
const AppLayout: React.FC<TAppLayoutProps> = () => {
  const dispatch = useAppDispatch();
  const appState = useRef(AppState.currentState);
  const showIntroScreen = useAppSelector(introScreenShowSelector);
  const isProductionEnv = useAppSelector(isProductionEvironmentSelector);
  const [networkAvailable, setNetworkAvailable] = useState(true);
  useEffect(() => {
    const regExpPattern = /^rohtvapp:\/\/events\/([^/]+)$/g;
    Linking.getInitialURL().then((url: string | null) => {
      if (url === null) {
        dispatch(turnOffDeepLinkingFlow({ isRegularFlow: true }));
        return;
      }
      if ([...url.matchAll(regExpPattern)]?.[0]?.[1]) {
        const eventId = [...url.matchAll(regExpPattern)][0][1];
        dispatch(
          turnOnDeepLinkingFlow({
            eventId,
          }),
        );
      } else {
        dispatch(
          turnOnDeepLinkingFlow({
            eventId: null,
          }),
        );
      }
    });
    const listnerCB = Linking.addEventListener(
      'url',
      ({ url }: { url: string }) => {
        if ([...url.matchAll(regExpPattern)]?.[0]?.[1]) {
          const eventId = [...url.matchAll(regExpPattern)][0][1];
          dispatch(
            turnOnDeepLinkingFlow({
              eventId,
            }),
          );
        }
      },
    );
    return () => {
      listnerCB.remove();
    };
  }, [dispatch]);
  addEventListener((state) => {
    if (state.isInternetReachable === false) {
      if (networkAvailable) {
        setNetworkAvailable(false);
      }
      RNBootSplash.hide().then(() => {
        globalModalManager.closeModal();
        globalModalManager.openModal({
          contentComponent: ErrorModal,
          contentProps: {
            confirmActionHandler: () => {
              globalModalManager.closeModal(() => {
                ExitApp.exit();
              });
            },
            fromInternetConnection: true,
            title: 'Connection error',
            subtitle: 'There is no internet connection.\nPress the button below to exit the application and check your internet connectivity.',
          },
        });
      });
    }
  });
  useEffect(() => {
    const _handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (isTVOS) {
          TVEventControl.enableTVMenuKey();
        }
        dispatch(getEventListLoopStart());
      }
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
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
  }, [dispatch]);

  useEffect(() => {
    verifyDevice(isProductionEnv)
      .then(response => {
        if (response?.data?.data?.attributes?.customerId) {
          response.data.data.attributes.countryCode = response.headers['x-country-code'];
          dispatch(checkDeviceSuccess(response.data));
          return true;
        } else if (response?.data?.errors?.length) {
          const errObj = response.data.errors[0];
          dispatch(checkDeviceError(errObj));
          return false;
        }
      })
      .then((success: boolean | undefined) => {
        if (success) {
          return getSubscribeInfo(isProductionEnv);
        }
      })
      .then(subscriptionResponse => {
        if (
          subscriptionResponse &&
          subscriptionResponse.status >= 200 &&
          subscriptionResponse.status < 400 &&
          subscriptionResponse?.data?.data?.attributes?.isSubscriptionActive !==
            undefined
        ) {
          dispatch(
            updateSubscriptionMode({
              fullSubscription:
                subscriptionResponse.data.data.attributes.isSubscriptionActive,
              fullSubscriptionUpdateDate: formatISO(new Date()),
            }),
          );
        }
      })
      .catch(console.log)
      .finally(() => {
        TVEventManager.init();
        dispatch(getEventListLoopStart());
      });
  }, [dispatch, isProductionEnv]);

  useLayoutEffect(() => {
    if (Platform.OS === 'android') {
      RNBootSplash.getVisibilityStatus().then(status => {
        if (status !== 'hidden') {
          RNBootSplash.hide({ fade: true });
        }
      });
    }
  });

  useLayoutEffect(() => {
    TVEventManager.init();
    return () => {
      if (isTVOS) {
        TVEventControl.disableTVMenuKey();
      }
      TVEventManager.unmount();
    };
  }, []);

  if (showIntroScreen && networkAvailable) {
    return <IntroScreen />;
  }
  return <MainLayout />;
};

export default AppLayout;
