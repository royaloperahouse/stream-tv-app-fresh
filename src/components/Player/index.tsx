import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CdnProvider,
  PlayerView,
  SourceType,
  usePlayer,
  VideoPlaybackQualityChangedEvent,
} from 'bitmovin-player-react-native';
import {
  AppState,
  AppStateStatus,
  BackHandler,
  SafeAreaView,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import { TBMPlayerErrorObject } from 'services/types/bitmovinPlayer';
import PlayerControls, {
  TPlayerControlsRef,
} from 'components/Player/PlayerControls';
import RohText from 'components/RohText';
import { scaleSize } from 'utils/scaleSize';
import { Colors } from 'themes/Styleguide';
import { ESeekOperations } from 'configs/bitMovinPlayerConfig';
import IdleTimerManager from 'react-native-idle-timer';
import { isTVOS } from 'configs/globalConfig';

const BITMOVIN_ANALYTICS_KEY = '45a0bac7-b900-4a0f-9d87-41a120744160';

export type TPlayerProps = {
  autoPlay?: boolean;
  style?: ViewProps['style'];
  onEvent?: (event: any) => void;
  onError?: (event: any) => void;
  isLiveStream?: boolean;
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

const BitMovinPlayer: React.FC<TPlayerProps> = props => {
  const cloneProps = {
    ...props,
    configuration: {
      ...props.configuration,
    },
    analytics: {
      ...props.analytics,
    },
  };

  const { analytics, configuration } = cloneProps;
  const player = usePlayer({
    styleConfig: {
      isUiEnabled: false,
    },
    analyticsConfig: {
      key: BITMOVIN_ANALYTICS_KEY,
      videoId: analytics.videoId || '',
      customUserId: analytics.userId || '',
      title: analytics.title || '',
      cdnProvider: CdnProvider.BITMOVIN,
      experimentName: analytics.experiment,
      customData1: analytics.buildInfoForBitmovin || '',
      customData2: analytics.userId || '',
      customData3: analytics.customData3 || '',
      customData4: analytics.customData4 || '',
      customData5: analytics.customData5 || '',
      customData6: analytics.customData6 || '',
      customData7: analytics.customData7 || '',
    },
  });

  const [loaded, setLoaded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [duration, setDuration] = useState(0.0);
  const subtitleCue = useRef('');
  const [videoInfo, setVideoInfo] = useState<string>();

  const controlRef = useRef<TPlayerControlsRef | null>(null);
  const durationInSecs = useRef<number>(0);

  const appState = useRef(AppState.currentState);
  useEffect(() => {
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
    }
  }, [player]);

  // useEffect(() => {
  //   const durationInterval = setInterval(() => {
  //     if (durationInSecs.current > 0) {
  //       durationInSecs.current = durationInSecs.current + 1;
  //       setDuration(() => durationInSecs.current);
  //     }
  //   }, 1000);
  //
  //   return () => clearInterval(durationInterval);
  // }, []);

  const {
    onClose,
    title,
    autoPlay = false,
    subtitle = '',
    seekingTimePoint = 10.0,
    guidance,
    guidanceDetails,
    isLiveStream,
    showVideoInfo,
    startDate,
    endDate,
  } = cloneProps;

  // Action section
  const actionPlay = useCallback(() => {
    if (!playerReady) {
      return;
    }
    player.play();
  }, [playerReady, player]);

  const actionPause = useCallback(() => {
    if (!playerReady) {
      return;
    }
    player.pause();
  }, [playerReady, player]);

  const actionRestart = useCallback(() => {
    if (!playerReady) {
      return;
    }
    player.seek(0.0);
  }, [playerReady, player]);

  const actionClose = useCallback(async () => {
    if (player.isInitialized) {
      if (typeof onClose === 'function') {
        onClose(null, (await player.getCurrentTime()).toFixed(1));
      }
      player.destroy();
    }
  }, [player, onClose]);

  const seekTo = useCallback(
    async (time: number) => {
      if (isLiveStream) {
        const timeShiftValue = 0 - time;
        player.timeShift(timeShiftValue);
      }
      player.seek(time);
    },
    [isLiveStream, player],
  );
  // End of actions section

  // Event listeners section
  const onReady = useCallback(async () => {
    let subtitles = [...(await player.getAvailableSubtitles())];

    if (
      subtitles.filter(
        sub => sub.identifier === 'bitmovin-off' || sub.identifier === 'off',
      ).length === 0
    ) {
      if (subtitles.length > 0) {
        subtitles.push({
          identifier: 'bitmovin-off',
          label: 'off',
          url: '',
        });
      } else {
        subtitles = [];
      }
    } else if (subtitles.length === 1) {
      subtitles = [];
    }

    controlRef.current?.loadSubtitleList(subtitles);
    if (autoPlay) {
      player.play();
    }
    let duration = String(await player.getDuration());
    if (isLiveStream && duration) {
      console.log(cloneProps.configuration);
      duration = Math.abs(await player.getMaxTimeShift()).toFixed(0);
      await player.timeShift(await player.getMaxTimeShift());
      if (+duration > 60 * 60 * 24) {
        duration = (60 * 60 * 24 - 1).toString();
      }

      durationInSecs.current = parseInt(duration, 10);
    }

    const initDuration = parseFloat(duration);
    if (!isNaN(initDuration)) {
      setDuration(initDuration);
    }
    if (cloneProps.configuration.offset && !isLiveStream) {
      await seekTo(Number(cloneProps.configuration.offset));
    }
    if (Number(cloneProps.configuration.offset) === 0 && isLiveStream) {
      await player.timeShift(0);
    }
    setPlayerReady(true);
  }, [
    autoPlay,
    player,
    isLiveStream,
    cloneProps.configuration.offset,
    startDate,
    endDate,
    seekTo,
  ]);

  if (configuration.url) {
    player.load({
      url: configuration.url,
      type: SourceType.HLS,
      title: title,
    });
    if (!loaded) {
      setTimeout(() => setLoaded(true), 0);
    }
  }

  const onSeeked = useCallback(async () => {
    const currentTime = isLiveStream
      ? Math.abs(await player.getTimeShift())
      : await player.getCurrentTime('relative');
    if (isNaN(currentTime)) {
      return;
    }
    if (typeof controlRef.current?.setSeekQueueFree === 'function') {
      controlRef.current.setSeekQueueFree();
    }
    if (typeof controlRef.current?.setCurrentTime === 'function') {
      controlRef.current.setCurrentTime(currentTime);
    }
    if (typeof controlRef.current?.seekUpdatingFinished === 'function') {
      controlRef.current.seekUpdatingFinished();
    }
  }, [player]);

  const onPlay = () => {
    if (typeof controlRef.current?.setPlay === 'function') {
      controlRef.current.setPlay(true);
    }
  };

  const onPaused = () => {
    if (typeof controlRef.current?.setPlay === 'function') {
      controlRef.current.setPlay(false);
    }
  };

  const onVideoPlaybackQualityChanged = useCallback(
    (event: VideoPlaybackQualityChangedEvent) => {
      if (event.newVideoQuality && showVideoInfo) {
        const { id, label, codec, bitrate, frameRate, width, height } =
          event.newVideoQuality;
        setVideoInfo(
          `Current video Quality is :  Id: ${id}, label: ${label}, codec: ${codec}, bitrate: ${bitrate}, frameRate: ${frameRate}, width: ${width}, height: ${height}`,
        );
      }
    },
    [showVideoInfo],
  );

  const onTimeChanged = async () => {
    const time = isLiveStream
      ? Math.abs(await player.getTimeShift())
      : await player.getCurrentTime();
    const durationFromEvent = await player.getDuration();
    if (isNaN(time) || isNaN(durationFromEvent)) {
      return;
    }
    if (parseFloat(time.toFixed()) >= parseFloat(durationFromEvent.toFixed())) {
      player.pause();
      if (isLiveStream) {
        player.timeShift(0);
      }
      player.seek(0.0);
      if (typeof controlRef.current?.controlFadeOut === 'function') {
        controlRef.current.controlFadeOut();
      }
      return;
    }
    if (typeof controlRef.current?.setCurrentTime === 'function') {
      controlRef.current.setCurrentTime(time);
    } else if (
      isLiveStream &&
      typeof controlRef.current?.setCurrentTime === 'function'
    ) {
      const timeShift = await player.getTimeShift();
      controlRef.current?.setCurrentTime(Math.abs(timeShift));
    }
  };
  // End of event listeners section

  const calculateTimeForSeeking = useCallback(
    (
      startTime: number,
      countOfSeekingIteration: number,
      seekOp: ESeekOperations,
    ) => {
      if (!playerReady) {
        return -1;
      }
      if (isLiveStream) {
        const seekingDuration = countOfSeekingIteration * seekingTimePoint;
        switch (seekOp) {
          case ESeekOperations.fastForward: {
            if (startTime < 10) {
              return 0;
            }
            return startTime - seekingDuration;
          }
          case ESeekOperations.rewind: {
            if (startTime > duration) {
              return duration;
            }
            return seekingDuration + startTime;
          }
        }
        return;
      }
      const seekingDuration = countOfSeekingIteration * seekingTimePoint;
      switch (seekOp) {
        case ESeekOperations.fastForward: {
          const calculatedSeekingTimePoint = startTime + seekingDuration;
          if (startTime >= duration - 5) {
            return -1;
          }
          return calculatedSeekingTimePoint >= duration - 5.0
            ? duration - 5.0
            : calculatedSeekingTimePoint;
        }
        case ESeekOperations.rewind: {
          const calculatedSeekingTimePoint = startTime - seekingDuration;
          if (startTime === 0.0) {
            return -1;
          }
          return calculatedSeekingTimePoint < 0.0
            ? 0.0
            : calculatedSeekingTimePoint;
        }
        default:
          return -1;
      }
    },
    [playerReady, seekingTimePoint, duration],
  );

  const setSubtitle = useCallback(
    (trackID: string) => {
      player.setSubtitleTrack(trackID === 'bitmovin-off' ? undefined : trackID);
      console.log(trackID, 'track Id');
    },
    [player],
  );

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

  const renderGuidanceText = (showTitle = true) => {
    return (
      <View style={[styles.overlayContainer]}>
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
              <RohText style={styles.guidanceSubTitle}>
                {guidanceDetails}
              </RohText>
            ) : null}
          </View>
        ) : null}
        <View style={styles.titleContainer}>
          {showTitle && (
            <RohText
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail">
              {title}
            </RohText>
          )}
        </View>
      </View>
    );
  };

  const onCueEnter = (cue) => {
    if (!controlRef.current) {
      return;
    }
    if (typeof controlRef.current?.setSubtitleCue === 'function') {
      controlRef.current?.setSubtitleCue(cue.text);
    }
  };

  const onCueExit = (cue) => {
    if (!controlRef.current) {
      return;
    }
    if (typeof controlRef.current?.setSubtitleCue === 'function') {
      controlRef.current?.setSubtitleCue('');
    }
  };

  return (
    <SafeAreaView style={styles.defaultPlayerStyle}>
      <PlayerView
        style={playerReady ? styles.playerLoaded : {}}
        player={player}
        onReady={onReady}
        onSeeked={onSeeked}
        onVideoPlaybackQualityChanged={onVideoPlaybackQualityChanged}
        onTimeChanged={onTimeChanged}
        onTimeShifted={onSeeked}
        onPlay={onPlay}
        onPaused={onPaused}
        onCueEnter={onCueEnter}
        onCueExit={onCueExit}
      />

      {!playerReady && (
        <SafeAreaView style={styles.overlayOuter}>
          {renderGuidanceText()}
        </SafeAreaView>
      )}

      {/*{continueShowingGuidance && renderGuidanceText(false)}*/}

      <PlayerControls
        ref={controlRef}
        title={title}
        guidance={guidance}
        guidanceDetails={guidanceDetails}
        subtitle={subtitle}
        duration={duration}
        playerLoaded={playerReady}
        onPlayPress={actionPlay}
        onPausePress={actionPause}
        onRestartPress={actionRestart}
        onClose={actionClose}
        setSubtitle={setSubtitle}
        autoPlay={autoPlay}
        subtitleCue={subtitleCue.current}
        calculateTimeForSeeking={calculateTimeForSeeking}
        seekTo={seekTo}
        videoInfo={videoInfo}
        isLiveStream={isLiveStream}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
});

export default BitMovinPlayer;
