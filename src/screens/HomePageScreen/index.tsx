import React, {
  useRef,
  useLayoutEffect,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  AppState,
  AppStateStatus,
  findNodeHandle,
  TouchableHighlight,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '@hooks/redux';
import {
  startFullSubscriptionLoop,
  endFullSubscriptionLoop,
} from '@services/store/auth/Slices';
import { digitalEventsForHomePageSelector } from '@services/store/events/Selectors';
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
import { useMyList } from '@hooks/useMyList';
import { useContinueWatchingList } from '@hooks/useContinueWatchingList';
import { continueWatchingRailTitle } from '@configs/bitMovinPlayerConfig';

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
import { isTVOS } from 'configs/globalConfig';

const HomePageScreen: React.FC<
  TContentScreensProps<NSNavigationScreensNames.ContentStackScreens['home']>
> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { navMenuNodesRefs } = useContext<TNavMenuNodesRefsContextValue>(
    NavMenuNodesRefsContext,
  );
  const appState = useRef(AppState.currentState);
  let focusPosition: {
    sectionIndex: number;
    itemIndex: number;
  } = {
    sectionIndex: -1,
    itemIndex: -1,
  };
  const { data: myList, ejected: myListEjected } = useMyList();
  const { data: continueWatchingList, ejected: continueWatchingListEjected } =
    useContinueWatchingList();

  const { data, eventsLoaded } = useAppSelector(
    digitalEventsForHomePageSelector(myList, continueWatchingList),
  );
  const previewRef = useRef(null);
  const navMenuScreenRedirectRef = useRef<TNavMenuScreenRedirectRef>(null);
  useEffect(() => {
    const _handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        dispatch(startFullSubscriptionLoop());
      }
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        dispatch(endFullSubscriptionLoop());
      }
      appState.current = nextAppState;
    };
    const unsubscribe = AppState.addEventListener(
      'change',
      _handleAppStateChange,
    );

    return unsubscribe.remove;
  }, [dispatch]);

  useLayoutEffect(() => {
    if (
      typeof previewRef.current?.setDigitalEvent === 'function' &&
      data.length
    ) {
      previewRef.current?.setDigitalEvent(data[0]?.data[0]);
    }
  }, [data]);

  useLayoutEffect(() => {
    dispatch(startFullSubscriptionLoop());
    return () => {
      dispatch(endFullSubscriptionLoop());
    };
  }, [dispatch]);

  if (eventsLoaded && continueWatchingListEjected && myListEjected) {
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
  if (!continueWatchingListEjected || !myListEjected || !eventsLoaded) {
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
      {
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
                scrollToRail,
                isFirstRail,
                isLastRail,
                sectionIndex,
                setRailItemRefCb,
                removeRailItemRefCb,
                hasEndlessScroll,
                scrollToRailItem,
              }) => (
                <DigitalEventItem
                  event={item}
                  ref={previewRef}
                  screenNameFrom={route.name}
                  hasTVPreferredFocus={
                    sectionIndex === focusPosition.sectionIndex &&
                    index === focusPosition.itemIndex
                  }
                  canMoveRight={index !== section.data.length - 1}
                  onFocus={scrollToRail}
                  continueWatching={section.title === continueWatchingRailTitle}
                  eventGroupTitle={section.title}
                  sectionIndex={sectionIndex}
                  lastItem={index === section.data.length - 1}
                  setRailItemRefCb={setRailItemRefCb}
                  removeRailItemRefCb={removeRailItemRefCb}
                  selectedItemIndex={index}
                  canMoveDown={(isLastRail && hasEndlessScroll) || !isLastRail}
                  canMoveUp={!isFirstRail}
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
      }
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
    flex: 1,
    justifyContent: 'flex-end',
  },
  navMenuContainerSeporator: {},
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

export default HomePageScreen;
