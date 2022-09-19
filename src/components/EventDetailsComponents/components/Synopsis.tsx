import React, { useContext, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import GoDown from '../commonControls/GoDown';
import GoUp from '@components/EventDetailsComponents/commonControls/GoUp';
import { Colors } from '@themes/Styleguide';
import MultiColumnSynopsisList from '../commonControls/MultiColumnSynopsisList';
import type {
  TEventDetailsScreensProps,
  NSNavigationScreensNames,
  TEventDetailsScreensParamContextProps,
} from '@configs/screensConfig';
import { SectionsParamsContext } from '@components/EventDetailsComponents/commonControls/SectionsParamsContext';

const Synopsis: React.FC<
  TEventDetailsScreensProps<
    NSNavigationScreensNames.EventDetailsStackScreens['synopsis']
  >
> = ({ route, navigation }) => {
  const params =
    useContext<Partial<TEventDetailsScreensParamContextProps>>(
      SectionsParamsContext,
    )[route.name] || {};
  const { nextSectionTitle, synopsis, nextScreenName, prevScreenName } = params;
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
          <View style={styles.titleContainer}>
            <RohText style={styles.title}>Synopsis</RohText>
          </View>
          <View style={styles.synopsisContainer}>
            <MultiColumnSynopsisList
              id={prevScreenName}
              data={synopsis}
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
    flex: 1,
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
    width: '100%',
    color: Colors.title,
    fontSize: scaleSize(72),
    textTransform: 'uppercase',
  },
  synopsis: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(28),
    lineHeight: scaleSize(38),
  },
  synopsisContainer: {
    //width: scaleSize(740),
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default Synopsis;
