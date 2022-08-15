import React, { useCallback, useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableHighlight } from 'react-native';
import RohText from '@components/RohText';
import { Colors } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import { TRoute } from '@services/types/models';
import {
  widthInvisble,
  focusAnimationDuration,
  visibleAnimationDuration,
} from '@configs/navMenuConfig';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useAnimatedProps,
  Easing,
} from 'react-native-reanimated';
type TNavMenuItemProps = {
  id: TRoute['navMenuScreenName'];
  isActive: boolean;
  SvgIconActiveComponent: TRoute['SvgIconActiveComponent'];
  SvgIconInActiveComponent: TRoute['SvgIconInActiveComponent'];
  navMenuTitle: TRoute['navMenuTitle'];
  onFocus: (id: TRoute['navMenuScreenName']) => void;
  isLastItem: boolean;
  labelOpacityWorklet: Readonly<Animated.SharedValue<1 | 0>>;
  setMunuItemRef: (
    id: TRoute['navMenuScreenName'],
    ref: React.RefObject<TouchableHighlight>,
    isLast?: boolean,
  ) => void;
  accessibleWorklet: Readonly<Animated.SharedValue<number>>;
  iconOpacityWorklet: Readonly<Animated.SharedValue<1 | 0>>;
  nextFocusDown: number | null;
};
const NavMenuButtonAnimated =
  Animated.createAnimatedComponent(TouchableHighlight);
const NavMenuItem: React.FC<TNavMenuItemProps> = ({
  id,
  isActive,
  SvgIconActiveComponent,
  SvgIconInActiveComponent,
  navMenuTitle = 'unknow',
  onFocus,
  isLastItem,
  labelOpacityWorklet,
  setMunuItemRef,
  accessibleWorklet,
  iconOpacityWorklet,
  nextFocusDown,
}) => {
  const mountedComponentRef = useRef(false);
  useLayoutEffect(() => {
    mountedComponentRef.current = true;
    return () => {
      mountedComponentRef.current = false;
    };
  }, []);
  const dynemicStyles = StyleSheet.create({
    touchableWrapperStyle: {
      marginBottom: isLastItem ? 0 : scaleSize(60),
    },
    iconContainer: {
      borderBottomWidth: isActive ? scaleSize(2) : 0,
      borderBottomColor: Colors.navIconActive,
    },
    titleText: { opacity: isActive ? 1 : 0.5 },
  });
  const touchRef = useRef<TouchableHighlight | null>(null);

  const onFocusHandler = useCallback(() => {
    onFocus(id);
  }, [onFocus, id]);
  const iconStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(iconOpacityWorklet.value, {
        duration: visibleAnimationDuration,
        easing: Easing.ease,
      }),
    }),
    [iconOpacityWorklet.value],
  );
  const textStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(labelOpacityWorklet.value, {
        duration: focusAnimationDuration,
        easing: Easing.ease,
      }),
    }),
    [labelOpacityWorklet.value],
  );
  const accessibleAnimatedProps = useAnimatedProps(
    () => ({
      accessible: accessibleWorklet.value !== widthInvisble,
    }),
    [accessibleWorklet.value],
  );
  useLayoutEffect(() => {
    setMunuItemRef(id, touchRef, isLastItem);
  }, [setMunuItemRef, id, isLastItem]);
  return (
    <NavMenuButtonAnimated
      animatedProps={accessibleAnimatedProps}
      ref={touchRef}
      onFocus={onFocusHandler}
      nextFocusDown={
        isLastItem && nextFocusDown !== null ? nextFocusDown : undefined
      }
      style={dynemicStyles.touchableWrapperStyle}>
      <View style={styles.root}>
        <Animated.View
          style={[
            styles.iconContainer,
            dynemicStyles.iconContainer,
            iconStyle,
          ]}>
          {isActive ? (
            <SvgIconActiveComponent
              width={scaleSize(40)}
              height={scaleSize(40)}
            />
          ) : (
            <SvgIconInActiveComponent
              width={scaleSize(40)}
              height={scaleSize(40)}
            />
          )}
        </Animated.View>
        <Animated.View style={[styles.titleContainer, textStyle]}>
          <RohText style={[styles.titleText, dynemicStyles.titleText]}>
            {navMenuTitle.toUpperCase()}
          </RohText>
        </Animated.View>
      </View>
    </NavMenuButtonAnimated>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    height: scaleSize(50),
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaleSize(20),
    paddingBottom: scaleSize(4),
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  titleText: {
    fontSize: scaleSize(24),
    letterSpacing: scaleSize(1),
    lineHeight: scaleSize(28),
    color: Colors.navIconDefault,
    width: scaleSize(350), // need to setup good value;
  },
});

export default NavMenuItem;
