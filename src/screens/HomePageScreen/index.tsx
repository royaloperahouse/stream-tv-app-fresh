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
import { NavMenuNodesRefsContext } from '@components/NavMenu/components/ContextProvider';

const HomePageScreen: React.FC<
  TContentScreensProps<NSNavigationScreensNames.ContentStackScreens['home']>
> = ({ navigation, route }) => {
  const { isFirstRun, setIsFirstRun } = useContext(NavMenuNodesRefsContext);
  const dispatch = useAppDispatch();
  const appState = useRef(AppState.currentState);
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
    if (isFirstRun) {
      setIsFirstRun(false);
    }
  }, [isFirstRun, setIsFirstRun]);

  useLayoutEffect(() => {
    dispatch(startFullSubscriptionLoop());
    return () => {
      dispatch(endFullSubscriptionLoop());
    };
  }, [dispatch]);
  const sectionIndexAvailable =
    !isFirstRun &&
    data
      .find(section => section.sectionIndex === route.params?.sectionIndex)
      ?.data.some(event => event.id === route.params?.eventId);

  const hasTVPreferredFocus = (
    isFirstRail: boolean,
    index: number,
    sectionIndex: number,
  ) => {
    return isFirstRun || !sectionIndexAvailable
      ? route.params?.eventId
        ? isFirstRail && index === 0
        : route.params?.sectionIndex === sectionIndex && index === 0
      : false;
  };

  if (!data.length || !continueWatchingListEjected || !myListEjected) {
    return null;
  }

  return (
    <View style={styles.root}>
      <NavMenuScreenRedirect
        screenName={route.name}
        ref={navMenuScreenRedirectRef}
      />
      {
        <View>
          <Preview ref={previewRef} />
          <View>
            <RailSections
              containerStyle={styles.railContainerStyle}
              headerContainerStyle={styles.railHeaderContainerStyle}
              sectionIndex={route?.params?.sectionIndex || 0}
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
              }) => (
                <DigitalEventItem
                  event={item}
                  ref={previewRef}
                  screenNameFrom={route.name}
                  hasTVPreferredFocus={hasTVPreferredFocus(
                    isFirstRail,
                    index,
                    sectionIndex,
                  )}
                  canMoveRight={index !== section.data.length - 1}
                  onFocus={scrollToRail}
                  continueWatching={section.title === continueWatchingRailTitle}
                  eventGroupTitle={section.title}
                  sectionIndex={sectionIndex}
                  lastItem={index === section.data.length - 1}
                  setRailItemRefCb={setRailItemRefCb}
                  removeRailItemRefCb={removeRailItemRefCb}
                  canMoveDown={(isLastRail && hasEndlessScroll) || !isLastRail}
                  canMoveUp={!isFirstRail}
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
  },
  railHeaderContainerStyle: {},
  railStyle: {
    paddingTop: scaleSize(30),
  },
});

export default HomePageScreen;
