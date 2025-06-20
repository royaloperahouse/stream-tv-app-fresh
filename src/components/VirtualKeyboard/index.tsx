import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import { View, FlatList, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import keyboardDataEng from './components/translations/eng.json';
import keyboardDataNumbers from './components/numbers.json';
import Button from './components/button';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import { Colors } from '@themes/Styleguide';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { searchQuerySelector } from '@services/store/events/Selectors';
import {
  clearSearchQuery,
  setSearchQuery,
} from '@services/store/events/Slices';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TNavMenuScreenRedirectRef } from '@components/NavmenuScreenRedirect';
import { TTouchableHighlightWrapperRef } from '@components/TouchableHighlightWrapper';

const keyboardDataLocale: TKeyboardAdditionalLocales = [keyboardDataEng];

type TKeyboardAdditionalLocales = Array<{
  langSwitchButton: {
    text: string;
  };
  switchSpecButton: {
    text: string;
  };
  letters: Array<{ text: string }>;
}>;

type TVirtualKeyboardProps = {
  rows?: number;
  cols?: number;
  cellWidth?: number;
  cellHeight?: number;
  onMountForNavMenuTransition: TNavMenuScreenRedirectRef['setDefaultRedirectFromNavMenu'];
  onMountToSearchKeybordTransition: TNavMenuScreenRedirectRef['setDefaultRedirectToNavMenu'];
};
const VirtualKeyboard = forwardRef<any, TVirtualKeyboardProps>(
  (
    {
      rows = 6,
      cols = 6,
      cellWidth = scaleSize(82),
      cellHeight = scaleSize(81),
      onMountForNavMenuTransition,
      onMountToSearchKeybordTransition,
    },
    ref,
  ) => {
    const spaceButtonRef = useRef<TTouchableHighlightWrapperRef>(null);
    const lastButtonInFirstRowRef = useRef<TTouchableHighlightWrapperRef>(null);
    const addLetterToSearch = (text: string): void => {
      ref?.current?.addLetterToSearch?.(text);
    };
    const addSpaceToSearch = (): void => {
      ref?.current?.addSpaceToSearch?.();
    };
    const removeLetterFromSearch = (): void => {
      ref?.current?.removeLetterFromSearch?.();
    };
    const clearLettersFromSearch = (): void => {
      ref?.current?.clearLettersFromSearch?.();
    };
    const keyboardData = [
      ...keyboardDataLocale[0].letters,
      ...keyboardDataNumbers,
    ];

    useLayoutEffect(() => {
      if (
        typeof onMountForNavMenuTransition === 'function' &&
        spaceButtonRef.current?.getRef?.().current
      ) {
        onMountForNavMenuTransition(
          'spaceBtn',
          spaceButtonRef.current.getRef().current,
        );
      }
      if (
        typeof onMountToSearchKeybordTransition === 'function' &&
        typeof lastButtonInFirstRowRef.current?.getRef === 'function'
      ) {
        onMountToSearchKeybordTransition(
          'clearBtn',
          lastButtonInFirstRowRef.current.getRef().current,
        );
      }
    }, [onMountForNavMenuTransition, onMountToSearchKeybordTransition]);

    return (
      <View
        style={{
          flex: 1,
        }}>
        <View style={styles.supportButtonsContainer}>
          <Button
            ref={spaceButtonRef}
            text="Space"
            onPress={addSpaceToSearch}
            style={{
              height: cellHeight,
              width: cellWidth * (keyboardDataLocale.length > 1 ? 1.5 : 2),
            }}
            canMoveUp={false}
            textStyle={[dStyle.text, dStyle.textButton]}
          />
          <Button
            text="Delete"
            onPress={removeLetterFromSearch}
            style={{
              height: cellHeight,
              width: cellWidth * (keyboardDataLocale.length > 1 ? 1.5 : 2),
            }}
            canMoveUp={false}
            textStyle={[dStyle.text, dStyle.textButton]}
          />
          <Button
            text="Clear"
            ref={lastButtonInFirstRowRef}
            onPress={clearLettersFromSearch}
            style={{
              height: cellHeight,
              width: cellWidth * (keyboardDataLocale.length > 1 ? 1.5 : 2),
            }}
            canMoveUp={false}
            textStyle={[dStyle.text, dStyle.textButton]}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FlatList
            style={{
              flex: 0,
            }}
            data={keyboardData}
            keyExtractor={({ text }) => text}
            numColumns={cols}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Button
                text={item.text}
                canMoveDown={index <= cols * (rows - 1)}
                onPress={addLetterToSearch}
                style={{ width: cellWidth, height: cellHeight, paddingTop: scaleSize(10) }}
              />
            )}
          />
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  supportButtonsContainer: {
    flexDirection: 'row',
  },
  specSymbolsLabelText: {
    fontSize: scaleSize(24),
    lineHeight: scaleSize(28),
    letterSpacing: scaleSize(1),
  },
});

export default VirtualKeyboard;

type TDisplayForVirtualKeyboardProps = {
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
};

export const DisplayForVirtualKeyboard = forwardRef<
  any,
  TDisplayForVirtualKeyboardProps
>((props, ref) => {
  const { containerStyle = {}, textStyle = {} } = props;
  const searchText = useSelector(searchQuerySelector, shallowEqual);
  const dispatch = useDispatch();

  useImperativeHandle(
    ref,
    () => ({
      addLetterToSearch: (text: string): void => {
        dispatch(setSearchQuery({ searchQuery: text }));
      },
      addSpaceToSearch: (): void => {
        dispatch(setSearchQuery({ searchQuery: ' ' }));
      },
      removeLetterFromSearch: (): void => {
        dispatch(setSearchQuery({ searchQuery: '' }));
      },
      clearLettersFromSearch: (): void => {
        dispatch(clearSearchQuery());
      },
    }),
    [dispatch],
  );
  return (
    <View style={[dStyle.container, containerStyle]}>
      <RohText style={[dStyle.text, textStyle, dStyle.textDefault]}>
        {searchText.toUpperCase()}
      </RohText>
    </View>
  );
});

const dStyle = StyleSheet.create({
  container: {
    width: scaleSize(486),
    height: scaleSize(80),
    backgroundColor: Colors.displayBackgroundColor,
  },
  textDefault: {
    width: '100%',
    height: '100%',
    paddingHorizontal: scaleSize(24),
    paddingTop: scaleSize(24),
  },
  text: {
    fontSize: scaleSize(26),
    lineHeight: scaleSize(30),
    letterSpacing: scaleSize(1),
    color: Colors.defaultTextColor,
  },
  textButton: {
    paddingTop: 7,
  },
  buttonStyleFocused: {
    color: '#1A1A1A',
  },
});
