import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  FlatList,
  SafeAreaView,
  BackHandler,
  HWEvent,
} from 'react-native';
import { Colors, PlayerIcons } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import ISO6391 from 'iso-639-1';

import ControlButton from './ControlButton';
import { TTouchableHighlightWrapperRef } from '@components/TouchableHighlightWrapper';
import RohText from '@components/RohText';
import SubtitlesItem from './SubtitlesItem';
import { ESeekOperations } from '@configs/bitMovinPlayerConfig';
import { TVEventManager } from '@services/tvRCEventListener';
import debounce from 'lodash.debounce';
import { isTVOS } from 'configs/globalConfig';

type TPlayerControlsProps = {
  duration: number;
  playerLoaded: boolean;
  title: string;
  subtitle: string;
  onPlayPress: () => void;
  onRestartPress: () => void;
  onPausePress: () => void;
  onClose: () => void;
  setSubtitle: (trackId: string) => void;
  autoPlay: boolean;
  subtitleCue: string;
  calculateTimeForSeeking: (
    startTime: number,
    countOfSeekingIteration: number,
    seekOp: ESeekOperations,
  ) => number;
  seekTo: (time: number) => void;
  videoInfo?: string;
  guidance?: string;
  guidanceDetails?: string;
  isLiveStream?: boolean;
};

export type TPlayerControlsRef = {
  setCurrentTime?: (time: number) => void;
  setPlay?: (isPlaying: boolean) => void;
  loadSubtitleList?: (subtitles: TSubtitles) => void;
  controlFadeIn?: () => void;
  controlFadeOut?: () => void;
  setSeekQueueFree?: () => void;
  seekUpdatingFinished?: () => void;
  setSubtitleCue?: (text: string) => void;
};

const PlayerControls = forwardRef<TPlayerControlsRef, TPlayerControlsProps>(
  (props, ref) => {
    const {
      duration,
      title,
      subtitle,
      onPlayPress,
      onRestartPress,
      onPausePress,
      onClose,
      setSubtitle,
      playerLoaded,
      autoPlay,
      calculateTimeForSeeking,
      seekTo,
      videoInfo,
      guidance,
      guidanceDetails,
      isLiveStream,
    } = props;
    const [subtitleCueText, setSubtitleCueText] = useState('');
    const otherRCTVEvents = useRef<Array<(_: any, event: any) => void>>([]);
    const activeAnimation = useRef<Animated.Value>(
      new Animated.Value(1),
    ).current;
    const isPlayingRef = useRef<boolean>(false);
    const controlMountedRef = useRef<boolean>(false);
    const progressBarRef = useRef<TProgressBarRef | null>(null);
    const subtitleButtonRef = useRef<null | TTouchableHighlightWrapperRef>(
      null,
    );
    const centralControlsRef = useRef<TCentralControlsRef | null>(null);
    const subtitlesRef = useRef<null | TSubtitlesRef>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const controlPanelVisibleRef = useRef<boolean>(true);
    const [hasSubtitles, setHasSubtitles] = useState<boolean>(false);
    const countOfFastForwardClicks = useRef<number>(0);
    const countOfRewindClicks = useRef<number>(0);
    const seekQueueuBusy = useRef<boolean>(false);
    const seekUpdatingOnDevice = useRef<boolean>(false);
    const startPointForSeek = useRef<number>(0.0);
    const seekOperation = useRef<ESeekOperations>(ESeekOperations.fastForward);
    const exitButtonRef = useRef<null | TTouchableHighlightWrapperRef>(null);
    const restartButtonRef = useRef<null | TTouchableHighlightWrapperRef>(null);
    let fastForwardClickStack = useRef<number>(0);

    const focusToSutitleButton = useCallback(() => {
      if (
        typeof subtitleButtonRef.current?.getRef === 'function' &&
        subtitleButtonRef.current.getRef()
      ) {
        console.log('focus');
        subtitleButtonRef.current
          .getRef()
          .current?.setNativeProps({ hasTVPreferredFocus: true });
      }
    }, []);
    const openSubtitleListHandler = () => {
      console.log('opened subtitles');
      if (typeof subtitlesRef?.current?.showSubtitles === 'function') {
        subtitlesRef.current.showSubtitles();
      }
    };
    const getControlPanelVisible = useCallback(
      () => controlPanelVisibleRef.current,
      [],
    );
    useImperativeHandle(
      ref,
      () => ({
        setCurrentTime: (time: number) => {
          const timeForSeeking: number = calculateTimeForSeeking(
            startPointForSeek.current,
            seekOperation.current === ESeekOperations.fastForward
              ? countOfFastForwardClicks.current
              : countOfRewindClicks.current,
            seekOperation.current,
          );
          if (
            !controlMountedRef.current ||
            typeof progressBarRef.current?.setCurrentTime !== 'function'
          ) {
            return;
          }

          if (!seekQueueuBusy.current) {
            countOfRewindClicks.current = 0;
            countOfFastForwardClicks.current = 0;
            startPointForSeek.current = time;
            progressBarRef.current?.setCurrentTime(time);
          } else if (timeForSeeking !== -1) {
            // progressBarRef.current?.setCurrentTime(timeForSeeking);
          }
        },
        setPlay: (play: boolean) => {
          if (!controlMountedRef.current) {
            return;
          }
          isPlayingRef.current = play;
          if (typeof centralControlsRef.current?.setPlay === 'function') {
            centralControlsRef.current.setPlay(play);
          }
        },
        setSubtitleCue: (text: string) => {
          setSubtitleCueText(text);
        },
        loadSubtitleList: (subtitles: TSubtitles) => {
          if (!controlMountedRef.current) {
            return;
          }
          if (subtitles.length > 0) {
            setHasSubtitles(true);
          }
          if (typeof subtitlesRef?.current?.setsubtitleList === 'function') {
            subtitlesRef.current.setsubtitleList(subtitles);
          }
        },
        controlFadeIn: () => {
          Animated.timing(activeAnimation, {
            toValue: 0,
            useNativeDriver: true,
            duration: 5000,
          }).start(({ finished }) => {
            if (finished) {
              controlPanelVisibleRef.current = false;
            }
          });
        },
        controlFadeOut: () => {
          Animated.timing(activeAnimation, {
            toValue: 1,
            useNativeDriver: true,
            duration: 500,
          }).start(({ finished }) => {
            if (finished) {
              controlPanelVisibleRef.current = true;
            }
          });
        },
        setSeekQueueFree: () => {
          if (!controlMountedRef.current) {
            return;
          }
          seekQueueuBusy.current = false;
        },
        seekUpdatingFinished: () => {
          if (!controlMountedRef.current) {
            return;
          }
          seekUpdatingOnDevice.current = false;
        },
      }),
      [calculateTimeForSeeking],
    );

    useLayoutEffect(() => {
      if (autoPlay && playerLoaded) {
        activeAnimation.setValue(0);
        controlPanelVisibleRef.current = true;
        Animated.timing(activeAnimation, {
          toValue: 0,
          useNativeDriver: true,
          duration: 5000,
        }).start(({ finished }) => {
          if (finished) {
            controlPanelVisibleRef.current = false;
          }
        });
      }
      if (!autoPlay && playerLoaded) {
        activeAnimation.setValue(0);
        controlPanelVisibleRef.current = true;
      }
    }, [autoPlay && playerLoaded]);

    useEffect(() => {
      otherRCTVEvents.current = TVEventManager.getEventListeners();
      return () => {
        TVEventManager.setEventListeners(otherRCTVEvents.current);
      };
    }, []);

    useEffect(() => {
      TVEventManager.setEventListeners([
        (eve: HWEvent) => {
          if (eve?.eventType === 'blur' || eve?.eventType === 'focus') {
            return;
          }
          if (eve?.eventKeyAction === 1 || isTVOS) {
            switch (eve.eventType) {
              case 'select': {
                if (
                  eve.tag === centralControlsRef.current?.getFwdNode() &&
                  seekUpdatingOnDevice.current === false &&
                  (seekOperation.current === ESeekOperations.fastForward ||
                    seekQueueuBusy.current === false)
                ) {
                  seekQueueuBusy.current = true;
                  countOfFastForwardClicks.current++;
                  seekOperation.current = ESeekOperations.fastForward;
                  break;
                }
                if (
                  eve.tag === centralControlsRef.current?.getRwdNode() &&
                  seekUpdatingOnDevice.current === false &&
                  (seekOperation.current === ESeekOperations.rewind ||
                    seekQueueuBusy.current === false)
                ) {
                  seekQueueuBusy.current = true;
                  countOfRewindClicks.current++;
                  seekOperation.current = ESeekOperations.rewind;
                  break;
                }
                break;
              }
              case 'fastForward': {
                if (
                  seekUpdatingOnDevice.current ||
                  (seekOperation.current !== ESeekOperations.fastForward &&
                    seekQueueuBusy.current)
                ) {
                  break;
                }
                seekQueueuBusy.current = true;
                countOfFastForwardClicks.current++;
                seekOperation.current = ESeekOperations.fastForward;
                break;
              }
              case 'rewind': {
                if (
                  seekUpdatingOnDevice.current ||
                  (seekOperation.current !== ESeekOperations.rewind &&
                    seekQueueuBusy.current)
                ) {
                  break;
                }
                seekQueueuBusy.current = true;
                countOfRewindClicks.current++;
                seekOperation.current = ESeekOperations.rewind;
                break;
              }
              default:
                break;
            }
          }

          if (eve?.eventKeyAction === 1 || isTVOS) {
            switch (eve.eventType) {
              case 'select': {
                // <---fast forward logic--->
                if (
                  eve.tag === centralControlsRef.current?.getFwdNode() &&
                  seekOperation.current === ESeekOperations.fastForward
                ) {
                  fastForwardClickStack.current++;
                }

                if (
                  eve.tag === centralControlsRef.current?.getRwdNode() &&
                  seekOperation.current === ESeekOperations.rewind
                ) {
                  fastForwardClickStack.current++;
                }
                // <---fast forward logic--->

                if (
                  eve.tag === centralControlsRef.current?.getFwdNode() &&
                  countOfFastForwardClicks.current &&
                  seekOperation.current === ESeekOperations.fastForward
                ) {
                  seekUpdatingOnDevice.current = true;
                  const timeForSeeking: number = calculateTimeForSeeking(
                    startPointForSeek.current,
                    fastForwardClickStack.current > 5
                      ? calculateRewindStep(fastForwardClickStack.current)
                      : 1,
                    seekOperation.current,
                  );
                  if (timeForSeeking === -1) {
                    countOfFastForwardClicks.current = 0;
                    seekUpdatingOnDevice.current = false;
                    seekQueueuBusy.current = false;
                    break;
                  }

                  startPointForSeek.current = timeForSeeking;
                  progressBarRef.current?.setCurrentTime(timeForSeeking);
                  debouncedSeekToo(timeForSeeking);

                  break;
                }
                if (
                  eve.tag === centralControlsRef.current?.getRwdNode() &&
                  countOfRewindClicks.current &&
                  seekOperation.current === ESeekOperations.rewind
                ) {
                  seekUpdatingOnDevice.current = true;
                  const timeForSeeking: number = calculateTimeForSeeking(
                    startPointForSeek.current,
                    fastForwardClickStack.current > 5
                      ? calculateRewindStep(fastForwardClickStack.current)
                      : 1,
                    seekOperation.current,
                  );
                  if (timeForSeeking === -1) {
                    countOfRewindClicks.current = 0;
                    seekUpdatingOnDevice.current = false;
                    seekQueueuBusy.current = false;
                    break;
                  }

                  startPointForSeek.current = timeForSeeking;
                  progressBarRef.current?.setCurrentTime(timeForSeeking);
                  debouncedSeekToo(timeForSeeking);
                }
                break;
              }
              case 'fastForward': {
                // <---fast forward logic--->
                if (countOfFastForwardClicks.current) {
                  fastForwardClickStack.current++;
                  // <---fast forward logic--->

                  seekUpdatingOnDevice.current = true;
                  const timeForSeeking: number = calculateTimeForSeeking(
                    startPointForSeek.current,
                    fastForwardClickStack.current > 5
                      ? calculateRewindStep(fastForwardClickStack.current)
                      : 1,
                    seekOperation.current,
                  );
                  if (timeForSeeking === -1) {
                    countOfFastForwardClicks.current = 0;
                    seekUpdatingOnDevice.current = false;
                    seekQueueuBusy.current = false;
                    break;
                  }
                  startPointForSeek.current = timeForSeeking;
                  progressBarRef.current?.setCurrentTime(timeForSeeking);
                  debouncedSeekToo(timeForSeeking);
                }
                break;
              }
              case 'rewind': {
                if (countOfRewindClicks.current) {
                  // <---fast forward logic--->
                  fastForwardClickStack.current++;
                  // <---fast forward logic--->

                  seekUpdatingOnDevice.current = true;
                  const timeForSeeking: number = calculateTimeForSeeking(
                    startPointForSeek.current,
                    fastForwardClickStack.current > 5
                      ? calculateRewindStep(fastForwardClickStack.current)
                      : 1,
                    seekOperation.current,
                  );
                  if (timeForSeeking === -1) {
                    countOfRewindClicks.current = 0;
                    seekUpdatingOnDevice.current = false;
                    seekQueueuBusy.current = false;
                    break;
                  }

                  startPointForSeek.current = timeForSeeking;
                  progressBarRef.current?.setCurrentTime(timeForSeeking);
                  debouncedSeekToo(timeForSeeking);
                }
                break;
              }
              case 'playPause': {
                const currentPlayerAction = isPlayingRef.current
                  ? onPausePress
                  : onPlayPress;
                currentPlayerAction();
                fastForwardClickStack.current = 0;
                break;
              }
              default:
                break;
            }
          }
          if (eve?.eventKeyAction === 1 || isTVOS) {
            Animated.timing(activeAnimation, {
              toValue: 1,
              useNativeDriver: true,
              duration: 500,
            }).start(({ finished }) => {
              if (!finished) {
                activeAnimation.setValue(1);
              }
              controlPanelVisibleRef.current = true;
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              timeoutRef.current = setTimeout(() => {
                if (!isPlayingRef.current) {
                  return;
                }
                Animated.timing(activeAnimation, {
                  toValue: 0,
                  useNativeDriver: true,
                  duration: 500,
                }).start(({ finished: animationFinished }) => {
                  if (animationFinished) {
                    controlPanelVisibleRef.current = false;
                    fastForwardClickStack.current = 0;
                  }
                });
              }, 5000);
            });
          }
        },
      ]);
    }, [
      onPausePress,
      onPlayPress,
      calculateTimeForSeeking,
      seekTo,
      fastForwardClickStack,
    ]);

    const debouncedSeekToo = debounce((time: number) => {
      seekTo(time);
      fastForwardClickStack.current = 0;
    }, 250);

    const calculateRewindStep = (numberOfClicks: number) => {
      return numberOfClicks * 0.5;
    };

    useLayoutEffect(() => {
      const intervalId = setInterval(() => {
        const timeForSeeking: number = calculateTimeForSeeking(
          startPointForSeek.current,
          seekOperation.current === ESeekOperations.fastForward
            ? countOfFastForwardClicks.current
            : countOfRewindClicks.current,
          seekOperation.current,
        );
        if (
          !controlMountedRef.current ||
          typeof progressBarRef.current?.setCurrentTime !== 'function'
        ) {
          return;
        }
        if (
          !isPlayingRef.current &&
          seekQueueuBusy.current &&
          timeForSeeking !== -1
        ) {
          progressBarRef.current.setCurrentTime(timeForSeeking);
        }
      }, 500);
      return () => {
        clearInterval(intervalId);
      };
    }, [calculateTimeForSeeking]);

    useLayoutEffect(() => {
      controlMountedRef.current = true;
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);
    return (
      <SafeAreaView style={styles.root}>
        <Animated.View style={[styles.container, { opacity: activeAnimation }]}>
          <View style={styles.topContainer}>
            <ControlButton
              ref={exitButtonRef}
              icon={PlayerIcons.close}
              onPress={onClose}
              text="Exit"
              canMoveLeft={false}
              canMoveUp={false}
              nextFocusRight={restartButtonRef.current?.getNode?.()}
              nextFocusDown={centralControlsRef.current?.getRwdNode()}
              getControlPanelVisible={getControlPanelVisible}
            />
            <ControlButton
              ref={restartButtonRef}
              icon={PlayerIcons.restart}
              onPress={onRestartPress}
              text="Restart"
              canMoveRight={false}
              canMoveUp={false}
              nextFocusLeft={exitButtonRef?.current?.getNode?.()}
              getControlPanelVisible={getControlPanelVisible}
              nextFocusDown={centralControlsRef.current?.getRwdNode()}
            />
            {videoInfo && (
              <View style={styles.infoContainer}>
                <RohText style={styles.infoText} bold>
                  {videoInfo}
                </RohText>
              </View>
            )}
          </View>
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
            <RohText
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail">
              {title}
            </RohText>
            {Boolean(subtitle) && (
              <RohText
                style={styles.subtitle}
                numberOfLines={1}
                ellipsizeMode="tail">
                {subtitle}
              </RohText>
            )}
          </View>
          <ProgressBar duration={duration} isLiveStream={isLiveStream} ref={progressBarRef} />
          <View style={styles.controlContainer}>
            <CentralControls
              onPausePress={onPausePress}
              onPlayPress={onPlayPress}
              ref={centralControlsRef}
              hasSubtitles={hasSubtitles}
              exitButtonNode={exitButtonRef.current?.getNode?.()}
              getControlPanelVisible={getControlPanelVisible}
              subtitlesButtonNode={subtitleButtonRef.current?.getNode?.()}
            />
            <View style={styles.rightControls}>
              {hasSubtitles && (
                <ControlButton
                  ref={subtitleButtonRef}
                  icon={PlayerIcons.subtitles}
                  onPress={openSubtitleListHandler}
                  getControlPanelVisible={getControlPanelVisible}
                  canMoveRight={false}
                  canMoveDown={false}
                  nextFocusUp={exitButtonRef.current?.getNode?.()}
                  nextFocusLeft={centralControlsRef.current?.getFwdNode?.()}
                />
              )}
            </View>
          </View>
        </Animated.View>
        <Subtitles
          focusToSutitleButton={focusToSutitleButton}
          ref={subtitlesRef}
          setSubtitle={setSubtitle}
        />
        {subtitleCueText !== '' && (
          <View style={styles.subtitleCueContainer}>
            <RohText style={styles.subtitleCueText}>{subtitleCueText}</RohText>
          </View>
        )}
      </SafeAreaView>
    );
  },
);

export default PlayerControls;

//ProgressBar component

type TProgressBarRef = {
  setCurrentTime?: (time: number) => void;
};
type TProgressBarProps = { duration: number, isLiveStream?: boolean };

const ProgressBar = forwardRef<TProgressBarRef, TProgressBarProps>(
  ({ duration, isLiveStream }, ref) => {
    const [currentTime, setCurrentTime] = useState<number>(0.0);
    const progressBarMountedRef = useRef<boolean>(false);
    useImperativeHandle(
      ref,
      () => ({
        setCurrentTime: (time: number) => {
          if (!progressBarMountedRef.current) {
            return;
          }
          setCurrentTime(time);
        },
      }),
      [],
    );
    const getTimeFormat = (time: number = 0): string => {
      let formattedString = '00:00';
      if (time > 0) {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time - hours * 3600) / 60);
        const seconds = time - hours * 3600 - minutes * 60;
        const stringMinutes = minutes > 10 ? `${minutes}` : `0${minutes}`;
        const stringSeconds =
          seconds > 9 ? `${seconds.toFixed(0)}` : `0${seconds.toFixed(0)}`;
        formattedString = `${hours}:${stringMinutes}:${stringSeconds}`;
        if (hours < 1) {
          formattedString =
            `${stringMinutes}:${stringSeconds}`;
        }
      }
      return formattedString;
    };
    useLayoutEffect(() => {
      progressBarMountedRef.current = true;
    }, []);
    return (
      <View style={styles.progressContainer}>
        <View>
          <RohText style={styles.currentTime}>
            {isLiveStream ? '-' + getTimeFormat(currentTime) : getTimeFormat(currentTime)}
          </RohText>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressBarActive,
              { width: isLiveStream ? (100 - (currentTime / duration) * 100) + '%' : (currentTime / duration) * 100 + '%' },
            ]}
          />
          <View
            style={[
              styles.progressBarInactive,
              { width: isLiveStream ? ((currentTime / duration) * 100 + '%') : 100 - (currentTime / duration) * 100 + '%' },
            ]}
          />
        </View>
        {isLiveStream ? (
          <RohText style={styles.liveLabel}>LIVE</RohText>
        ) : (
          <RohText style={styles.duration}>{getTimeFormat(duration)}</RohText>
        )}
      </View>
    );
  },
);

//Subtitles component

type TSubtitlesProps = {
  focusToSutitleButton: () => void;
  setSubtitle: (trackId: string) => void;
};
export type TSubtitles = Array<{
  url: string;
  identifier: string;
  label: string;
  isDefault: boolean;
}>;

type TSubtitlesRef = {
  setsubtitleList: (subtitles: TSubtitles) => void;
  showSubtitles: () => void;
};

const Subtitles = forwardRef<TSubtitlesRef, TSubtitlesProps>((props, ref) => {
  const { focusToSutitleButton, setSubtitle } = props;
  const overlayAnimation = useRef(new Animated.Value(0)).current;
  const subtitleContainerAnimation = useRef(new Animated.Value(0)).current;
  const [subtitleList, setSubtitleList] = useState<TSubtitles>([]);
  const previousSubtitleList = useRef([]);
  const [showList, setShowList] = useState<boolean>(false);
  const subtitlesActiveItemRef = useRef<string | null>(null);
  const subtitlesMountedRef = useRef<boolean>(false);
  const hideSubtitles = useCallback(() => {
    if (typeof focusToSutitleButton === 'function') {
      focusToSutitleButton();
    }
    setShowList(false);
    Animated.timing(subtitleContainerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(sutitleAnimationResult => {
      if (!sutitleAnimationResult.finished) {
        subtitleContainerAnimation.setValue(0);
      }
      Animated.timing(overlayAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(overlayAnimationResult => {
        if (!overlayAnimationResult.finished) {
          overlayAnimation.setValue(0);
        }
      });
    });
  }, [focusToSutitleButton]);

  const onPressHandler = (trackId: string, pressed: boolean) => {
    if (trackId === subtitlesActiveItemRef.current && !pressed) {
      return;
    }

    subtitlesActiveItemRef.current = trackId;
    setSubtitle(trackId);
    if (pressed) hideSubtitles();
  };

  useImperativeHandle(
    ref,
    () => ({
      setsubtitleList: (subtitles: TSubtitles) => {
        if (!subtitlesMountedRef.current) {
          return;
        }
        console.log('setting subtitle list');
        setSubtitleList(subtitles);
      },
      showSubtitles: () => {
        if (
          !subtitlesMountedRef.current ||
          !Array.isArray(subtitleList) ||
          !subtitleList.length
        ) {
          return;
        }
        Animated.timing(overlayAnimation, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }).start(overlayAnimationResult => {
          if (!overlayAnimationResult.finished) {
            overlayAnimation.setValue(0.5);
          }
          setShowList(true);
          Animated.timing(subtitleContainerAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start(sutitleAnimationResult => {
            if (!sutitleAnimationResult.finished) {
              subtitleContainerAnimation.setValue(1);
            }
          });
        });
      },
    }),
    [subtitleList, overlayAnimation, subtitleContainerAnimation],
  );

  useLayoutEffect(() => {
    subtitlesMountedRef.current = true;
  }, []);

  useEffect(() => {
    const handleBackButtonClick = () => {
      if (showList) {
        hideSubtitles();
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, [showList, hideSubtitles]);

  // Moving off label to the end of the list and setting friendly name for subtitles labels
  if (subtitleList.length) {
    const offLabelIndex = subtitleList.findIndex(i => i && i.label === 'off');
    subtitleList.push(subtitleList.splice(offLabelIndex, 1)[0]);
    subtitleList.forEach(i => {
      const friendlyName = ISO6391.getName(i.label);
      if (friendlyName) {
        i.label = friendlyName;
      }
    });
  }
  useEffect(() => {
    if (previousSubtitleList.current[0]?.identifier === subtitleList[0]?.identifier) {
      return;
    }
    if (!subtitleList.length) {
      return;
    }
    const defaultSubs = subtitleList.find(i => i.isDefault);
    if (defaultSubs) {
      onPressHandler(defaultSubs.identifier, false);
      previousSubtitleList.current = [subtitleList];
    }
  }, [subtitleList]);
  console.log(showList);
  return (
    <SafeAreaView style={styles.subtitlesContainer}>
      <Animated.View
        style={[
          styles.subtitlesShadowOverlay,
          {
            opacity: overlayAnimation,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.subtitlesContentContainer,
          {
            opacity: subtitleContainerAnimation,
          },
        ]}>
        {showList && (
          <View style={styles.subtitlesListContainer}>
            <RohText style={styles.subtitlesContainerTitleText}>
              subtitles
            </RohText>
            <FlatList
              data={subtitleList}
              keyExtractor={item => item.identifier}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={styles.subtitlesFlatListContainer}
              renderItem={({ item, index }) => (
                <SubtitlesItem
                  hasTVPreferredFocus={
                    (subtitlesActiveItemRef.current === null && index === 0) ||
                    subtitlesActiveItemRef.current === item.identifier
                  }
                  onPress={() => onPressHandler(item.identifier, true)}
                  currentIndex={index}
                  itemsLength={subtitleList.length}
                  text={item.label === 'off' ? 'Off' : item.label}
                />
              )}
            />
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
});

//Central Controls Component

type TCentralControlsProps = {
  onPausePress: () => void;
  onPlayPress: () => void;
  getControlPanelVisible: () => boolean;
  hasSubtitles: boolean;
  exitButtonNode?: number;
  subtitlesButtonNode?: number;
};
type TCentralControlsRef = {
  setPlay: (play: boolean) => void;
  getFwdNode: () => number | undefined;
  getRwdNode: () => number | undefined;
};
const CentralControls = forwardRef<TCentralControlsRef, TCentralControlsProps>(
  (props, ref) => {
    const {
      onPausePress,
      onPlayPress,
      getControlPanelVisible,
      hasSubtitles,
      exitButtonNode,
      subtitlesButtonNode,
    } = props;
    const centralControlsMounted = useRef<boolean>(false);
    const [isPlaying, setPlaying] = useState(false);
    const fwdRef = useRef<TTouchableHighlightWrapperRef | null>(null);
    const rwdRef = useRef<TTouchableHighlightWrapperRef | null>(null);
    const playRef = useRef<TTouchableHighlightWrapperRef | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        setPlay: play => {
          if (centralControlsMounted.current) {
            setPlaying(play);
          }
        },
        getFwdNode: () => {
          if (
            centralControlsMounted.current &&
            typeof fwdRef.current?.getNode === 'function'
          ) {
            return fwdRef.current.getNode();
          }
        },
        getRwdNode: () => {
          if (
            centralControlsMounted.current &&
            typeof rwdRef.current?.getNode === 'function'
          ) {
            return rwdRef.current.getNode();
          }
        },
      }),
      [],
    );

    useLayoutEffect(() => {
      centralControlsMounted.current = true;
      return () => {
        centralControlsMounted.current = false;
      };
    }, []);
    return (
      <View style={styles.centralControls}>
        <ControlButton
          icon={PlayerIcons.seekBackward}
          ref={rwdRef}
          getControlPanelVisible={getControlPanelVisible}
          canMoveDown={false}
          canMoveLeft={false}
          nextFocusRight={playRef.current?.getNode?.()}
          nextFocusUp={exitButtonNode}
        />
        <ControlButton
          ref={playRef}
          icon={isPlaying ? PlayerIcons.pause : PlayerIcons.play}
          onPress={isPlaying ? onPausePress : onPlayPress}
          hasTVPreferredFocus
          getControlPanelVisible={getControlPanelVisible}
          canMoveDown={false}
          nextFocusUp={exitButtonNode}
          nextFocusLeft={rwdRef.current?.getNode?.()}
          nextFocusRight={fwdRef.current?.getNode?.()}
        />
        <ControlButton
          ref={fwdRef}
          icon={PlayerIcons.seekForward}
          getControlPanelVisible={getControlPanelVisible}
          canMoveDown={false}
          nextFocusLeft={playRef.current?.getNode?.()}
          canMoveRight={hasSubtitles}
          nextFocusRight={subtitlesButtonNode}
          nextFocusUp={exitButtonNode}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    top: scaleSize(60),
    left: scaleSize(200),
    bottom: scaleSize(64),
    right: scaleSize(200),
  },
  topContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
  },
  titleContainer: {
    width: '100%',
  },
  title: {
    fontSize: scaleSize(72),
    textTransform: 'uppercase',
    color: Colors.defaultTextColor,
  },
  subtitle: {
    fontSize: scaleSize(24),
    textTransform: 'uppercase',
    color: Colors.defaultTextColor,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: scaleSize(112),
    flexDirection: 'row',
  },
  controlContainer: {
    flexDirection: 'row',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    right: 0,
    left: 0,
  },
  centralControls: {
    flexDirection: 'row',
  },
  rightControls: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
  },
  progressBar: {
    flexDirection: 'row',
    width: scaleSize(1262),
    height: scaleSize(8),
    marginLeft: scaleSize(20),
    marginRight: scaleSize(20),
  },
  progressBarActive: {
    height: scaleSize(8),
    backgroundColor: Colors.defaultTextColor,
  },
  progressBarInactive: {
    height: scaleSize(8),
    backgroundColor: Colors.defaultTextColor,
    opacity: 0.5,
  },
  currentTime: {
    fontSize: scaleSize(24),
    textTransform: 'uppercase',
    color: Colors.defaultTextColor,
  },
  liveLabel: {
    backgroundColor: 'red',
    color: 'white',
    borderRadius: 15,
    textAlign: 'center',
    fontSize: scaleSize(24),
    width: scaleSize(85),
    position: 'absolute',
    top: 0,
    right: -90,
  },
  duration: {
    fontSize: scaleSize(24),
    textTransform: 'uppercase',
    color: Colors.defaultTextColor,
  },
  shadowWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  subtitlesContainerTitleText: {
    textTransform: 'uppercase',
    color: 'white',
    fontSize: scaleSize(24),
    lineHeight: scaleSize(28),
    letterSpacing: scaleSize(1),
    paddingLeft: scaleSize(60),
    paddingVertical: scaleSize(35),
  },
  subtitlesContainer: {
    flex: 1,
  },
  subtitlesShadowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  subtitlesContentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  subtitlesListContainer: {
    backgroundColor: Colors.backgroundColor,
    width: scaleSize(528),
    height: scaleSize(631),
  },
  subtitlesFlatListContainer: {
    flex: 0,
  },
  subtitleText: { color: 'white', fontSize: scaleSize(24) },
  infoText: {
    color: Colors.title,
    fontSize: scaleSize(24),
    textAlign: 'justify',
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '80%',
  },
  dropDownArrow: {
    marginTop: scaleSize(16),
    marginBottom: scaleSize(12),
    alignItems: 'center',
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
  subtitleCueContainer: {
    position: 'absolute',
    top: 0,
    bottom: scaleSize(100),
    right: 0,
    left: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  subtitleCueText: {
    textAlign: 'center',
    color: 'white',
    backgroundColor: 'black',
    fontSize: scaleSize(32),
    padding: scaleSize(4),
  },
});
