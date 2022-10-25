import React, { useCallback, useContext } from 'react';
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
const Cast: React.FC<
  TEventDetailsScreensProps<
    NSNavigationScreensNames.EventDetailsStackScreens['cast']
  >
> = ({ route, navigation }) => {
  const params =
    useContext<Partial<TEventDetailsScreensParamContextProps>>(
      SectionsParamsContext,
    )[route.name] || {};
  const { nextSectionTitle, castList, nextScreenName, prevScreenName } = params;
  for (let i = 0; i < 20; i++) {
    castList.push({ ...castList[0], role: castList[0] + i });
  }
  const goUpCB = useCallback(() => {
    navigation.replace(prevScreenName);
  }, [navigation, prevScreenName]);
  const goDownCB = useCallback(() => {
    if (nextScreenName) {
      navigation.replace(nextScreenName);
    }
  }, [navigation, nextScreenName]);
  return (
    <View style={styles.rootContainer}>
      <View style={styles.generalContainer}>
        {prevScreenName ? <GoUp onFocus={goUpCB} /> : null}
        <View style={{ flex: 1 }}>
          <View style={styles.wrapper}>
            <View style={styles.titleContainer}>
              <RohText style={styles.title}>Cast</RohText>
            </View>
            <View style={styles.castsContainer}>
              <MultiColumnRoleNameList
                id={prevScreenName}
                data={castList}
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
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    height: Dimensions.get('window').height,
    width: '100%',
    flexDirection: 'row',
  },
  generalContainer: {
    height: '100%',
    paddingRight: scaleSize(200),
    flex: 1,
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
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  castsContainer: {
    width: scaleSize(945),
    justifyContent: 'center',
  },
});

export default Cast;
