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
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { contentScreenNames } from '@configs/screensConfig';
import { navMenuManager } from '@components/NavMenu';
import { Colors } from '@themes/Styleguide';
import { TNavMenuScreenRedirectRef } from '@components/NavmenuScreenRedirect';
import {
  TContentScreenReverseNamesOfNavToDetails,
  TContentScreensProps,
} from '@configs/screensConfig';
import RohImage from '@components/RohImage';
type DigitalEventItemProps = {
  event: TEventContainer;
  eventIndex: number;
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

const firstFocusItenKey = 'firstFocusItenKey';

const DigitalEventItem = forwardRef<any, DigitalEventItemProps>(
  (
    {
      event,
      eventIndex,
      canMoveUp,
      hasTVPreferredFocus,
      canMoveRight = true,
      onFocus,
      screenNameFrom,
      eventGroupTitle,
      sectionIndex,
      canMoveDown = true,
      selectedItemIndex,
      lastItem = false,
      setRailItemRefCb = () => {},
      removeRailItemRefCb = () => {},
      setFirstItemFocusable,
    },
    ref: any,
  ) => {
    const navigation =
      useNavigation<
        TContentScreensProps<typeof screenNameFrom>['navigation']
      >();
    const touchableRef = useRef<TTouchableHighlightWrapperRef>();
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
        eventId: event.id,
        screenNameFrom,
        sectionIndex,
        selectedItemIndex,
      });
    };

    const onFocusHandler = () => {
      if (isMounted.current) {
        setFocused(true);
      }
      if (setFirstItemFocusable && touchableRef.current?.getRef?.().current) {
        setFirstItemFocusable(
          firstFocusItenKey,
          touchableRef.current?.getRef?.().current,
        );
      }
      ref?.current?.setDigitalEvent(event, eventIndex, eventGroupTitle);
      if (typeof onFocus === 'function') {
        onFocus(touchableRef.current?.getRef?.().current);
      }
    };

    useLayoutEffect(() => {
      if (
        sectionIndex === 0 &&
        setFirstItemFocusable &&
        touchableRef.current?.getRef?.().current
      ) {
        setFirstItemFocusable(
          firstFocusItenKey,
          touchableRef.current?.getRef?.().current,
        );
      }
    }, [setFirstItemFocusable, sectionIndex]);
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
        style={[lastItem ? styles.containerForListItem : styles.container]}
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
            <RohImage
              resizeMode={FastImage.resizeMode.cover}
              style={styles.image}
              source={snapshotImageUrl}
            />
          </View>
          <RohText numberOfLines={2} ellipsizeMode="tail" style={styles.title}>
            {eventTitle}
          </RohText>
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
  containerForListItem: {
    width: scaleSize(465),
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
