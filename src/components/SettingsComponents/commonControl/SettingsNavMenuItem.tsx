import RohText from '@components/RohText';
import TouchableHighlightWrapper, {
  TTouchableHighlightWrapperRef,
} from '@components/TouchableHighlightWrapper';
import { Colors } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import React, { useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableHighlight } from 'react-native';

type TSettingsNavMenuItemProps = {
  id: string;
  title: string;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onFocus: (
    ref: React.MutableRefObject<TTouchableHighlightWrapperRef | undefined>,
  ) => void;
  isActive: boolean;
  hasTVPreferredFocus?: boolean;
  isFirst: boolean;
  onMount?: (cp: TouchableHighlight | null) => void;
};
const SettingsNavMenuItem: React.FC<TSettingsNavMenuItemProps> = props => {
  const {
    id,
    title,
    canMoveUp,
    canMoveDown,
    onFocus,
    isActive,
    hasTVPreferredFocus,
    isFirst,
    onMount,
  } = props;
  const touchableRef = useRef<TTouchableHighlightWrapperRef>();
  const focusHandler = () => {
    if (typeof onFocus === 'function') {
      onFocus(touchableRef);
    }
  };
  useLayoutEffect(() => {
    if (
      isFirst &&
      touchableRef.current?.getRef?.().current &&
      typeof onMount === 'function'
    ) {
      onMount(touchableRef.current.getRef().current);
    }
  }, [onMount, isFirst]);
  return (
    <TouchableHighlightWrapper
      ref={touchableRef}
      onFocus={focusHandler}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={styles.menuButtonInActive}
      styleBlured={isActive ? styles.menuButtonActiveWithoutFocus : undefined}
      styleFocused={styles.menuButtonActiveWithFocus}>
      <View style={styles.root}>
        <RohText
          style={[styles.buttonTitle, isActive ? {} : styles.inActiveTitle]}>
          {title}
        </RohText>
      </View>
    </TouchableHighlightWrapper>
  );
};

export default SettingsNavMenuItem;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: scaleSize(25),
  },
  menuButtonActiveWithFocus: {
    backgroundColor: Colors.streamPrimary,
    paddingLeft: scaleSize(20),
  },
  menuButtonActiveWithoutFocus: {
    //backgroundColor: Colors.tVMidGrey,
    paddingLeft: scaleSize(20),
  },
  menuButtonInActive: {
    paddingLeft: scaleSize(25),
  },
  buttonTitle: {
    fontSize: scaleSize(26),
    lineHeight: scaleSize(30),
    letterSpacing: scaleSize(1),
    color: Colors.defaultTextColor,
  },
  inActiveTitle: {
    opacity: 0.7,
  },
});
