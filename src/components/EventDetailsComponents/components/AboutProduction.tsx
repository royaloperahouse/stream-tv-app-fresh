import React, { useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import GoDown from '../commonControls/GoDown';
import GoUp from '@components/EventDetailsComponents/commonControls/GoUp';
import { Colors } from '@themes/Styleguide';
import MultiColumnAboutProductionList from '../commonControls/MultiColumnAboutProductionList';
import type {
  NSNavigationScreensNames,
  TEventDetailsScreensParamContextProps,
  TEventDetailsScreensProps,
} from '@configs/screensConfig';
import { SectionsParamsContext } from '@components/EventDetailsComponents/commonControls/SectionsParamsContext';
import { isTVOS } from 'configs/globalConfig';
import { AnalyticsEventTypes, storeEvents } from 'utils/storeEvents';

const AboutProduction: React.FC<
  TEventDetailsScreensProps<
    NSNavigationScreensNames.EventDetailsStackScreens['info']
  >
> = ({ route, navigation }) => {
  const params =
    useContext<Partial<TEventDetailsScreensParamContextProps>>(
      SectionsParamsContext,
    )[route.name] || {};
  const { nextSectionTitle, aboutProduction, nextScreenName, prevScreenName } =
    params;
  const [showGoUpOrDownButtons, setShowGoUpOrDownButtons] =
    useState<boolean>(false);
  const isMounted = useRef<boolean>(false);
  const goUpCB = useCallback(() => {
    navigation.replace(prevScreenName);
  }, [navigation, prevScreenName]);
  const goDownCB = useCallback(() => {
    if (nextScreenName) {
      navigation.replace(nextScreenName);
    }
  }, [navigation, nextScreenName]);
  const onContentReady = useCallback(() => {
    if (isMounted.current) {
      setShowGoUpOrDownButtons(true);
    }
  }, []);
  useLayoutEffect(() => {
    storeEvents({
      event_type: AnalyticsEventTypes.SECTION_VIEWED,
      event_data: {
        performance_id: params.eventId,
        section_name: 'About Production',
      },
    }).then(() => {});
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <View style={styles.generalContainer}>
      <View style={styles.upContainer}>
        {(prevScreenName && !isTVOS) ||
        (prevScreenName && isTVOS && showGoUpOrDownButtons) ? (
          <GoUp onFocus={goUpCB} />
        ) : null}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.wrapper}>
          <RohText style={styles.title}>About the Production</RohText>
          <View style={styles.aboutTheProductionContainer}>
            <MultiColumnAboutProductionList
              id={prevScreenName}
              data={aboutProduction.filter((item: any) => item.content)}
              columnWidth={scaleSize(isTVOS ? 740 : 600)}
              columnHeight={scaleSize(770)}
              onReady={onContentReady}
            />
          </View>
        </View>
      </View>
      <View style={styles.downContainer}>
        {(nextScreenName && !isTVOS) ||
        (nextScreenName && isTVOS && showGoUpOrDownButtons) ? (
          <GoDown text={nextSectionTitle || ''} onFocus={goDownCB} />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  generalContainer: {
    height: Dimensions.get('window').height,
    paddingRight: scaleSize(200),
  },
  navigationToDownContainer: {
    width: '100%',
    height: 2,
  },
  navigationToUpContainer: {
    width: '100%',
    height: 2,
  },
  wrapper: {
    paddingTop: scaleSize(100),
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downContainer: {
    marginBottom: scaleSize(50),
    height: scaleSize(50),
  },
  upContainer: {
    height: scaleSize(10),
  },
  title: {
    paddingRight: scaleSize(100),
    color: Colors.defaultTextColor,
    fontSize: scaleSize(72),
    letterSpacing: scaleSize(1),
    lineHeight: scaleSize(84),
    overflow: 'visible',
    width: Dimensions.get('window').width / 2 - scaleSize(185),
  },
  aboutTheProductionContainer: {
    height: scaleSize(770),
    flex: 1,
    justifyContent: 'center',
    width: scaleSize(740),
  },
});

export default AboutProduction;
