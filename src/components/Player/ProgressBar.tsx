import React, { useEffect, useRef, useState } from 'react';
import Slider from '@react-native-community/slider';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from 'themes/Styleguide';

interface Props {
  currentTime: number;
  duration: number;
  onSlideCapture: (time: number) => void;
  onFocus: () => void;
}

export const ProgressBar: React.FC<Props> = ({
  currentTime,
  duration,
  onSlideCapture,
  onFocus,
  exitButtonRef,
}) => {
  const [slidingPosition, setSlidingPosition] = useState<null | number>(null);
  const sliderValueRef = useRef(0);
  const [sliderStep, setSliderStep] = useState(1);
  const position = getMinutesFromSeconds(currentTime);
  const fullDuration = getMinutesFromSeconds(duration);
  useEffect(() => {
    setSlidingPosition(null);
    setSliderStep(1);
    sliderValueRef.current = 0;
  }, [currentTime]);
  return (
    <View style={styles.wrapper} focusable={false}>
      <Slider
        value={slidingPosition ? slidingPosition : currentTime}
        minimumValue={0}
        maximumValue={duration}
        step={sliderStep}
        onValueChange={handleOnSlide}
        minimumTrackTintColor={Colors.defaultTextColor}
        maximumTrackTintColor={'#FFFFFF'}
        thumbTintColor={Colors.defaultTextColor}
      />
      <View style={styles.timeWrapper} focusable={false}>
        <Text style={styles.timeLeft}>
          {slidingPosition ? getMinutesFromSeconds(slidingPosition) : position}
        </Text>
        <Text style={styles.timeRight}>{fullDuration}</Text>
      </View>
    </View>
  );

  function getMinutesFromSeconds(time: number) {
    const minutes = time >= 60 ? Math.floor(time / 60) : 0;
    const seconds = Math.floor(time - minutes * 60);

    return `${minutes >= 10 ? minutes : '0' + minutes}:${
      seconds >= 10 ? seconds : '0' + seconds
    }`;
  }

  function handleOnSlide(time: number) {
    onFocus();
    setSlidingPosition(time);
    onSlideCapture(time);
    sliderValueRef.current++;
    if (sliderValueRef.current > 30 && sliderValueRef.current < 60) {
      setSliderStep(5);
    } else if (sliderValueRef.current > 60) {
      setSliderStep(10);
    }
  }
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.01)',
    paddingTop: 10,
  },
  timeWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  timeLeft: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingLeft: 10,
  },
  timeRight: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'right',
    paddingRight: 10,
  },
});
