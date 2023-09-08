import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Dimensions, StyleSheet, TouchableHighlight, View } from 'react-native';
import GoBack, { goBackButtonuManager } from 'components/GoBack';
import LoadingSpinner from 'components/LoadingSpinner';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import {
  getEventListLoopStart,
  getEventListLoopStop,
} from 'services/store/events/Slices';
import { buildInfoForBitmovin, isTVOS } from 'configs/globalConfig';
import {
  contentScreenNames,
  NSNavigationScreensNames,
  TContentScreensProps,
} from 'configs/screensConfig';
import RohText from 'components/RohText';
import { OverflowingContainer } from 'components/OverflowingContainer';
import { scaleSize } from 'utils/scaleSize';
import ActionButtonList, {
  TActionButtonListRef,
} from 'components/EventDetailsComponents/commonControls/ActionButtonList';
import RohImage from 'components/RohImage';
import FastImage from 'react-native-fast-image';
import { Colors } from 'themes/Styleguide';
import { getVideoDetails } from 'services/prismicApiClient';
import * as Prismic from '@prismicio/client';
import Watch from 'assets/svg/eventDetails/Watch.svg';
import { useFocusEffect } from '@react-navigation/native';
import {
  customerIdSelector,
  deviceAuthenticatedSelector,
} from 'services/store/auth/Selectors';
import { TBMPlayerErrorObject } from 'services/types/bitmovinPlayer';
import { globalModalManager } from 'components/GlobalModals';
import {
  ErrorModal,
  NotSubscribedModal,
  PlayerModal,
  RentalStateStatusModal,
} from 'components/GlobalModals/variants';
import { navMenuManager } from 'components/NavMenu';
import { promiseWait } from 'utils/promiseWait';
import { fetchVideoURL, getAccessToWatchVideo } from 'services/apiClient';
import { playerBitratesFilter } from 'configs/bitMovinPlayerConfig';
import {
  NonSubscribedStatusError,
  NotRentedItemError,
  UnableToCheckRentalStatusError,
} from 'utils/customErrors';
import { isProductionEvironmentSelector } from 'services/store/settings/Selectors';
import { getSelectedBitrateId } from 'services/bitMovinPlayer';
import transformVideoDuration from 'utils/transformVideoDuration';

const EventVideoScreen: React.FC<
  TContentScreensProps<
    NSNavigationScreensNames.ContentStackScreens['eventVideo']
  >
> = ({route, navigation}) => {
  const { videoId } = route.params;
  const [videoDetails, setVideoDetails] = useState<any | null>(null);
  const dispatch = useAppDispatch();
  const watchNowButtonRef = useRef<TActionButtonListRef>(null);
  const eventDetailsScreenMounted = useRef<boolean>(false);
  const isAuthenticated = useAppSelector(deviceAuthenticatedSelector);
  const customerId = useAppSelector(customerIdSelector);
  const isProductionEnv = useAppSelector(isProductionEvironmentSelector);
  const performanceVideoInFocus = useRef<
    { pressingHandler: () => void } | null | undefined
  >(null);

  const setPerformanceVideoInFocus = useCallback(
    (pressingHandler: () => void) => {
      performanceVideoInFocus.current = { pressingHandler };
    },
    [],
  );

  const setPerformanceVideoBlur = useCallback(() => {
    performanceVideoInFocus.current = null;
  }, []);

  const closeModal = useCallback((ref: any, clearLoadingState: any) => {
    if (typeof ref?.current?.setNativeProps === 'function') {
      ref.current.setNativeProps({
        hasTVPreferredFocus: true,
        accessible: true,
      });
    }
    goBackButtonuManager.showGoBackButton();
    if (typeof clearLoadingState === 'function') {
      clearLoadingState();
    }
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const response = await getVideoDetails({
        queryPredicates: [Prismic.predicate.in('document.id', [videoId])],
        isProductionEnv: true,
      });
      const videoQualityId = await getSelectedBitrateId();
      const videoQualityBitrate: number =
        playerBitratesFilter[videoQualityId].value;
      setVideoDetails({
        ...response.results[0].data,
        videoQualityId,
        videoQualityBitrate,
      });
    };
    fetch();
  }, [videoId]);

  useEffect(() => {
    dispatch(getEventListLoopStop());
    return () => {
      dispatch(getEventListLoopStart());
    };
  }, [dispatch]);

  useLayoutEffect(() => {
    eventDetailsScreenMounted.current = true;
    return () => {
      if (eventDetailsScreenMounted?.current) {
        eventDetailsScreenMounted.current = false;
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isTVOS) {
        setTimeout(() => {
          watchNowButtonRef.current?.focusOnFirstAvalibleButton?.();
        }, 500);
      }
    }, []),
  );

  const closePlayer = useCallback(
    ({ ref, clearLoadingState, closeModalCB = closeModal }: any) =>
      async (error: TBMPlayerErrorObject | null) => {
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

  const getPerformanceVideoUrl = useCallback(
    async (
      ref?: React.RefObject<TouchableHighlight>,
      clearLoadingState?: () => void,
    ) => {
      const moveToSettings = () => {
        navigation.navigate(contentScreenNames.settings, { pinPage: true });
      };
      try {
        if (!isAuthenticated) {
          moveToSettings();
          navMenuManager.unwrapNavMenu();
          return;
        }
        const performanceInfo = {
          videoId,
          eventId: '',
          title: videoDetails.video_title[0].text,
        };
        const videoFromPrismic = await promiseWait(
          getAccessToWatchVideo(
            performanceInfo,
            isProductionEnv,
            customerId,
            () => {
              globalModalManager.openModal({
                contentComponent: RentalStateStatusModal,
                contentProps: {
                  title:
                    performanceInfo.title ||
                    videoDetails.video_title[0].text ||
                    '',
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
        const videoTitle =
          videoFromPrismic.title || videoDetails.video_title[0].text || '';

        openPlayer({
          url: manifestInfo.data.data.attributes.hlsManifestUrl,
          poster:
            'https://actualites.music-opera.com/wp-content/uploads/2019/09/14OPENING-superJumbo.jpg',
          title: videoTitle,
          onClose: closePlayer({
            clearLoadingState,
            ref,
          }),
          analytics: {
            videoId: videoFromPrismic.videoId,
            title: videoTitle,
            buildInfoForBitmovin,
            customData3: videoDetails.videoQualityId,
            userId: customerId ? String(customerId) : null,
          },
          guidance: '',
          guidanceDetails: undefined,
          videoQualityBitrate: videoDetails.videoQualityBitrate,
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
      videoId,
      closeModal,
      closePlayer,
      customerId,
      isProductionEnv,
      openPlayer,
      videoDetails,
      isAuthenticated,
      navigation,
    ],
  );

  const actionButtonList = [
    {
      key: 'WatchNow',
      text: 'Watch now',
      hasTVPreferredFocus: true,
      onPress: getPerformanceVideoUrl,
      onFocus: setPerformanceVideoInFocus,
      onBlur: setPerformanceVideoBlur,
      Icon: Watch,
      showLoader: true,
      freezeButtonAfterPressing: true,
    },
  ];

  if (!videoDetails) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner showSpinner={true} />
      </View>
    );
  }

  const isComingSoon = videoDetails.video_card_label === 'Coming soon';

  return (
    <View style={styles.rootContainer}>
      <GoBack />
      <View style={styles.generalContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.descriptionContainer}>
            <OverflowingContainer
              fixedHeight={false}
              contentMaxVisibleHeight={scaleSize(460)}>
              <RohText style={styles.title}>
                {videoDetails.video_title[0].text.toUpperCase() || ''}
              </RohText>
              {videoDetails.extra_video_type ? (
                <RohText style={styles.tags}>
                  {videoDetails.extra_video_type.toUpperCase()}
                </RohText>
              ) : null}
              {videoDetails.short_description.length ? (
                <RohText style={styles.description}>
                  {videoDetails.short_description[0].text}
                </RohText>
              ) : null}
              {isComingSoon ? (
                <RohText style={styles.tags}>COMING SOON</RohText>
              ) : videoDetails.video.duration ? (
                <RohText style={styles.tags}>
                  {`${transformVideoDuration(videoDetails.video.duration)}`}
                </RohText>
              ) : null}
            </OverflowingContainer>
            {!isComingSoon ? (
              <View style={styles.buttonsContainer}>
                <ActionButtonList
                  ref={watchNowButtonRef}
                  buttonList={actionButtonList}
                  goDownOn={() => {}}
                  goDownOff={() => {}}
                  backButtonOn={goBackButtonuManager.setAccessibleGoBackButton}
                  backButtonOff={
                    goBackButtonuManager.setUnAccessibleGoBackButton
                  }
                />
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.snapshotContainer}>
          <RohImage
            resizeMode={FastImage.resizeMode.cover}
            style={styles.snapshotContainer}
            source={videoDetails.preview_image.url}
            isPortrait={true}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    flexDirection: 'row',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    marginTop: scaleSize(350),
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
    color: Colors.defaultTextColor,
    fontSize: scaleSize(22),
    marginTop: scaleSize(24),
    overflow: 'hidden',
  },
  tags: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(22),
    marginTop: scaleSize(12),
    overflow: 'hidden',
  },
  info: {
    color: Colors.defaultTextColor,
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
});

export default EventVideoScreen;
