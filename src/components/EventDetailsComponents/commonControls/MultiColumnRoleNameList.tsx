import { View, StyleSheet, ScrollView } from 'react-native';
import RohText from '@components/RohText';
import { scaleSize } from '@utils/scaleSize';
import React, { useRef } from 'react';
import { Colors } from '@themes/Styleguide';
import { useSplitingOnColumns } from '@hooks/useSplitingOnColumns';
import TouchableHighlightWrapper from '@components/TouchableHighlightWrapper';
import ScrollingPagination, {
  TScrolingPaginationRef,
} from '@components/ScrollingPagination';

type TMultiColumnRoleNameListProps = {
  data: Array<{ role: string; name: string }>;
  columnHeight: number;
  columnWidth: number;
  id: string;
  onReady?: () => void;
};
const noopCB = () => {};
const MultiColumnRoleNameList: React.FC<
  TMultiColumnRoleNameListProps
> = props => {
  const { data, columnHeight, columnWidth, onReady = noopCB, id } = props;
  const { onLayoutHandler, splitedItems, splited } = useSplitingOnColumns({
    columnHeight,
    itemsForSpliting: data,
  });
  const scrpllingPaginationRef = useRef<TScrolingPaginationRef>(null);
  const callOnce = useRef<boolean>(false);
  if (!splited) {
    return (
      <TouchableHighlightWrapper hasTVPreferredFocus>
        <View style={{ width: columnWidth }}>
          {data.map(item => (
            <View
              key={item.role}
              style={[styles.elementContainer, styles.elementContainerAbsolute]}
              onLayout={onLayoutHandler('role', item.role)}>
              <RohText style={styles.role}>{item.role}</RohText>
              <RohText style={styles.name}>{item.name}</RohText>
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
        hasTVPreferredFocus
        onFocus={onReady}>
        <View style={[styles.towColumnsList, { height: columnHeight }]}>
          {splitedItems.map((column, index) => (
            <View style={styles.columnContainer} key={index}>
              {column.map(ceil => (
                <View style={styles.elementContainer} key={ceil.role}>
                  <RohText style={styles.role}>{ceil.role}</RohText>
                  <RohText style={styles.name}>{ceil.name}</RohText>
                </View>
              ))}
            </View>
          ))}
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
            style={[styles.column, { height: columnHeight }]}
            canMoveRight={index !== items.length - 1}
            hasTVPreferredFocus={index === 0}
            onFocus={() => {
              if (!callOnce.current) {
                callOnce.current = true;
                onReady();
              }
              if (
                typeof scrpllingPaginationRef.current?.setCurrentIndex ===
                'function'
              ) {
                scrpllingPaginationRef.current.setCurrentIndex(index);
              }
            }}
            styleFocused={styles.columnInFocus}>
            <View style={styles.columnContainer}>
              {item.map(ceil => (
                <View style={styles.elementContainer} key={ceil.role}>
                  <RohText style={styles.role}>{ceil.role}</RohText>
                  <RohText style={styles.name}>{ceil.name}</RohText>
                </View>
              ))}
            </View>
          </TouchableHighlightWrapper>
        ))}
      </ScrollView>
      <View style={styles.paginationContainer}>
        <ScrollingPagination
          ref={scrpllingPaginationRef}
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
  role: {
    fontSize: scaleSize(30),
    color: Colors.lightGrey,
    textTransform: 'uppercase',
    marginBottom: scaleSize(8),
  },
  name: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(30),
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
    marginTop: scaleSize(100),
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
});

export default MultiColumnRoleNameList;
