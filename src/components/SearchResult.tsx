import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { digitalEventDetailsSearchSelector, searchQuerySelector } from '@services/store/events/Selectors';
import { saveSearchResultQuery, setFullSearchQuery } from '@services/store/events/Slices';
import RohText from './RohText';
import TouchableHighlightWrapper, { TTouchableHighlightWrapperRef } from './TouchableHighlightWrapper';
import FastImage from 'react-native-fast-image';
import get from 'lodash.get';
import { scaleSize } from '@utils/scaleSize';
import { Colors } from '@themes/Styleguide';
import { getPrevSearchList } from '@services/previousSearch';
import { useNavigation, useRoute } from '@react-navigation/core';
import { TContentScreenReverseNames, TEventContainer } from '@services/types/models';
import { navMenuManager } from '@components/NavMenu';
import { TNavMenuScreenRedirectRef } from '@components/NavmenuScreenRedirect';
import type { TContentScreensProps } from '@configs/screensConfig';
import { contentScreenNames } from '@configs/screensConfig';
import { FocusManager } from '@services/focusService/focusManager';
import { customerIdSelector } from 'services/store/auth/Selectors';
import { isProductionEvironmentSelector } from 'services/store/settings/Selectors';
import Placeholder from '@assets/image-placeholder-landscape.svg';
import { shallowEqual, useSelector } from 'react-redux';
import { AnalyticsEventTypes, storeEvents } from 'utils/storeEvents';

type TSearchResultProps = {
  onMountToSearchResultTransition?: TNavMenuScreenRedirectRef['setDefaultRedirectToNavMenu'];
  onUnMountAllToSearchResultTransition?: TNavMenuScreenRedirectRef['removeAllDefaultRedirectFromNavMenu'];
};
const SearchResult: React.FC<TSearchResultProps> = ({
  onMountToSearchResultTransition,
  onUnMountAllToSearchResultTransition,
}) => {
  const route = useRoute<TContentScreensProps<'Search'>['route']>();
  const searchText = useSelector(searchQuerySelector, shallowEqual);
  const previousSearchText = useRef(searchText);
  const isSearchTextChanged = searchText !== previousSearchText.current;
  const resultListRef = useRef<FlatList>(null);
  const digitalEventDetailsLength = useRef<number>(0);
  const selectPrevSearch = useRef<boolean>(false);
  const digitalEventDetails = useAppSelector(digitalEventDetailsSearchSelector);
  const selectedIndex = digitalEventDetails.findIndex(
    event => event.id === route.params?.eventId,
  );
  const prevSearchWasSelcted = () => {
    selectPrevSearch.current = true;
  };
  useLayoutEffect(() => {
    if (
      digitalEventDetails.length &&
      route.params?.eventId &&
      resultListRef.current
    ) {
      if (isSearchTextChanged) {
        return;
      }
      resultListRef.current.scrollToIndex({
        animated: true,
        index: selectedIndex === -1 ? 0 : selectedIndex,
      });
    }
  }, [digitalEventDetails.length, route, selectedIndex]);
  if (!digitalEventDetails.length && digitalEventDetailsLength.current) {
    onUnMountAllToSearchResultTransition?.();
  }
  if (!digitalEventDetails.length) {
    digitalEventDetailsLength.current = 0;
    return (
      <PreviousSearchList
        onMountToSearchResultTransition={onMountToSearchResultTransition}
        prevSearchWasSelectedCB={prevSearchWasSelcted}
      />
    );
  }
  if (!digitalEventDetailsLength.current) {
    onUnMountAllToSearchResultTransition?.();
    digitalEventDetailsLength.current = digitalEventDetails.length;
  }
  const { itemIndex = selectPrevSearch.current ? 0 : -1 } =
    FocusManager.getFocusPosition({
      searchingCB: FocusManager.searchingCBForList,
      eventId: route.params?.eventId || null,
      data: digitalEventDetails,
    });
  return (
    <FlatList
      ref={resultListRef}
      style={styles.searchItemListContainer}
      data={digitalEventDetails}
      keyExtractor={item => item.id}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      onScrollToIndexFailed={info => {
        const wait = new Promise(resolve => setTimeout(resolve, 500));
        wait.then(() => {
          if (
            !resultListRef.current ||
            !resultListRef.current ||
            info.index === undefined
          ) {
            return;
          }
          resultListRef.current.scrollToIndex({
            animated: true,
            index: info.index,
          });
        });
      }}
      ListHeaderComponent={<ResultHraderComponent headerText="Results" />}
      initialNumToRender={5}
      renderItem={({ item, index }) => (
        <SearchItemComponent
          item={item}
          isFirst={index === 0}
          canMoveUp={index !== 0}
          canMoveDown={index !== digitalEventDetails.length - 1}
          screenNameFrom={route.name}
          sectionIndex={index}
          hasTVPreferredFocus={!isSearchTextChanged && index === itemIndex}
          onMountToSearchResultTransition={onMountToSearchResultTransition}
          searchText={searchText}
        />
      )}
    />
  );
};
export default SearchResult;

type TSearchItemComponentProps = {
  isFirst: boolean;
  item: TEventContainer;
  canMoveUp: boolean;
  screenNameFrom: TContentScreenReverseNames;
  sectionIndex: number;
  canMoveDown: boolean;
  hasTVPreferredFocus: boolean;
  onMountToSearchResultTransition?: TSearchResultProps['onMountToSearchResultTransition'];
  searchText: string;
};

export const SearchItemComponent: React.FC<TSearchItemComponentProps> = ({
  isFirst,
  item,
  canMoveUp,
  screenNameFrom,
  sectionIndex,
  canMoveDown,
  hasTVPreferredFocus,
  onMountToSearchResultTransition,
  searchText,
}) => {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<TContentScreensProps<'Search'>['navigation']>();
  const [isFocused, setIsFocused] = useState(false);
  const btnRef = useRef<TTouchableHighlightWrapperRef>(null);
  const availableFrom = get(item.data, ['vs_availability_date']);
  const touchableHandler = () => {
    storeEvents({
      event_type: AnalyticsEventTypes.OPEN_PERFORMANCE_SEARCH,
      event_data: {
        search_query: searchText,
        index: sectionIndex.toString(),
        performance_id: item.id,
      },
    }).then(() => {});
    if (item.type === 'digital_event_video') {
      navMenuManager.hideNavMenu(() => {
        navigation.navigate(contentScreenNames.eventVideo, {
          videoId: item.id,
          eventId: item.id,
          screenNameFrom,
          sectionIndex,
          availableFrom: availableFrom ? availableFrom : null,
        });
      });
      return;
    }
    navMenuManager.hideNavMenu(() => {
      navigation.navigate(contentScreenNames.eventDetails, {
        eventId: item.id,
        screenNameFrom,
        sectionIndex,
        availableFrom: availableFrom ? availableFrom : null,
        duration: item.data.vs_running_time_summary,
      });
    });
  };
  const title: string =
    get(item.data, ['vs_title', '0', 'text'], '').replace(
      /(<([^>]+)>)/gi,
      '',
    ) ||
    get(item.data, ['vs_event_details', 'title'], '').replace(
      /(<([^>]+)>)/gi,
      '',
    );

  const description: string = (
    item.data.vs_short_description.reduce((acc, sDescription) => {
      acc += sDescription.text + '\n';
      return acc;
    }, '') || get(item.data, ['vs_event_details', 'shortDescription'], '')
  ).replace(/(<([^>]+)>)/gi, '');

  const imgUrl: string = get(
    item.data,
    ['vs_event_image', 'tv_app_rail_thumbnail', 'url'],
    '',
  );
  const toggleFocus = () => setIsFocused(prevState => !prevState);
  const focusHandler = () => {
    if (
      typeof onMountToSearchResultTransition === 'function' &&
      btnRef.current?.getRef?.().current
    ) {
      onMountToSearchResultTransition(
        'mvFromKeyboard',
        btnRef.current.getRef().current,
      );
    }
    dispatch(saveSearchResultQuery());
    toggleFocus();
  };

  useLayoutEffect(() => {
    if (
      isFirst &&
      typeof onMountToSearchResultTransition === 'function' &&
      btnRef.current?.getRef?.().current
    ) {
      onMountToSearchResultTransition(
        'mvFromKeyboard',
        btnRef.current.getRef().current,
      );
    }
  }, [onMountToSearchResultTransition, isFirst]);
  return (
    <View style={styles.itemContainer}>
      <TouchableHighlightWrapper
        ref={btnRef}
        underlayColor={Colors.defaultBlue}
        onPress={touchableHandler}
        onBlur={toggleFocus}
        onFocus={focusHandler}
        hasTVPreferredFocus={hasTVPreferredFocus}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        canMoveRight={false}
        style={styles.itemImageContainer}>
        {imgUrl.length ? (
          <FastImage
            style={styles.imageStyle}
            source={{
              uri: imgUrl,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <Placeholder width={scaleSize(358)} height={scaleSize(200)} />
        )}
      </TouchableHighlightWrapper>
      <View
        style={[
          styles.itemTextDescriptionContainer,
          isFocused && styles.itemTextDescriptionContainerActive,
        ]}>
        {Boolean(title.length) && (
          <RohText
            numberOfLines={2}
            style={[
              styles.textTitle,
              Boolean(description.length) &&
                styles.textTitleWithExistingDescription,
            ]}>
            {title}
          </RohText>
        )}
        {Boolean(description.length) && (
          <RohText style={styles.textDescription} numberOfLines={5}>
            {description}
          </RohText>
        )}
      </View>
    </View>
  );
};

type TResultHeaderComponentProps = {
  headerText: string;
  isPrevSearch?: boolean;
};
const ResultHraderComponent: React.FC<TResultHeaderComponentProps> = ({
  headerText,
  isPrevSearch,
}) => (
  <View
    style={[
      styles.headerContainer,
      isPrevSearch && styles.headerContainerPrevSearch,
    ]}>
    <RohText style={styles.headerText}>{headerText}</RohText>
  </View>
);

type TPreviousSearchListProps = {
  onMountToSearchResultTransition?: TSearchResultProps['onMountToSearchResultTransition'];
  prevSearchWasSelectedCB: () => void;
};

const PreviousSearchList: React.FC<TPreviousSearchListProps> = ({
  onMountToSearchResultTransition,
  prevSearchWasSelectedCB,
}) => {
  const customerId = useAppSelector(customerIdSelector);
  const isProductionEnv = useAppSelector(isProductionEvironmentSelector);
  const isMounted = useRef<boolean>(false);
  const [previousSearchesList, setPreviousSearchesList] =
    useState<Array<string>>();

  useLayoutEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    getPrevSearchList(customerId, isProductionEnv)
      .then(previousSearchesListData => {
        if (isMounted.current) {
          setPreviousSearchesList(previousSearchesListData);
        }
      })
      .catch(console.log);
  }, [isProductionEnv, customerId]);

  if (!Array.isArray(previousSearchesList) || !previousSearchesList.length) {
    return null;
  }
  return (
    <FlatList
      style={styles.searchItemListContainer}
      data={previousSearchesList}
      keyExtractor={item => item}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <ResultHraderComponent headerText="Previous Searches" isPrevSearch />
      }
      renderItem={({ item, index }) => (
        <PreviousSearchListItemComponent
          text={item}
          isFirst={index === 0}
          canMoveUp={index !== 0}
          canMoveDown={index !== previousSearchesList.length - 1}
          onMountToSearchResultTransition={onMountToSearchResultTransition}
          prevSearchWasSelectedCB={prevSearchWasSelectedCB}
        />
      )}
    />
  );
};

type TPreviousSearchListItemComponentProps = {
  isFirst: boolean;
  text: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMountToSearchResultTransition?: TSearchResultProps['onMountToSearchResultTransition'];
  prevSearchWasSelectedCB: () => void;
};
const PreviousSearchListItemComponent: React.FC<
  TPreviousSearchListItemComponentProps
> = ({
  isFirst,
  text,
  canMoveUp,
  canMoveDown,
  onMountToSearchResultTransition,
  prevSearchWasSelectedCB,
}) => {
  const [focused, setFocused] = useState(false);
  const dispatch = useAppDispatch();
  const btnRef = useRef<TTouchableHighlightWrapperRef>(null);
  const onPressHandler = () => {
    prevSearchWasSelectedCB();
    dispatch(setFullSearchQuery({ searchQuery: text }));
  };
  useLayoutEffect(() => {
    if (
      isFirst &&
      typeof onMountToSearchResultTransition === 'function' &&
      typeof btnRef.current?.getRef === 'function'
    ) {
      onMountToSearchResultTransition(
        'mvFromKeyboard',
        btnRef.current.getRef().current,
      );
    }
  }, [onMountToSearchResultTransition, isFirst]);
  return (
    <View style={styles.searchesResultItemContainer}>
      <View>
        <TouchableHighlightWrapper
          ref={btnRef}
          underlayColor={Colors.defaultBlue}
          onPress={onPressHandler}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          canMoveRight={false}
          onFocus={() => {
            setFocused(true);
            if (
              typeof onMountToSearchResultTransition === 'function' &&
              typeof btnRef.current?.getRef === 'function'
            ) {
              onMountToSearchResultTransition(
                'mvFromKeyboard',
                btnRef.current.getRef().current,
              );
            }
          }}
          onBlur={() => setFocused(false)}
          style={styles.searchesResultItemWrapperContainer}
          styleFocused={styles.searchesResultItemWrapperActive}>
          <RohText style={[styles.searchesResultItemText, focused ? styles.textColorFocused : styles.textColorBlurred]} numberOfLines={1}>
            {text.toUpperCase()}
          </RohText>
        </TouchableHighlightWrapper>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchItemListContainer: {
    width: '100%',
    height: '100%',
  },
  itemContainer: {
    width: '100%',
    height: scaleSize(220),
    flexDirection: 'row',
  },
  itemImageContainer: {
    marginRight: scaleSize(20),
    width: scaleSize(376),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    width: scaleSize(358),
    height: scaleSize(200),
    zIndex: 0,
  },
  itemTextDescriptionContainer: {
    height: '100%',
    justifyContent: 'center',
    width: scaleSize(489),
    opacity: 0.7,
  },
  itemTextDescriptionContainerActive: {
    opacity: 1,
  },
  textTitle: {
    fontSize: scaleSize(26),
    lineHeight: scaleSize(30),
    letterSpacing: scaleSize(1),
    color: Colors.defaultTextColor,
  },
  textTitleWithExistingDescription: {
    marginBottom: scaleSize(12),
  },
  textDescription: {
    fontSize: scaleSize(22),
    lineHeight: scaleSize(28),
    color: Colors.defaultTextColor,
  },
  textColorFocused: {
    color: Colors.focusedTextColor,
  },
  textColorBlurred: {
    color: Colors.defaultTextColor,
  },
  headerContainer: {
    width: '100%',
    height: scaleSize(315),
    marginLeft: scaleSize(18),
    justifyContent: 'flex-end',
    paddingBottom: scaleSize(54),
  },
  headerContainerPrevSearch: {
    marginLeft: 0,
  },
  headerText: {
    fontSize: scaleSize(26),
    lineHeight: scaleSize(30),
    letterSpacing: scaleSize(1),
    color: Colors.midGrey,
  },
  searchesResultItemContainer: {
    height: scaleSize(80),
    width: '100%',
    flexDirection: 'row',
  },
  searchesResultItemWrapperActive: {
    paddingHorizontal: scaleSize(25),
    opacity: 1,
  },
  searchesResultItemWrapperContainer: {
    height: '100%',
    justifyContent: 'center',
    opacity: 0.7,
  },
  searchesResultItemText: {
    maxWidth: scaleSize(875),
    fontSize: scaleSize(26),
    lineHeight: scaleSize(30),
    letterSpacing: scaleSize(1),
  },
});
