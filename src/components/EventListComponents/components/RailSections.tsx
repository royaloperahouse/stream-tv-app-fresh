import React, {
  useCallback,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useEffect,
} from 'react';
import {
  View,
  ViewProps,
  ViewStyle,
  FlatList,
  NativeSyntheticEvent,
  TargetedEvent,
  TouchableHighlight,
  findNodeHandle,
  ViewToken,
  HWEvent,
  StyleSheet,
} from 'react-native';
import { TTouchableHighlightWrapperRef } from '@components/TouchableHighlightWrapper';
import { TVEventManager } from '@services/tvRCEventListener';
import debounce from 'lodash.debounce';
import { isTVOS } from 'configs/globalConfig';
import { navMenuManager } from 'components/NavMenu';

const RailSections: React.FC<{
  containerStyle?: ViewProps['style'];
  sections: Record<string, any>[];
  sectionKeyExtractor?: (data: Record<string, any>) => string;
  sectionItemKeyExtractor?: (data: Record<string, any>) => string;
  sectionsInitialNumber?: number;
  sectionItemsInitialNumber?: number;
  railStyle?: ViewStyle;
  renderHeader?: (data: any) => JSX.Element | null;
  headerContainerStyle?: ViewProps['style'];
  renderItem: (info: Record<string, any>) => JSX.Element | null;
  sectionsWindowSize?: number;
  railWindowSize?: number;
  sectionIndex?: number;
  itemIndex?: number;
}> = ({
  containerStyle = {},
  sections,
  sectionKeyExtractor = data => data.id,
  sectionItemKeyExtractor = data => data.id,
  sectionsInitialNumber = 2,
  sectionItemsInitialNumber = 5,
  railStyle = {},
  renderHeader = _ => null,
  headerContainerStyle = {},
  sectionsWindowSize = 3,
  railWindowSize = 10,
  renderItem,
  sectionIndex = 0,
  itemIndex = 0,
}) => {
    const mountedRef = useRef<boolean>(false);


    const topEndlessScrollRef = useRef<TEndlessScrollRef>(null);
    const bottomEndlessScrollRef = useRef<TEndlessScrollRef>(null);

    const [topScrollAccessible, setTopScrollAccessible] = useState(false);

    const scrollToTop = useRef<boolean>(false);
    const scrollToBottom = useRef<boolean>(false);

    const scrollToNecessaryRail = useRef<boolean>(false);
    const scrollToNecessaryRailItem = useRef<boolean>(false);

    const railsListRef = useRef<FlatList<any> | null>(null);
    const railsRef = useRef<
      Map<string, React.RefObject<typeof TouchableHighlight>>
    >(new Map());
    const railItemsRef = useRef<Record<string, FlatList<any> | null>>({});
    const railItemRef = useRef<Record<string, string>>({});

    const currentRailIndex = useRef<number>(0);
    const prevRailItemIndex = useRef<number>(-1);

    const [currentPosition, setCurrentPosition] = useState([0, 0]);

    const selectRailItem = useCallback(
      (
        eventId: string,
        ref: React.RefObject<TTouchableHighlightWrapperRef | undefined>,
        railIndex: number,
      ) => {
        const railItemId = ref.current?.getNode?.();
        if (railItemId === undefined) return;

        const newRailItemId = `${eventId} - ${railItemId}`;
        const newRailId = `${eventId}-${railIndex}`;

        railItemRef.current[railItemId] =
          railItemRef.current[railItemId] || newRailItemId;

        if (!ref.current?.getRef?.()) return;

        if (railsRef.current.has(newRailId))
          railsRef.current.delete(newRailId);
        railsRef.current.set(newRailId, ref.current.getRef());
      },
      [],
    );

    const deselectRailItem = useCallback(
      (
        eventId: string,
        ref: React.RefObject<TTouchableHighlightWrapperRef | undefined>,
        railIndex: number,
      ) => {
        const railItemId = ref.current?.getNode?.();
        if (railItemId === undefined || !railItemRef.current[railItemId]) return;

        const newRailId = `${eventId}-${railIndex}`;

        delete railItemRef.current[railItemId];
        if (!ref.current?.getRef?.()) return;
        if (railsRef.current.has(newRailId))
          railsRef.current.delete(newRailId);
      },
      [],
    );

    const initialScrollToRail = () => {
      if (!railsListRef.current) return;

      scrollToNecessaryRail.current = true;
      railsListRef.current?.scrollToIndex({
        animated: false,
        index: sectionIndex,
      });
    };

    const initialScrollToRailItem = useCallback(() => {
      if (!railItemsRef.current[sectionIndex]) return;

      scrollToNecessaryRailItem.current = true;
      railItemsRef.current[sectionIndex]?.scrollToIndex({
        animated: false,
        index: itemIndex,
      });

      setTimeout(() => setCurrentPosition([sectionIndex, itemIndex]), 200);
    }, [itemIndex, sectionIndex]);

    const scrollToRail = (railIndex: number, railItemIndex: number) => () => {
      if (currentRailIndex.current === railIndex && isTVOS) return;

      currentRailIndex.current = railIndex;
      if (
        !railsListRef.current ||
        scrollToNecessaryRail.current ||
        scrollToNecessaryRailItem.current
      ) {
        return;
      }

      setTimeout(() => setCurrentPosition([railIndex, railItemIndex]), 200);
      railsListRef.current?.scrollToIndex({
        animated: true,
        index: railIndex,
      });
    };


    const scrollToRailItem = useCallback(
      (railItemIndex: number, index: number) => {
        if (
          !railItemsRef.current[railItemIndex] ||
          railItemIndex !== prevRailItemIndex.current
        ) {
          prevRailItemIndex.current = railItemIndex;
          return;
        }

        setTimeout(() => setCurrentPosition([railItemIndex, index]), 200);
        railItemsRef.current[railItemIndex]?.scrollToIndex({
          animated: true,
          index,
        });
        prevRailItemIndex.current = railItemIndex;
      },
      [],
    );

    const viewableItemsChangeHandler = useCallback(
      (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
        if (scrollToNecessaryRail.current) {
          scrollToNecessaryRail.current = false;
          return;
        }
        if (!scrollToBottom.current && !!scrollToTop.current) return;

        const sectionIndexToScroll = scrollToBottom.current
          ? sections.length - 1
          : 0;

        const section = info.viewableItems.find(
          viewableItem =>
            viewableItem.index === sectionIndexToScroll &&
            viewableItem.isViewable,
        );

        if (
          !section ||
          !section?.item?.data.length ||
          !railsRef.current.has(
            `${section.item.data[0].id}-${sectionIndexToScroll}`,
          )
        ) {
          !isTVOS && navMenuManager.unlockNavMenu();
          return;
        }

        railsRef.current
          .get(`${section.item.data[0].id}-${sectionIndexToScroll}`)
          ?.current // @ts-expect-error Custom `setNativeProps` RN function has no typedef
          ?.setNativeProps({ hasTVPreferredFocus: true });

        !isTVOS && navMenuManager.unlockNavMenu();
        scrollToBottom.current = false;
        scrollToTop.current = false;
      },
      [sections.length],
    );

    const viewableRailItemsChangeHandler = useCallback(
      debounce((info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
        if (
          !scrollToNecessaryRailItem.current ||
          !info.viewableItems.some(
            item => item.index === itemIndex && item.isViewable,
          )
        )
          return;

        scrollToNecessaryRailItem.current = false;
      }, 250),
      [itemIndex],
    );

    const handleTopEndlessScrollFocus = () => {
      if (
        mountedRef.current &&
        railStyle?.height &&
        typeof railStyle.height === 'number'
      ) {
        scrollToBottom.current = true;
        !isTVOS && navMenuManager.lockNavMenu();
        railsListRef.current?.scrollToOffset?.({
          offset: (railStyle.height + 35) * sections.length,
        });
      }
    };

    const handleBottomEndlessScrollFocus = () => {
      if (mountedRef.current) {
        scrollToTop.current = true;
        !isTVOS && navMenuManager.lockNavMenu();
        scrollToRailItem(0, 0);
        railsListRef.current?.scrollToOffset?.({ offset: 0 });
      }
    };

    const handleSectionScrollToIndexFailed: React.ComponentProps<
      typeof FlatList
    >['onScrollToIndexFailed'] = async info => {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!mountedRef.current) return;
      if (info.index === undefined) return;
      if (!railsListRef.current) return;

      if (scrollToNecessaryRail.current) return initialScrollToRail();

      railsListRef.current.scrollToIndex({
        animated: false,
        index: info.index,
      });
    };

    const handleItemScrollToIndexFailed =
      (
        sectionItemIndex: number,
      ): React.ComponentProps<typeof FlatList>['onScrollToIndexFailed'] =>
        async info => {
          await new Promise(resolve => setTimeout(resolve, 500));

          if (!mountedRef.current) return;
          if (scrollToNecessaryRailItem.current) return initialScrollToRailItem();

          railItemsRef.current[sectionItemIndex]?.scrollToIndex({
            animated: false,
            index: info.index,
          });
        };

    useEffect(() => {
      if (currentPosition[1] !== 0) isTVOS && navMenuManager.lockNavMenu();
      if (currentPosition[1] === 0) isTVOS && navMenuManager.unlockNavMenu();

      setTimeout(() => setTopScrollAccessible(true), 500);
    }, [currentPosition]);

    useLayoutEffect(() => {
      mountedRef.current = true;
      return () => {
        if (mountedRef && mountedRef.current) {
          mountedRef.current = false;
        }
      };
    }, []);

    useLayoutEffect(() => {
      initialScrollToRail();
    }, []);

    useLayoutEffect(() => {
      let outerBlur: boolean = true;
      let outerFocus: boolean = true;

      const cb = (e: HWEvent) => {
        if (e?.eventType === 'blur' && mountedRef.current) {
          outerBlur = !(
            Boolean(e.tag && railItemRef.current[e.tag]) ||
            bottomEndlessScrollRef.current?.getNode?.() === e.tag
          );
          return;
        }
        if (e?.eventType === 'focus' && mountedRef.current) {
          outerFocus = !(
            Boolean(e.tag && railItemRef.current[e.tag]) ||
            bottomEndlessScrollRef.current?.getNode?.() === e.tag
          );
          if ((!outerFocus && outerBlur) || (!outerFocus && !outerBlur)) {
            bottomEndlessScrollRef.current?.setAccessible?.(true);
            return;
          }
          if ((outerFocus && !outerBlur) || (outerFocus && outerBlur)) {
            bottomEndlessScrollRef.current?.setAccessible?.(false);
            return;
          }
        }
      };

      TVEventManager.addEventListener(cb);

      const current = bottomEndlessScrollRef.current;

      return () => {
        TVEventManager.removeEventListener(cb);
        outerBlur = true;
        outerFocus = true;
        current?.setAccessible?.(false);
        scrollToTop.current = false;
        scrollToBottom.current = false;
      };
    }, []);

    return (
      <View style={[containerStyle]}>
        <EndlessScroll
          fromTop
          countOfRails={sections.length}
          accessibleProp={
            currentPosition[0] === 0 && topScrollAccessible && isTVOS
          }
          ref={topEndlessScrollRef}
          onFocusCb={handleTopEndlessScrollFocus}
        />
        <FlatList
          ref={railsListRef}
          data={sections}
          keyExtractor={sectionKeyExtractor}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialNumToRender={isTVOS ? sections.length : sectionsInitialNumber}
          maxToRenderPerBatch={isTVOS ? sections.length : sectionsInitialNumber}
          windowSize={sectionsWindowSize}
          snapToInterval={Number(railStyle.height)}
          numColumns={1}
          onScrollToIndexFailed={handleSectionScrollToIndexFailed}
          onViewableItemsChanged={viewableItemsChangeHandler}
          renderItem={({ item: sectionItem, index: railIndex }) => (
            <View style={[railStyle]}>
              <View style={[headerContainerStyle]}>
                {renderHeader(sectionItem)}
              </View>
              <FlatList
                ref={component => {
                  railItemsRef.current[railIndex] = component;
                }}
                horizontal
                windowSize={railWindowSize}
                data={sectionItem.data}
                initialNumToRender={
                  isTVOS ? sectionItem.data.length : sectionItemsInitialNumber
                }
                maxToRenderPerBatch={
                  isTVOS ? sections.length : sectionItemsInitialNumber
                }
                keyExtractor={sectionItemKeyExtractor}
                onScrollToIndexFailed={handleItemScrollToIndexFailed(
                  railIndex,
                )}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={viewableRailItemsChangeHandler}
                renderItem={({
                  index: railItemIndex,
                  item: railItemInList,
                }) =>
                  renderItem({
                    index: railItemIndex,
                    item: railItemInList,
                    section: sectionItem,
                    scrollToRail: scrollToRail(
                      railIndex,
                      railItemIndex,
                    ),
                    topEndlessScrollRef,
                    isFirstRail: railIndex === 0,
                    sectionIndex: railIndex,
                    railItemIndex: railItemIndex,
                    isLastRail: sections.length - 1 === railIndex,
                    setRailItemRefCb: selectRailItem,
                    removeRailItemRefCb: deselectRailItem,
                    hasEndlessScroll: sections.length > 2,
                    scrollToRailItem,
                    accessible: true,
                  })
                }
              />
            </View>
          )}
        />
        <EndlessScroll
          fromTop={false}
          countOfRails={sections.length}
          accessibleProp={currentPosition[0] === sections.length - 1}
          ref={bottomEndlessScrollRef}
          onFocusCb={handleBottomEndlessScrollFocus}
        />
      </View>
    );
  };

type TEndlessScrollProps = {
  fromTop: boolean;
  onFocusCb: (e: NativeSyntheticEvent<TargetedEvent>) => void;
  countOfRails: number;
  accessibleProp: boolean;
};

type TEndlessScrollRef = {
  setAccessible?: (isAccessible: boolean) => void;
  getNode?: () => number | null | undefined;
};

const EndlessScroll = forwardRef<TEndlessScrollRef, TEndlessScrollProps>(
  ({ fromTop, onFocusCb, countOfRails, accessibleProp }, ref) => {
    const touchableRef = useRef<View>(null);
    const isMounted = useRef<boolean>(false);

    useImperativeHandle(
      ref,
      () => ({
        setAccessible: (_isAccessible: boolean) => { },
        getNode: () => {
          if (isMounted.current) {
            return findNodeHandle(touchableRef.current);
          }
        },
      }),
      [],
    );

    useLayoutEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);

    const styleObject = StyleSheet.create({
      endlessScroll: {
        position: 'absolute',
        height: 10,
        width: '100%',
        ...(fromTop ? { top: 1 } : { bottom: 1 }),
      },
    });

    return (
      <TouchableHighlight
        ref={touchableRef}
        accessible={countOfRails > 2 && accessibleProp}
        onFocus={onFocusCb}
        style={styleObject.endlessScroll}
        // @ts-expect-error Android-specific props
        nextFocusRight={findNodeHandle(touchableRef.current)}
        nextFocusLeft={findNodeHandle(touchableRef.current)}
        nextFocusUp={findNodeHandle(touchableRef.current)}
        nextFocusDown={findNodeHandle(touchableRef.current)}>
        <View
          style={{
            height: 1,
            width: '100%',
          }}
        />
      </TouchableHighlight>
    );
  },
);

export default RailSections;
