import React, { useContext, useCallback } from 'react';
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
  const goUpCB = useCallback(() => {
    navigation.replace(prevScreenName);
  }, [navigation, prevScreenName]);
  const goDownCB = useCallback(() => {
    if (nextScreenName) {
      navigation.replace(nextScreenName);
    }
  }, [navigation, nextScreenName]);
  return (
    <View style={styles.generalContainer}>
      {prevScreenName ? <GoUp onFocus={goUpCB} /> : null}
      <View style={{ flex: 1 }}>
        <View style={styles.wrapper}>
          <RohText style={styles.title}>About the Production</RohText>
          <View style={styles.aboutTheProductionContainer}>
            <MultiColumnAboutProductionList
              id={prevScreenName}
              data={aboutProduction}
              columnWidth={scaleSize(740)}
              columnHeight={scaleSize(770)}
            />
          </View>
        </View>
      </View>
      <View style={styles.downContainer}>
        <GoDown text={nextSectionTitle || ''} onFocus={goDownCB} />
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
