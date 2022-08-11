import React from 'react';
import {
  View,
  StyleSheet,
  TouchableHighlight,
  Text,
  Dimensions,
  Platform,
} from 'react-native';
import WithLogo from '@components/WithLogo';
import WithBackground from '@components/WithBackground';
import RNBootSplash from 'react-native-bootsplash';
//import NavMenu from '@components/NavMenu';
import NavigationContainer from '@navigations/navigationContainer';
import ContentLayout from '@layouts/contentLayout';
//import { routes } from '@navigations/routes';
import RohText from '@components/RohText';
import { buildInfo } from '@configs/globalConfig';
import { scaleSize } from '@utils/scaleSize';
//import GlobalModal from '@components/GlobalModal';
//import { useFeature } from 'flagged';
type TMainLayoutProps = {};

const MainLayout: React.FC<TMainLayoutProps> = () => {
  //const showLiveStream = useFeature('showLiveStream');
  /*   const navMenuConfig = routes
    .filter(route => {
      if (showLiveStream) {
        return true;
      }
      return route.navMenuScreenName !== 'liveStream';
    })
    .map(route => ({
      navMenuScreenName: route.navMenuScreenName,
      SvgIconActiveComponent: route.SvgIconActiveComponent,
      SvgIconInActiveComponent: route.SvgIconInActiveComponent,
      navMenuTitle: route.navMenuTitle,
      position: route.position,
      isDefault: route.isDefault,
    })); */
  return (
    <WithBackground>
      <WithLogo>
        <View style={styles.root}>
          <View style={styles.maninContentContainer}>
            <NavigationContainer
              onReady={React.useCallback(() => RNBootSplash.hide(), [])}>
              <ContentLayout />
            </NavigationContainer>
          </View>
          {/*           <GlobalModal /> */}
          {__DEV__ && (
            <View style={styles.buildInfo}>
              <RohText
                bold
                style={styles.buildInfoText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {buildInfo}
              </RohText>
            </View>
          )}
        </View>
      </WithLogo>
    </WithBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  maninContentContainer: {
    //flex: 1,
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    //justifyContent: 'flex-end',
    //flexDirection: 'row', //'row-reverse',
  },
  buildInfo: {
    position: 'absolute',
    top: scaleSize(10),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  buildInfoText: {
    color: 'white',
    fontSize: scaleSize(20),
  },
});

export default MainLayout;