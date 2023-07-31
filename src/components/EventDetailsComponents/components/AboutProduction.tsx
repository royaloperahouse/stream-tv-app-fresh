import React, {
  useContext,
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import GoDown from '../commonControls/GoDown';
import GoUp from '@components/EventDetailsComponents/commonControls/GoUp';
import { Colors } from '@themes/Styleguide';
import MultiColumnAboutProductionList from '../commonControls/MultiColumnAboutProductionList';
import type {
  TEventDetailsScreensProps,
  NSNavigationScreensNames,
  TEventDetailsScreensParamContextProps,
} from '@configs/screensConfig';
import { SectionsParamsContext } from '@components/EventDetailsComponents/commonControls/SectionsParamsContext';
import { isTVOS } from 'configs/globalConfig';

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
    flex: 1,
    color: Colors.defaultTextColor,
    fontSize: scaleSize(72),
    textTransform: 'uppercase',
    letterSpacing: scaleSize(1),
    lineHeight: scaleSize(84),
  },
  aboutTheProductionContainer: {
    height: scaleSize(770),
    width: scaleSize(740),
  },
});

export default AboutProduction;
