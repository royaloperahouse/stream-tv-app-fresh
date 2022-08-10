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

const LoadingSpinner = ({ showSpinner }: { showSpinner: boolean }) => {
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

  useLayoutEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
    );
    return () => cancelAnimation(rotation);
  }, [showSpinner]);

  if (!showSpinner) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, animatedStyles]} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  spinner: {
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 7,
    borderTopColor: 'rgba(69,97,218,0.35)',
    borderRightColor: 'rgba(69,97,218,0.35)',
    borderBottomColor: 'rgba(69,97,218,0.35)',
    borderLeftColor: 'rgba(255,255,255,0.84)',
  },
});
export default LoadingSpinner;
