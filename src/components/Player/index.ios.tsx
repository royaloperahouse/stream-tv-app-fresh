import React, {
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  useEffect,
  useCallback,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ViewProps,
  HostComponent,
  requireNativeComponent,
  NativeModules,
  findNodeHandle,
  BackHandler,
  View,
} from 'react-native';
import type {
  TBitmoviPlayerNativeProps,
  ROHBitmovinPlayerMethodsType,
  TBMPlayerErrorObject,
} from '@services/types/bitmovinPlayer';
import RohText from '@components/RohText';
import { scaleSize } from '@utils/scaleSize';
import { Colors } from '@themes/Styleguide';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
  withDelay,
  useSharedValue,
} from 'react-native-reanimated';

let NativeBitMovinPlayer: HostComponent<TBitmoviPlayerNativeProps> =
  requireNativeComponent('ROHBitMovinPlayer');

const ROHBitmovinPlayerModule = NativeModules.ROHBitMovinPlayer;

type TCallbackFunc = (data?: any) => void;

type TOnLoadPayload = {
  message: 'load';
  duration: string;
};

type TOnReadyPayload = {
  message: 'ready';
  duration: string;
  subtitles: Array<{ url: string; id: string; label: string }>;
};

type TOnPlayPayload = {
  message: 'play';
  duration: string;
  time: string;
};

type TOnPausePayload = {
  message: 'pause';
  duration: string;
  time: string;
};

type TOnTimeChangedPayload = {
  message: 'timeChanged';
  duration: string;
  time: string;
};

type TOnSeekPayload = {
  message: 'seek' | 'seeked';
  duration: string;
  time: string;
};

type TOnDestoyPayload = {
  message: 'seek';
  duration: string;
  time: string;
};

type TPlayerProps = {
  autoPlay?: boolean;
  style?: ViewProps['style'];
  onEvent?: (event: any) => void;
  onError?: (event: any) => void;
  title: string;
  subtitle: string;
  onClose?: (error: TBMPlayerErrorObject | null, stoppedTime: string) => void;
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
    customData2?: string;
    customData3?: string;
    customData4?: string;
    customData5?: string;
    customData6?: string;
    customData7?: string;
  };
  guidance?: string;
  guidanceDetails?: string;
};

const Player: React.FC<TPlayerProps> = props => {
  const cloneProps = {
    ...props,
    configuration: {
      ...props.configuration,
      offset: parseFloat(props.configuration.offset || '0.0'),
      subtitle: [
        props.configuration.subtitles || '',
        props.guidance ? 'GUIDANCE:' : '',
        props.guidance || '',
        props.guidanceDetails || '',
      ]
        .filter(item => item)
        .join('\n'),
    },
    analytics: {
      ...props.analytics,
    },
    title: props?.title.toUpperCase() || '',
  };

  const {
    onClose,
    title,
    configuration,
    analytics,
    autoPlay = false,
    guidance,
    guidanceDetails,
  } = cloneProps;
  const playerRef = useRef<typeof NativeBitMovinPlayer | null>(null);
  const controlRef = useRef<ROHBitmovinPlayerMethodsType | null>(null);
  const playerMounted = useRef<boolean>(false);
  const playerError = useRef<TBMPlayerErrorObject | null>(null);
  const guidanceOpacityValue = useSharedValue(1);
  const guidanceBlockStyle = useAnimatedStyle(() => {
    if (guidanceOpacityValue.value === 1) {
      return {
        opacity: 1,
      };
    }
    return {
      opacity: withDelay(
        7000,
        withTiming(0, {
          duration: 500,
          easing: Easing.ease,
        }),
      ),
    };
  }, [guidanceOpacityValue.value]);
  useLayoutEffect(() => {
    guidanceOpacityValue.value = 0;
    playerMounted.current = true;
    return () => {
      playerMounted.current = false;
    };
  }, []);

  const play = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.play();
  };

  const pause = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.pause();
  };

  const seekBackwardCommand = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.seekBackwardCommand();
  };

  const seekForwardCommand = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.seekForwardCommand();
  };

  const destroy = useCallback(() => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.destroy();
  }, []);

  const setZoom = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.setZoom(findNodeHandle(playerRef.current || null));
  };

  const setFit = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.setFit(findNodeHandle(playerRef.current || null));
  };

  const seek = (time = 0) => {
    if (!playerMounted.current) {
      return;
    }
    const seekTime = parseFloat(time.toString());

    if (seekTime) {
      ROHBitmovinPlayerModule.seek(
        findNodeHandle(playerRef.current || null),
        seekTime,
      );
    }
  };

  const mute = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.mute(findNodeHandle(playerRef.current || null));
  };

  const unmute = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.unmute(findNodeHandle(playerRef.current || null));
  };

  const enterFullscreen = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.enterFullscreen(
      findNodeHandle(playerRef.current || null),
    );
  };

  const exitFullscreen = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.exitFullscreen(
      findNodeHandle(playerRef.current || null),
    );
  };

  const getCurrentTime = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.getCurrentTime(
      findNodeHandle(playerRef.current || null),
    );
  };
  const getDuration = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.getDuration(
      findNodeHandle(playerRef.current || null),
    );
  };
  const getVolume = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.getVolume(
      findNodeHandle(playerRef.current || null),
    );
  };
  const setVolume = (volume = 100) => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.setVolume(
      findNodeHandle(playerRef.current || null),
      volume,
    );
  };

  const isMuted = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.isMuted(findNodeHandle(playerRef.current || null));
  };

  const isPaused = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.isPaused(findNodeHandle(playerRef.current || null));
  };

  const isStalled = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.isStalled(
      findNodeHandle(playerRef.current || null),
    );
  };

  const isPlaying = () => {
    if (!playerMounted.current) {
      return;
    }
    ROHBitmovinPlayerModule.isPlaying(
      findNodeHandle(playerRef.current || null),
    );
  };

  useImperativeHandle(controlRef, () => ({
    play,
    pause,
    seekBackwardCommand,
    seekForwardCommand,
    destroy,
    setZoom,
    setFit,
    seek,
    mute,
    unmute,
    enterFullscreen,
    exitFullscreen,
    getCurrentTime,
    getDuration,
    getVolume,
    setVolume,
    isMuted,
    isPaused,
    isStalled,
    isPlaying,
  }));

  useEffect(() => {
    const handleBackButtonClick = () => {
      destroy();
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, [destroy]);

  useEffect(() => () => playerRef?.current?.destroy?.(), []);
  return (
    <SafeAreaView style={styles.defaultPlayerStyle}>
      <NativeBitMovinPlayer
        ref={playerRef}
        configuration={configuration}
        analytics={analytics}
        title={title}
        style={styles.playerLoaded}
        autoPlay={autoPlay}
        onError={event => {
          playerError.current = {
            errCode: event?.nativeEvent?.code,
            errMessage: event?.nativeEvent?.message,
            url: configuration.url,
          };
          destroy();
        }}
        onDestroy={event => {
          const stoppedTimePoint =
            event?.nativeEvent?.currentTime === event?.nativeEvent?.duration
              ? '0.0'
              : event?.nativeEvent?.currentTime;
          if (typeof onClose === 'function') {
            onClose(playerError.current, stoppedTimePoint.toString());
          }
        }}
      />
      <Animated.View style={[styles.overlayContainer, guidanceBlockStyle]}>
        {Boolean(guidance) ? (
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
            {Boolean(guidanceDetails) ? (
              <RohText style={styles.guidanceSubTitle}>
                {guidanceDetails}
              </RohText>
            ) : null}
          </View>
        ) : null}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  textDescription: {
    position: 'absolute',
    flex: 1,
    alignSelf: 'center',
    top: scaleSize(180),
    fontSize: scaleSize(80),
    color: 'red',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    top: scaleSize(60),
    left: scaleSize(200),
    bottom: scaleSize(64),
    right: scaleSize(200),
    opacity: 1,
  },
  guidanceContainer: {
    position: 'absolute',
    backgroundColor: 'black',
    opacity: 0.7,
    top: scaleSize(130),
    left: 0,
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
});

export default Player;
