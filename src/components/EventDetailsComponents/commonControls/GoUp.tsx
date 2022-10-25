import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, HWEvent } from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import TouchableHighlightWrapper, {
  TTouchableHighlightWrapperRef,
} from 'components/TouchableHighlightWrapper';
import { TVEventManager } from '@services/tvRCEventListener';
import { useFocusLayoutEffect } from 'hooks/useFocusLayoutEffect';

type Props = {
  height?: number;
  onFocus: () => void;
};

const GoUp: React.FC<Props> = ({ height = 10, onFocus }) => {
  const btnRef = useRef<TTouchableHighlightWrapperRef>(null);
  useFocusLayoutEffect(
    useCallback(() => {
      const cb = (event: HWEvent) => {
        if (
          event.eventType === 'swipeUp' ||
          (event.tag === btnRef.current?.getNode?.() &&
            event.eventType === 'up')
        ) {
          onFocus();
        }
      };
      TVEventManager.addEventListener(cb);
      return () => {
        TVEventManager.removeEventListener(cb);
      };
    }, [onFocus]),
  );
  return (
    <TouchableHighlightWrapper
      ref={btnRef}
      canMoveDown={false}
      canMoveLeft={false}
      canMoveRight={false}
      canMoveUp={false}
      underlayColor="transparent"
      style={{ height: scaleSize(height) }}>
      <View style={[styles.container, { height }]} collapsable={false} />
    </TouchableHighlightWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
  },
});

export default GoUp;
