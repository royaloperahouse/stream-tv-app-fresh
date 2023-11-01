import { Dimensions, StyleSheet, TouchableHighlight, View } from 'react-native';
import RohText from 'components/RohText';
import React, { useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';
import {
  NSNavigationScreensNames,
  TEventDetailsScreensParamContextProps,
  TEventDetailsScreensProps,
} from 'configs/screensConfig';
import { SectionsParamsContext } from 'components/EventDetailsComponents/commonControls/SectionsParamsContext';
import { isTVOS } from 'configs/globalConfig';
import GoDown from 'components/EventDetailsComponents/commonControls/GoDown';
import GoUp from 'components/EventDetailsComponents/commonControls/GoUp';
import MultiColumnRoleNameList from 'components/EventDetailsComponents/commonControls/MultiColumnRoleNameList';
import { scaleSize } from 'utils/scaleSize';
import { Colors } from 'themes/Styleguide';
import RohImage from 'components/RohImage';
import FastImage from 'react-native-fast-image';

const Shop: React.FC<
  TEventDetailsScreensProps<
    NSNavigationScreensNames.EventDetailsStackScreens['shop']
  >
> = ({ route, navigation }) => {
  const params =
    useContext<Partial<TEventDetailsScreensParamContextProps>>(
      SectionsParamsContext,
    )[route.name] || {};
  const {
    nextScreenName,
    nextSectionTitle,
    prevScreenName,
    shop,
    snapshotImageUrl,
  } = params;
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
            <TouchableHighlight style={styles.descriptionContainer} onFocus={onContentReady} hasTVPreferredFocus>
              <View style={styles.titleContainer}>
                <RohText style={styles.title}>{shop.title}</RohText>
                <RohText style={styles.description}>{shop.standfirst}</RohText>
                <RohText style={styles.description}>{shop.body}</RohText>
                <RohText style={styles.linkDescription}>Scan the code to buy or visit:</RohText>
                <RohText style={styles.link}>{shop.imageLink}</RohText>
                <RohImage source={shop.image.url} style={{width: scaleSize(300), height: scaleSize(300), marginTop: isTVOS ? 25 : 10}}/>
              </View>
            </TouchableHighlight>
            <RohImage
              source={shop.productImage.url}
              style={{width: scaleSize(975), height: Dimensions.get('window').height }}
              resizeMode={FastImage.resizeMode.cover}
              isPortrait={true}
            />
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
    width: '100%',
    color: Colors.title,
    fontSize: scaleSize(72),
    textTransform: 'uppercase',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '90%',
  },
  description: {
    color: 'white',
    fontSize: scaleSize(24),
    marginTop: scaleSize(12),
    overflow: 'hidden',
  },
  linkDescription: {
    color: 'white',
    fontSize: scaleSize(30),
    marginTop: scaleSize(25),
    overflow: 'hidden',
  },
  link: {
    fontSize: scaleSize(30),
    overflow: 'hidden',
    color: Colors.defaultBlue,
  },
  info: {
    color: 'white',
    fontSize: scaleSize(20),
    textTransform: 'uppercase',
    marginTop: scaleSize(24),
  },
  descriptionContainer: {
    flex: 1,
    marginTop: scaleSize(isTVOS ? 120 : 120),
    marginRight: scaleSize(10),
    width: scaleSize(100),
  },
});

export default Shop;
