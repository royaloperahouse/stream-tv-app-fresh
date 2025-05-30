import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  useTVEventHandler,
  FlatList,
  BackHandler,
  TVFocusGuideView,
} from 'react-native';
import debounce from 'lodash.debounce';

import { Colors, PlayerIcons } from '@themes/Styleguide';
import { ProgressBar } from 'components/Player/ProgressBar';
import TouchableHighlightWrapper, {
  TTouchableHighlightWrapperRef,
} from 'components/TouchableHighlightWrapper';
import { scaleSize } from 'utils/scaleSize';
import RohText from 'components/RohText';
import SubtitlesSelect from 'assets/svg/player/SubtitlesSelect.svg';
import SubtitlesNotSelect from 'assets/svg/player/SubtitlesNotSelect.svg';

interface Props {
  playing: boolean;
  showSkip: boolean;
  onPlay: () => void;
  onPause: () => void;
  skipForwards?: () => void;
  skipBackwards?: () => void;
  duration: number;
  currentTime: number;
  seekTo: (time: number) => void;
  subtitleCue: string;
  subtitlesList: any[];
  selectedSubtitles: string | undefined;
  actionClose: () => void;
  isLiveStream: boolean;
}

export const PlayerControls: React.FC<Props> = ({
  playing,
  showSkip,
  onPlay,
  onPause,
  skipForwards,
  skipBackwards,
  duration,
  currentTime,
  seekTo,
  subtitleCue,
  subtitlesList,
  selectedSubtitles,
  setSubtitles,
  actionClose,
  isLiveStream,
}) => {
  const [focusedItem, setFocusedItem] = useState('');
  const activeAnimation = useRef<Animated.Value>(new Animated.Value(1)).current;
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isSubtitlesListVisible, setIsSubtitlesListVisible] = useState(false);
  const playPauseRef = useRef<TTouchableHighlightWrapperRef | null>(null);
  const subtitleButtonRef = useRef<TTouchableHighlightWrapperRef | null>(null);
  const focusToSubtitleButton = useCallback(() => {
    if (
      typeof subtitleButtonRef.current?.getRef === 'function' &&
      subtitleButtonRef?.current?.getRef?.()
    ) {
      subtitleButtonRef.current
        ?.getRef()
        ?.current?.setNativeProps({ hasTVPreferredFocus: true });
    }
  }, []);
  useTVEventHandler(event => {
    if (event && (event.eventType === 'down' || event.eventType === 'up')) {
      showControlsAnimation();
      if (playing) {
        hideControlsAnimation();
      }
    }
  });
  const showControlsAnimation = useCallback(() => {
    Animated.timing(activeAnimation, {
      toValue: 1,
      useNativeDriver: true,
      duration: 500,
    }).start(({ finished }) => {
      if (finished) {
        setIsControlsVisible(true);
      }
    });
  }, [activeAnimation]);

  const hideControlsAnimation = useRef(
    debounce(() => {
      Animated.timing(activeAnimation, {
        toValue: 0,
        useNativeDriver: true,
        duration: 500,
      }).start(({ finished }) => {
        if (finished) {
          setIsControlsVisible(false);
        }
      });
    }, 5000),
  ).current;

  useEffect(() => {
    if (playing) {
      hideControlsAnimation();
      return;
    }
    showControlsAnimation();
  }, [hideControlsAnimation, playing, showControlsAnimation]);

  const handleControlsFocus = () => {
    showControlsAnimation();
    if (playing) {
      hideControlsAnimation();
    }
  };

  const showSubtitlesList = () => {
    setIsSubtitlesListVisible(s => !s);
  };

  const onPressHandler = handler => {
    showControlsAnimation();
    handler();
    if (playing) {
      hideControlsAnimation();
    }
  };

  return (
    <>
      {isSubtitlesListVisible && (
        <SubtitlesList
          subtitlesList={subtitlesList}
          setSubtitles={setSubtitles}
          selectedSubtitles={selectedSubtitles}
          showSubtitlesList={showSubtitlesList}
          focusToSubtitleButton={focusToSubtitleButton}
          isSubtitlesListVisible={isSubtitlesListVisible}
        />
      )}
      <View
        focusable={false}
        style={
          isControlsVisible
            ? styles.subtitleCueWrapperActive
            : styles.subtitleCueWrapperInactive
        }>
        <SubtitleCue text={subtitleCue} />
      </View>
      <Animated.View
        style={[styles.exitButtonWrapper, { opacity: activeAnimation }]}>
        <TouchableHighlightWrapper
          onFocus={() => {
            setFocusedItem('exit');
            handleControlsFocus();
          }}
          onBlur={() => setFocusedItem('')}
          canMoveLeft={false}
          canMoveUp={false}
          canMoveRight={false}
          nextFocusDown={playPauseRef?.current?.getNode?.()}
          style={styles.exitButtonTouchable}
          underlayColor={Colors.defaultBlue}
          onPress={isControlsVisible ? actionClose : () => {}}>
          <View style={styles.buttonWrapper}>
            <Image
              source={PlayerIcons.close}
              style={[
                styles.icon,
                focusedItem === 'exit' ? styles.iconFocused : {},
              ]}
            />
            <RohText
              style={[
                styles.buttonText,
                focusedItem === 'exit'
                  ? styles.focusedButtonText
                  : styles.blurredButtonText,
              ]}>
              Exit
            </RohText>
          </View>
        </TouchableHighlightWrapper>
      </Animated.View>
      <Animated.View
        style={[styles.wrapper, { opacity: activeAnimation }]}
        focusable={false}>
        <ProgressBar
          onFocus={handleControlsFocus}
          currentTime={currentTime}
          duration={duration}
          onSlideCapture={seekTo}
          isLiveStream={isLiveStream}
        />
        <View style={styles.controlsWrapper}>
          {showSkip && (
            <TouchableHighlightWrapper
              onFocus={() => {
                setFocusedItem('seekBackward');
                handleControlsFocus();
              }}
              onBlur={() => {
                setFocusedItem('');
              }}
              canMoveDown={false}
              style={styles.touchable}
              underlayColor={Colors.defaultBlue}
              onPress={
                isControlsVisible
                  ? () => onPressHandler(skipBackwards)
                  : () => {}
              }>
              <Image
                source={PlayerIcons.seekBackward}
                style={[
                  styles.icon,
                  focusedItem === 'seekBackward' ? styles.iconFocused : {},
                ]}
              />
            </TouchableHighlightWrapper>
          )}

          <TouchableHighlightWrapper
            ref={playPauseRef}
            onFocus={() => {
              setFocusedItem('playPause');
              handleControlsFocus();
            }}
            onBlur={() => {
              setFocusedItem('');
            }}
            hasTVPreferredFocus={true}
            canMoveDown={false}
            style={styles.touchable}
            underlayColor={Colors.defaultTextColor}
            onPress={
              isControlsVisible ? (playing ? onPause : onPlay) : () => {}
            }>
            {playing ? (
              <Image
                source={PlayerIcons.pause}
                style={[
                  styles.icon,
                  focusedItem === 'playPause' ? styles.iconFocused : {},
                ]}
              />
            ) : (
              <Image
                source={PlayerIcons.play}
                style={[
                  styles.icon,
                  focusedItem === 'playPause' ? styles.iconFocused : {},
                ]}
              />
            )}
          </TouchableHighlightWrapper>
          {showSkip && (
            <TouchableHighlightWrapper
              onFocus={() => {
                setFocusedItem('seekForward');
                handleControlsFocus();
              }}
              onBlur={() => setFocusedItem('')}
              canMoveDown={false}
              style={styles.touchable}
              underlayColor={Colors.defaultTextColor}
              onPress={
                isControlsVisible
                  ? () => onPressHandler(skipForwards)
                  : () => {}
              }>
              <Image
                source={PlayerIcons.seekForward}
                style={[
                  styles.icon,
                  focusedItem === 'seekForward' ? styles.iconFocused : {},
                ]}
              />
            </TouchableHighlightWrapper>
          )}
          <TouchableHighlightWrapper
            ref={subtitleButtonRef}
            onFocus={() => {
              setFocusedItem('subtitles');
              handleControlsFocus();
            }}
            onBlur={() => setFocusedItem('')}
            canMoveRight={false}
            canMoveDown={false}
            style={styles.subtitleListTouchable}
            underlayColor={Colors.defaultTextColor}
            onPress={isControlsVisible ? showSubtitlesList : () => {}}>
            <Image
              source={PlayerIcons.subtitles}
              style={[
                styles.icon,
                focusedItem === 'subtitles' ? styles.iconFocused : {},
              ]}
            />
          </TouchableHighlightWrapper>
        </View>
      </Animated.View>
    </>
  );
};

const SubtitleCue = ({ text }) => {
  if (!text) {
    return <></>;
  }
  return (
    <View style={styles.subtitleCue}>
      <RohText style={styles.subtitleCueText}>{text}</RohText>
    </View>
  );
};

const SubtitlesList = ({
  subtitlesList,
  setSubtitles,
  showSubtitlesList,
  selectedSubtitles,
  isSubtitlesListVisible,
  focusToSubtitleButton,
}) => {
  const listRef = useRef<FlatList>();
  useEffect(() => {
    if (isSubtitlesListVisible) {
      listRef.current?.scrollToOffset({
        animated: true,
        offset:
          subtitlesList.findIndex(
            item => item.identifier === selectedSubtitles,
          ) * 80,
      });
    }
  }, [isSubtitlesListVisible, selectedSubtitles, subtitlesList]);
  useEffect(() => {
    const handleBackButtonClick = () => {
      if (isSubtitlesListVisible) {
        showSubtitlesList();
        focusToSubtitleButton();
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
  }, [focusToSubtitleButton, isSubtitlesListVisible, showSubtitlesList]);

  const onPressHandler = async subtitleTrack => {
    await setSubtitles(subtitleTrack.identifier);
    focusToSubtitleButton();
    showSubtitlesList();
  };

  return (
    <TVFocusGuideView
      trapFocusUp={true}
      trapFocusRight={true}
      trapFocusLeft={true}
      trapFocusDown={true}>
      <Animated.View style={styles.subtitleListWrapper}>
        <View style={styles.subtitlesContainer}>
          {!subtitlesList.length ? (
            <>
              <RohText style={styles.subtitlesContainerMessageText}>
                Subtitles are not available for this video
              </RohText>
              <TouchableHighlightWrapper
                underlayColor={Colors.defaultTextColor}
                style={styles.subtitleMessageConfirmContainer}
                hasTVPreferredFocus={true}
                canMoveLeft={false}
                canMoveRight={false}
                canMoveUp={false}
                canMoveDown={false}
                onPress={() => {
                  showSubtitlesList();
                  focusToSubtitleButton();
                }}>
                <RohText style={styles.subtitlesContainerMessageConfirmText}>
                  OK
                </RohText>
              </TouchableHighlightWrapper>
            </>
          ) : (
            <>
              <FlatList
                ref={listRef}
                data={subtitlesList}
                keyExtractor={item => item.identifier}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                style={styles.subtitlesFlatListContainer}
                onScrollToIndexFailed={() => {}}
                renderItem={({ item, index }) => (
                  <SubtitlesItem
                    onPress={() => onPressHandler(item)}
                    index={index}
                    listLength={subtitlesList.length}
                    subtitleTrack={item}
                    isSelected={item.identifier === selectedSubtitles}
                  />
                )}
              />
            </>
          )}
        </View>
      </Animated.View>
    </TVFocusGuideView>
  );
};

const SubtitlesItem = ({
  subtitleTrack,
  onPress,
  isSelected,
  index,
  listLength,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <TouchableHighlightWrapper
      underlayColor={Colors.defaultTextColor}
      style={
        index === listLength - 1
          ? styles.subtitleItemContainerLast
          : styles.subtitleItemContainer
      }
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      canMoveLeft={false}
      canMoveRight={false}
      canMoveDown={index !== listLength - 1}
      canMoveUp={index !== 0}
      hasTVPreferredFocus={isSelected}
      onPress={onPress}>
      <View style={styles.subtitleItemWrapper}>
        {isSelected ? (
          <SubtitlesSelect
            width={scaleSize(40)}
            height={scaleSize(40)}
            style={
              focused ? styles.focusedButtonText : styles.blurredButtonText
            }
          />
        ) : (
          <SubtitlesNotSelect
            width={scaleSize(40)}
            height={scaleSize(40)}
            style={
              focused ? styles.focusedButtonText : styles.blurredButtonText
            }
          />
        )}
        <RohText
          style={[
            isSelected ? styles.text : styles.textInActive,
            focused ? styles.focusedButtonText : styles.blurredButtonText,
          ]}>
          {subtitleTrack.text}
        </RohText>
      </View>
    </TouchableHighlightWrapper>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: scaleSize(40),
    height: scaleSize(40),
  },
  iconFocused: {
    tintColor: '#000000',
  },
  subtitlesContainerMessageTitleText: {
    color: 'white',
    fontSize: scaleSize(24),
    lineHeight: scaleSize(28),
    letterSpacing: scaleSize(1),
    paddingLeft: scaleSize(20),
    paddingVertical: scaleSize(35),
  },
  subtitlesContainerMessageText: {
    color: 'white',
    fontSize: scaleSize(24),
    lineHeight: scaleSize(28),
    letterSpacing: scaleSize(1),
    paddingLeft: scaleSize(20),
    paddingTop: scaleSize(20),
  },
  subtitlesContainerMessageConfirmText: {
    color: Colors.focusedTextColor,
    fontSize: scaleSize(28),
    lineHeight: scaleSize(28),
    letterSpacing: scaleSize(1),
  },
  subtitleMessageConfirmContainer: {
    marginTop: scaleSize(40),
    marginBottom: scaleSize(20),
    marginHorizontal: scaleSize(20),
    paddingHorizontal: scaleSize(20),
    maxHeight: scaleSize(80),
    minHeight: scaleSize(80),
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  controlsWrapper: {
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 3,
    marginLeft: 325,
  },
  subtitleListWrapper: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleItemWrapper: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitlesFlatListContainer: {
    flex: 0,
    paddingTop: 20,
  },
  subtitlesContainer: {
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'flex-start',
    width: 300,
    maxHeight: 300,
  },
  subtitleItemContainer: {
    marginHorizontal: scaleSize(20),
    paddingHorizontal: scaleSize(20),
    height: scaleSize(80),
    paddingLeft: scaleSize(40),
  },
  subtitleItemContainerLast: {
    marginHorizontal: scaleSize(20),
    paddingHorizontal: scaleSize(20),
    height: scaleSize(80),
    paddingLeft: scaleSize(40),
    marginBottom: scaleSize(60),
  },
  text: {
    marginLeft: scaleSize(20),
    fontSize: scaleSize(24),
    lineHeight: scaleSize(30),
  },
  textInActive: {
    marginLeft: scaleSize(20),
    fontSize: scaleSize(24),
    lineHeight: scaleSize(30),
    opacity: 0.7,
  },
  controlsOverlay: {
    position: 'absolute',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#000000c4',
  },
  wrapper: {
    position: 'absolute',
    bottom: 15,
    left: 25,
    width: Dimensions.get('window').width - 50,
  },
  subtitleCueWrapperActive: {
    marginBottom: 100,
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  subtitleCueWrapperInactive: {
    marginBottom: 30,
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  subtitleCue: {
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  subtitleCueText: {
    fontSize: scaleSize(32),
    lineHeight: scaleSize(40),
    color: '#FFFFFF',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scaleSize(72),
    height: scaleSize(72),
  },
  buttonText: {
    fontSize: scaleSize(24),
    marginLeft: scaleSize(14),
  },
  focusedButtonText: {
    color: Colors.focusedTextColor,
  },
  blurredButtonText: {
    color: Colors.defaultTextColor,
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  exitButtonTouchable: {
    padding: 10,
  },
  exitButtonWrapper: {
    position: 'absolute',
    right: 40,
    top: 40,
  },
  subtitleListTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: scaleSize(600),
    height: scaleSize(72),
    minWidth: scaleSize(72),
  },
  restartButtonTouchable: {
    position: 'absolute',
    top: 40,
    right: 40,
    padding: 10,
  },
});
