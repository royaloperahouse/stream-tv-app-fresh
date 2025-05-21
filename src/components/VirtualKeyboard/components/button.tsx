import React, { forwardRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableHighlightProps,
  TextStyle,
} from 'react-native';
import TouchableHighlightWrapper from '@components/TouchableHighlightWrapper';
import RohText from '@components/RohText';
import { Colors } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';

type TButtonProps = TouchableHighlightProps & {
  text?: string;
  Icon?: any;
  iconWidth?: number;
  iconHeight?: number;
  style?: ViewStyle;
  onPress: (text?: string) => void;
  styleFocused?: TouchableHighlightProps['style'];
  textStyle?: TextStyle;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  hasTVPreferredFocus?: boolean;
};

const Button = forwardRef<any, TButtonProps>(
  (
    {
      text,
      Icon,
      onPress,
      style = {},
      styleFocused = {},
      textStyle = {},
      iconHeight = scaleSize(40),
      iconWidth = scaleSize(40),
      hasTVPreferredFocus = false,
      ...restProps
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const onClick = () => {
      onPress(text);
    };
    return (
      <TouchableHighlightWrapper
        underlayColor={Colors.defaultBlue}
        ref={ref}
        style={[styles.touchContainer, style]}
        styleFocused={styleFocused}
        {...restProps}
        hasTVPreferredFocus={hasTVPreferredFocus}
        onPress={onClick}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}>
        <View style={styles.viewContainer}>
          {text !== undefined && text !== '' && (
            <RohText
              style={[
                styles.textStyle,
                textStyle,
                focused ? styles.textColorFocused : styles.textColorBlurred,
              ]}>
              {text}
            </RohText>
          )}
          {Icon && <Icon width={iconWidth} height={iconHeight} />}
        </View>
      </TouchableHighlightWrapper>
    );
  },
);

const styles = StyleSheet.create({
  touchContainer: {},
  viewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    marginBottom: scaleSize(10),
    fontSize: scaleSize(38),
    lineHeight: scaleSize(44),
    letterSpacing: scaleSize(1),
  },
  textColorFocused: {
    color: Colors.focusedTextColor,
  },
  textColorBlurred: {
    color: Colors.defaultTextColor,
  },
});

export default Button;
