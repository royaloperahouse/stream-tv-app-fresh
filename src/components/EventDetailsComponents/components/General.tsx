import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
  useContext,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  HWEvent,
  TouchableHighlight,
} from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import FastImage from 'react-native-fast-image';
import Watch from '@assets/svg/eventDetails/Watch.svg';
import AddToMyList from '@assets/svg/eventDetails/AddToMyList.svg';
import Trailer from '@assets/svg/eventDetails/Trailer.svg';
import ActionButtonList, {
  TActionButtonListRef,
} from '../commonControls/ActionButtonList';

import {
  hasMyListItem,
  removeIdFromMyList,
  addToMyList,
} from '@services/myList';

import {
  NonSubscribedStatusError,
  NotRentedItemError,
  UnableToCheckRentalStatusError,
} from '@utils/customErrors';
import { fetchVideoURL, getAccessToWatchVideo } from '@services/apiClient';
import {
  resumeRollbackTime,
  minResumeTime,
} from '@configs/bitMovinPlayerConfig';
import { TVEventManager } from '@services/tvRCEventListener';
import { promiseWait } from '@utils/promiseWait';
import isAfter from 'date-fns/isAfter';
import isValid from 'date-fns/isValid';
import CountDown from '@components/EventDetailsComponents/commonControls/CountDown';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { Colors } from '@themes/Styleguide';
import { OverflowingContainer } from '@components/OverflowingContainer';
import { useAppSelector } from 'hooks/redux';
import {
  customerIdSelector,
  deviceAuthenticatedSelector,
} from '@services/store/auth/Selectors';
import { isProductionEvironmentSelector } from '@services/store/settings/Selectors';
import type {
  TEventDetailsScreensProps,
  NSNavigationScreensNames,
  TEventDetailsScreensParamContextProps,
} from '@configs/screensConfig';
import GoDown, { TGoDownRef } from '../commonControls/GoDown';
import GoUp from '../commonControls/GoUp';
import { SectionsParamsContext } from '@components/EventDetailsComponents/commonControls/SectionsParamsContext';
import { globalModalManager } from '@components/GlobalModals';
import {
  СontinueWatchingModal,
  PlayerModal,
  ErrorModal,
  NotSubscribedModal,
  RentalStateStatusModal,
} from '@components/GlobalModals/variants';
import { goBackButtonuManager } from '@components/GoBack';
import { TBMPlayerErrorObject } from '@services/types/bitmovinPlayer';
import {
  removeBitMovinSavedPositionByIdAndEventId,
  savePosition,
} from '@services/bitMovinPlayer';
import RohImage from 'components/RohImage';
import { buildInfoForBitmovin, isTVOS } from '@configs/globalConfig';
import { DummyPlayerScreenName } from '@components/Player/DummyPlayerScreen';
import { navMenuManager } from 'components/NavMenu';
import { navigate } from 'navigations/navigationContainer';
import { contentScreenNames, rootStackScreensNames } from '@configs/screensConfig';
import { formatDate } from 'utils/formatDate';
import { AnalyticsEventTypes, storeEvents } from 'utils/storeEvents';

const General: React.FC<
  TEventDetailsScreensProps<
    NSNavigationScreensNames.EventDetailsStackScreens['general']
  >
> = ({ route, navigation }) => {
  const params =
    useContext<Partial<TEventDetailsScreensParamContextProps>>(
      SectionsParamsContext,
    )[route.name] || {};
  const {
    publishingDate,
    availableFrom,
    duration,
    title,
    shortDescription,
    snapshotImageUrl,
    vs_guidance,
    vs_guidance_details,
    nextSectionTitle,
    nextScreenName,
    prevScreenName,
    trailerInfo,
    performanceInfo,
    eventId,
    performanceVideoTimePosition,
    setPerformanceVideoTimePositionCB,
    videoQualityBitrate,
    videoQualityId,
    isComingSoon,
  } = params;
  const moveToSettings = useContext(SectionsParamsContext)['moveToSettings'];
  const isFocused = useIsFocused();
  const [closeCountDown, setCloseCountDown] = useState(false);
  const goDownRef = useRef<TGoDownRef>(null);
  const timezoneOffset = new Date().getTimezoneOffset();
  const startDateReactNative = performanceInfo
    ? performanceInfo.startDate
      ? new Date(
          parseInt(performanceInfo.startDate.slice(0, 4), 10),
          parseInt(performanceInfo.startDate.slice(5, 7), 10) - 1,
          parseInt(performanceInfo.startDate.slice(8, 10), 10),
          parseInt(performanceInfo.startDate.slice(11, 13), 10) -
            timezoneOffset / 60,
          parseInt(performanceInfo.startDate.slice(14, 16), 10),
          parseInt(performanceInfo.startDate.slice(17, 19), 10),
          0,
        )
      : 0
    : 0;
  const showCountDownTimer = performanceInfo
    ? performanceInfo.startDate &&
      isFocused &&
      !closeCountDown &&
      isValid(new Date(startDateReactNative)) &&
      isAfter(new Date(startDateReactNative), new Date())
    : false;
  const performanceVideoInFocus = useRef<
    { pressingHandler: () => void } | null | undefined
  >(null);
  const trailerVideoInFocus = useRef<
    { pressingHandler: () => void } | null | undefined
  >(null);
  const generalMountedRef = useRef<boolean | undefined>(false);
  const addOrRemoveBusyRef = useRef<boolean>(true);
  const playTrailer = useRef<boolean>(params.playTrailer);
  const watchNowButtonRef = useRef<TActionButtonListRef>(null);
  const customerId = useAppSelector(customerIdSelector);
  const isProductionEnv = useAppSelector(isProductionEvironmentSelector);
  const isAuthenticated = useAppSelector(deviceAuthenticatedSelector);
  const [existInMyList, setExistInMyList] = useState<boolean>(false);

  let formattedDate: string;
  let availableFromReactNative = new Date(0);

  if (availableFrom) {
    availableFromReactNative = new Date(
      parseInt(availableFrom.slice(0, 4), 10),
      parseInt(availableFrom.slice(5, 7), 10) - 1,
      parseInt(availableFrom.slice(8, 10), 10),
      parseInt(availableFrom.slice(11, 13), 10) - timezoneOffset / 60,
      parseInt(availableFrom.slice(14, 16), 10),
      parseInt(availableFrom.slice(17, 19), 10),
      0,
    );
    formattedDate = formatDate(new Date(availableFromReactNative));
  }

  const closeModal = useCallback((ref, clearLoadingState: any) => {
    if (typeof ref?.current?.setNativeProps === 'function') {
      ref.current.setNativeProps({
        hasTVPreferredFocus: true,
        accessible: true,
      });
    }
    setTimeout(() => goBackButtonuManager.showGoBackButton(), 500);
    if (typeof clearLoadingState === 'function') {
      clearLoadingState();
    }
  }, []);

  const closePlayer = useCallback(
    ({
        savePositionCB,
        videoId,
        eventId,
        ref,
        clearLoadingState,
        closeModalCB = closeModal,
        dieseVideoId,
        isProductionEnv,
      }: any) =>
      async (error: TBMPlayerErrorObject | null, time: string) => {
        if (typeof savePositionCB === 'function' && error === null) {
          savePositionCB({
            time,
            videoId,
            eventId,
            dieseVideoId,
            isProductionEnv,
          });
        }
        if (isTVOS) {
          navigation.goBack();
        }
        if (error) {
          globalModalManager.openModal({
            contentComponent: ErrorModal,
            contentProps: {
              confirmActionHandler: () => {
                globalModalManager.closeModal(() => {
                  if (typeof closeModalCB === 'function') {
                    closeModalCB(ref, clearLoadingState);
                  }
                });
              },
              title: 'Player Error',
              subtitle: `Something went wrong.\n${error.errCode}: ${
                error.errMessage
              }\n${error.url || ''}`,
            },
          });
        } else {
          globalModalManager.closeModal(() => {
            if (typeof closeModalCB === 'function') {
              closeModalCB(ref, clearLoadingState);
            }
          });
        }
      },
    [closeModal, navigation],
  );

  const openPlayer = useCallback(
    ({
      url,
      poster = '',
      offset,
      title: playerTitle = '',
      subtitle = '',
      onClose = () => {},
      analytics = {},
      guidance = '',
      guidanceDetails = [],
      videoQualityBitrate = -1,
      showVideoInfo,
      startDate,
      endDate,
      isLiveStream,
    }) => {
      goBackButtonuManager.hideGoBackButton();
      if (isTVOS) {
        navigation.push(DummyPlayerScreenName);
      }
      globalModalManager.openModal({
        contentComponent: PlayerModal,
        contentProps: {
          autoPlay: true,
          configuration: {
            url,
            poster,
            offset,
          },
          title: playerTitle,
          subtitle,
          onClose,
          analytics,
          guidance,
          guidanceDetails,
          videoQualityBitrate,
          showVideoInfo,
          isLiveStream,
          startDate,
          endDate,
        },
      });
    },
    [navigation],
  );

  const savePositionCB = useCallback(
    async ({ time, videoId, eventId, dieseVideoId, isProductionEnv }) => {
      const floatTime = parseFloat(time);
      if (!customerId) {
        return;
      }

      if (isNaN(floatTime) || floatTime < minResumeTime) {
        removeBitMovinSavedPositionByIdAndEventId(
          customerId,
          dieseVideoId,
          eventId,
          isProductionEnv,
          () => setPerformanceVideoTimePositionCB(''),
        );
      } else {
        savePosition(
          customerId,
          {
            id: dieseVideoId,
            position: time,
            eventId,
          },
          isProductionEnv,
          () => setPerformanceVideoTimePositionCB(time),
        );
      }
    },
    [customerId, setPerformanceVideoTimePositionCB],
  );

  const getPerformanceVideoUrl = useCallback(
    async (
      ref?: React.RefObject<TouchableHighlight>,
      clearLoadingState?: () => void,
    ) => {
      storeEvents({
        event_type: AnalyticsEventTypes.OPTION_CLICK,
        event_data: {
          performance_id: params.eventId,
          option_name: 'Watch now',
        },
      }).then(() => {});
      try {
        if (!isAuthenticated) {
          moveToSettings();
          navMenuManager.unwrapNavMenu();
          return;
        }
        const videoFromPrismic = await promiseWait(
          getAccessToWatchVideo(
            performanceInfo,
            isProductionEnv,
            customerId,
            () => {
              globalModalManager.openModal({
                contentComponent: RentalStateStatusModal,
                contentProps: {
                  title: performanceInfo.title || title || '',
                },
              });
            },
          ),
        );

        const manifestInfo = await fetchVideoURL(
          videoFromPrismic.videoId,
          isProductionEnv, // set to false if on staging
        );
        if (!manifestInfo?.data?.data?.attributes?.hlsManifestUrl) {
          throw new Error('Something went wrong');
        }
        const videoTitle = videoFromPrismic.title || title || '';

        if (performanceVideoTimePosition) {
          const fromTime = new Date(0);
          const intPosition = parseInt(performanceVideoTimePosition);
          let rolledBackPos = intPosition - resumeRollbackTime;
          if (performanceInfo.startDate && !performanceInfo.endDate) {
            rolledBackPos = 0;
          }
          fromTime.setSeconds(intPosition);
          goBackButtonuManager.hideGoBackButton();
          globalModalManager.openModal({
            contentComponent: СontinueWatchingModal,
            contentProps: {
              confirmActionHandler: () => {
                openPlayer({
                  url: manifestInfo.data.data.attributes.hlsManifestUrl,
                  isLiveStream: performanceInfo.isLiveStream,
                  startDate: performanceInfo.startDate,
                  endDate: performanceInfo.endDate,
                  poster:
                    'https://actualites.music-opera.com/wp-content/uploads/2019/09/14OPENING-superJumbo.jpg',
                  offset: performanceInfo.isLiveStream
                    ? '0'
                    : rolledBackPos.toString(),
                  title: videoTitle,
                  analytics: {
                    videoId: videoFromPrismic.dieseId
                      ? videoFromPrismic.dieseId.replace('_', '-')
                      : '',
                    title: videoTitle,
                    buildInfoForBitmovin,
                    customData3: videoQualityId,
                    userId: customerId ? String(customerId) : null,
                  },
                  onClose: closePlayer({
                    savePositionCB,
                    videoId: videoFromPrismic.videoId,
                    eventId: videoFromPrismic.eventId,
                    clearLoadingState,
                    dieseVideoId: videoFromPrismic.dieseId,
                    ref,
                    isProductionEnv,
                  }),
                  guidance: vs_guidance,
                  guidanceDetails: vs_guidance_details,
                  videoQualityBitrate,
                  showVideoInfo: !isProductionEnv,
                });
              },
              rejectActionHandler: () => {
                openPlayer({
                  url: manifestInfo.data.data.attributes.hlsManifestUrl,
                  isLiveStream: performanceInfo.isLiveStream,
                  offset: performanceInfo.isLiveStream ? undefined : '0.0',
                  startDate: performanceInfo.startDate,
                  endDate: performanceInfo.endDate,
                  poster:
                    'https://actualites.music-opera.com/wp-content/uploads/2019/09/14OPENING-superJumbo.jpg',
                  title: videoTitle,
                  onClose: closePlayer({
                    savePositionCB,
                    videoId: videoFromPrismic.videoId,
                    eventId: videoFromPrismic.eventId,
                    clearLoadingState,
                    dieseVideoId: videoFromPrismic.dieseId,
                    ref,
                    isProductionEnv,
                  }),
                  analytics: {
                    videoId: videoFromPrismic.dieseId ? videoFromPrismic.dieseId.replace('_', '-') : '',
                    title: videoTitle,
                    buildInfoForBitmovin,
                    customData3: videoQualityId,
                    userId: customerId ? String(customerId) : null,
                  },
                  guidance: vs_guidance,
                  guidanceDetails: vs_guidance_details,
                  videoQualityBitrate,
                  showVideoInfo: !isProductionEnv,
                });
              },
              cancelActionHandler: () => {
                globalModalManager.closeModal(() => {
                  closeModal(ref, clearLoadingState);
                });
              },
              videoTitle: videoTitle,
              isLiveStream: performanceInfo.isLiveStream,
              fromTime: fromTime.toISOString().substr(11, 8),
            },
          });
          return;
        }
        if (performanceInfo.isLiveStream) {
          globalModalManager.openModal({
            contentComponent: СontinueWatchingModal,
            contentProps: {
              confirmActionHandler: () => {
                openPlayer({
                  url: manifestInfo.data.data.attributes.hlsManifestUrl,
                  isLiveStream: performanceInfo.isLiveStream,
                  startDate: performanceInfo.startDate,
                  endDate: performanceInfo.endDate,
                  poster:
                    'https://actualites.music-opera.com/wp-content/uploads/2019/09/14OPENING-superJumbo.jpg',
                  title: videoTitle,
                  analytics: {
                    videoId: videoFromPrismic.dieseId
                      ? videoFromPrismic.dieseId.replace('_', '-')
                      : '',
                    title: videoTitle,
                    buildInfoForBitmovin,
                    customData3: videoQualityId,
                    userId: customerId ? String(customerId) : null,
                  },
                  onClose: closePlayer({
                    savePositionCB,
                    videoId: videoFromPrismic.videoId,
                    eventId: videoFromPrismic.eventId,
                    clearLoadingState,
                    dieseVideoId: videoFromPrismic.dieseId,
                    ref,
                    isProductionEnv,
                  }),
                  offset: '0',
                  guidance: vs_guidance,
                  guidanceDetails: vs_guidance_details,
                  videoQualityBitrate,
                  showVideoInfo: !isProductionEnv,
                });
              },
              rejectActionHandler: () => {
                openPlayer({
                  url: manifestInfo.data.data.attributes.hlsManifestUrl,
                  isLiveStream: performanceInfo.isLiveStream,
                  startDate: performanceInfo.startDate,
                  endDate: performanceInfo.endDate,
                  poster:
                    'https://actualites.music-opera.com/wp-content/uploads/2019/09/14OPENING-superJumbo.jpg',
                  title: videoTitle,
                  onClose: closePlayer({
                    savePositionCB,
                    videoId: videoFromPrismic.videoId,
                    eventId: videoFromPrismic.eventId,
                    clearLoadingState,
                    dieseVideoId: videoFromPrismic.dieseId,
                    ref,
                    isProductionEnv,
                  }),
                  analytics: {
                    videoId: videoFromPrismic.dieseId ? videoFromPrismic.dieseId.replace('_', '-') : '',
                    title: videoTitle,
                    buildInfoForBitmovin,
                    customData3: videoQualityId,
                    userId: customerId ? String(customerId) : null,
                  },
                  guidance: vs_guidance,
                  guidanceDetails: vs_guidance_details,
                  videoQualityBitrate,
                  showVideoInfo: !isProductionEnv,
                  offset: undefined,
                });
              },
              cancelActionHandler: () => {
                globalModalManager.closeModal(() => {
                  closeModal(ref, clearLoadingState);
                });
              },
              videoTitle: videoTitle,
              isLiveStream: performanceInfo.isLiveStream,
            },
          });
          return;
        }
        openPlayer({
          url: manifestInfo.data.data.attributes.hlsManifestUrl,
          isLiveStream: performanceInfo.isLiveStream,
          startDate: performanceInfo.startDate,
          endDate: performanceInfo.endDate,
          poster:
            'https://actualites.music-opera.com/wp-content/uploads/2019/09/14OPENING-superJumbo.jpg',
          title: videoTitle,
          onClose: closePlayer({
            savePositionCB,
            videoId: videoFromPrismic.videoId,
            eventId: videoFromPrismic.eventId,
            clearLoadingState,
            ref,
            dieseVideoId: videoFromPrismic.dieseId,
            isProductionEnv,
          }),
          analytics: {
            videoId: videoFromPrismic.dieseId ? videoFromPrismic.dieseId.replace('_', '-') : '',
            title: videoTitle,
            buildInfoForBitmovin,
            customData3: videoQualityId,
            userId: customerId ? String(customerId) : null,
          },
          guidance: vs_guidance,
          guidanceDetails: vs_guidance_details,
          videoQualityBitrate,
          showVideoInfo: !isProductionEnv,
        });
      } catch (err: any) {
        globalModalManager.openModal({
          contentComponent:
            err instanceof NonSubscribedStatusError
              ? NotSubscribedModal
              : ErrorModal,
          contentProps: {
            confirmActionHandler: () => {
              globalModalManager.closeModal(() => {
                closeModal(ref, clearLoadingState);
              });
              navMenuManager.showNavMenu();
              navigate(rootStackScreensNames.content, {
                screen: contentScreenNames.home,
                params: {
                  fromErrorModal: true,
                },
              });
            },
            title:
              err instanceof NonSubscribedStatusError ||
              err instanceof NotRentedItemError ||
              err instanceof UnableToCheckRentalStatusError
                ? err.message
                : 'Player Error',
            subtitle:
              err instanceof NonSubscribedStatusError ||
              err instanceof NotRentedItemError ||
              err instanceof UnableToCheckRentalStatusError
                ? undefined
                : err.message,
          },
        });
      } finally {
        if (typeof clearLoadingState === 'function') {
          clearLoadingState();
        }
      }
    },
    [
      closeModal,
      closePlayer,
      customerId,
      isProductionEnv,
      openPlayer,
      performanceInfo,
      savePositionCB,
      title,
      vs_guidance,
      vs_guidance_details,
      performanceVideoTimePosition,
      videoQualityBitrate,
      videoQualityId,
      isAuthenticated,
      moveToSettings,
    ],
  );

  const getTrailerVideoUrl = useCallback(
    async (
      ref?: React.RefObject<TouchableHighlight>,
      clearLoadingState?: () => void,
    ) => {
      try {
        storeEvents({
          event_type: AnalyticsEventTypes.OPTION_CLICK,
          event_data: {
            performance_id: params.eventId,
            option_name: 'Watch trailer',
          },
        }).then(() => {});
        const manifestInfo = await fetchVideoURL(
          trailerInfo.videoId,
          isProductionEnv,
        );
        if (!manifestInfo?.data?.data?.attributes?.hlsManifestUrl) {
          throw new Error('Something went wrong');
        }
        const videoTitle = trailerInfo.title || title || '';
        openPlayer({
          url: manifestInfo.data.data.attributes.hlsManifestUrl,
          poster:
            'https://actualites.music-opera.com/wp-content/uploads/2019/09/14OPENING-superJumbo.jpg',
          title: videoTitle,
          onClose: closePlayer({
            eventId: trailerInfo.eventId,
            clearLoadingState,
            ref,
          }),
          analytics: {
            videoId: trailerInfo.dieseVideoId.replace('_', '-'),
            title: videoTitle,
            buildInfoForBitmovin,
            customData3: videoQualityId,
            userId: customerId ? String(customerId) : null,
          },
          videoQualityBitrate,
          showVideoInfo: !isProductionEnv,
        });
      } catch (err: any) {
        globalModalManager.openModal({
          contentComponent: ErrorModal,
          contentProps: {
            confirmActionHandler: () => {
              globalModalManager.closeModal(() => {
                closeModal(ref, clearLoadingState);
              });
            },
            title: 'Player Error',
            subtitle: err.message,
          },
        });
      } finally {
        if (typeof clearLoadingState === 'function') {
          clearLoadingState();
        }
      }
    },
    [
      closeModal,
      closePlayer,
      isProductionEnv,
      openPlayer,
      title,
      trailerInfo,
      videoQualityBitrate,
      videoQualityId,
      customerId,
    ],
  );

  const addOrRemoveItemIdFromMyListHandler = (
    _: React.RefObject<TouchableHighlight>,
    clearLoadingState: () => void,
  ) => {
    storeEvents({
      event_type: AnalyticsEventTypes.OPTION_CLICK,
      event_data: {
        performance_id: params.eventId,
        option_name: 'Add to my list',
      },
    }).then(() => {});
    if (!isAuthenticated) {
      moveToSettings();
      navMenuManager.unwrapNavMenu();
      return;
    }
    if (addOrRemoveBusyRef.current) {
      return;
    }
    addOrRemoveBusyRef.current = true;
    const myListAction = existInMyList ? removeIdFromMyList : addToMyList;

    if (!customerId) {
      addOrRemoveBusyRef.current = false;
      clearLoadingState();
      return;
    }

    myListAction(customerId, eventId, isProductionEnv, () => {
      hasMyListItem(customerId, eventId, isProductionEnv)
        .then(isExist => {
          if (generalMountedRef.current) {
            setExistInMyList(isExist);
          }
        })
        .catch(console.log)
        .finally(() => {
          if (generalMountedRef.current) {
            clearLoadingState();
            addOrRemoveBusyRef.current = false;
          }
        });
    });
  };

  const setPerformanceVideoInFocus = useCallback(
    (pressingHandler: () => void) => {
      performanceVideoInFocus.current = { pressingHandler };
    },
    [],
  );
  const setTrailerVideoInFocus = useCallback((pressingHandler: () => void) => {
    trailerVideoInFocus.current = { pressingHandler };
  }, []);

  const setPerformanceVideoBlur = useCallback(() => {
    performanceVideoInFocus.current = null;
  }, []);
  const setTrailerVideoBlur = useCallback(() => {
    trailerVideoInFocus.current = null;
  }, []);

  const [showGoUpOrDownButtons, setShowGoUpOrDownButtons] =
    useState<boolean>(false);
  const setAccessibleOnForGD = useCallback(() => {
    goDownRef.current?.setAccessibleOn?.();
  }, []);
  const setAccessibleOffForGD = useCallback(() => {
    goDownRef.current?.setAccessibleOff?.();
  }, []);
  const setOffUp = useCallback(() => {
    setShowGoUpOrDownButtons(false);
  }, []);
  const setOnUp = useCallback(() => {
    setShowGoUpOrDownButtons(true);
  }, [])
  const goDownCB = useCallback(
    () => navigation.replace(nextScreenName),
    [navigation, nextScreenName],
  );
  const goUpCB = useCallback(() => {
    navigation.replace(prevScreenName);
  }, [navigation, prevScreenName]);
  const actionButtonList = [
    {
      key: 'WatchNow',
      text: performanceVideoTimePosition ? 'Continue watching' : 'Watch now',
      hasTVPreferredFocus: true,
      onPress: getPerformanceVideoUrl,
      onFocus: setPerformanceVideoInFocus,
      onBlur: setPerformanceVideoBlur,
      Icon: Watch,
      showLoader: true,
      freezeButtonAfterPressing: true,
    },
    {
      key: 'AddToMyList',
      text: (existInMyList ? 'Remove from' : 'Add to') + ' my list',
      onPress: addOrRemoveItemIdFromMyListHandler,
      Icon: AddToMyList,
      hasTVPreferredFocus: !performanceInfo || showCountDownTimer || isAfter(availableFromReactNative, new Date()),
      showLoader: true,
    },
    {
      key: 'WatchTrailer',
      text: 'Watch trailer',
      onPress: getTrailerVideoUrl,
      onFocus: setTrailerVideoInFocus,
      onBlur: setTrailerVideoBlur,
      showLoader: true,
      freezeButtonAfterPressing: true,
      Icon: Trailer,
    },
  ].filter(item => {
    if (
      isAfter(availableFromReactNative, new Date()) &&
      item.key === 'WatchNow'
    ) {
      return false;
    }
    if (isComingSoon && item.key === 'WatchNow') {
      return false;
    }
    if ((!performanceInfo || showCountDownTimer) && item.key === 'WatchNow') {
      return false;
    }
    if (!trailerInfo && item.key === 'WatchTrailer') {
      return false;
    }
    return true;
  });

  useLayoutEffect(() => {
    generalMountedRef.current = true;
    return () => {
      if (generalMountedRef.current) {
        generalMountedRef.current = false;
      }
    };
  }, []);

  useEffect(
    () => {
      hasMyListItem(customerId, eventId, isProductionEnv)
        .then(setExistInMyList)
        .catch(console.log)
        .finally(() => {
          addOrRemoveBusyRef.current = false;
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eventId, customerId, isProductionEnv],
  );

  useFocusEffect(
    useCallback(() => {
      const cb = (eve: HWEvent) => {
        if (eve?.eventType !== 'playPause') {
          return;
        }
        if (
          typeof performanceVideoInFocus?.current?.pressingHandler ===
          'function'
        ) {
          performanceVideoInFocus.current.pressingHandler();
        } else if (
          typeof trailerVideoInFocus?.current?.pressingHandler === 'function'
        ) {
          trailerVideoInFocus.current.pressingHandler();
        }
      };
      TVEventManager.addEventListener(cb);
      return () => {
        TVEventManager.removeEventListener(cb);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (isTVOS) {
        setTimeout(() => {
          watchNowButtonRef.current?.focusOnFirstAvalibleButton?.();
        }, 500);
      }
    }, []),
  );

  if (playTrailer.current) {
    playTrailer.current = false;
    getTrailerVideoUrl();
  }

  return (
    <View style={styles.generalContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.upContainer}>
          {(prevScreenName && !isTVOS) ||
          (prevScreenName && isTVOS && showGoUpOrDownButtons) ? (
              <GoUp onFocus={goUpCB} />
          ) : null}
        </View>
        <View style={styles.descriptionContainer}>
          <OverflowingContainer
            fixedHeight={false}
            contentMaxVisibleHeight={scaleSize(1000)}>
            <View style={styles.titleContainer}>
              <RohText style={styles.title} numberOfLines={isTVOS ? 4 : 3}>
                {title?.toUpperCase() || ''}
              </RohText>
            </View>
            <RohText style={styles.description} numberOfLines={vs_guidance ? 6 : 8}>{shortDescription}</RohText>
            {vs_guidance ? (
              <RohText style={styles.description}>{vs_guidance}</RohText>
            ) : null}
            {vs_guidance_details.length ? (
              <RohText style={styles.description}>
                {vs_guidance_details}
              </RohText>
            ) : null}
            {isAfter(availableFromReactNative, new Date()) ? (
              <RohText style={styles.description}>
                {`AVAILABLE FROM ${formattedDate.toUpperCase()}`}
              </RohText>
            ) : null}
            {!availableFrom && !isComingSoon && !!duration ? (
              <RohText style={styles.description}>{duration}</RohText>
            ) : null}
            {isComingSoon ? <RohText style={styles.description}>COMING SOON</RohText> : null}
          </OverflowingContainer>
          {showCountDownTimer ? (
            <CountDown
              publishingDate={startDateReactNative}
              finishCB={() => {
                setCloseCountDown(true);
              }}
            />
          ) : null}
          <View style={styles.buttonsContainer}>
            <ActionButtonList
              ref={watchNowButtonRef}
              setFocusRef={() => {}}
              buttonList={actionButtonList}
              goDownOn={setAccessibleOnForGD}
              goDownOff={setAccessibleOffForGD}
              goUpOff={setOffUp}
              goUpOn={setOnUp}
              backButtonOn={goBackButtonuManager.setAccessibleGoBackButton}
              backButtonOff={goBackButtonuManager.setUnAccessibleGoBackButton}
            />
          </View>
        </View>
        <View style={styles.downContainer}>
          {nextSectionTitle && nextScreenName ? (
            <GoDown
              text={nextSectionTitle}
              onFocus={goDownCB}
              ref={goDownRef}
              accessibleDef={false}
            />
          ) : null}
        </View>
      </View>
      <View style={styles.snapshotContainer}>
        <RohImage
          resizeMode={FastImage.resizeMode.cover}
          style={styles.snapshotContainer}
          source={snapshotImageUrl}
          isPortrait={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  generalContainer: {
    height: Dimensions.get('window').height,
    width: '100%',
    flexDirection: 'row',
  },
  upContainer: {
    height: scaleSize(10),
  },
  contentContainer: {
    width: scaleSize(785),
    height: '100%',
  },
  descriptionContainer: {
    flex: 1,
    marginTop: scaleSize(isTVOS ? 80 : 190),
    marginRight: scaleSize(130),
    width: scaleSize(615),
  },
  downContainer: {
    marginBottom: scaleSize(50),
    height: scaleSize(50),
  },
  snapshotContainer: {
    width: scaleSize(975),
    height: Dimensions.get('window').height,
    zIndex: 0,
  },
  pageTitle: {
    color: 'white',
    fontSize: scaleSize(22),
    textTransform: 'uppercase',
  },
  title: {
    color: 'white',
    fontSize: scaleSize(48),
    marginBottom: scaleSize(24),
    textTransform: 'uppercase',
  },
  ellipsis: {
    color: 'white',
    fontSize: scaleSize(22),
    textTransform: 'uppercase',
  },
  description: {
    color: 'white',
    fontSize: scaleSize(22),
    marginTop: scaleSize(12),
    overflow: 'hidden',
  },
  info: {
    color: 'white',
    fontSize: scaleSize(20),
    textTransform: 'uppercase',
    marginTop: scaleSize(24),
  },
  buttonsContainer: {
    width: '100%',
    height: scaleSize(272),
    marginTop: scaleSize(40),
  },
  guidanceContainer: {},
  guidanceSubTitle: {
    fontSize: scaleSize(26),
    color: Colors.defaultTextColor,
  },
  titleContainer: isTVOS
    ? {
        justifyContent: 'flex-end',
        minHeight: 300,
      }
    : {},
});

export default General;
