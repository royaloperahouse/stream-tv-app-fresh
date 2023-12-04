import { isTVOS } from '@configs/globalConfig';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  createRef,
  useLayoutEffect,
  useState,
} from 'react';
import { ViewStyle, StyleSheet, VirtualizedList, FlatList } from 'react-native';
import ExpandableButton from './ExpandableButton';
export enum EActionButtonListType {
  common,
  withoutTrailers,
}

type TActionButton = {
  text: string;
  Icon: any;
  onPress: (...args: Array<any>) => void;
  onFocus?: (...args: Array<any>) => void;
  onBlur?: (...args: Array<any>) => void;
  key: string;
  hasTVPreferredFocus?: boolean;
  showLoader?: boolean;
  freezeButtonAfterPressing?: boolean;
};

type ActionButtonListProps = {
  buttonList: Array<TActionButton>;
  style?: ViewStyle;
  goDownOn: () => void;
  goDownOff: () => void;
  backButtonOn: () => void;
  backButtonOff: () => void;
};

export type TActionButtonListRef = Partial<{
  focusOnFirstAvalibleButton: () => void;
}>;

const ActionButtonList = forwardRef<
  TActionButtonListRef,
  ActionButtonListProps
>(
  (
    {
      buttonList,
      style = {},
      goDownOff,
      goDownOn,
      backButtonOff,
      backButtonOn,
    },
    ref,
  ) => {
    const isMounted = useRef<boolean>(false);
    const [freezeAll, setFreezeAll] = useState(false);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const [indexOfFocusedItem, setIndexOfFocusedItem] = useState<number>(
      buttonList.findIndex(item => item.hasTVPreferredFocus),
    );
    //const firstButtonKeyName = useRef<string>(buttonList[0].key);
    const expandableButtonsRefs = useRef<Partial<{ [key: string]: any }>>({});
    const freezeAllControlBtn = (freeze: boolean) => {
      if (freeze) {
        backButtonOff();
        goDownOff();
      } else {
        console.log('ololo');
        goDownOn();
        backButtonOn();
      }
      setFreezeAll(freeze);
    };
    useImperativeHandle(
      ref,
      () => ({
        focusOnFirstAvalibleButton: () => {
          const firstAvalibleButtonRef = Object.values(
            expandableButtonsRefs.current,
          )[0];
          if (
            isMounted.current &&
            firstAvalibleButtonRef !== undefined &&
            typeof firstAvalibleButtonRef?.current?.setNativeProps ===
              'function'
          ) {
            firstAvalibleButtonRef.current.setNativeProps({
              hasTVPreferredFocus: true,
            });
          }
        },
      }),
      [],
    );

    useLayoutEffect(() => {
      if (freezeAll && timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
        return;
      }
      if (indexOfFocusedItem === buttonList.length - 1) {
        timeoutIdRef.current = setTimeout(() => {
          goDownOn();
          timeoutIdRef.current = null;
        }, 200);
        return;
      }
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
      }
      goDownOff();
    }, [indexOfFocusedItem, buttonList.length, goDownOff, goDownOn, freezeAll]);

    useLayoutEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);

    return (
      <FlatList
        listKey={'eventDetailsActionButtonList'}
        style={[styles.root, style]}
        keyExtractor={item => item.key}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        data={buttonList}
        initialNumToRender={5}
        renderItem={({ item, index }) => (
          <ExpandableButton
            ref={
              expandableButtonsRefs.current[item.key]
                ? expandableButtonsRefs.current[item.key]
                : (expandableButtonsRefs.current[item.key] = createRef())
            }
            text={item.text}
            Icon={item.Icon}
            hasTVPreferredFocus={item.hasTVPreferredFocus || false}
            focusCallback={event => {
              setIndexOfFocusedItem(index);
              item?.onFocus?.(event);
            }}
            blurCallback={item.onBlur}
            onPress={item.onPress}
            showLoader={item.showLoader}
            freezeButtonAfterPressing={item.freezeButtonAfterPressing}
            freezeAll={freezeAllControlBtn}
            accessible={
              index === indexOfFocusedItem ||
              (!freezeAll &&
                (index === indexOfFocusedItem - 1 ||
                  index === indexOfFocusedItem + 1))
            }
          />
        )}
      />
    );
  },
);

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: '100%',
  },
});

export default ActionButtonList;
