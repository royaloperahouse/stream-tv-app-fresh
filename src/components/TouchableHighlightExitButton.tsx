import React, {
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  RefObject,
} from 'react';
import {
  findNodeHandle,
  NativeSyntheticEvent,
  TargetedEvent,
  TouchableHighlight,
  TouchableHighlightProps,
  Platform,
} from 'react-native';

type TTouchableHighlightExitButtonProps = TouchableHighlightProps & {
  canMoveUp?: boolean;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  canMoveDown?: boolean;
  styleFocused?: { [key: string]: any };
  styleBlured?: TouchableHighlightProps['style'];
  children: React.ReactNode;
  nextFocusLeft?: number;
  nextFocusUp?: number;
  nextFocusRight?: number;
  nextFocusDown?: number;
  canCollapseNavMenu?: boolean;
  style?: { [key: string]: any } | Array<{ [key: string]: any }>;
};

export type TTouchableHighlightExitButtonRef = {
  getNode?: () => number;
  getRef?: () => RefObject<TouchableHighlight>;
};

const TouchableHighlightExitButton = forwardRef<
  any,
  TTouchableHighlightExitButtonProps
>((props, ref) => {
  const {
    children,
    canMoveUp = true,
    canMoveLeft = true,
    canMoveRight = true,
    canMoveDown = true,
    styleFocused = {},
    onFocus,
    onBlur,
    onPress,
    style = {},
    accessible = true,
    styleBlured = {},
    underlayColor,
    ...restProps
  } = props;
  const [focused, setFocused] = useState(false);
  const touchableHighlightRef = useRef<TouchableHighlight>(null);
  useImperativeHandle(
    ref,
    () => ({
      getNode: () => {
        if (touchableHighlightRef.current) {
          return findNodeHandle(touchableHighlightRef.current);
        }
      },
      getRef: () => {
        if (touchableHighlightRef.current) {
          return touchableHighlightRef;
        }
      },
    }),
    [],
  );
  const movingAccessibility: { [key: string]: number | null } = {};
  if (!canMoveUp) {
    movingAccessibility.nextFocusUp = findNodeHandle(
      touchableHighlightRef.current,
    );
  }
  if (!canMoveLeft) {
    movingAccessibility.nextFocusLeft = findNodeHandle(
      touchableHighlightRef.current,
    );
  }
  if (!canMoveRight) {
    movingAccessibility.nextFocusRight = findNodeHandle(
      touchableHighlightRef.current,
    );
  }
  if (!canMoveDown) {
    movingAccessibility.nextFocusDown = findNodeHandle(
      touchableHighlightRef.current,
    );
  }
  const onFocusHandler = useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>): void => {
      const focusEventCB = (ev: NativeSyntheticEvent<TargetedEvent>) => {
        setFocused(true);
        if (typeof onFocus === 'function') {
          onFocus(ev);
        }
      };
      if (Platform.OS === 'ios' && Platform.isTV) {
        setTimeout(() => {
          focusEventCB(event);
        }, 0);
      } else {
        focusEventCB(event);
      }
    },
    [onFocus],
  );

  const onBlurHandler = useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>): void => {
      setFocused(false);
      if (typeof onBlur === 'function') {
        onBlur(event);
      }
    },
    [onBlur],
  );

  const underlayColorFromStyle = style
    ? Array.isArray(style)
      ? style.reduce<undefined | string>((acc, styleObj) => {
          if (styleObj.backgroundColor) {
            acc = styleObj.backgroundColor;
          }
          return acc;
        }, undefined)
      : style.backgroundColor
    : undefined;

  const underlayColorFromStyleFocused = styleFocused
    ? Array.isArray(styleFocused)
      ? styleFocused.reduce<undefined | string>((acc, styleObj) => {
          if (styleObj.backgroundColor) {
            acc = styleObj.backgroundColor;
          }
          return acc;
        }, undefined)
      : styleFocused.backgroundColor
    : undefined;
  return (
    <TouchableHighlight
      {...restProps}
      {...movingAccessibility}
      accessible={accessible}
      onPress={onPress}
      ref={touchableHighlightRef}
      onFocus={onFocusHandler}
      onBlur={onBlurHandler}
      underlayColor={
        underlayColorFromStyleFocused ||
        underlayColorFromStyle ||
        underlayColor ||
        'transperent'
      }
      style={[style, focused ? styleFocused : styleBlured]}>
      {children}
    </TouchableHighlight>
  );
});

export default TouchableHighlightExitButton;
