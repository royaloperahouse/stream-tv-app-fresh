import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from 'react-native';

import GoBack, { goBackButtonuManager } from "components/GoBack";
import { SectionsParamsComtextProvider } from 'components/EventDetailsComponents/commonControls/SectionsParamsContext';
import {
  DummyPlayerScreen,
  DummyPlayerScreenName,
} from 'components/Player/DummyPlayerScreen';
import LoadingSpinner from 'components/LoadingSpinner';

import { useAppDispatch } from 'hooks/redux';
import {
  getEventListLoopStart,
  getEventListLoopStop,
} from 'services/store/events/Slices';

import { isTVOS } from 'configs/globalConfig';
import {
  contentScreenNames,
  NSNavigationScreensNames,
  TContentScreensProps,
} from 'configs/screensConfig';
import RohText from "components/RohText";
import { OverflowingContainer } from "components/OverflowingContainer";
import { scaleSize } from "utils/scaleSize";
import CountDown from "components/EventDetailsComponents/commonControls/CountDown";
import ActionButtonList, {
  TActionButtonListRef
} from "components/EventDetailsComponents/commonControls/ActionButtonList";
import GoDown from "components/EventDetailsComponents/commonControls/GoDown";
import RohImage from "components/RohImage";
import FastImage from "react-native-fast-image";
import { Colors } from "themes/Styleguide";
import { useEventVideo } from 'hooks/useEventVideo'
import { getVideoDetails } from "services/prismicApiClient";
import * as Prismic from "@prismicio/client";
import Watch from "assets/svg/eventDetails/Watch.svg";
import { useFocusEffect } from "@react-navigation/native";

const EventVideoScreen: React.FC<
  TContentScreensProps<
    NSNavigationScreensNames.ContentStackScreens['eventVideo']
  >
> = ({route, navigation}) => {
  const { videoId } = route.params;
  const [videoDetails, setVideoDetails] = useState<any | null>(null);
  const dispatch = useAppDispatch();
  const watchNowButtonRef = useRef<TActionButtonListRef>(null);
  const eventDetailsScreenMounted = useRef<boolean>(false);
  const moveToSettings = () => {
    navigation.navigate(contentScreenNames.settings, { pinPage: true });
  };

  const actionButtonList = [
    {
      key: 'WatchNow',
      text: 'Watch now',
      hasTVPreferredFocus: true,
      onPress: () => console.log('press'),
      onFocus: () => console.log('focus'),
      onBlur: () => console.log('blur'),
      Icon: Watch,
      showLoader: true,
      freezeButtonAfterPressing: true,
    },
  ];

  useEffect(() => {
    const fetch = async () => {
      const response = await getVideoDetails({
        queryPredicates: [Prismic.predicate.in('document.id', [videoId])],
        isProductionEnv: true,
      });
      setVideoDetails(response.results[0].data);
    };
    fetch();
  }, []);

  useEffect(() => {
    dispatch(getEventListLoopStop());
    return () => {
      dispatch(getEventListLoopStart());
    };
  }, [dispatch]);

  useLayoutEffect(() => {
    eventDetailsScreenMounted.current = true;
    return () => {
      if (eventDetailsScreenMounted?.current) {
        eventDetailsScreenMounted.current = false;
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isTVOS) {
        setTimeout(() => {
          watchNowButtonRef.current?.focusOnFirstAvalibleButton?.();
        }, 500);
      }
    }, []),
  );

  if (!videoDetails) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner showSpinner={true} />
      </View>
    );
  }

  console.log(JSON.stringify(videoDetails, null, 4));
  return (
    <View style={styles.rootContainer}>
      <GoBack />
      <View style={styles.generalContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.descriptionContainer}>
            <OverflowingContainer
              fixedHeight={false}
              contentMaxVisibleHeight={scaleSize(460)}>
              <RohText style={styles.title} numberOfLines={2}>
                {videoDetails.video_title[0].text.toUpperCase() || ''}
              </RohText>
              {videoDetails.short_description.length ? (
                <RohText style={styles.description}>
                  {videoDetails.short_description[0].text}
                </RohText>
              ) : null}
            </OverflowingContainer>
            <View style={styles.buttonsContainer}>
              <ActionButtonList
                ref={watchNowButtonRef}
                setFocusRef={() => {}}
                buttonList={actionButtonList}
                goDownOn={() => {}}
                goDownOff={() => {}}
                backButtonOn={goBackButtonuManager.setAccessibleGoBackButton}
                backButtonOff={goBackButtonuManager.setUnAccessibleGoBackButton}
              />
            </View>
          </View>
        </View>
        <View style={styles.snapshotContainer}>
          <RohImage
            resizeMode={FastImage.resizeMode.cover}
            style={styles.snapshotContainer}
            source={videoDetails.preview_image.url}
            isPortrait={true}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    flexDirection: 'row',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generalContainer: {
    height: Dimensions.get('window').height,
    width: '100%',
    flexDirection: 'row',
  },
  contentContainer: {
    width: scaleSize(785),
    height: '100%',
  },
  descriptionContainer: {
    flex: 1,
    marginTop: scaleSize(350),
    marginRight: scaleSize(130),
    width: scaleSize(615),
  },
  downContainer: {
    marginBottom: scaleSize(50),
    height: scaleSize(50),
  },
  snapshotContainer: {
    width: scaleSize(975),
    height: Dimensions.get('window').height,
    zIndex: 0,
  },
  pageTitle: {
    color: 'white',
    fontSize: scaleSize(22),
    textTransform: 'uppercase',
  },
  title: {
    color: 'white',
    fontSize: scaleSize(48),
    marginTop: scaleSize(24),
    marginBottom: scaleSize(24),
    textTransform: 'uppercase',
  },
  ellipsis: {
    color: 'white',
    fontSize: scaleSize(22),
    textTransform: 'uppercase',
  },
  description: {
    color: 'white',
    fontSize: scaleSize(22),
    marginTop: scaleSize(12),
    overflow: 'hidden',
  },
  info: {
    color: 'white',
    fontSize: scaleSize(20),
    textTransform: 'uppercase',
    marginTop: scaleSize(24),
  },
  buttonsContainer: {
    width: '100%',
    height: scaleSize(272),
    marginTop: scaleSize(40),
  },
  guidanceContainer: {},
  guidanceSubTitle: {
    fontSize: scaleSize(26),
    color: Colors.defaultTextColor,
  },
});

export default EventVideoScreen;
