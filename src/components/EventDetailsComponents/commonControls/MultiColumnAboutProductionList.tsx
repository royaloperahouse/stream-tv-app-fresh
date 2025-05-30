import {
  VirtualizedList,
  View,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import RohText from '@components/RohText';
import { scaleSize } from '@utils/scaleSize';
import React, { useRef } from 'react';
import { Colors } from '@themes/Styleguide';
import { useSplitingOnColumnsForSynopsis } from '@hooks/useSplitingOnColumnsForSynopsis';
import TouchableHighlightWrapper, {
  TTouchableHighlightWrapperRef,
} from '@components/TouchableHighlightWrapper';
import ScrollingPagination, {
  TScrolingPaginationRef,
} from '@components/ScrollingPagination';
import FastImage from 'react-native-fast-image';
import { OverflowingContainer } from '@components/OverflowingContainer';
import { ScrollView } from 'react-native-gesture-handler';
import RohImage from 'components/RohImage';
import { isTVOS } from 'configs/globalConfig';

export enum ECellItemKey {
  'guidance' = 'guidance',
  'genres' = 'genres',
  'sponsor' = 'sponsor',
  'language' = 'language',
  'description' = 'description',
  'run_time' = 'run_time',
}

type TMultiColumnAboutProductionListProps = {
  data: Array<{ key: string; type: ECellItemKey; content: any }>;
  columnHeight: number;
  columnWidth: number;
  id: string;
  onReady?: () => void;
};
const noopCB = () => {};

const MultiColumnAboutProductionList: React.FC<
  TMultiColumnAboutProductionListProps
> = props => {
  const { data, columnHeight, columnWidth, onReady = noopCB } = props;
  const { onLayoutHandler, splitedItems, splited } =
    useSplitingOnColumnsForSynopsis({
      columnHeight,
      itemsForSpliting: data,
    });
  const callOnce = useRef<boolean>(false);
  const imageSizeCalc = (
    width: number,
    height: number,
    maxWidth: number,
  ): { width: number; height: number } => {
    if (width <= maxWidth) {
      return {
        width: scaleSize(width),
        height: scaleSize(height),
      };
    }
    const multiplexer = width / maxWidth;
    const calculatedHeight = height / multiplexer;
    return {
      width: scaleSize(maxWidth),
      height: scaleSize(calculatedHeight),
    };
  };
  const contentItemsFabric = (item: {
    key: string;
    type: ECellItemKey;
    content: any;
  }) => {
    switch (item.type) {
      case ECellItemKey.sponsor: {
        return (
          <View>
            {item.content.img && (
              <View>
                <RohText style={styles.title}>Production sponsor</RohText>
                <RohImage
                  resizeMode={FastImage.resizeMode.cover}
                  style={[
                    styles.image,
                    imageSizeCalc(
                      item.content.img.width,
                      item.content.img.height,
                      columnWidth / 2,
                    ),
                  ]}
                  source={item.content.img.url}></RohImage>
              </View>
            )}
            {item.content.info && (
              <View>
                <RohText style={styles.title}>
                  {item.content.info.title}
                </RohText>
                <RohText style={styles.content}>
                  {item.content.info.description.trim()}
                </RohText>
              </View>
            )}
          </View>
        );
      }
      default:
        return (
          <View>
            <RohText style={styles.title}>
              {ECellItemKey[item.type].toUpperCase()}
            </RohText>
            <RohText style={styles.content}>{item.content.trim()}</RohText>
          </View>
        );
    }
  };
  const scrollingPaginationRef = useRef<TScrolingPaginationRef>(null);
  const focusedComponentRef = useRef<TTouchableHighlightWrapperRef>(null);

  if (!splited) {
    return (
      <TouchableHighlightWrapper
        hasTVPreferredFocus
        underlayColor="trasparent"
        canMoveDown={false}
        canMoveLeft={false}
        canMoveUp={false}
        canMoveRight={false}>
        <View style={{ width: columnWidth }}>
          {data.map(item => (
            <View
              key={item.key}
              style={[styles.elementContainer, styles.elementContainerAbsolute]}
              onLayout={onLayoutHandler('key', item.key)}>
              {contentItemsFabric(item)}
            </View>
          ))}
        </View>
      </TouchableHighlightWrapper>
    );
  }
  if (splitedItems.length < 3) {
    return (
      <TouchableHighlightWrapper
        canMoveRight={false}
        ref={focusedComponentRef}
        onFocus={onReady}
        hasTVPreferredFocus>
        <View style={[styles.towColumnsList, { height: columnHeight }]}>
          {splitedItems.map((column, index) =>
            column.needToWrap ? (
              <OverflowingContainer
                fixedHeight
                contentMaxVisibleHeight={columnHeight}
                contentMaxVisibleWidth={columnWidth}>
                {column.items.map((ceil: any) => (
                  <View style={styles.elementContainer} key={ceil.key}>
                    {contentItemsFabric(ceil)}
                  </View>
                ))}
              </OverflowingContainer>
            ) : (
              <View style={styles.columnContainer} key={index}>
                {column.items.map((ceil: any) => (
                  <View style={styles.elementContainer} key={ceil.key}>
                    {contentItemsFabric(ceil)}
                  </View>
                ))}
              </View>
            ),
          )}
        </View>
      </TouchableHighlightWrapper>
    );
  }

  return (
    <View style={[{ height: columnHeight }]}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        horizontal
        style={styles.list}>
        {splitedItems.map((item, index, items) => (
          <TouchableHighlightWrapper
            key={index}
            ref={index === 0 ? focusedComponentRef : undefined}
            style={[styles.column, { height: columnHeight }]}
            canMoveRight={index !== items.length - 1}
            hasTVPreferredFocus={index === 0}
            onFocus={() => {
              if (!callOnce.current) {
                callOnce.current = true;
                onReady();
              }
              if (
                typeof scrollingPaginationRef.current?.setCurrentIndex ===
                'function'
              ) {
                scrollingPaginationRef.current.setCurrentIndex(index);
              }
            }}
            styleFocused={styles.columnInFocus}>
            {item.needToWrap ? (
              <OverflowingContainer
                fixedHeight
                contentMaxVisibleHeight={columnHeight}
                contentMaxVisibleWidth={columnWidth}>
                {item.items.map(ceil => (
                  <View style={styles.elementContainer} key={ceil.key}>
                    {contentItemsFabric(ceil)}
                  </View>
                ))}
              </OverflowingContainer>
            ) : (
              <View style={styles.columnContainer}>
                {item.items.map(ceil => (
                  <View style={styles.elementContainer} key={ceil.key}>
                    {contentItemsFabric(ceil)}
                  </View>
                ))}
              </View>
            )}
          </TouchableHighlightWrapper>
        ))}
      </ScrollView>
      <View style={styles.paginationContainer}>
        <ScrollingPagination
          ref={scrollingPaginationRef}
          countOfItems={splitedItems.length}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  title: {
    fontSize: scaleSize(26),
    color: Colors.lightGrey,
    lineHeight: scaleSize(24),
    letterSpacing: scaleSize(2),
    marginBottom: scaleSize(8),
    textTransform: 'uppercase',
  },
  content: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(26),
    lineHeight: scaleSize(32),
  },
  elementContainer: {
    paddingBottom: scaleSize(32),
    width: scaleSize(357),
  },
  elementContainerAbsolute: {
    position: 'absolute',
    opacity: 0,
  },
  list: {
    flex: 1,
  },
  towColumnsList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  columnContainer: {
    flex: 1,
  },
  column: {
    opacity: 0.7,
    marginRight: scaleSize(30),
  },
  columnInFocus: {
    opacity: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: scaleSize(30),
  },
  image: {
    zIndex: 0,
    marginTop: scaleSize(10),
    marginBottom: scaleSize(20),
  },
});

export default MultiColumnAboutProductionList;
