import React, { useLayoutEffect } from 'react';

import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { scaleSize } from "@utils/scaleSize";

interface LoginSpinnerProps {
  showSpinner: boolean;
  size?: number;
}

const LoadingSpinner: React.FC<LoginSpinnerProps> = ({
  showSpinner,
  size = 60,
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
        99999999,
      );
    }
    return () => cancelAnimation(rotation);
  }, [showSpinner]);

  if (!showSpinner) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.spinner, dynamicStyles.innerStyle, animatedStyles]}
    />
  );
};
const styles = StyleSheet.create({
  spinner: {
    borderTopColor: 'rgba(69,97,218,0.35)',
    borderRightColor: 'rgba(69,97,218,0.35)',
    borderBottomColor: 'rgba(69,97,218,0.35)',
    borderLeftColor: 'rgba(255,255,255,0.84)',
  },
});
export default LoadingSpinner;
