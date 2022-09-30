import React, { useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, Dimensions, VirtualizedList } from 'react-native';
import { useSelector } from 'react-redux';
import { digitalEventsForBalletAndDanceSelector } from '@services/store/events/Selectors';
import {
  DigitalEventItem,
  Preview,
  DigitalEventSectionHeader,
  RailSections,
} from '@components/EventListComponents';
import { scaleSize } from '@utils/scaleSize';
import {
  widthWithOutFocus,
  marginRightWithOutFocus,
  marginLeftStop,
} from '@configs/navMenuConfig';
import { TPreviewRef } from '@components/EventListComponents/components/Preview';

import {
  NavMenuScreenRedirect,
  TNavMenuScreenRedirectRef,
} from '@components/NavmenuScreenRedirect';
import type {
  TContentScreensProps,
  NSNavigationScreensNames,
} from '@configs/screensConfig';

const BalletDanceScreen: React.FC<
  TContentScreensProps<
    NSNavigationScreensNames.ContentStackScreens['balletDance']
  >
> = ({ route }) => {
  const { data, eventsLoaded } = useSelector(
    digitalEventsForBalletAndDanceSelector,
  );

  const previewRef = useRef<TPreviewRef | null>(null);
  const runningOnceRef = useRef<boolean>(false);

  const navMenuScreenRedirectRef = useRef<TNavMenuScreenRedirectRef>(null);
  const sectionIndexAvailable = data
    .find(section => section.sectionIndex === route.params?.sectionIndex)
    ?.data.some(event => event.id === route.params?.eventId);

  const hasTVPreferredFocus = (
    isFirstRail: boolean,
    index: number,
    sectionIndex: number,
  ) => {
    return !route.params?.eventId
      ? false
      : !sectionIndexAvailable
      ? isFirstRail && index === 0
      : route.params?.sectionIndex === sectionIndex && index === 0;
  };

  useLayoutEffect(() => {
    if (
      typeof previewRef.current?.setDigitalEvent === 'function' &&
      data.length &&
      !runningOnceRef.current
    ) {
      runningOnceRef.current = true;
      previewRef.current.setDigitalEvent(data[0]?.data[0]);
    }
  }, [data]);
  if (!data.length) {
    return null;
  }
  return (
    <View style={styles.root}>
      <NavMenuScreenRedirect
        screenName={route.name}
        ref={navMenuScreenRedirectRef}
      />
      <View style={styles.contentContainer}>
        <Preview ref={previewRef} />
        <View>
          <RailSections
            containerStyle={styles.railContainerStyle}
            headerContainerStyle={styles.railHeaderContainerStyle}
            railStyle={styles.railStyle}
            sectionIndex={route?.params?.sectionIndex || 0}
            sections={data}
            sectionKeyExtractor={item => item.sectionIndex?.toString()}
            renderHeader={section => (
              <DigitalEventSectionHeader>
                {section.title}
              </DigitalEventSectionHeader>
            )}
            renderItem={({
              item,
              section,
              index,
              scrollToRail,
              sectionIndex,
              isFirstRail,
              isLastRail,
              setRailItemRefCb,
              removeRailItemRefCb,
              hasEndlessScroll,
            }) => (
              <DigitalEventItem
                screenNameFrom={route.name}
                event={item}
                eventIndex={index}
                ref={previewRef}
                canMoveUp={!isFirstRail}
                hasTVPreferredFocus={hasTVPreferredFocus(
                  isFirstRail,
                  index,
                  sectionIndex,
                )}
                canMoveRight={index !== section.data.length - 1}
                onFocus={({ selectedEventIndex }) => {
                  const railItemsList: VirtualizedList<any> | null =
                    scrollToRail();

                  if (railItemsList) {
                    railItemsList.scrollToIndex({
                      animated: true,
                      index: selectedEventIndex,
                    });
                  }
                }}
                eventGroupTitle={section.title}
                sectionIndex={sectionIndex}
                lastItem={index === section.data.length - 1}
                setRailItemRefCb={setRailItemRefCb}
                removeRailItemRefCb={removeRailItemRefCb}
                canMoveDown={(isLastRail && hasEndlessScroll) || !isLastRail}
                setFirstItemFocusable={
                  index === 0
                    ? navMenuScreenRedirectRef.current
                        ?.setDefaultRedirectFromNavMenu
                    : undefined
                }
              />
            )}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width:
      Dimensions.get('window').width -
      (widthWithOutFocus + marginRightWithOutFocus + marginLeftStop),
    height: Dimensions.get('window').height,
    flexDirection: 'row',
  },
  contentContainer: {
    justifyContent: 'flex-end',
  },
  railContainerStyle: {
    top: 0,
    height: Dimensions.get('window').height - scaleSize(600),
    width:
      Dimensions.get('window').width -
      (widthWithOutFocus + marginRightWithOutFocus + marginLeftStop),
  },
  railHeaderContainerStyle: {},
  railStyle: {
    paddingTop: scaleSize(30),
  },
});

export default BalletDanceScreen;
