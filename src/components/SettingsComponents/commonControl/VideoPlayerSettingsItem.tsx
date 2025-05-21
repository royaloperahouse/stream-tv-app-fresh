import React, { forwardRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { scaleSize } from '@utils/scaleSize';

import RohText from '@components/RohText';

import TouchableHighlightWrapper from '@components/TouchableHighlightWrapper';
import { Colors } from '@themes/Styleguide';
import VideoQualityNotSelect from '@assets/svg/playerSettings/VideoQualityNotSelect.svg';
import VideoQualitySelect from '@assets/svg/playerSettings/VideoQualitySelect.svg';
import VideoSD from '@assets/svg/playerSettings/video-sd-icon.svg';
import VideoHD from '@assets/svg/playerSettings/video-hd-icon.svg';
import VideoHQ from '@assets/svg/playerSettings/video-hq-icon.svg';

type Props = {
  text: string;
  onPress: (val: string) => void;
  currentIndex: number;
  itemsLength: number;
  isActive: boolean;
  type: 'sd' | 'hd' | 'hq';
  id: string;
};

const VideoPlayerSettingsItem = forwardRef<any, Props>((props, ref) => {
  const [focused, setFocused] = useState(false);
  const { text, onPress, currentIndex, itemsLength, isActive, type, id } =
    props;

  const onPressHandler = () => {
    if (typeof onPress === 'function') {
      onPress(id);
    }
  };
  return (
    <TouchableHighlightWrapper
      underlayColor={Colors.defaultTextColor}
      ref={ref}
      style={styles.subtitleItemContainer}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      canMoveRight={false}
      canMoveDown={currentIndex !== itemsLength - 1}
      canMoveUp={currentIndex !== 0}
      onPress={onPressHandler}>
      <View style={styles.wrapper}>
        {isActive ? (
          <VideoQualitySelect
            width={scaleSize(40)}
            height={scaleSize(40)}
            style={focused ? styles.textColorFocused : styles.textColorBlurred}
          />
        ) : (
          <VideoQualityNotSelect
            width={scaleSize(40)}
            height={scaleSize(40)}
            style={focused ? styles.textColorFocused : styles.textColorBlurred}
          />
        )}
        <RohText
          style={[
            styles.text,
            focused ? styles.textColorFocused : styles.textColorBlurred,
          ]}>
          {text}
        </RohText>
      </View>
    </TouchableHighlightWrapper>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '90%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitleItemContainer: {
    height: scaleSize(80),
    paddingRight: scaleSize(40),
    paddingLeft: scaleSize(24),
  },
  text: {
    marginLeft: scaleSize(20),
    fontSize: scaleSize(24),
    lineHeight: scaleSize(30),
  },
  textColorFocused: {
    color: Colors.focusedTextColor,
  },
  textColorBlurred: {
    color: Colors.defaultTextColor,
  },
});

export default VideoPlayerSettingsItem;
