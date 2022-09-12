import React, { useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
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

const MyListScreen: React.FC<
  TContentScreensProps<NSNavigationScreensNames.ContentStackScreens['myList']>
> = ({ route }) => {
  const { data: myList, ejected } = useMyList();
  const data = useSelector(digitalEventsForMyListScreenSelector(myList));
  const listRef = useRef<FlatList>(null);
  const itemRef = useRef(null);
  const navMenuScreenRedirectRef = useRef<TNavMenuScreenRedirectRef>(null);
  const selectedIndex = data.findIndex(
    event => route.params?.eventId === event.id,
  );
  useLayoutEffect(() => {
    if (selectedIndex !== -1 && ejected) {
      listRef?.current?.scrollToIndex?.({
        animated: false,
        index: Math.floor(
          (selectedIndex === -1 ? 0 : selectedIndex) / countOfItemsPeerRail,
        ),
      });
    }
  }, [route, data.length, ejected, selectedIndex]);

  return (
    <View style={styles.root}>
      <NavMenuScreenRedirect
        screenName={route.name}
        ref={navMenuScreenRedirectRef}
      />
      <View style={styles.contentContainer}>
        <RohText style={styles.pageTitle}>{myListTitle}</RohText>
        {ejected && data.length ? (
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
                ref={itemRef}
                screenNameFrom={route.name}
                hasTVPreferredFocus={
                  !route.params?.eventId
                    ? false
                    : (selectedIndex === -1 ? 0 : selectedIndex) === index
                }
                event={item}
                canMoveUp={index >= countOfItemsPeerRail}
                canMoveRight={
                  (index + 1) % countOfItemsPeerRail !== 0 &&
                  index !== data.length - 1
                }
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
});

export default MyListScreen;
