import React, {
  useCallback,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
} from 'react';
import {
  View,
  ViewProps,
  VirtualizedList,
  NativeSyntheticEvent,
  TargetedEvent,
  TouchableHighlight,
  findNodeHandle,
  ViewToken,
  HWEvent,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TTouchableHighlightWrapperRef } from '@components/TouchableHighlightWrapper';
import { TVEventManager } from '@services/tvRCEventListener';
import debounce from 'lodash.debounce';

type TRailSectionsProps = {
  containerStyle?: ViewProps['style'];
  sections: Array<{ [key: string]: any }>;
  sectionKeyExtractor?: (data: { [key: string]: any }) => string;
  sectionItemKeyExtractor?: (data: { [key: string]: any }) => string;
  sectionsInitialNumber?: number;
  sectionItemsInitialNumber?: number;
  railStyle?: ViewProps['style'];
  renderHeader?: (data: any) => JSX.Element | null;
  headerContainerStyle?: ViewProps['style'];
  renderItem: (info: { [key: string]: any }) => JSX.Element | null;
  sectionsWindowSize?: number;
  railWindowSize?: number;
  sectionIndex?: number;
  itemIndex?: number;
};

const RailSections: React.FC<TRailSectionsProps> = props => {
  const {
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
  } = props;
  const mountedRef = useRef<boolean>(false);
  const sectionsListRef = useRef<VirtualizedList<any> | null>(null);
  const bottomEndlessScrollRef = useRef<TEndlessScrollRef>(null);
  const scrollToTop = useRef<boolean>(false);
  const scrollToBottom = useRef<boolean>(false);
  const scrollToNecessaryRail = useRef<boolean>(false);
  const scrollToNecessaryRailItem = useRef<boolean>(false);
  const prevSectionIndex = useRef<number>(-1);
  const railItemsListRef = useRef<{
    [key: string]: VirtualizedList<any> | null;
  }>({});
  const railsItemsNodesRef = useRef<{
    [key: string]: string;
  }>({});
  const railsItemsRef = useRef<
    Map<string, React.RefObject<TouchableHighlight>>
  >(new Map());

  const setRailItemRef = useCallback(
    (
      eventId: string,
      ref: React.MutableRefObject<TTouchableHighlightWrapperRef | undefined>,
      sectionIdx: number,
    ) => {
      const nodeId = ref.current?.getNode?.();
      if (nodeId === undefined) {
        return;
      }
      if (!railsItemsNodesRef.current[nodeId]) {
        railsItemsNodesRef.current[nodeId] = `${eventId} - ${nodeId}`;
      }
      if (!ref.current?.getRef?.()) {
        return;
      }
      if (railsItemsRef.current.has(`${eventId}-${sectionIdx}`)) {
        railsItemsRef.current.delete(`${eventId}-${sectionIdx}`);
      }
      railsItemsRef.current.set(
        `${eventId}-${sectionIdx}`,
        ref.current.getRef(),
      );
    },
    [],
  );
  const removeRailItemRef = useCallback(
    (
      eventId: string,
      ref: React.MutableRefObject<TTouchableHighlightWrapperRef | undefined>,
      sectionIdx: number,
    ) => {
      const nodeId = ref.current?.getNode?.();
      if (nodeId === undefined || !railsItemsNodesRef.current[nodeId]) {
        return;
      }
      delete railsItemsNodesRef.current[nodeId];
      if (!ref.current?.getRef?.()) {
        return;
      }
      if (railsItemsRef.current.has(`${eventId}-${sectionIdx}`)) {
        railsItemsRef.current.delete(`${eventId}-${sectionIdx}`);
      }
    },
    [],
  );
  const getSectionCount = useCallback(
    (data: Array<any>) => (Array.isArray(data) ? data.length : 0),
    [],
  );
  const getSectionItemCount = useCallback(
    (data: Array<any>) => (Array.isArray(data) ? data.length : 0),
    [],
  );

  const scrollToRail = (index: number) => () => {
    if (
      sectionsListRef.current &&
      !scrollToNecessaryRail.current &&
      !scrollToNecessaryRailItem.current
    ) {
      sectionsListRef.current.scrollToIndex({
        animated: false,
        index,
      });
    }
  };

  const initScrollToRail = () => {
    if (sectionsListRef.current) {
      scrollToNecessaryRail.current = true;
      sectionsListRef.current.scrollToIndex({
        animated: false,
        index: sectionIndex,
      });
    }
  };

  const initScrollToRailItem = useCallback(() => {
    if (railItemsListRef.current[sectionIndex]) {
      scrollToNecessaryRailItem.current = true;
      railItemsListRef.current[sectionIndex]?.scrollToIndex({
        animated: false,
        index: itemIndex,
      });
    }
  }, [itemIndex, sectionIndex]);

  const scrollToRailItem = useCallback(
    (currentSectionIndex: number, index: number) => {
      if (
        railItemsListRef.current[currentSectionIndex] &&
        currentSectionIndex === prevSectionIndex.current
      ) {
        railItemsListRef.current[currentSectionIndex]?.scrollToIndex({
          animated: true,
          index,
        });
      }
      prevSectionIndex.current = currentSectionIndex;
    },
    [],
  );

  const viewableItemsChangeHandler = useMemo(
    () =>
      debounce((info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
        if (scrollToNecessaryRail.current) {
          scrollToNecessaryRail.current = false;
          return;
        }
        if (scrollToBottom.current || scrollToTop.current) {
          const sectionIndexToScroll = scrollToBottom.current
            ? sections.length - 1
            : 0;
          scrollToBottom.current = false;
          scrollToTop.current = false;
          const section = info.viewableItems.find(
            viewableItem =>
              viewableItem.index === sectionIndexToScroll &&
              viewableItem.isViewable,
          );
          if (
            !section ||
            !section?.item?.data.length ||
            !railsItemsRef.current.has(
              `${section.item.data[0].id}-${sectionIndexToScroll}`,
            )
          ) {
            return;
          }
          railsItemsRef.current
            .get(`${section.item.data[0].id}-${sectionIndexToScroll}`)
            ?.current?.setNativeProps({ hasTVPreferredFocus: true });
        }
      }, 500),
    [sections.length],
  );

  const viewableRailItemsChangeHandler = useMemo(
    () =>
      debounce((info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
        if (
          scrollToNecessaryRailItem.current &&
          info.viewableItems.some(
            item => item.index === itemIndex && item.isViewable,
          )
        ) {
          scrollToNecessaryRailItem.current = false;
          return;
        }
      }, 250),
    [itemIndex],
  );

  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      if (mountedRef && mountedRef.current) {
        mountedRef.current = false;
      }
    };
  }, []);

  useLayoutEffect(() => {
    initScrollToRail();
  }, []);

  useLayoutEffect(() => {
    let outerBlur: boolean = true;
    let outerFocus: boolean = true;
    const cb = (eve: HWEvent) => {
      if (eve?.eventType === 'blur' && mountedRef.current) {
        outerBlur = !(
          Boolean(eve.tag && railsItemsNodesRef.current[eve.tag]) ||
          bottomEndlessScrollRef.current?.getNode?.() === eve.tag
        );
        return;
      }
      if (eve?.eventType === 'focus' && mountedRef.current) {
        outerFocus = !(
          Boolean(eve.tag && railsItemsNodesRef.current[eve.tag]) ||
          bottomEndlessScrollRef.current?.getNode?.() === eve.tag
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
    return () => {
      TVEventManager.removeEventListener(cb);
      outerBlur = true;
      outerFocus = true;
      bottomEndlessScrollRef.current?.setAccessible?.(false);
      scrollToTop.current = false;
      scrollToBottom.current = false;
    };
  }, []);
  return (
    <View style={[containerStyle]}>
      <VirtualizedList
        ref={sectionsListRef}
        data={sections}
        keyExtractor={item => sectionKeyExtractor(item)}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        initialNumToRender={sectionsInitialNumber}
        maxToRenderPerBatch={sectionsInitialNumber}
        getItemCount={getSectionCount}
        windowSize={sectionsWindowSize}
        getItem={(data, index) => data[index]}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            if (
              !mountedRef.current ||
              info.index === undefined ||
              !sectionsListRef.current
            ) {
              return;
            }
            if (scrollToNecessaryRail.current) {
              initScrollToRail();
              return;
            }
            sectionsListRef.current.scrollToIndex({
              animated: false,
              index: info.index,
            });
          });
        }}
        onViewableItemsChanged={viewableItemsChangeHandler}
        renderItem={({ item: sectionItem, index: sectionItemIndex }) => (
          <View style={[railStyle]}>
            <View style={[headerContainerStyle]}>
              {renderHeader(sectionItem)}
            </View>
            <VirtualizedList
              horizontal
              listKey={sectionItem.sectionIndex?.toString()}
              windowSize={railWindowSize}
              getItem={(data, index) => data[index]}
              initialNumToRender={sectionItemsInitialNumber}
              maxToRenderPerBatch={sectionItemsInitialNumber}
              data={sectionItem.data}
              ref={component => {
                railItemsListRef.current[sectionItemIndex] = component;
              }}
              keyExtractor={(sectionItemForKeyExtracting: any) =>
                sectionItemKeyExtractor(sectionItemForKeyExtracting)
              }
              onScrollToIndexFailed={info => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  if (!mountedRef.current) {
                    return;
                  }
                  if (scrollToNecessaryRailItem.current) {
                    initScrollToRailItem();
                    return;
                  }
                  railItemsListRef.current[sectionItemIndex]?.scrollToIndex({
                    animated: false,
                    index: info.index,
                  });
                });
              }}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              getItemCount={getSectionItemCount}
              onViewableItemsChanged={viewableRailItemsChangeHandler}
              renderItem={({
                index: railItemIndexInList,
                item: railItemInList,
              }) => {
                return renderItem({
                  index: railItemIndexInList,
                  item: railItemInList,
                  section: sectionItem,
                  scrollToRail: scrollToRail(sectionItemIndex),
                  isFirstRail: sectionItemIndex === 0,
                  sectionIndex: sectionItemIndex,
                  railItemIndex: railItemIndexInList,
                  isLastRail: sections.length - 1 === sectionItemIndex,
                  setRailItemRefCb: setRailItemRef,
                  removeRailItemRefCb: removeRailItemRef,
                  hasEndlessScroll: sections.length > 2,
                  scrollToRailItem,
                });
              }}
            />
          </View>
        )}
      />
      <EndlessScroll
        countOfRails={sections.length}
        ref={bottomEndlessScrollRef}
        onFocusCb={() => {
          if (mountedRef.current) {
            scrollToTop.current = true;
            sectionsListRef.current?.scrollToOffset?.({ offset: 0 });
          }
        }}
      />
    </View>
  );
};

export default RailSections;

type TEndlessScrollProps = {
  onFocusCb: (e: NativeSyntheticEvent<TargetedEvent>) => void;
  countOfRails: number;
};

type TEndlessScrollRef = {
  setAccessible?: (isAccessible: boolean) => void;
  getNode?: () => number | null | undefined;
};

const EndlessScroll = forwardRef<TEndlessScrollRef, TEndlessScrollProps>(
  ({ onFocusCb, countOfRails }, ref) => {
    const [accessible, setAccessible] = useState<boolean>(false);
    const touchableRef = useRef<TouchableHighlight>(null);
    const isMounted = useRef<boolean>(false);
    useImperativeHandle(
      ref,
      () => ({
        setAccessible: (isAccessible: boolean) => {
          if (isMounted.current) {
            setAccessible(isAccessible);
          }
        },
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
    return (
      <TouchableHighlight
        ref={touchableRef}
        accessible={countOfRails > 2 && accessible}
        nextFocusRight={findNodeHandle(touchableRef.current)}
        nextFocusLeft={findNodeHandle(touchableRef.current)}
        nextFocusUp={findNodeHandle(touchableRef.current)}
        nextFocusDown={findNodeHandle(touchableRef.current)}
        onFocus={onFocusCb}>
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
