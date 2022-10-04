import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
  useImperativeHandle,
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
import { customerIdSelector } from '@services/store/auth/Selectors';
import { isProductionEvironmentSelector } from '@services/store/settings/Selectors';
import type {
  TEventDetailsScreensProps,
  NSNavigationScreensNames,
  TEventDetailsScreensParamContextProps,
} from '@configs/screensConfig';
import GoDown from '../commonControls/GoDown';
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
import { buildInfoForBitmovin } from '@configs/globalConfig';
import { getVideoDetails } from 'services/prismicApiClient';
import * as Prismic from '@prismicio/client';

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
    title,
    shortDescription,
    snapshotImageUrl,
    vs_guidance,
    vs_guidance_details,
    nextSectionTitle,
    nextScreenName,
    trailerInfo,
    performanceInfo,
    eventId,
    performanceVideoTimePosition,
    setPerformanceVideoTimePosition,
    videoQualityBitrate,
    videoQualityId,
  } = params;
  const isFocused = useIsFocused();
  const [closeCountDown, setCloseCountDown] = useState(false);

  const showCountDownTimer =
    publishingDate &&
    isFocused &&
    !closeCountDown &&
    isValid(new Date(publishingDate)) &&
    isAfter(new Date(publishingDate), new Date());
  const performanceVideoInFocus = useRef<
    { pressingHandler: () => void } | null | undefined
  >(null);
  const trailerVideoInFocus = useRef<
    { pressingHandler: () => void } | null | undefined
  >(null);
  const generalMountedRef = useRef<boolean | undefined>(false);
  const addOrRemoveBusyRef = useRef<boolean>(true);
  const watchNowButtonRef = useRef<TActionButtonListRef>(null);
  const customerId = useAppSelector(customerIdSelector);
  const isProductionEnv = useAppSelector(isProductionEvironmentSelector);
  const [existInMyList, setExistInMyList] = useState<boolean>(false);

  const closeModal = useCallback((ref, clearLoadingState: any) => {
    if (typeof ref?.current?.setNativeProps === 'function') {
      ref.current.setNativeProps({
        hasTVPreferredFocus: true,
      });
    }
    goBackButtonuManager.showGoBackButton();
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
      }) =>
      async (error: TBMPlayerErrorObject | null, time: string) => {
        if (typeof savePositionCB === 'function') {
          await savePositionCB({ time, videoId, eventId });
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
    [closeModal],
  );

  const openPlayer = useCallback(
    ({
      url,
      poster = '',
      offset = '0.0',
      title: playerTitle = '',
      subtitle = '',
      onClose = () => {},
      analytics = {},
      guidance = '',
      guidanceDetails = [],
      videoQualityBitrate = -1,
      showVideoInfo,
    }) => {
      goBackButtonuManager.hideGoBackButton();
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
        },
      });
    },
    [],
  );

  const savePositionCB = useCallback(
    async ({ time, videoId, eventId }) => {
      const floatTime = parseFloat(time);
      if (!customerId) {
        return;
      }
      const videoDetails = await getVideoDetails({
        queryPredicates: [Prismic.predicate.in('document.id', [videoId])],
        isProductionEnv,
      });
      const dieseVideoId = videoDetails.results.map(
        detail => detail.data.video.video_key,
      )[0];

      if (isNaN(floatTime) || floatTime < minResumeTime) {
        if (dieseVideoId) {
          await removeBitMovinSavedPositionByIdAndEventId(
            customerId,
            dieseVideoId,
            eventId,
          );
        }
        setPerformanceVideoTimePosition('');
      } else {
        if (dieseVideoId) {
          await savePosition(customerId, {
            id: dieseVideoId,
            position: time,
            eventId,
          });
        }
        setPerformanceVideoTimePosition(time);
      }
    },
    [customerId, setPerformanceVideoTimePosition, isProductionEnv],
  );

  const getPerformanceVideoUrl = useCallback(
    async (
      ref?: React.RefObject<TouchableHighlight>,
      clearLoadingState?: () => void,
    ) => {
      try {
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
          isProductionEnv,
        );
        if (!manifestInfo?.data?.data?.attributes?.hlsManifestUrl) {
          throw new Error('Something went wrong');
        }
        const videoTitle = videoFromPrismic.title || title || '';

        if (performanceVideoTimePosition) {
          const fromTime = new Date(0);
          const intPosition = parseInt(performanceVideoTimePosition);
          const rolledBackPos = intPosition - resumeRollbackTime;
          fromTime.setSeconds(intPosition);
          globalModalManager.openModal({
            contentComponent: СontinueWatchingModal,
            contentProps: {
              confirmActionHandler: () => {
                openPlayer({
                  url: manifestInfo.data.data.attributes.hlsManifestUrl,
                  poster:
                    'https://actualites.music-opera.com/wp-content/uploads/2019/09/14OPENING-superJumbo.jpg',
                  offset: rolledBackPos.toString(),
                  title: videoTitle,
                  analytics: {
                    videoId: videoFromPrismic.videoId,
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
                    ref,
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
                  poster:
                    'https://actualites.music-opera.com/wp-content/uploads/2019/09/14OPENING-superJumbo.jpg',
                  title: videoTitle,
                  onClose: closePlayer({
                    savePositionCB,
                    videoId: videoFromPrismic.videoId,
                    eventId: videoFromPrismic.eventId,
                    clearLoadingState,
                    ref,
                  }),
                  analytics: {
                    videoId: videoFromPrismic.videoId,
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
              fromTime: fromTime.toISOString().substr(11, 8),
            },
          });
          return;
        }
        openPlayer({
          url: manifestInfo.data.data.attributes.hlsManifestUrl,
          poster:
            'https://actualites.music-opera.com/wp-content/uploads/2019/09/14OPENING-superJumbo.jpg',
          title: videoTitle,
          onClose: closePlayer({
            savePositionCB,
            videoId: videoFromPrismic.videoId,
            eventId: videoFromPrismic.eventId,
            clearLoadingState,
            ref,
          }),
          analytics: {
            videoId: videoFromPrismic.videoId,
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
    ],
  );

  const getTrailerVideoUrl = useCallback(
    async (
      ref?: React.RefObject<TouchableHighlight>,
      clearLoadingState?: () => void,
    ) => {
      try {
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
            videoId: trailerInfo.videoId,
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

  const addOrRemoveItemIdFromMyListHandler = () => {
    if (addOrRemoveBusyRef.current) {
      return;
    }
    addOrRemoveBusyRef.current = true;
    const myListAction = existInMyList ? removeIdFromMyList : addToMyList;

    if (!customerId) {
      return;
    }

    myListAction(customerId, eventId, () => {
      hasMyListItem(customerId, eventId)
        .then(isExist => {
          if (generalMountedRef.current) {
            setExistInMyList(isExist);
          }
        })
        .finally(() => {
          if (generalMountedRef.current) {
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

  const goDownCB = useCallback(
    () => navigation.replace(nextScreenName),
    [navigation, nextScreenName],
  );
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
      hasTVPreferredFocus: !performanceInfo || showCountDownTimer,
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
      if (customerId) {
        hasMyListItem(customerId, eventId)
          .then(isExist => setExistInMyList(isExist))
          .finally(() => {
            addOrRemoveBusyRef.current = false;
          });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eventId],
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

  return (
    <View style={styles.generalContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.descriptionContainer}>
          <OverflowingContainer
            fixedHeight
            contentMaxVisibleHeight={scaleSize(368)}>
            <RohText style={styles.title} numberOfLines={2}>
              {title?.toUpperCase?.() || ''}
            </RohText>
            <RohText style={styles.description}>{shortDescription}</RohText>
            {vs_guidance ? (
              <RohText style={styles.description}>{vs_guidance}</RohText>
            ) : null}
            {vs_guidance_details.length ? (
              <RohText style={styles.description}>
                {vs_guidance_details}
              </RohText>
            ) : null}
          </OverflowingContainer>
          {showCountDownTimer ? (
            <CountDown
              publishingDate={publishingDate}
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
            />
          </View>
        </View>
        {nextSectionTitle && nextScreenName ? (
          <View style={styles.downContainer}>
            <GoDown text={nextSectionTitle} onFocus={goDownCB} />
          </View>
        ) : null}
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
  contentContainer: {
    width: scaleSize(785),
    height: '100%',
  },
  descriptionContainer: {
    flex: 1,
    marginTop: scaleSize(230),
    marginRight: scaleSize(130),
    width: scaleSize(615),
  },
  downContainer: {
    marginBottom: scaleSize(50),
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
    marginTop: scaleSize(24),
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
    marginTop: scaleSize(50),
  },
  guidanceContainer: {},
  guidanceSubTitle: {
    fontSize: scaleSize(26),
    color: Colors.defaultTextColor,
  },
});

export default General;
