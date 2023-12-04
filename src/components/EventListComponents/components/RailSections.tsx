import React, {
  useCallback,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
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
} from 'react-native';
import { TTouchableHighlightWrapperRef } from '@components/TouchableHighlightWrapper';
import { TVEventManager } from '@services/tvRCEventListener';
import debounce from 'lodash.debounce';
import { isTVOS } from 'configs/globalConfig';
import { navMenuManager } from 'components/NavMenu';

type TRailSectionsProps = {
  containerStyle?: ViewProps['style'];
  sections: Array<{ [key: string]: any }>;
  sectionKeyExtractor?: (data: { [key: string]: any }) => string;
  sectionItemKeyExtractor?: (data: { [key: string]: any }) => string;
  sectionsInitialNumber?: number;
  sectionItemsInitialNumber?: number;
  railStyle?: ViewStyle;
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
  const sectionsListRef = useRef<FlatList<any> | null>(null);
  const bottomEndlessScrollRef = useRef<TEndlessScrollRef>(null);
  const scrollToTop = useRef<boolean>(false);
  const scrollToBottom = useRef<boolean>(false);
  const scrollToNecessaryRail = useRef<boolean>(false);
  const scrollToNecessaryRailItem = useRef<boolean>(false);
  const prevSectionIndex = useRef<number>(-1);
  const [currentPosition, setCurrentPosition] = useState([0, 0]);
  const railItemsListRef = useRef<{
    [key: string]: FlatList<any> | null;
  }>({});
  const railsItemsNodesRef = useRef<{
    [key: string]: string;
  }>({});
  const railsItemsRef = useRef<
    Map<string, React.RefObject<TouchableHighlight>>
  >(new Map());

  const preSectionIndex = useRef<number>(0);
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

  const scrollToRail = (index: number, itemIndexNumber: number) => () => {
    // TODO while not on the first card lock navmenu for a bit
    if (preSectionIndex.current === index && isTVOS) {
      return;
    }
    preSectionIndex.current = index;
    if (
      !sectionsListRef.current ||
      scrollToNecessaryRail.current ||
      scrollToNecessaryRailItem.current
    ) {
      return;
    }
    setTimeout(() => setCurrentPosition([index, itemIndexNumber]), 200);
    if (railStyle && railStyle.height) {
      sectionsListRef.current?.scrollToOffset({
        animated: true,
        offset: index * railStyle.height + 5,
      });
    } else {
      sectionsListRef.current?.scrollToIndex({
        animated: true,
        index,
      });
    }
  };

  const initScrollToRail = () => {
    if (sectionsListRef.current) {
      scrollToNecessaryRail.current = true;
      if (railStyle && railStyle.height) {
        sectionsListRef.current?.scrollToOffset({
          animated: false,
          offset: sectionIndex * railStyle.height + 5,
        });
      } else {
        sectionsListRef.current?.scrollToIndex({
          animated: false,
          index: sectionIndex,
        });
      }
    }
  };

  useEffect(() => {
    if (currentPosition[1] !== 0) {
      isTVOS && navMenuManager.lockNavMenu();
    }

    if (currentPosition[1] === 0) {
      isTVOS && navMenuManager.unlockNavMenu();
    }
  }, [currentPosition]);
  const initScrollToRailItem = useCallback(() => {
    if (railItemsListRef.current[sectionIndex]) {
      scrollToNecessaryRailItem.current = true;
      railItemsListRef.current[sectionIndex]?.scrollToIndex({
        animated: false,
        index: itemIndex,
      });
      setTimeout(() => setCurrentPosition([sectionIndex, itemIndex]), 200);
    }
  }, [itemIndex, sectionIndex]);

  const scrollToRailItem = useCallback(
    (currentSectionIndex: number, index: number) => {
      if (
        railItemsListRef.current[currentSectionIndex] &&
        currentSectionIndex === prevSectionIndex.current
      ) {
        setTimeout(() => setCurrentPosition([currentSectionIndex, index]), 200);
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
            !isTVOS && navMenuManager.unlockNavMenu();
            return;
          }
          railsItemsRef.current
            .get(`${section.item.data[0].id}-${sectionIndexToScroll}`)
            ?.current?.setNativeProps({ hasTVPreferredFocus: true });
          !isTVOS && navMenuManager.unlockNavMenu();
          scrollToBottom.current = false;
          scrollToTop.current = false;
        }
      }, 0),
    [sections.length],
  );

  const viewableRailItemsChangeHandler = useCallback(
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
      <FlatList
        ref={sectionsListRef}
        data={sections}
        keyExtractor={item => sectionKeyExtractor(item)}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        initialNumToRender={sectionsInitialNumber}
        maxToRenderPerBatch={sectionsInitialNumber}
        windowSize={sectionsWindowSize}
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
            console.log('failed ?');
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
            <FlatList
              horizontal
              windowSize={railWindowSize}
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
              onViewableItemsChanged={viewableRailItemsChangeHandler}
              renderItem={({
                index: railItemIndexInList,
                item: railItemInList,
              }) => {
                return renderItem({
                  index: railItemIndexInList,
                  item: railItemInList,
                  section: sectionItem,
                  scrollToRail: scrollToRail(
                    sectionItemIndex,
                    railItemIndexInList,
                  ),
                  isFirstRail: sectionItemIndex === 0,
                  sectionIndex: sectionItemIndex,
                  railItemIndex: railItemIndexInList,
                  isLastRail: sections.length - 1 === sectionItemIndex,
                  setRailItemRefCb: setRailItemRef,
                  removeRailItemRefCb: removeRailItemRef,
                  hasEndlessScroll: sections.length > 2,
                  scrollToRailItem,
                  // TODO make accessible for TVOS
                  accessible: true, //isTVOS ? isAccessible(railItemIndexInList, sectionItemIndex) : true,
                });
              }}
            />
          </View>
        )}
      />
      <EndlessScroll
        countOfRails={sections.length}
        accessibleProp={currentPosition[0] === sections.length - 1}
        ref={bottomEndlessScrollRef}
        onFocusCb={() => {
          if (mountedRef.current) {
            scrollToTop.current = true;
            !isTVOS && navMenuManager.lockNavMenu();
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
  accessibleProp: boolean;
};

type TEndlessScrollRef = {
  setAccessible?: (isAccessible: boolean) => void;
  getNode?: () => number | null | undefined;
};

const EndlessScroll = forwardRef<TEndlessScrollRef, TEndlessScrollProps>(
  ({ onFocusCb, countOfRails, accessibleProp }, ref) => {
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
        accessible={countOfRails > 2 && accessible && accessibleProp}
        nextFocusRight={findNodeHandle(touchableRef.current)}
        nextFocusLeft={findNodeHandle(touchableRef.current)}
        nextFocusUp={findNodeHandle(touchableRef.current)}
        nextFocusDown={findNodeHandle(touchableRef.current)}
        onFocus={onFocusCb}
        style={{
          position: 'absolute',
          bottom: 1,
          height: 2,
          width: '100%',
        }}>
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
