import React, { useRef, useLayoutEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableHighlight,
} from 'react-native';
import RohText from '@components/RohText';
import { scaleSize } from '@utils/scaleSize';
import { useMyList } from '@hooks/useMyList';
import { digitalEventsForMyListScreenSelector } from '@services/store/events/Selectors';
import { useSelector } from 'react-redux';
import { myListTitle, countOfItemsPeerRail } from '@configs/myListConfig';
import { Colors } from '@themes/Styleguide';
import { DigitalEventItem } from '@components/EventListComponents';
import {
  widthWithOutFocus,
  marginRightWithOutFocus,
  marginLeftStop,
} from '@configs/navMenuConfig';
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

const MyListScreen: React.FC<
  TContentScreensProps<NSNavigationScreensNames.ContentStackScreens['myList']>
> = ({ route }) => {
  const { navMenuNodesRefs } = useContext<TNavMenuNodesRefsContextValue>(
    NavMenuNodesRefsContext,
  );
  const { data: myList, ejected } = useMyList();
  const data = useSelector(digitalEventsForMyListScreenSelector(myList));
  const { itemIndex = -1 } = FocusManager.getFocusPosition({
    searchingCB: FocusManager.searchingCBForList,
    eventId: route.params?.eventId || null,
    data,
    moveToMenuItem: () => {
      if (ejected) {
        navMenuNodesRefs?.[route.name]?.current?.setNativeProps({
          hasTVPreferredFocus: true,
        });
      }
    },
  });
  const listRef = useRef<FlatList>(null);
  const navMenuScreenRedirectRef = useRef<TNavMenuScreenRedirectRef>(null);

  useLayoutEffect(() => {
    if (itemIndex > -1 && ejected) {
      listRef?.current?.scrollToIndex?.({
        animated: false,
        index: Math.floor(itemIndex / countOfItemsPeerRail),
      });
    }
  }, [data.length, ejected, itemIndex]);

  return (
    <View style={styles.root}>
      <NavMenuScreenRedirect
        screenName={route.name}
        ref={navMenuScreenRedirectRef}
      />
      <View style={styles.contentContainer}>
        <RohText style={styles.pageTitle}>{myListTitle}</RohText>
        {!ejected ? (
          <View style={styles.loadingContainer}>
            <TouchableHighlight
              hasTVPreferredFocus={isTVOS && route.params?.eventId}
              underlayColor="transperent">
              <LoadingSpinner showSpinner={true} />
            </TouchableHighlight>
          </View>
        ) : data.length ? (
          <FlatList
            data={data}
            ref={listRef}
            keyExtractor={item => item.id}
            onScrollToIndexFailed={() => {}}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            numColumns={countOfItemsPeerRail}
            renderItem={({ item, index }) => (
              <DigitalEventItem
                screenNameFrom={route.name}
                hasTVPreferredFocus={index === itemIndex}
                event={item}
                canMoveUp={index >= countOfItemsPeerRail}
                canMoveRight={
                  (index + 1) % countOfItemsPeerRail !== 0 &&
                  index !== data.length - 1
                }
                selectedItemIndex={index % countOfItemsPeerRail}
                sectionIndex={index}
                setFirstItemFocusable={
                  index === 0
                    ? navMenuScreenRedirectRef.current
                        ?.setDefaultRedirectFromNavMenu
                    : undefined
                }
              />
            )}
          />
        ) : (
          <View style={styles.emptyListContainer}>
            <RohText style={styles.emptyListText} bold>
              No items have been added to your list
            </RohText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  contentContainer: { flex: 1, marginTop: scaleSize(189) },
  emptyListContainer: {
    flex: 1,
    marginTop: scaleSize(25),
  },
  emptyListText: {
    fontSize: scaleSize(22),
    lineHeight: scaleSize(30),
    letterSpacing: scaleSize(1),
    color: Colors.defaultTextColor,
  },
  pageTitle: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(48),
    marginBottom: scaleSize(24),
    textTransform: 'uppercase',
  },
  listContainer: {
    width:
      Dimensions.get('window').width -
      (widthWithOutFocus + marginRightWithOutFocus + marginLeftStop),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MyListScreen;
