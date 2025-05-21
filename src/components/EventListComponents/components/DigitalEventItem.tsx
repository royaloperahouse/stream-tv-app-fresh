import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableHighlight, View } from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import { TEventContainer } from '@services/types/models';
import RohText from '@components/RohText';
import TouchableHighlightWrapper, { TTouchableHighlightWrapperRef } from '@components/TouchableHighlightWrapper';
import get from 'lodash.get';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {
  contentScreenNames,
  TContentScreenReverseNamesOfNavToDetails,
  TContentScreensProps,
} from '@configs/screensConfig';
import { navMenuManager } from '@components/NavMenu';
import { Colors } from '@themes/Styleguide';
import { TNavMenuScreenRedirectRef } from '@components/NavmenuScreenRedirect';
import RohImage from '@components/RohImage';
import { FocusManager } from 'services/focusService/focusManager';
import { isTVOS } from 'configs/globalConfig';
import { AnalyticsEventTypes, storeEvents } from '@utils/storeEvents';

type DigitalEventItemProps = {
  event: TEventContainer;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  canMoveLeft?: boolean;
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
  topEndlessScrollRef: any;
  setFirstItemFocusable?: TNavMenuScreenRedirectRef['setDefaultRedirectFromNavMenu'];
  removeFirstItemFocusable?: TNavMenuScreenRedirectRef['removeDefaultRedirectFromNavMenu'];
  nextFocusLeftOnFirstItem?: React.RefObject<TouchableHighlight>;
  scrollToRailItem?: (sectionIndex: number, itemIndex: number) => void;
  accessible?: boolean;
  railName: string;
};

const firstFocusItenKey = 'firstFocusItenKey';

const DigitalEventItem = forwardRef<any, DigitalEventItemProps>(
  (
    {
      event,
      canMoveUp,
      hasTVPreferredFocus,
      canMoveRight = true,
      onFocus,
      screenNameFrom,
      eventGroupTitle,
      sectionIndex,
      canMoveDown = true,
      canMoveLeft= true,
      selectedItemIndex,
      lastItem = false,
      setRailItemRefCb = () => {},
      removeRailItemRefCb = () => {},
      setFirstItemFocusable,
      scrollToRailItem = () => {},
      accessible,
      railName,
      topEndlessScrollRef,
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
    const [shouldScroll, setShouldScroll] = useState(false);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    const snapshotImageUrl: string = get(
      event.data,
      ['vs_event_image', 'tv_app_rail_thumbnail', 'url'],
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
    const availableFrom = get(event.data, ['vs_availability_date']);
    const duration = get(event.data, ['vs_running_time_summary']);

    useLayoutEffect(() => {
      isMounted.current = true;
      return () => {
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
          timeoutId.current = null;
        }
        isMounted.current = false;
      };
    }, []);

    const onPressHandler = () => {
      storeEvents({
        event_type: AnalyticsEventTypes.OPEN_PERFORMANCE_RAILS,
        event_data: {
          screen_name: screenNameFrom,
          rail_name: railName,
          index: String(selectedItemIndex),
        },
      }).then(() => {});
      navMenuManager.lockNavMenu();
      if (event.type === 'digital_event_video') {
        navMenuManager.hideNavMenu(() => {
          navigation.navigate(contentScreenNames.eventVideo, {
            videoId: event.id,
            eventId: event.id,
            screenNameFrom,
            sectionIndex,
            selectedItemIndex,
            availableFrom: availableFrom ? availableFrom : null,
          });
        });
        navMenuManager.unlockNavMenu();
        return;
      }
      navMenuManager.hideNavMenu(() => {
        navigation.navigate(contentScreenNames.eventDetails, {
          eventId: event.id,
          screenNameFrom,
          sectionIndex,
          selectedItemIndex,
          availableFrom: availableFrom ? availableFrom : null,
          duration,
        });
        navMenuManager.unlockNavMenu();
      });
    };
    const onFocusHandler = () => {
      if (selectedItemIndex && selectedItemIndex !== 0) {
        isTVOS && navMenuManager.lockNavMenu();
      } else {
        isTVOS && navMenuManager.unlockNavMenu();
      }
      if (isMounted.current) {
        setFocused(true);
      }
      FocusManager.switchOffFirstLounch();
      ref?.current?.setDigitalEvent(event, eventGroupTitle);
      isTVOS && setTimeout(() => scrollToRailItem(sectionIndex, selectedItemIndex || 0), 100);
      if (setFirstItemFocusable && touchableRef.current?.getRef?.().current) {
        setFirstItemFocusable(
          firstFocusItenKey,
          touchableRef.current?.getRef?.().current,
        );
      }
      if (typeof onFocus === 'function') {
        onFocus(touchableRef.current?.getRef?.().current);
      }
    };
    useEffect(() => {
      if (typeof onFocus === 'function' && shouldScroll) {
        onFocus(sectionIndex, selectedItemIndex);
      }
    }, [shouldScroll]);
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
    if (hasTVPreferredFocus && !shouldScroll && !isTVOS && focused) {
      setShouldScroll(true);
    }
    return (
      <TouchableHighlightWrapper
        ref={touchableRef}
        hasTVPreferredFocus={hasTVPreferredFocus}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        canMoveRight={canMoveRight}
        canMoveLeft={canMoveLeft}
        nextFocusUp={
          sectionIndex === 0 && topEndlessScrollRef?.current && isTVOS
            ? topEndlessScrollRef.current.getNode()
            : undefined
        }
        style={[lastItem ? styles.containerForListItem : styles.container]}
        onBlur={() => {
          if (isMounted.current) {
            setFocused(false);
          }
        }}
        onFocus={onFocusHandler}
        accessible={accessible}
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
  },
  title: {
    color: 'white',
    fontSize: scaleSize(22),
    marginLeft: scaleSize(10),
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
  },
});

export default DigitalEventItem;
