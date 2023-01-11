import React, {
  useContext,
  useCallback,
  useRef,
  useLayoutEffect,
  useState,
} from 'react';
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
import { isTVOS } from 'configs/globalConfig';

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
          <View style={styles.titleContainer}>
            <RohText style={styles.title}>Synopsis</RohText>
          </View>
          <View style={styles.synopsisContainer}>
            <MultiColumnSynopsisList
              id={prevScreenName}
              data={synopsis}
              columnWidth={scaleSize(740)}
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
    height: scaleSize(50),
  },
  upContainer: {
    height: scaleSize(10),
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
