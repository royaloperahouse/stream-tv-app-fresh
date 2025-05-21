import React, {
  useCallback,
  useContext,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';
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
import { isTVOS } from 'configs/globalConfig';
import { AnalyticsEventTypes, storeEvents } from 'utils/storeEvents';
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
    storeEvents({
      event_type: AnalyticsEventTypes.SECTION_VIEWED,
      event_data: {
        performance_id: params.eventId,
        section_name: 'Cast',
      },
    }).then(() => {});
    return () => {
      isMounted.current = false;
    };
  }, []);
  return (
    <View style={styles.rootContainer}>
      <View style={styles.generalContainer}>
        <View style={styles.upContainer}>
          {(prevScreenName && !isTVOS) ||
          (prevScreenName && isTVOS && showGoUpOrDownButtons) ? (
            <GoUp onFocus={goUpCB} />
          ) : null}
        </View>
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
    height: scaleSize(50),
  },
  upContainer: {
    height: scaleSize(10),
  },
  title: {
    paddingTop: scaleSize(72),
    width: '100%',
    color: Colors.title,
    fontSize: scaleSize(72),
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
