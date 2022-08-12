import React, {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableHighlight,
  findNodeHandle,
} from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import { TEventContainer } from '@services/types/models';
import RohText from '@components/RohText';
import TouchableHighlightWrapper, {
  TTouchableHighlightWrapperRef,
} from '@components/TouchableHighlightWrapper';
import get from 'lodash.get';
import {
  useNavigation,
  CommonActions,
  useRoute,
} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { contentScreenNames } from '@configs/screensConfig';
import { navMenuManager } from '@components/NavMenu';
import { Colors } from '@themes/Styleguide';
import { TNavMenuScreenRedirectRef } from '@components/NavmenuScreenRedirect';
import { useFocusEffect } from '@react-navigation/native';
import {
  TContentScreenReverseNamesOfNavToDetails,
  TContentScreensProps,
} from '@configs/screensConfig';
type DigitalEventItemProps = {
  event: TEventContainer;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  sectionIndex: number;
  hasTVPreferredFocus?: boolean;
  canMoveRight?: boolean;
  continueWatching?: boolean;
  onFocus?: (...[]: any[]) => void;
  screenNameFrom: TContentScreenReverseNamesOfNavToDetails;
  eventGroupTitle?: string;
  selectedItemIndex?: number;
  lastItem?: boolean;
  setRailItemRefCb?: (
    eventId: string,
    ref: React.MutableRefObject<TTouchableHighlightWrapperRef | undefined>,
    sectionIdx: number,
  ) => void;
  removeRailItemRefCb?: (
    eventId: string,
    ref: React.MutableRefObject<TTouchableHighlightWrapperRef | undefined>,
    sectionIdx: number,
  ) => void;
  setFirstItemFocusable?: TNavMenuScreenRedirectRef['setDefaultRedirectFromNavMenu'];
  removeFirstItemFocusable?: TNavMenuScreenRedirectRef['removeDefaultRedirectFromNavMenu'];
  nextFocusLeftOnFirstItem?: React.RefObject<TouchableHighlight>;
};

const DigitalEventItem = forwardRef<any, DigitalEventItemProps>(
  (
    {
      event,
      canMoveUp,
      hasTVPreferredFocus,
      canMoveRight = true,
      onFocus,
      continueWatching,
      screenNameFrom,
      eventGroupTitle,
      sectionIndex,
      canMoveDown = true,
      selectedItemIndex,
      lastItem = false,
      setRailItemRefCb = () => {},
      removeRailItemRefCb = () => {},
      setFirstItemFocusable,
      removeFirstItemFocusable,
    },
    ref: any,
  ) => {
    const navigation =
      useNavigation<
        TContentScreensProps<typeof screenNameFrom>['navigation']
      >();
    const touchableRef = useRef<TTouchableHighlightWrapperRef>();
    const route = useRoute<TContentScreensProps<typeof screenNameFrom>['route']>();
    const isMounted = useRef(false);
    const [focused, setFocused] = useState(false);
    const snapshotImageUrl: string = get(
      event.data,
      ['vs_event_image', 'wide_event_image', 'url'],
      '',
    );
    const eventTitle: string =
      get(event.data, ['vs_title', '0', 'text'], '').replace(
        /(<([^>]+)>)/gi,
        '',
      ) ||
      get(event.data, ['vs_event_details', 'title'], '').replace(
        /(<([^>]+)>)/gi,
        '',
      );

    useLayoutEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);

    const onPressHandler = () => {
      navMenuManager.hideNavMenu();
      navigation.navigate(contentScreenNames.eventDetails, {
        fromEventDetails: false,
        event,
        continueWatching,
        screenNameFrom,
        sectionIndex,
        selectedItemIndex,
      });
    };

    const onFocusHandler = () => {
      if (isMounted.current) {
        setFocused(true);
      }
      ref?.current?.setDigitalEvent(event, eventGroupTitle);
      if (typeof onFocus === 'function') {
        onFocus(touchableRef.current?.getRef?.().current);
      }
    };

    useLayoutEffect(() => {
      if (setFirstItemFocusable && touchableRef.current?.getRef?.().current) {
        setFirstItemFocusable(
          sectionIndex.toString(),
          touchableRef.current?.getRef?.().current,
        );
      }
      return () => {
        if (removeFirstItemFocusable) {
          removeFirstItemFocusable(sectionIndex.toString());
        }
      };
    }, [removeFirstItemFocusable, setFirstItemFocusable, sectionIndex]);
    useLayoutEffect(() => {
      setRailItemRefCb(event.id, touchableRef, sectionIndex);
      return () => {
        removeRailItemRefCb(event.id, touchableRef, sectionIndex);
      };
    }, [
      event.id,
      touchableRef,
      sectionIndex,
      setRailItemRefCb,
      removeRailItemRefCb,
    ]);
    return (
      <TouchableHighlightWrapper
        ref={touchableRef}
        hasTVPreferredFocus={hasTVPreferredFocus}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        canMoveRight={canMoveRight}
        style={[lastItem ? styles.containeForListItem : styles.container]}
        onBlur={() => {
          if (isMounted.current) {
            setFocused(false);
          }
        }}
        onFocus={onFocusHandler}
        onPress={onPressHandler}>
        <View style={styles.container}>
          <View
            style={[
              styles.imageContainer,
              focused ? styles.imageContainerActive : {},
            ]}>
            <FastImage
              resizeMode={FastImage.resizeMode.cover}
              style={styles.image}
              source={{ uri: snapshotImageUrl }}
            />
          </View>
          <RohText style={styles.title}>{eventTitle}</RohText>
        </View>
      </TouchableHighlightWrapper>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: scaleSize(377),
    minHeight: scaleSize(262),
  },
  containeForListItem: {
    width: scaleSize(397),
    minHeight: scaleSize(262),
    paddingRight: scaleSize(20),
  },
  title: {
    color: 'white',
    fontSize: scaleSize(22),
    marginLeft: scaleSize(10),
    textTransform: 'uppercase',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scaleSize(377),
    height: scaleSize(220),
  },
  imageContainerActive: {
    backgroundColor: Colors.defaultBlue,
  },
  image: {
    width: scaleSize(357),
    height: scaleSize(200),
    zIndex: 0,
  },
});

export default DigitalEventItem;
