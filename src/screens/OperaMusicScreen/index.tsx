import React, { useRef, useLayoutEffect, useContext } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { digitalEventsForOperaAndMusicSelector } from '@services/store/events/Selectors';
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
import { FocusManager } from '@services/focusService/focusManager';
import { NavMenuNodesRefsContext } from '@components/NavMenu/components/ContextProvider';
import type { TNavMenuNodesRefsContextValue } from '@components/NavMenu/components/ContextProvider';
import LoadingSpinner from '@components/LoadingSpinner';

const OperaMusicScreen: React.FC<
  TContentScreensProps<
    NSNavigationScreensNames.ContentStackScreens['operaMusic']
  >
> = ({ navigation, route }) => {
  const { data, eventsLoaded } = useSelector(
    digitalEventsForOperaAndMusicSelector,
  );
  let focusPosition: {
    sectionIndex: number;
    itemIndex: number;
  } = {
    sectionIndex: -1,
    itemIndex: -1,
  };
  const { navMenuNodesRefs } = useContext<TNavMenuNodesRefsContextValue>(
    NavMenuNodesRefsContext,
  );
  const previewRef = useRef<TPreviewRef | null>(null);
  const runningOnceRef = useRef<boolean>(false);
  const navMenuScreenRedirectRef = useRef<TNavMenuScreenRedirectRef>(null);

  if (eventsLoaded) {
    focusPosition = FocusManager.getFocusPosition({
      eventId: route.params?.eventId || null,
      data,
      searchingCB: FocusManager.searchingCBForRails,
      sectionIndex: route.params?.sectionIndex,
      itemIndex: route.params?.selectedItemIndex,
      moveToMenuItem: () => {
        navMenuNodesRefs?.[route.name]?.current?.setNativeProps({
          hasTVPreferredFocus: true,
        });
      },
    });
  }

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

  if (!eventsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner showSpinner={true} />
      </View>
    );
  }

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
            sectionIndex={0}
            railStyle={styles.railStyle}
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
              sectionIndex,
              isFirstRail,
              isLastRail,
              scrollToRail,
              setRailItemRefCb,
              removeRailItemRefCb,
              hasEndlessScroll,
              scrollToRailItem,
            }) => (
              <DigitalEventItem
                screenNameFrom={route.name}
                event={item}
                hasTVPreferredFocus={
                  sectionIndex === focusPosition.sectionIndex &&
                  index === focusPosition.itemIndex
                }
                ref={previewRef}
                onFocus={scrollToRail}
                canMoveUp={!isFirstRail}
                canMoveRight={index !== section.data.length - 1}
                eventGroupTitle={section.title}
                sectionIndex={sectionIndex}
                selectedItemIndex={index}
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
                scrollToRailItem={scrollToRailItem}
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
    paddingRight: 40,
  },
  railHeaderContainerStyle: {},
  railStyle: {
    paddingTop: scaleSize(30),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OperaMusicScreen;
