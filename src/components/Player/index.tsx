import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PlayerView, SourceType, SubtitleFormat, usePlayer } from 'bitmovin-player-react-native';
import {
  Animated,
  AppState,
  AppStateStatus,
  BackHandler,
  Dimensions,
  StyleSheet,
  TVFocusGuideView,
  View,
  ViewProps,
} from 'react-native';
import ISO6391 from 'iso-639-1';
import { TBMPlayerErrorObject } from 'services/types/bitmovinPlayer';
import { PlayerControls } from './PlayerControls';
import RohText from 'components/RohText';
import { scaleSize } from 'utils/scaleSize';
import { Colors } from 'themes/Styleguide';
import IdleTimerManager from 'react-native-idle-timer';
import { isTVOS } from 'configs/globalConfig';
import { useAppSelector } from 'hooks/redux';
import { customerIdSelector } from 'services/store/auth/Selectors';
import { isProductionEvironmentSelector } from 'services/store/settings/Selectors';
import { activateAvailabilityWindow } from 'services/apiClient';

const BITMOVIN_ANALYTICS_KEY = '45a0bac7-b900-4a0f-9d87-41a120744160';

export type TPlayerProps = {
  autoPlay?: boolean;
  style?: ViewProps['style'];
  onEvent?: (event: any) => void;
  onError?: (event: any) => void;
  isLiveStream?: boolean;
  isPPV?: boolean;
  isMainVideo?: boolean;
  orderNo?: number;
  feeId?: number;
  isAvailabilityWindowActivated?: boolean;
  availabilityWindow: number;
  title: string;
  videoQualityBitrate: number;
  subtitle?: string;
  seekingTimePoint?: number;
  onClose?: (error: TBMPlayerErrorObject | null, stoppedTime: string) => void;
  showVideoInfo?: boolean;
  startDate?: string;
  endDate?: string;
  configuration: {
    url: string;
    poster?: string;
    subtitles?: string;
    configuration?: string;
    offset?: string;
  };
  analytics?: {
    videoId: string;
    title?: string;
    userId?: string;
    experiment?: string;
    buildInfoForBitmovin?: string;
    customData3?: string;
    customData4?: string;
    customData5?: string;
    customData6?: string;
    customData7?: string;
  };
  guidance?: string;
  guidanceDetails?: string;
};

interface State {
  fullscreen: boolean;
  ready: boolean;
  play: boolean;
  currentTime: number;
  duration: number;
  subtitleCue: string;
  subtitlesList: any[];
  selectedSubtitles: string;
  isLiveStream: boolean;
}

const BitMovinPlayer: React.FC<TPlayerProps> = props => {
  const { analytics, configuration } = props;
  const {
    onClose,
    title,
    guidance,
    guidanceDetails,
    autoPlay = true,
    isLiveStream = false,
    availabilityWindow,
    feeId,
    orderNo,
    isMainVideo,
    isPPV,
    isAvailabilityWindowActivated,
  } = props;
  const [state, setState] = useState<State>({
    fullscreen: false,
    play: false,
    currentTime: 0,
    duration: 0,
    subtitlesList: [],
    subtitleCue: '',
    ready: false,
    selectedSubtitles: '',
    isLiveStream,
  });
  const player = usePlayer({
    styleConfig: {
      isUiEnabled: isTVOS,
    },
    playbackConfig: {
      isBackgroundPlaybackEnabled: true,
    },
    analyticsConfig: {
      licenseKey: BITMOVIN_ANALYTICS_KEY,
      defaultMetadata: {
        customUserId: analytics?.userId || '',
        experimentName: analytics?.experiment,
        customData1: analytics?.buildInfoForBitmovin || '',
        customData2: analytics?.userId || '',
        customData3: analytics?.customData3 || '',
        customData4: analytics?.customData4 || '',
        customData5: analytics?.customData5 || '',
        customData6: analytics?.customData6 || '',
        customData7: analytics?.customData7 || '',
      },
    },
  });

  const isProductionEnv = useAppSelector(isProductionEvironmentSelector);
  const customerId = useAppSelector(customerIdSelector);

  const appState = useRef(AppState.currentState);
  useEffect(() => {
    player.load({
      url: configuration.url,
      type: SourceType.HLS,
      title: title,
    });
    if (!isTVOS) {
      IdleTimerManager.setIdleTimerDisabled(true);
    }
    const _handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current === 'active' && nextAppState === 'background') {
        player.pause();
      }
      appState.current = nextAppState;
    };
    const unsubscribe = AppState.addEventListener(
      'change',
      _handleAppStateChange,
    );

    return () => {
      if (!isTVOS) {
        IdleTimerManager.setIdleTimerDisabled(false);
      }
      unsubscribe.remove();
    };
  }, [configuration.url, player, title]);

  const actionClose = useCallback(async () => {
    if (player.isInitialized) {
      if (typeof onClose === 'function') {
        onClose(null, (await player.getCurrentTime()).toFixed(1));
      }
      player.destroy();
    }
  }, [player, onClose]);

  useEffect(() => {
    const handleBackButtonClick = () => {
      actionClose();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, [actionClose]);

  function handlePlayPause() {
    if (state.play) {
      player.pause();
      setState({ ...state, play: false });
      return;
    }

    player.play();
    setState({ ...state, play: true });
  }

  function skipBackward() {
    if (state.isLiveStream) {
      if (-(state.currentTime - 10) > state.duration) {
        return;
      }
      player.timeShift(state.currentTime - 10);
    } else {
      if (state.currentTime - 10 < 0) {
        player.seek(0);
        return;
      }
      player.seek(state.currentTime - 10);
    }
    setState({ ...state, currentTime: state.currentTime - 10 });
  }

  function skipForward() {
    if (state.isLiveStream) {
      if (state.currentTime + 10 >= 0) {
        player.timeShift(0);
        setState({ ...state, currentTime: 0 });
        return;
      }
      player.timeShift(state.currentTime + 10);
    } else {
      player.seek(state.currentTime + 10);
    }
    setState({ ...state, currentTime: state.currentTime + 10 });
  }

  async function setSubtitles(subtitleTrackIdentifier) {
    await player.setSubtitleTrack(subtitleTrackIdentifier);
    setState({ ...state, selectedSubtitles: subtitleTrackIdentifier });
  }

  async function seekTo(time) {
    await player.seek(time);
  }

  async function onReady() {
    const isLiveStreamFromPlayer = await player.isLive();
    let duration = await player.getDuration();
    if (isLiveStreamFromPlayer) {
      duration = -(await player.getMaxTimeShift());
    }
    let currentTime = await player.getCurrentTime();
    if (isLiveStreamFromPlayer) {
      currentTime = await player.getTimeShift();
    }

    const subtitlesAvailable = await player.getAvailableSubtitles();
    const filteredSubtitles = subtitlesAvailable.filter(
      item =>
        (item.identifier !== 'bitmovin-off' || item.identifier !== 'off') &&
        !!item.language,
    );

    if (filteredSubtitles.length) {
      const subtitlesFormatted = filteredSubtitles.map(subtitleTrack => {
        if (!subtitleTrack.label) {
          subtitleTrack.label = '';
        }
        return {
          identifier: subtitleTrack.identifier,
          text: ISO6391.getName(subtitleTrack.label),
        };
      });
      subtitlesFormatted.push({
        identifier: undefined,
        text: 'Off',
      });

      await setSubtitles(filteredSubtitles[0].identifier);
      setState(s => ({
        ...s,
        subtitlesList: subtitlesFormatted,
      }));
    }

    if (isLiveStreamFromPlayer) {
      if (configuration.offset) {
        await player.timeShift(0);
      } else {
        await player.timeShift(-duration);
      }
    }

    if (configuration.offset && !isLiveStreamFromPlayer) {
      await seekTo(Number(configuration.offset));
    }
    if (autoPlay) {
      player.play();
      setState(s => ({ ...s, play: true }));
    }

    if (isPPV && !isAvailabilityWindowActivated && isMainVideo) {
      await activateAvailabilityWindow(
        feeId,
        orderNo,
        availabilityWindow,
        customerId,
        isProductionEnv,
      );
      props.isAvailabilityWindowActivated = true;
    }
    setState(s => ({
      ...s,
      currentTime,
      duration,
      ready: true,
      isLiveStream: isLiveStreamFromPlayer,
    }));
  }

  async function onTimeChanged() {
    let currentTime = await player.getCurrentTime();
    let duration = state.duration;
    if (state.isLiveStream) {
      currentTime = await player.getTimeShift();
      duration = -(await player.getMaxTimeShift());
    }
    setState(s => ({ ...s, currentTime, duration }));
  }

  function onCueEnter(event) {
    setState(s => ({ ...s, subtitleCue: event.text }));
  }

  function onCueExit() {
    setState(s => ({ ...s, subtitleCue: '' }));
  }

  return (
    <TVFocusGuideView
      style={styles.overlayOuter}
      trapFocusUp={true}
      trapFocusRight={true}
      trapFocusLeft={true}
      trapFocusDown={true}>
      <PlayerView
        style={styles.video}
        player={player}
        onReady={onReady}
        onTimeChanged={onTimeChanged}
        onCueEnter={onCueEnter}
        onCueExit={onCueExit}
      />
      <Guidance
        guidanceDetails={guidanceDetails}
        guidance={guidance}
        title={title}
        showGuidance={!state.ready}
      />
      <View style={styles.controlOverlay} focusable={false}>
        <PlayerControls
          onPlay={handlePlayPause}
          onPause={handlePlayPause}
          playing={state.play}
          skipBackwards={skipBackward}
          skipForwards={skipForward}
          showSkip={true}
          duration={state.duration}
          currentTime={state.currentTime}
          seekTo={seekTo}
          subtitleCue={state.subtitleCue}
          subtitlesList={state.subtitlesList}
          selectedSubtitles={state.selectedSubtitles}
          actionClose={actionClose}
          setSubtitles={setSubtitles}
          isLiveStream={state.isLiveStream}
        />
      </View>
    </TVFocusGuideView>
  );
};

const Guidance = ({
  guidanceDetails,
  title,
  guidance,
  showGuidance,
  showTitle = true,
}) => {
  const guidanceAnimation = useRef(new Animated.Value(1)).current;
  if (!showGuidance) {
    Animated.timing(guidanceAnimation, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }
  return (
    <Animated.View
      style={[styles.overlayContainer, { opacity: guidanceAnimation }]}>
      {guidance ? (
        <View style={styles.guidanceContainer}>
          <RohText
            style={styles.guidanceTitle}
            numberOfLines={1}
            ellipsizeMode="tail">
            guidance
          </RohText>
          <RohText
            style={styles.guidanceSubTitle}
            numberOfLines={1}
            ellipsizeMode="tail">
            {guidance}
          </RohText>
          {guidanceDetails ? (
            <RohText style={styles.guidanceSubTitle}>{guidanceDetails}</RohText>
          ) : null}
        </View>
      ) : null}
      <View style={styles.titleContainer}>
        {showTitle && (
          <RohText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </RohText>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchableOverlay: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlayOuter: {
    flex: 1,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    position: 'absolute',
    backgroundColor: 'black',
    zIndex: 100,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    top: scaleSize(60),
    left: scaleSize(200),
    bottom: scaleSize(64),
    right: scaleSize(200),
  },
  guidanceContainer: {
    position: 'absolute',
    backgroundColor: 'black',
    opacity: 0.7,
    top: scaleSize(130),
    left: 90,
  },
  guidanceTitle: {
    fontSize: scaleSize(26),
    textTransform: 'uppercase',
    color: Colors.defaultTextColor,
  },
  guidanceSubTitle: {
    fontSize: scaleSize(26),
    color: Colors.defaultTextColor,
  },
  titleContainer: {
    width: '100%',
    paddingLeft: 100,
  },
  title: {
    fontSize: scaleSize(72),
    textTransform: 'uppercase',
    color: Colors.defaultTextColor,
  },
  defaultPlayerStyle: {
    backgroundColor: 'black',
    flex: 1,
  },
  playerLoaded: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  controlsContainer: {
    position: 'absolute',
    backgroundColor: 'red',
    bottom: 0,
  },
  textDescription: {
    position: 'absolute',
    flex: 1,
    alignSelf: 'center',
    top: scaleSize(180),
    fontSize: scaleSize(80),
    color: 'red',
  },
  container: {
    flex: 1,
    backgroundColor: '#ebebeb',
  },
  video: {
    height: Dimensions.get('window').width * (9 / 16),
    width: Dimensions.get('window').width,
    backgroundColor: 'black',
  },
  fullscreenVideo: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    backgroundColor: 'black',
  },
  text: {
    marginTop: 30,
    marginHorizontal: 20,
    fontSize: 15,
    textAlign: 'justify',
  },
  fullscreenButton: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    paddingRight: 10,
  },
  controlOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
  },
});

export default BitMovinPlayer;
