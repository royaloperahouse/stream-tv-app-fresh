import React, {
  useEffect,
  useRef,
  createRef,
  useCallback,
  useContext,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableHighlight,
  HWEvent,
} from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import GoDown from '../commonControls/GoDown';
import GoUp from '@components/EventDetailsComponents/commonControls/GoUp';
import { Colors } from '@themes/Styleguide';
import ExtrasInfoBlock, {
  TExtrasInfoBlockRef,
} from '../commonControls/ExtrasInfoBlock';
import ExtrasVideoButton from '@components/EventDetailsComponents/commonControls/ExtrasVideoButton';
import { fetchVideoURL } from '@services/apiClient';
import { goBackButtonuManager } from '@components/GoBack';
import ScrollingPagination, {
  TScrolingPaginationRef,
} from '@components/ScrollingPagination';
import { globalModalManager } from '@components/GlobalModals';
import { ErrorModal, PlayerModal } from '@components/GlobalModals/variants';
import { useFocusEffect } from '@react-navigation/native';
import { TVEventManager } from '@services/tvRCEventListener';
import type {
  TEventDetailsScreensProps,
  NSNavigationScreensNames,
  TEventDetailsScreensParamContextProps,
} from '@configs/screensConfig';
import { SectionsParamsContext } from '@components/EventDetailsComponents/commonControls/SectionsParamsContext';
import { ScrollView } from 'react-native-gesture-handler';
import { TBMPlayerErrorObject } from '@services/types/bitmovinPlayer';
import { useAppSelector } from '@hooks/redux';
import { isProductionEvironmentSelector } from '@services/store/settings/Selectors';
import { buildInfoForBitmovin, isTVOS } from '@configs/globalConfig';
import { customerIdSelector } from '@services/store/auth/Selectors';
import { useFocusLayoutEffect } from '@hooks/useFocusLayoutEffect';
import { DummyPlayerScreenName } from '@components/Player/DummyPlayerScreen';
const Extras: React.FC<
  TEventDetailsScreensProps<
    NSNavigationScreensNames.EventDetailsStackScreens['extras']
  >
> = ({ route, navigation }) => {
  const params = useContext<Partial<TEventDetailsScreensParamContextProps>>(
    SectionsParamsContext,
  )[route.name];
  const {
    nextSectionTitle,
    videosInfo,
    prevScreenName,
    nextScreenName,
    eventId,
    videoQualityBitrate,
    videoQualityId,
  } = params;
  const videosRefs = useRef<{
    [key: string]: any;
  }>({});

  const scrollingPaginationRef = useRef<TScrolingPaginationRef>(null);
  const extrasInfoBlockRef = useRef<TExtrasInfoBlockRef>(null);
  const isMounted = useRef<boolean>(false);
  const extrasVideoInFocusRef = useRef<TouchableHighlight | null | undefined>(
    null,
  );
  const isBMPlayerShowingRef = useRef<boolean>(false);
  const extrasVideoInFocus = useRef<any | null>(null);
  const isProduction = useAppSelector(isProductionEvironmentSelector);
  const extrasVideoInFocusPressing = useRef<{
    pressingHandler: () => void;
  } | null>(null);

  const customerId = useAppSelector(customerIdSelector);
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
        },
      });
    },
    [navigation],
  );

  const closeModalCB = useCallback(
    (...rest: any[]) => {
      closeModal(...rest);
      isBMPlayerShowingRef.current = false;
    },
    [closeModal],
  );

  const pressHandler = useCallback(
    (ref, clearLoadingState) => {
      if (!isBMPlayerShowingRef.current && extrasVideoInFocus.current) {
        isBMPlayerShowingRef.current = true;
        fetchVideoURL(extrasVideoInFocus.current.id, isProduction)
          .then(response => {
            if (!response?.data?.data?.attributes?.hlsManifestUrl) {
              throw new Error('Something went wrong');
            }
            const videoTitle = extrasVideoInFocus.current.title;

            const subtitle = extrasVideoInFocus.current.participant_details;
            openPlayer({
              url: response.data.data.attributes.hlsManifestUrl,
              poster:
                'https://actualites.music-opera.com/wp-content/uploads/2019/09/14OPENING-superJumbo.jpg',
              title: videoTitle,
              subtitle,
              analytics: {
                videoId: extrasVideoInFocus.current.id,
                title: videoTitle,
                buildInfoForBitmovin,
                customData3: videoQualityId,
                userId: customerId ? String(customerId) : null,
              },
              onClose: closePlayer({
                eventId,
                clearLoadingState,
                ref,
                closeModalCB,
              }),
              videoQualityBitrate,
              showVideoInfo: !isProduction,
            });
          })
          .catch(err => {
            globalModalManager.openModal({
              contentComponent: ErrorModal,
              contentProps: {
                confirmActionHandler: () => {
                  globalModalManager.closeModal(() => {
                    closeModalCB(ref, clearLoadingState);
                  });
                },
                title: 'Player Error',
                subtitle: err.message,
              },
            });
          })
          .finally(() => {
            if (typeof clearLoadingState === 'function') {
              clearLoadingState();
            }
          });
      } else {
        clearLoadingState();
      }
    },
    [
      closeModalCB,
      closePlayer,
      eventId,
      openPlayer,
      isProduction,
      videoQualityBitrate,
      videoQualityId,
      customerId,
    ],
  );

  const setExtrasrVideoBlur = useCallback(() => {
    extrasVideoInFocusRef.current = null;
    extrasVideoInFocus.current = null;
    extrasVideoInFocusPressing.current = null;
  }, []);

  const goUpCB = useCallback(() => {
    navigation.replace(prevScreenName);
  }, [navigation, prevScreenName]);
  const goDownCB = useCallback(() => {
    if (nextScreenName) {
      navigation.replace(nextScreenName);
    }
  }, [navigation, nextScreenName]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const cb = (eve: HWEvent) => {
        if (
          eve?.eventType !== 'playPause' ||
          typeof extrasVideoInFocusPressing.current?.pressingHandler !==
            'function'
        ) {
          return;
        }
        extrasVideoInFocusPressing.current.pressingHandler();
      };
      TVEventManager.addEventListener(cb);
      return () => {
        TVEventManager.removeEventListener(cb);
      };
    }, []),
  );

  useFocusLayoutEffect(
    useCallback(() => {
      setTimeout(() => {
        Object.values(videosRefs.current)[0].current.setNativeProps({
          hasTVPreferredFocus: true,
        });
      }, 500);
    }, []),
  );
  return (
    <View style={[styles.generalContainer]}>
      {prevScreenName ? <GoUp onFocus={goUpCB} /> : null}
      <View style={{ flex: 1 }}>
        <View style={styles.wrapper}>
          <View style={styles.leftSideContainer}>
            <RohText style={styles.title}>Extras</RohText>
            <ExtrasInfoBlock ref={extrasInfoBlockRef} />
          </View>
          <View style={styles.extrasGalleryContainer}>
            <ScrollView
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              horizontal
              style={styles.list}
              contentContainerStyle={{ alignItems: 'center' }}>
              {videosInfo.map((item: any, index: number) => (
                <ExtrasVideoButton
                  key={item.id}
                  uri={item.previewImageUrl}
                  hasTVPreferredFocus={index === 0}
                  ref={
                    videosRefs.current[item.id]
                      ? videosRefs.current[item.id]
                      : (videosRefs.current[item.id] =
                          createRef<TouchableHighlight>())
                  }
                  paddingLeft={index === 0 ? scaleSize(147) : scaleSize(10)}
                  paddingRight={
                    videosInfo.length > 0 && index === videosInfo.length - 1
                      ? scaleSize(147)
                      : scaleSize(10)
                  }
                  containerStyle={[styles.extrasGalleryItemContainer]}
                  canMoveRight={index !== videosInfo.length - 1}
                  onPress={pressHandler}
                  blurCallback={setExtrasrVideoBlur}
                  focusCallback={(pressingHandler?: () => void) => {
                    extrasVideoInFocus.current = item;
                    if (pressingHandler) {
                      extrasVideoInFocusPressing.current = { pressingHandler };
                    }
                    if (
                      typeof scrollingPaginationRef.current?.setCurrentIndex ===
                      'function'
                    ) {
                      scrollingPaginationRef.current.setCurrentIndex(index);
                    }
                    if (
                      typeof extrasInfoBlockRef.current?.setVideoInfo ===
                      'function'
                    ) {
                      extrasInfoBlockRef.current.setVideoInfo({
                        title: item.title,
                        descrription: item.descrription,
                        participant_details: item.participant_details,
                      });
                    }
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
      <View style={styles.downContainer}>
        <GoDown text={nextSectionTitle || ''} onFocus={goDownCB} />
      </View>
      {videosInfo.length > 1 && (
        <View style={styles.paginationContainer}>
          <ScrollingPagination
            ref={scrollingPaginationRef}
            countOfItems={videosInfo.length}
            alignHorizontal="flex-start"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  generalContainer: {
    height: Dimensions.get('window').height,
  },
  navigationToDownContainer: {
    width: '100%',
    height: 2,
  },
  navigationToUpContainer: {
    width: '100%',
    height: 2,
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downContainer: {
    marginBottom: scaleSize(60),
  },
  title: {
    marginTop: scaleSize(105),
    color: Colors.defaultTextColor,
    fontSize: scaleSize(72),
    textTransform: 'uppercase',
    letterSpacing: scaleSize(1),
    lineHeight: scaleSize(84),
  },
  extrasGalleryContainer: {
    flex: 1,
  },
  leftSideContainer: {
    width: scaleSize(645),
  },
  extrasGalleryItemContainer: {
    height: scaleSize(440),
    width: scaleSize(765),
    alignItems: 'center',
    justifyContent: 'center',
  },
  extrasGalleryFirstItemContainer: {
    marginLeft: scaleSize(147),
  },
  extrasGalleryOtherItemsContainer: {
    marginLeft: scaleSize(20),
  },
  list: {
    flex: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: scaleSize(160),
    left: 0,
  },
});

export default Extras;
