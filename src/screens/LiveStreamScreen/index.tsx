import React, { useContext, useLayoutEffect, useRef } from 'react';
import { View, StyleSheet, TouchableHighlight, Dimensions } from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import { useSelector } from 'react-redux';
import {
  digitalEventsForBalletAndDanceSelector,
  digitalEventsForLiveStreamSelector
} from "services/store/events/Selectors";
import { TPreviewRef } from 'components/EventListComponents/components/Preview';
import {
  NavMenuScreenRedirect,
  TNavMenuScreenRedirectRef,
} from 'components/NavmenuScreenRedirect';
import {
  NavMenuNodesRefsContext,
  TNavMenuNodesRefsContextValue,
} from 'components/NavMenu/components/ContextProvider';
import { FocusManager } from 'services/focusService/focusManager';
import { isTVOS } from 'configs/globalConfig';
import LoadingSpinner from 'components/LoadingSpinner';
import {
  DigitalEventItem,
  DigitalEventSectionHeader,
  Preview,
  RailSections,
} from 'components/EventListComponents';
import {
  NSNavigationScreensNames,
  TContentScreensProps,
} from 'configs/screensConfig';
import {
  marginLeftStop,
  marginRightWithOutFocus,
  widthWithOutFocus,
} from 'configs/navMenuConfig';

const LiveStreamScreen: React.FC<
  TContentScreensProps<
    NSNavigationScreensNames.ContentStackScreens['liveStream']
  >
> = ({ route }) => {
  const { data, eventsLoaded } = useSelector(
    digitalEventsForLiveStreamSelector,
  );
  const previewRef = useRef<TPreviewRef | null>(null);
  const runningOnceRef = useRef<boolean>(false);

  const navMenuScreenRedirectRef = useRef<TNavMenuScreenRedirectRef>(null);
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
        <TouchableHighlight
          hasTVPreferredFocus={isTVOS && route.params?.eventId}
          underlayColor="transperent">
          <LoadingSpinner showSpinner={true} />
        </TouchableHighlight>
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
            railStyle={styles.railStyle}
            sectionIndex={0}
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
              scrollToRailItem,
              accessible,
            }) => (
              <DigitalEventItem
                screenNameFrom={route.name}
                event={item}
                ref={previewRef}
                canMoveUp={!isFirstRail}
                hasTVPreferredFocus={
                  sectionIndex === focusPosition.sectionIndex &&
                  index === focusPosition.itemIndex
                }
                canMoveRight={index !== section.data.length - 1}
                onFocus={scrollToRail}
                eventGroupTitle={section.title}
                sectionIndex={sectionIndex}
                selectedItemIndex={index}
                lastItem={index === section.data.length - 1}
                setRailItemRefCb={setRailItemRefCb}
                removeRailItemRefCb={removeRailItemRefCb}
                canMoveDown={
                  isTVOS
                    ? isLastRail
                    : (isLastRail && hasEndlessScroll) || !isLastRail
                }
                setFirstItemFocusable={
                  index === 0
                    ? navMenuScreenRedirectRef.current
                        ?.setDefaultRedirectFromNavMenu
                    : undefined
                }
                scrollToRailItem={scrollToRailItem}
                accessible={accessible}
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
    height: scaleSize(370), // need to check how it will showed on android
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LiveStreamScreen;
