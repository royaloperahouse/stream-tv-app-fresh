import React, {
  useImperativeHandle,
  useState,
  useRef,
  forwardRef,
  useLayoutEffect,
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
import { isTVOS } from 'configs/globalConfig';
import { formatDate } from 'utils/formatDate';
import isValid from 'date-fns/isValid';
import isAfter from 'date-fns/isAfter';
import CountDown from 'components/EventDetailsComponents/commonControls/CountDown';

export type TPreviewRef = {
  setDigitalEvent?: (
    digitalEvent: TEventContainer,
    eveGroupTitle?: string,
  ) => void;
  setShowContinueWatching?: (showContinueWatching: boolean) => void;
};

type TPreviewProps = {};

const Preview = forwardRef<TPreviewRef, TPreviewProps>((props, ref) => {
  const fadeAnimation = useRef<Animated.Value>(new Animated.Value(0)).current;
  const mountedRef = useRef<boolean>(false);
  const [event, setEvent] = useState<TEvent | null>(null);
  const [closeCountDown, setCloseCountDown] = useState(false);
  const [eventGroupTitle, setEventGroupTitle] = useState<string>('');
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  useImperativeHandle(
    ref,
    () => ({
      setDigitalEvent: (
        digitalEvent: TEventContainer,
        eveGroupTitle: string = '',
      ) => {
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
          timeoutId.current = null;
        }
        timeoutId.current = setTimeout(() => {
          timeoutId.current = null;
          if (mountedRef.current) {
            setEvent(digitalEvent.data);
            setEventGroupTitle(eveGroupTitle);
          }
        }, 500);
      },
    }),
    [],
  );

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
    ['vs_event_image', 'tv_app_preview_image_selected', 'url'],
    '',
  );
  const duration = get(event, ['vs_running_time_summary']);
  const availableFrom = get(event, ['vs_availability_date']);
  const extraVideoType = get(event, ['extra_video_type']);

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
    return () => {
      mountedRef.current = false;
    };
  }, []);
  if (!event) {
    return null;
  }

  const timezoneOffset = new Date().getTimezoneOffset();
  const startDateReactNative = event.start_time
    ? new Date(
        parseInt(event.start_time.slice(0, 4), 10),
        parseInt(event.start_time.slice(5, 7), 10) - 1,
        parseInt(event.start_time.slice(8, 10), 10),
        parseInt(event.start_time.slice(11, 13), 10) - timezoneOffset / 60,
        parseInt(event.start_time.slice(14, 16), 10),
        parseInt(event.start_time.slice(17, 19), 10),
        0,
      )
    : 0;

  const showCountDownTimer =
    event.start_time &&
    !closeCountDown &&
    isValid(new Date(startDateReactNative)) &&
    isAfter(new Date(startDateReactNative), new Date());

  let formattedDate: string;

  if (isTVOS && availableFrom) {
    formattedDate = formatDate(new Date(availableFrom));
  } else if (availableFrom) {
    formattedDate = formatDate(
      new Date(
        parseInt(availableFrom.slice(0, 4), 10),
        parseInt(availableFrom.slice(5, 7), 10) - 1,
        parseInt(availableFrom.slice(8, 10), 10),
        parseInt(availableFrom.slice(11, 13), 10) -
        timezoneOffset / 60,
        parseInt(availableFrom.slice(14, 16), 10),
        parseInt(availableFrom.slice(17, 19), 10),
        0,
      ),
    );
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
          {extraVideoType ? (
            <RohText style={styles.description}>
              {extraVideoType.toUpperCase()}
            </RohText>
          ) : null}
          <RohText style={styles.description}>{shortDescription}</RohText>
          {showCountDownTimer ?
            <CountDown
              publishingDate={startDateReactNative}
              finishCB={() => {
                setCloseCountDown(true);
              }}
            /> : availableFrom ? (
            <RohText style={styles.availableFrom}>{`AVAILABLE FROM ${formattedDate.toUpperCase()}`}</RohText>
          ) : (
            <RohText style={styles.description}>{duration}</RohText>
          )}
        </OverflowingContainer>
      </View>

      <View style={styles.snapshotContainer}>
        <RohImage
          resizeMode={FastImage.resizeMode.cover}
          style={styles.previewImage}
          source={snapshotImageUrl}
        />
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
  availableFrom: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(26),
    marginTop: scaleSize(12),
  },
  previewImage: {
    width: scaleSize(1200),
    height: scaleSize(600),
    backgroundColor: Colors.defaultBlue,
    zIndex: 0,
  },
});

export default Preview;
