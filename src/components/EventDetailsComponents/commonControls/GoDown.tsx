import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, HWEvent } from 'react-native';
import Down from '@assets/svg/eventDetails/Down.svg';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import TouchableHighlightWrapper, {
  TTouchableHighlightWrapperRef,
} from 'components/TouchableHighlightWrapper';
import { TVEventManager } from '@services/tvRCEventListener';
import { useFocusLayoutEffect } from 'hooks/useFocusLayoutEffect';

type Props = {
  text: string;
  onFocus: () => void;
};

const GoDown: React.FC<Props> = ({ text, onFocus }) => {
  const btnRef = useRef<TTouchableHighlightWrapperRef>(null);

  useFocusLayoutEffect(
    useCallback(() => {
      const cb = (event: HWEvent) => {
        if (
          event.eventType === 'swipeDown' ||
          (event.tag === btnRef.current?.getNode?.() &&
            event.eventType === 'down')
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
      style={{ height: scaleSize(50) }}>
      <View style={styles.container}>
        <Down width={scaleSize(50)} height={scaleSize(50)} />
        <RohText style={styles.text}>{text.toUpperCase()}</RohText>
      </View>
    </TouchableHighlightWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    opacity: 0.7,
    height: scaleSize(50),
    alignItems: 'center',
  },
  text: {
    color: '#F1F1F1',
    fontSize: scaleSize(24),
    marginLeft: scaleSize(20),
  },
});

export default GoDown;
