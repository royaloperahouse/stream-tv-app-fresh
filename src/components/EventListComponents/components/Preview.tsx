import React, {
  useImperativeHandle,
  useState,
  useRef,
  forwardRef,
  useLayoutEffect,
  useCallback,
} from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import { TEvent, TEventContainer } from '@services/types/models';
import RohText from '@components/RohText';
import get from 'lodash.get';
import FastImage from 'react-native-fast-image';
import { Colors } from '@themes/Styleguide';
import { OverflowingContainer } from '@components/OverflowingContainer';
import RohImage from 'components/RohImage';

export type TPreviewRef = {
  index: number;
  setDigitalEvent?: (
    digitalEvent: TEventContainer,
    itemIndexInRail?: number,
    eveGroupTitle?: string,
  ) => void;
  setShowContinueWatching?: (showContinueWatching: boolean) => void;
};

type TPreviewProps = {};

const Preview = forwardRef<TPreviewRef, TPreviewProps>((props, ref) => {
  const fadeAnimation = useRef<Animated.Value>(new Animated.Value(0)).current;
  const mountedRef = useRef<boolean>(false);
  const [event, setEvent] = useState<TEvent | null>(null);

  const [index, setIndex] = useState<number>(0);

  const [eventGroupTitle, setEventGroupTitle] = useState<string>('');

  const setDigitalEvent = useCallback(
    (
      digitalEvent: TEventContainer,
      itemIndexInRail: number = 0,
      eveGroupTitle: string = '',
    ) => {
      if (mountedRef.current) {
        console.log({
          data: digitalEvent.data.vs_title[0].text,
          itemIndexInRail,
          eveGroupTitle: eveGroupTitle,
        });
        setEvent(digitalEvent.data);
        setIndex(itemIndexInRail);
        setEventGroupTitle(eveGroupTitle);
      }
    },
    [],
  );

  useImperativeHandle(ref, () => ({ index, setDigitalEvent }), [index, setDigitalEvent]);

  const eventTitle: string =
    get(event, ['vs_title', '0', 'text'], '').replace(/(<([^>]+)>)/gi, '') ||
    get(event, ['vs_event_details', 'title'], '').replace(/(<([^>]+)>)/gi, '');
  const shortDescription: string = !event
    ? ''
    : (
        event.vs_short_description.reduce((acc, sDescription) => {
          acc += sDescription.text + '\n';
          return acc;
        }, '') || get(event, ['vs_event_details', 'shortDescription'], '')
      ).replace(/(<([^>]+)>)/gi, '');
  const snapshotImageUrl: string = get(
    event,
    ['vs_event_image', 'wide_event_image', 'url'],
    '',
  );

  useLayoutEffect(() => {
    fadeAnimation.setValue(0);
    if (event) {
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [event]);
  useLayoutEffect(() => {
    mountedRef.current = true;
  }, []);
  if (!event) {
    return null;
  }
  return (
    <Animated.View
      style={[styles.previewContainer, { opacity: fadeAnimation }]}>
      <View style={styles.descriptionContainer}>
        <OverflowingContainer
          fixedHeight
          contentMaxVisibleHeight={
            styles.previewContainer.height -
            styles.descriptionContainer.marginTop
          }>
          <RohText style={styles.pageTitle}>{eventGroupTitle}</RohText>
          <RohText style={styles.title}>{eventTitle}</RohText>
          {/* <RohText style={styles.ellipsis}>{event.captionText}</RohText> */}
          <RohText style={styles.description}>{shortDescription}</RohText>
        </OverflowingContainer>
      </View>

      <View style={styles.snapshotContainer}>
        <RohImage
          resizeMode={FastImage.resizeMode.cover}
          style={styles.previewImage}
          source={snapshotImageUrl}></RohImage>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  previewContainer: {
    flexDirection: 'row',
    height: scaleSize(600),
  },
  descriptionContainer: {
    flex: 1,
    marginTop: scaleSize(141),
    marginRight: scaleSize(130),
  },
  snapshotContainer: {
    width: scaleSize(975),
    height: scaleSize(600),
  },
  pageTitle: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(22),
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(48),
    marginTop: scaleSize(24),
    marginBottom: scaleSize(24),
    textTransform: 'uppercase',
  },
  ellipsis: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(22),
    textTransform: 'uppercase',
  },
  description: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(22),
    marginTop: scaleSize(12),
  },
  previewImage: {
    width: scaleSize(975),
    height: scaleSize(600),
    zIndex: 0,
  },
});

export default Preview;
