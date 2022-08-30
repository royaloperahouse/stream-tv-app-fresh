import React, { useContext, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import GoDown from '../commonControls/GoDown';
import GoUp from '@components/EventDetailsComponents/commonControls/GoUp';
import MultiColumnRoleNameList from '../commonControls/MultiColumnRoleNameList';
import { Colors } from '@themes/Styleguide';
import type {
  TEventDetailsScreensProps,
  NSNavigationScreensNames,
  TEventDetailsScreensParamContextProps,
} from '@configs/screensConfig';
import { SectionsParamsContext } from '@components/EventDetailsComponents/commonControls/SectionsParamsContext';

const Creatives: React.FC<
  TEventDetailsScreensProps<
    NSNavigationScreensNames.EventDetailsStackScreens['creatives']
  >
> = ({ route, navigation }) => {
  const params =
    useContext<Partial<TEventDetailsScreensParamContextProps>>(
      SectionsParamsContext,
    )[route.name] || {};
  const { nextSectionTitle, creatives, nextScreenName, prevScreenName } =
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
          <View style={styles.titleContainer}>
            <RohText style={styles.title}>Creatives</RohText>
          </View>
          <View style={styles.creativesContainer}>
            <MultiColumnRoleNameList
              id={prevScreenName}
              data={creatives}
              columnHeight={scaleSize(770)}
              columnWidth={scaleSize(387)}
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
  wrapper: {
    flexDirection: 'row',
    height: '100%',
  },
  navigationToDownContainer: {
    width: '100%',
    height: 2,
  },
  navigationToUpContainer: {
    width: '100%',
    height: 2,
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
  creativesContainer: {
    width: scaleSize(945),
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default Creatives;
