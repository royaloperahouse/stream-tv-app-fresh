import { View, StyleSheet, ScrollView } from 'react-native';
import RohText from '@components/RohText';
import { scaleSize } from '@utils/scaleSize';
import React, { useRef } from 'react';
import { Colors } from '@themes/Styleguide';
import { useSplitingOnColumnsForSynopsis } from '@hooks/useSplitingOnColumnsForSynopsis';
import TouchableHighlightWrapper, {
  TTouchableHighlightWrapperRef,
} from '@components/TouchableHighlightWrapper';
import ScrollingArrowPagination, {
  TScrollingArrowPaginationRef,
} from '@components/ScrollingArrowPagination';
import { OverflowingContainer } from '@components/OverflowingContainer';

type TMultiColumnSynopsisListProps = {
  data: Array<{ key: string; text: string }>;
  columnHeight: number;
  columnWidth: number;
  id: string;
  onReady?: () => void;
};
const noopCB = () => {};
const MultiColumnSynopsisList: React.FC<
  TMultiColumnSynopsisListProps
> = props => {
  const { data, columnHeight, columnWidth, onReady = noopCB } = props;
  const { onLayoutHandler, splitedItems, splited } =
    useSplitingOnColumnsForSynopsis({
      columnHeight,
      itemsForSpliting: data,
    });
  const scrollingArrowPaginationRef =
    useRef<TScrollingArrowPaginationRef>(null);
  const focusedComponentRef = useRef<TTouchableHighlightWrapperRef>(null);
  const callOnce = useRef<boolean>(false);
  if (!splited) {
    return (
      <TouchableHighlightWrapper
        hasTVPreferredFocus
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
              <RohText style={styles.synopsis}>{item.text}</RohText>
            </View>
          ))}
        </View>
      </TouchableHighlightWrapper>
    );
  }
  if (splitedItems.length === 1) {
    return (
      <TouchableHighlightWrapper
        canMoveRight={false}
        ref={focusedComponentRef}
        onFocus={onReady}
        hasTVPreferredFocus>
        <View>
          {splitedItems.map((column, index) =>
            column.needToWrap ? (
              <OverflowingContainer
                fixedHeight
                key={index}
                contentMaxVisibleHeight={columnHeight}
                contentMaxVisibleWidth={columnWidth}>
                {column.items.map(synops => (
                  <View style={styles.elementContainer} key={synops.key}>
                    <RohText style={styles.synopsis}>{synops.text}</RohText>
                  </View>
                ))}
              </OverflowingContainer>
            ) : (
              <View
                key={index}
                style={[
                  {
                    height: columnHeight,
                    width: columnWidth,
                  },
                ]}>
                {column.items.map(synops => (
                  <View style={styles.elementContainer} key={synops.key}>
                    <RohText style={styles.synopsis}>{synops.text}</RohText>
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
    <View style={[{ height: columnHeight, width: columnWidth }]}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        horizontal
        style={styles.list}>
        {splitedItems.map((item, index, items) => (
          <TouchableHighlightWrapper
            key={index}
            canMoveRight={index !== items.length - 1}
            hasTVPreferredFocus={index === 0}
            ref={index === 0 ? focusedComponentRef : undefined}
            onFocus={() => {
              if (!callOnce.current) {
                callOnce.current = true;
                onReady();
              }
              if (
                typeof scrollingArrowPaginationRef.current?.setCurrentIndex ===
                'function'
              ) {
                scrollingArrowPaginationRef.current.setCurrentIndex(index);
              }
            }}>
            <View>
              {item.needToWrap ? (
                <OverflowingContainer
                  fixedHeight
                  key={index}
                  contentMaxVisibleHeight={columnHeight}
                  contentMaxVisibleWidth={columnWidth}>
                  {item.items.map(synops => (
                    <View style={styles.elementContainer} key={synops.key}>
                      <RohText style={styles.synopsis}>{synops.text}</RohText>
                    </View>
                  ))}
                </OverflowingContainer>
              ) : (
                <View
                  style={[
                    {
                      height: columnHeight,
                      width: columnWidth,
                    },
                  ]}>
                  {item.items.map(synops => (
                    <View style={styles.elementContainer} key={synops.key}>
                      <RohText style={styles.synopsis}>{synops.text}</RohText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableHighlightWrapper>
        ))}
      </ScrollView>
      <ScrollingArrowPagination
        ref={scrollingArrowPaginationRef}
        countOfItems={splitedItems.length}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  elementContainer: {
    paddingBottom: scaleSize(32),
    paddingTop: '20%',
    width: scaleSize(740),
  },
  elementContainerAbsolute: {
    position: 'absolute',
    opacity: 0,
  },
  list: {
    flex: 1,
  },
  columnContainer: {
    flex: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: scaleSize(30),
  },
  synopsisContainer: {
    height: '100%',
    width: scaleSize(740),
  },
  synopsis: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(28),
    lineHeight: scaleSize(34),
  },
});

export default MultiColumnSynopsisList;
