import React, { useLayoutEffect } from 'react';

import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { scaleSize } from '@utils/scaleSize';

interface LoginSpinnerProps {
  showSpinner: boolean;
  size?: number;
}

const LoadingSpinner: React.FC<LoginSpinnerProps> = ({
  showSpinner,
  size = 60,
  inverted = false,
}) => {
  const rotation = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  }, [rotation.value]);

  const dynamicStyles = StyleSheet.create({
    innerStyle: {
      height: scaleSize(size),
      width: scaleSize(size),
      borderRadius: scaleSize(size / 2),
      borderWidth: scaleSize((size * 7) / 60),
    },
  });

  useLayoutEffect(() => {
    if (showSpinner) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1,
      );
    } else {
      rotation.value = 0;
    }
    return () => cancelAnimation(rotation);
  }, [showSpinner, rotation]);

  if (!showSpinner) {
    return null;
  }

  return (
    <Animated.View
      style={[
        inverted ? styles.spinnerInverted : styles.spinner,
        dynamicStyles.innerStyle,
        animatedStyles,
      ]}
    />
  );
};
const styles = StyleSheet.create({
  spinner: {
    borderTopColor: 'rgb(241,241,241)',
    borderRightColor: 'rgb(155,155,155)',
    borderBottomColor: 'rgb(155,155,155)',
    borderLeftColor: 'rgb(155,155,155)',
  },
  spinnerInverted: {
    borderTopColor: 'rgb(0,0,0)',
    borderRightColor: 'rgb(155,155,155)',
    borderBottomColor: 'rgb(155,155,155)',
    borderLeftColor: 'rgb(155,155,155)',
  },
});
export default LoadingSpinner;
