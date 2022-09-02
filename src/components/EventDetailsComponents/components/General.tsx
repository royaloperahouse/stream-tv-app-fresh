import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
  useImperativeHandle,
  useContext,
} from 'react';
import { View, StyleSheet, Dimensions, HWEvent } from 'react-native';
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

//import { globalModalManager } from '@components/GlobalModal';
/* import {
  NonSubscribedModeAlert,
  СontinueWatchingModal,
  ErrorModal,
  RentalStateStatusModal,
} from '@components/GlobalModal/variants'; */
import {
  NonSubscribedStatusError,
  NotRentedItemError,
  UnableToCheckRentalStatusError,
} from '@utils/customErrors';
import Prismic from '@prismicio/client';
import { fetchVideoURL, getAccessToWatchVideo } from '@services/apiClient';
import { getVideoDetails } from '@services/prismicApiClient';
import { getBitMovinSavedPosition } from '@services/bitMovinPlayer';
import {
  resumeRollbackTime,
  minResumeTime,
} from '@configs/bitMovinPlayerConfig';
import { TVEventManager } from '@services/tvRCEventListener';
import { promiseWait } from '@utils/promiseWait';
import { needSubscribedModeInfoUpdateSelector } from '@services/store/auth/Selectors';
import isAfter from 'date-fns/isAfter';
import isValid from 'date-fns/isValid';
import CountDown from '@components/EventDetailsComponents/commonControls/CountDown';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { Colors } from '@themes/Styleguide';
import { OverflowingContainer } from '@components/OverflowingContainer';
import { useAppSelector } from 'hooks/redux';
import { customerIdSelector } from '@services/store/auth/Selectors';
import { isProductionEvironmentSelector } from '@services/store/settings/Selectors';
import {
  removeBitMovinSavedPositionByIdAndEventId,
  savePosition,
} from '@services/bitMovinPlayer';
import type {
  TEventDetailsScreensProps,
  NSNavigationScreensNames,
  TEventDetailsScreensParamContextProps,
} from '@configs/screensConfig';
import GoDown from '../commonControls/GoDown';
import { SectionsParamsContext } from '@components/EventDetailsComponents/commonControls/SectionsParamsContext';
import GoBack, { goBackButtonuManager } from '@components/GoBack';
import { useFocusLayoutEffect } from '@hooks/useFocusLayoutEffect';
import RohImage from 'components/RohImage';
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
  } = params;
  const isFocused = useIsFocused();
  const [closeCountDown, setCloseCountDown] = useState(false);

  const showCountDownTimer =
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

  const [showContinueWatching, setShowContinueWatching] =
    useState<boolean>(false);

  const setContinueWatching = useCallback(async () => {
    if (!performanceInfo) {
      return;
    }
    try {
      const videoFromPrismic = await getAccessToWatchVideo(
        performanceInfo,
        isProductionEnv,
        customerId,
      );

      const videoPositionInfo = await getBitMovinSavedPosition(
        videoFromPrismic.videoId,
        videoFromPrismic.eventId,
      );
      if (!generalMountedRef.current) {
        return;
      }

      setShowContinueWatching(videoPositionInfo !== null);
    } catch (err: any) {
      if (!generalMountedRef.current) {
        return;
      }
      setShowContinueWatching(false);
    }
  }, [performanceInfo, customerId, isProductionEnv]);

  const savePositionCB = useCallback(async ({ time, videoId, eventId }) => {
    const floatTime = parseFloat(time);
    if (isNaN(floatTime) || floatTime < minResumeTime) {
      await removeBitMovinSavedPositionByIdAndEventId(videoId, eventId);
    } else {
      await savePosition({
        id: videoId,
        position: time,
        eventId,
      });
    }
  }, []);

  const getPerformanceVideoUrl = useCallback(() => {}, []);
  /* const getPerformanceVideoUrl = useCallback(
      async (
        ref?: RefObject<TouchableHighlight>,
        clearLoadingState?: () => void,
      ) => {
        try {
          if (!videos.length) {
            throw new Error('Something went wrong');
          }
          if (needSubscribedModeInfoUpdate) {
            globalModalManager.openModal({
              contentComponent: RentalStateStatusModal,
              contentProps: {
                title,
              },
            });
          }

          const videoFromPrismic = needSubscribedModeInfoUpdate
            ? await promiseWait(
                getAccessToWatchVideo(
                  getVideoDetails({
                    queryPredicates: [
                      Prismic.predicates.any('document.id', videos),
                    ],
                  }),
                ),
              )
            : (
                await getVideoDetails({
                  queryPredicates: [
                    Prismic.predicates.any('document.id', videos),
                  ],
                })
              ).results.find(
                (prismicResponseResult: any) =>
                  prismicResponseResult.data?.video?.video_type ===
                  'performance',
              );

          const manifestInfo = await fetchVideoURL(videoFromPrismic.id);
          if (!manifestInfo?.data?.data?.attributes?.hlsManifestUrl) {
            throw new Error('Something went wrong');
          }
          const videoPositionInfo = await getBitMovinSavedPosition(
            videoFromPrismic.id,
            event.id,
          );
          const videoTitle =
            videoFromPrismic.data?.video_title[0]?.text || title || '';
          if (videoPositionInfo && videoPositionInfo?.position) {
            const fromTime = new Date(0);
            const intPosition = parseInt(videoPositionInfo.position);
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
                    onClose: closePlayer({
                      savePositionCB,
                      videoId: videoFromPrismic.id,
                      eventId: event.id,
                      clearLoadingState,
                      ref,
                    }),
                    analytics: {
                      videoId: videoFromPrismic.id,
                      title: videoTitle,
                    },
                    guidance: vs_guidance,
                    guidanceDetails: vs_guidance_details,
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
                      videoId: videoFromPrismic.id,
                      eventId: event.id,
                      clearLoadingState,
                      ref,
                    }),
                    analytics: {
                      videoId: videoFromPrismic.id,
                      title: videoTitle,
                    },
                    guidance: vs_guidance,
                    guidanceDetails: vs_guidance_details,
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
              videoId: videoFromPrismic.id,
              eventId: event.id,
              clearLoadingState,
              ref,
            }),
            analytics: {
              videoId: videoFromPrismic.id,
              title: videoTitle,
            },
            guidance: vs_guidance,
            guidanceDetails: vs_guidance_details,
          });
        } catch (err: any) {
          globalModalManager.openModal({
            contentComponent:
              err instanceof NonSubscribedStatusError
                ? NonSubscribedModeAlert
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
        }
      },
      [
        closePlayer,
        event.id,
        needSubscribedModeInfoUpdate,
        openPlayer,
        title,
        videos,
        vs_guidance,
        vs_guidance_details,
        savePositionCB,
        closeModal,
      ],
    ); */
  const getTrailerVideoUrl = useCallback(() => {}, []);
  /* const getTrailerVideoUrl = async (
      ref?: RefObject<TouchableHighlight>,
      clearLoadingState?: () => void,
    ) => {
      try {
        if (!videos.length) {
          throw new Error('Something went wrong');
        }
        const prismicResponse = await getVideoDetails({
          queryPredicates: [Prismic.predicates.any('document.id', videos)],
        });

        const videoFromPrismic = prismicResponse.results.find(
          prismicResponseResult =>
            prismicResponseResult.data?.video?.video_type === 'trailer',
        );
        if (videoFromPrismic === undefined) {
          throw new Error('Something went wrong');
        }
        const manifestInfo = await fetchVideoURL(videoFromPrismic.id);
        if (!manifestInfo?.data?.data?.attributes?.hlsManifestUrl) {
          throw new Error('Something went wrong');
        }
        const videoTitle =
          videoFromPrismic.data?.video_title[0]?.text || title || '';
        openPlayer({
          url: manifestInfo.data.data.attributes.hlsManifestUrl,
          poster:
            'https://actualites.music-opera.com/wp-content/uploads/2019/09/14OPENING-superJumbo.jpg',
          title: videoTitle,
          onClose: closePlayer({
            eventId: event.id,
            clearLoadingState,
            ref,
          }),
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
      }
    }; */

  const addOrRemoveItemIdFromMyListHandler = () => {
    if (addOrRemoveBusyRef.current) {
      return;
    }
    addOrRemoveBusyRef.current = true;
    (existInMyList ? removeIdFromMyList : addToMyList)(eventId, () => {
      hasMyListItem(eventId)
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
      text: showContinueWatching ? 'Continue watching' : 'Watch now',
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

  useFocusEffect(
    useCallback(() => {
      setContinueWatching();
    }, [setContinueWatching]),
  );

  useEffect(() => {
    hasMyListItem(eventId)
      .then(isExist => setExistInMyList(isExist))
      .finally(() => {
        addOrRemoveBusyRef.current = false;
      });
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      const cb = (eve: HWEvent) => {
        if (eve?.eventType !== 'playPause' || eve.eventKeyAction === 0) {
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
              {title.toUpperCase()}
            </RohText>
            <RohText style={styles.description}>{shortDescription}</RohText>
            {Boolean(vs_guidance) && (
              <RohText style={styles.description}>{vs_guidance}</RohText>
            )}
            {vs_guidance_details.length ? (
              <RohText style={styles.description}>
                {vs_guidance_details}
              </RohText>
            ) : null}
          </OverflowingContainer>
          {showCountDownTimer && (
            <CountDown
              publishingDate={publishingDate}
              finishCB={() => {
                setCloseCountDown(true);
              }}
            />
          )}
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
