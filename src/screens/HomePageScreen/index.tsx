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
import { deviceAuthenticatedSelector } from 'services/store/auth/Selectors';

const HomePageScreen: React.FC<
  TContentScreensProps<NSNavigationScreensNames.ContentStackScreens['home']>
> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();

  const { navMenuNodesRefs } = useContext<TNavMenuNodesRefsContextValue>(
    NavMenuNodesRefsContext,
  );
  const fromErrorModal = route?.params?.fromErrorModal;
  const appState = useRef(AppState.currentState);
  const numsOfRender = useRef(0);
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
      data.length &&
      numsOfRender.current < 2
    ) {
      previewRef.current?.setDigitalEvent(data[0]?.data[0]);
    }
  }, [data, numsOfRender]);

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

  if (isTVOS) {
    numsOfRender.current++;
  }

  const isLoading = useRef<boolean>(!isTVOS);
  const isAuthenticated = useAppSelector(deviceAuthenticatedSelector);
  if (FocusManager.getFirstLounch()) {
    isLoading.current = false;
  }

  if (
    !continueWatchingListEjected ||
    !myListEjected ||
    !eventsLoaded ||
    (!FocusManager.getFirstLounch() && isTVOS && numsOfRender.current < 3 && isAuthenticated)
  ) {
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
  if (focusPosition.sectionIndex === -1) {
    isLoading.current = false;
  }

  if (!data.length) {
    return null;
  }

  if (!isTVOS) {
    numsOfRender.current++;
  }

  if (!isTVOS && numsOfRender.current > 1) {
    isLoading.current = false;
  }

  console.log(isLoading, 'isLoading');
  return (
    <>
      {isLoading.current ? (
        <View style={styles.androidLoadingContainer}>
          <TouchableHighlight
            hasTVPreferredFocus={isTVOS && route.params?.eventId}
            underlayColor="transperent">
            <LoadingSpinner showSpinner={true} />
          </TouchableHighlight>
        </View>
      ) : null}
      <View style={isLoading.current ? styles.hidden : styles.root}>
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
                sectionsInitialNumber={focusPosition.sectionIndex > 1 ? focusPosition.sectionIndex + 1 : 2}
                sectionItemsInitialNumber={focusPosition.itemIndex > 4 ? focusPosition.itemIndex + 1 : 5}
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
                  accessible,
                }) => (
                  <DigitalEventItem
                    event={item}
                    ref={previewRef}
                    screenNameFrom={route.name}
                    hasTVPreferredFocus={
                      (sectionIndex === focusPosition.sectionIndex &&
                        index === focusPosition.itemIndex &&
                        numsOfRender.current > 1) ||
                      (fromErrorModal && sectionIndex === 0 && index === 0)
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
                    canMoveDown={isTVOS ? isLastRail : (isLastRail && hasEndlessScroll) || !isLastRail}
                    canMoveUp={!isFirstRail}
                    setFirstItemFocusable={
                      index === 0
                        ? navMenuScreenRedirectRef.current
                            ?.setDefaultRedirectFromNavMenu
                        : undefined
                    }
                    scrollToRailItem={scrollToRailItem}
                    accessible={
                    (sectionIndex === focusPosition.sectionIndex &&
                      index === focusPosition.itemIndex) ? true : accessible}
                  />
                )}
              />
            </View>
          </View>
        }
      </View>
    </>
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
    height: scaleSize(375), // need to check how it will showed on android
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    zIndex: -1000,
    position: 'absolute',
    top: Dimensions.get('window').height + 100,
    left: Dimensions.get('window').width + 100,
  },
  androidLoadingContainer: {
    position: 'absolute',
    left: Dimensions.get('window').width / 2 - 60,
    top: Dimensions.get('window').height / 2 - 15,
  },
});

export default HomePageScreen;
